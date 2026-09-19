"use client";

// Khung đặt phòng ở trang chi tiết: chọn ngày, chọn số khách, xem tổng tiền, bấm đặt.
// Chạy trong trình duyệt vì cần bắt thao tác của người dùng và cần biết ai đang đăng nhập.

import { useEffect, useMemo, useState } from "react";
import type { Room } from "@/types/room";
import type { CreateBookingPayload } from "@/types/booking";
import { useAuthStore } from "@/store/auth-store";
import { buildAuthHeaders } from "@/lib/api-client";
import { normalizeApiError } from "@/lib/api-error";
import { requestAuthModal } from "@/lib/auth-events";
import { showToast } from "@/components/common/toast";
import {
  createBooking,
  getBookedRangesByRoom,
  hasRoomBookingConflict,
} from "@/services/booking-service";

interface BookingCardProps {
  room: Room;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
}

// Số mili giây của một ngày, dùng để đổi khoảng cách hai ngày ra số đêm.
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Lấy ngày hôm nay theo giờ máy người dùng, dạng 2026-09-19.
// Phải trừ đi độ lệch múi giờ, vì toISOString trả về giờ quốc tế,
// ở Việt Nam sau 7 giờ tối sẽ ra nhầm sang ngày hôm sau.
function todayISO(): string {
  const date = new Date();
  const offset = date.getTimezoneOffset();

  return new Date(
    date.getTime() - offset * 60 * 1000,
  )
    .toISOString()
    .slice(0, 10);
}

// Thêm phần giờ vào cho đúng dạng API yêu cầu.
function toApiDate(date: string): string {
  return `${date}T00:00:00.000Z`;
}

// Đổi 2026-09-20 thành 20/09 để hiện trong dòng báo ngày đã kín.
function formatDayMonth(value: string): string {
  return `${value.slice(8, 10)}/${value.slice(5, 7)}`;
}

function formatUsd(price: number): string {
  return `$${price.toLocaleString("en-US")} / đêm`;
}

