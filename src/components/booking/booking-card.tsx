"use client";

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

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function todayISO(): string {
  const date = new Date();
  const offset = date.getTimezoneOffset();

  return new Date(
    date.getTime() - offset * 60 * 1000,
  )
    .toISOString()
    .slice(0, 10);
}

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

  const [guests, setGuests] = useState(
    String(initialGuests),
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

  const guestOptions = useMemo(
    () =>
      Array.from(
        { length: room.khach },
        (_, index) => index + 1,
      ),
    [room.khach],
  );

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

  const handleSubmit = async () => {
    if (submitting) {
      return;
    }

    const message = validate();

    if (message) {
      setValidationMsg(message);
      return;
    }

    setValidationMsg("");

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