export default function BookingCard({
  room,
  initialCheckIn = "",
  initialCheckOut = "",
  initialGuests = 1,
}: BookingCardProps) {
  const {
    user,
    accessToken,
    isAuthenticated,
    hasHydrated,
  } = useAuthStore();

  const [checkIn, setCheckIn] =
    useState(initialCheckIn);

  const [checkOut, setCheckOut] =
    useState(initialCheckOut);

  // Số khách lấy từ địa chỉ trang nên có thể lớn hơn sức chứa phòng,
  // ví dụ /rooms/12?guests=99. Kẹp lại trong khoảng từ 1 tới sức chứa,
  // để ô chọn luôn có sẵn giá trị đang chọn thay vì hiện trống.
  const [guests, setGuests] = useState(
    String(
      Math.min(
        Math.max(1, initialGuests),
        room.khach,
      ),
    ),
  );

  const [submitting, setSubmitting] =
    useState(false);

  const [validationMsg, setValidationMsg] =
    useState("");

  // Các khoảng ngày phòng này đã có người đặt, dùng để báo trước cho người dùng.
  const [bookedRanges, setBookedRanges] =
    useState<
      { from: string; to: string }[]
    >([]);

  // Lấy danh sách ngày đã kín khi mở trang chi tiết.
  // Lấy hỏng thì bỏ qua, không báo lỗi, vì đây chỉ là thông tin tham khảo;
  // phần chặn thật nằm ở bước kiểm tra lúc bấm đặt phòng.
  useEffect(() => {
    let cancelled = false;

    const loadBookedRanges = async () => {
      try {
        const ranges =
          await getBookedRangesByRoom(
            room.id,
          );

        if (!cancelled) {
          setBookedRanges(ranges);
        }
      } catch {
        // Bỏ qua.
      }
    };

    loadBookedRanges();

    return () => {
      cancelled = true;
    };
  }, [room.id]);

  const today = todayISO();
  const guestCount = Number(guests);

  // Số đêm tính từ khoảng cách hai ngày, dùng để nhân ra tổng tiền.
  // Chưa chọn đủ ngày hoặc ngày sai thứ tự thì coi như 0 đêm.
  const nights =
    checkIn &&
    checkOut &&
    checkOut > checkIn
      ? Math.round(
          (new Date(checkOut).getTime() -
            new Date(checkIn).getTime()) /
            MS_PER_DAY,
        )
      : 0;

  const total =
    nights > 0
      ? nights * room.giaTien
      : 0;

  // Danh sách số khách cho ô chọn, chạy từ 1 tới sức chứa tối đa của phòng.
  const guestOptions = useMemo(
    () =>
      Array.from(
        { length: room.khach },
        (_, index) => index + 1,
      ),
    [room.khach],
  );

  // Kiểm tra trước khi gửi. Trả về câu báo lỗi đầu tiên gặp phải, hợp lệ thì trả về rỗng.
  // Đây là kiểm tra phía giao diện cho người dùng biết sớm, server vẫn kiểm tra lại.
  const validate = (): string | null => {
    if (!checkIn) {
      return "Vui lòng chọn ngày nhận phòng.";
    }

    if (!checkOut) {
      return "Vui lòng chọn ngày trả phòng.";
    }

    if (checkIn < today) {
      return "Ngày nhận phòng không được ở quá khứ.";
    }

    if (checkOut <= checkIn) {
      return "Ngày trả phòng phải sau ngày nhận phòng.";
    }

    if (
      !Number.isInteger(guestCount) ||
      guestCount < 1
    ) {
      return "Số khách phải là số nguyên từ 1.";
    }

    if (guestCount > room.khach) {
      return `Phòng tối đa ${room.khach} khách.`;
    }

    return null;
  };

  // Đổi ngày nhận phòng mà ngày trả đang sớm hơn hoặc bằng thì xóa ngày trả đi,
  // buộc người dùng chọn lại, thay vì giữ một cặp ngày vô lý.
  const handleCheckInChange = (
    value: string,
  ) => {
    setCheckIn(value);
    setValidationMsg("");

    if (
      checkOut &&
      value &&
      checkOut <= value
    ) {
      setCheckOut("");
    }
  };

  // Bấm nút Đặt phòng.
  const handleSubmit = async () => {
    // Đang gửi rồi thì bỏ qua, tránh bấm hai lần tạo hai lượt đặt.
    if (submitting) {
      return;
    }

    const message = validate();

    if (message) {
      setValidationMsg(message);
      return;
    }

    setValidationMsg("");

    // Chưa đăng nhập thì không đặt được: báo một câu rồi mở luôn cửa sổ đăng nhập.
    // requestAuthModal phát tín hiệu cho Header mở cửa sổ đó, vì cửa sổ nằm ở Header
    // chứ không nằm trong khung đặt phòng này.
    if (
      !hasHydrated ||
      !isAuthenticated ||
      !user ||
      !accessToken
    ) {
      showToast(
        "error",
        "Vui lòng đăng nhập để đặt phòng.",
      );

      requestAuthModal();
      return;
    }

    setSubmitting(true);

    try {
      // Hỏi lại ngay trước khi gửi: phòng này đã có ai đặt trùng ngày chưa.
      // Kiểm tra ở đây chứ không chỉ dựa vào danh sách lấy lúc mở trang,
      // vì người khác có thể vừa đặt trong lúc người này còn đang chọn ngày.
      const conflicted =
        await hasRoomBookingConflict(
          room.id,
          checkIn,
          checkOut,
        );

      if (conflicted) {
        setValidationMsg(
          "Phòng đã có người đặt trong khoảng thời gian này.",
        );

        return;
      }

      // Gửi lên API: mã phòng, hai mốc ngày, số khách, và mã người đang đăng nhập.
      const payload: CreateBookingPayload = {
        id: 0,
        maPhong: room.id,
        ngayDen: toApiDate(checkIn),
        ngayDi: toApiDate(checkOut),
        soLuongKhach: guestCount,
        maNguoiDung: user.id,
      };

      await createBooking(
        payload,
        buildAuthHeaders(accessToken),
      );

      showToast(
        "success",
        "Đặt phòng thành công!",
      );

      // Cập nhật lại danh sách ngày đã kín để hiện luôn khoảng vừa đặt.
      try {
        setBookedRanges(
          await getBookedRangesByRoom(
            room.id,
          ),
        );
      } catch {
        // Bỏ qua.
      }
    } catch (error: unknown) {
      showToast(
        "error",
        normalizeApiError(error).message,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-border p-6 shadow-sm">
      <p className="text-xl font-semibold text-foreground">
        {formatUsd(room.giaTien)}
      </p>

      <div className="mt-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="bk-checkin"
              className="text-xs font-medium text-secondary"
            >
              Nhận phòng
            </label>

            <input
              id="bk-checkin"
              type="date"
              min={today}
              value={checkIn}
              onChange={(event) =>
                handleCheckInChange(
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="bk-checkout"
              className="text-xs font-medium text-secondary"
            >
              Trả phòng
            </label>

            <input
              id="bk-checkout"
              type="date"
              min={checkIn || today}
              value={checkOut}
              onChange={(event) => {
                setCheckOut(
                  event.target.value,
                );
                setValidationMsg("");
              }}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </div>
        </div>

        {/* Báo trước những khoảng ngày đã kín, để người dùng khỏi chọn trúng rồi mới bị từ chối */}
        {bookedRanges.length > 0 && (
          <p className="text-xs text-secondary">
            Đã có người đặt:{" "}
            {bookedRanges
              .map(
                (range) =>
                  `${formatDayMonth(range.from)} - ${formatDayMonth(range.to)}`,
              )
              .join(", ")}
          </p>
        )}

        <div className="flex flex-col gap-1">
          <label
            htmlFor="bk-guests"
            className="text-xs font-medium text-secondary"
          >
            Khách
          </label>

          <select
            id="bk-guests"
            value={guests}
            onChange={(event) => {
              setGuests(
                event.target.value,
              );
              setValidationMsg("");
            }}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          >
            {guestOptions.map((number) => (
              <option
                key={number}
                value={number}
              >
                {number} khách
              </option>
            ))}
          </select>
        </div>
      </div>

      {validationMsg && (
        <p className="mt-2 text-xs text-red-600">
          {validationMsg}
        </p>
      )}

      {nights > 0 && (
        <div className="mt-4 space-y-1 border-t border-border pt-4 text-sm text-foreground">
          <div className="flex justify-between">
            <span>
              {formatUsd(room.giaTien)} ×{" "}
              {nights} đêm
            </span>

            <span>
              ${total.toLocaleString("en-US")}
            </span>
          </div>

          <div className="flex justify-between border-t border-border pt-2 font-semibold">
            <span>Tổng</span>

            <span>
              ${total.toLocaleString("en-US")}
            </span>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="mt-4 h-12 w-full rounded-lg bg-brand text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting
          ? "Đang xử lý..."
          : "Đặt phòng"}
      </button>
    </div>
  );
}