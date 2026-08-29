"use client";

import { useState } from "react";
import Link from "next/link";

import SafeImage from "@/components/common/safe-image";
import { showToast } from "@/components/common/toast";

import {
  buildAuthHeaders,
} from "@/lib/api-client";

import {
  normalizeApiError,
} from "@/lib/api-error";

import {
  deleteBooking,
  getBookingById,
  hasRoomBookingConflict,
  updateBooking,
} from "@/services/booking-service";

import type { Booking } from "@/types/booking";
import type { Room } from "@/types/room";

interface BookingHistoryCardProps {
  booking: Booking;
  room: Room | null;
  userId: number;
  accessToken: string;
  canManage: boolean;
  onUpdated: (
    booking: Booking,
  ) => void;
  onDeleted: (
    bookingId: number,
  ) => void;
}

function toDateInput(
  value: string,
): string {
  const match =
    value?.match(/^\d{4}-\d{2}-\d{2}/);

  return match?.[0] ?? "";
}

function toApiDate(
  value: string,
): string {
  return `${value}T00:00:00.000Z`;
}

function todayISO(): string {
  const now = new Date();

  const offset =
    now.getTimezoneOffset();

  return new Date(
    now.getTime() -
      offset * 60 * 1000,
  )
    .toISOString()
    .slice(0, 10);
}

function formatDate(
  value: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Không xác định";
  }

  return date.toLocaleDateString(
    "vi-VN",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );
}

export default function BookingHistoryCard({
  booking,
  room,
  userId,
  accessToken,
  canManage,
  onUpdated,
  onDeleted,
}: BookingHistoryCardProps) {
  const [editing, setEditing] =
    useState(false);

  const [
    confirmingDelete,
    setConfirmingDelete,
  ] = useState(false);

  const [
    loadingDetails,
    setLoadingDetails,
  ] = useState(false);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [checkIn, setCheckIn] =
    useState(
      toDateInput(booking.ngayDen),
    );

  const [checkOut, setCheckOut] =
    useState(
      toDateInput(booking.ngayDi),
    );

  const [guests, setGuests] =
    useState(
      String(
        booking.soLuongKhach,
      ),
    );

  const today = todayISO();

  const startEditing = async () => {
    if (
      !canManage ||
      loadingDetails ||
      saving ||
      deleting
    ) {
      return;
    }

    setLoadingDetails(true);

    try {
      const current =
        await getBookingById(
          booking.id,
        );

      if (
        current.maNguoiDung !==
        userId
      ) {
        showToast(
          "error",
          "Bạn không có quyền sửa đặt phòng này.",
        );

        return;
      }

      setCheckIn(
        toDateInput(
          current.ngayDen,
        ),
      );

      setCheckOut(
        toDateInput(
          current.ngayDi,
        ),
      );

      setGuests(
        String(
          current.soLuongKhach,
        ),
      );

      setConfirmingDelete(false);
      setEditing(true);
      onUpdated(current);
    } catch (error: unknown) {
      showToast(
        "error",
        normalizeApiError(error)
          .message,
      );
    } finally {
      setLoadingDetails(false);
    }
  };

  const saveChanges = async () => {
    const guestCount =
      Number(guests);

    if (!checkIn || !checkOut) {
      showToast(
        "error",
        "Vui lòng chọn đầy đủ ngày nhận và trả phòng.",
      );

      return;
    }

    if (checkIn < today) {
      showToast(
        "error",
        "Ngày nhận phòng không được ở quá khứ.",
      );

      return;
    }

    if (checkOut <= checkIn) {
      showToast(
        "error",
        "Ngày trả phòng phải sau ngày nhận phòng.",
      );

      return;
    }

    if (
      !Number.isInteger(
        guestCount,
      ) ||
      guestCount < 1
    ) {
      showToast(
        "error",
        "Số khách phải là số nguyên từ 1 trở lên.",
      );

      return;
    }

    if (
      room &&
      guestCount > room.khach
    ) {
      showToast(
        "error",
        `Phòng tối đa ${room.khach} khách.`,
      );

      return;
    }

    if (
      booking.maNguoiDung !==
      userId
    ) {
      showToast(
        "error",
        "Bạn không có quyền sửa đặt phòng này.",
      );

      return;
    }

    setSaving(true);

    try {
      const hasConflict =
        await hasRoomBookingConflict(
          booking.maPhong,
          checkIn,
          checkOut,
          booking.id,
        );

      if (hasConflict) {
        showToast(
          "error",
          "Phòng đã có người đặt trong khoảng thời gian này.",
        );

        return;
      }

      const updated =
        await updateBooking(
          booking.id,
          {
            id: booking.id,
            maPhong:
              booking.maPhong,
            ngayDen:
              toApiDate(checkIn),
            ngayDi:
              toApiDate(checkOut),
            soLuongKhach:
              guestCount,
            maNguoiDung:
              booking.maNguoiDung,
          },
          buildAuthHeaders(
            accessToken,
          ),
        );

      onUpdated({
        ...booking,
        ...updated,
      });

      setEditing(false);

      showToast(
        "success",
        "Đã cập nhật đặt phòng.",
      );
    } catch (error: unknown) {
      showToast(
        "error",
        normalizeApiError(error)
          .message,
      );
    } finally {
      setSaving(false);
    }
  };

  const removeBooking =
    async () => {
      if (
        booking.maNguoiDung !==
        userId
      ) {
        showToast(
          "error",
          "Bạn không có quyền hủy đặt phòng này.",
        );

        return;
      }

      setDeleting(true);

      try {
        await deleteBooking(
          booking.id,
          buildAuthHeaders(
            accessToken,
          ),
        );

        onDeleted(booking.id);

        showToast(
          "success",
          "Đã hủy đặt phòng.",
        );
      } catch (error: unknown) {
        showToast(
          "error",
          normalizeApiError(error)
            .message,
        );

        setDeleting(false);
      }
    };

  return (
    <article className="rounded-xl border border-border p-4 transition hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Link
          href={`/rooms/${booking.maPhong}`}
          className="shrink-0"
        >
          <SafeImage
            src={
              room?.hinhAnh ?? ""
            }
            alt={
              room?.tenPhong ??
              `Phòng #${booking.maPhong}`
            }
            fallbackSrc="/placeholder-room.svg"
            className="h-24 w-full rounded-lg object-cover sm:w-28"
          />
        </Link>

        <div className="min-w-0 flex-1 text-sm text-foreground">
          <Link
            href={`/rooms/${booking.maPhong}`}
            className="font-semibold hover:text-brand hover:underline"
          >
            {room?.tenPhong ??
              `Phòng #${booking.maPhong}`}
          </Link>

          <p className="mt-1 text-secondary">
            {formatDate(
              booking.ngayDen,
            )}{" "}
            →{" "}
            {formatDate(
              booking.ngayDi,
            )}
          </p>

          <p className="mt-0.5 text-secondary">
            {booking.soLuongKhach}{" "}
            khách
          </p>

          {room && (
            <p className="mt-0.5 font-medium">
              $
              {room.giaTien.toLocaleString(
                "en-US",
              )}{" "}
              / đêm
            </p>
          )}
        </div>

        {canManage &&
          !editing &&
          !confirmingDelete && (
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={
                  startEditing
                }
                disabled={
                  loadingDetails ||
                  deleting
                }
                className="rounded-lg border border-border px-3 py-2 text-xs font-semibold transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingDetails
                  ? "Đang tải..."
                  : "Sửa"}
              </button>

              <button
                type="button"
                onClick={() =>
                  setConfirmingDelete(
                    true,
                  )
                }
                disabled={
                  loadingDetails ||
                  deleting
                }
                className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Hủy đặt phòng
              </button>
            </div>
          )}
      </div>

      {editing && (
        <div className="mt-4 grid grid-cols-1 gap-3 border-t border-border pt-4 sm:grid-cols-3">
          <div>
            <label
              htmlFor={`trip-check-in-${booking.id}`}
              className="mb-1 block text-xs font-medium"
            >
              Nhận phòng
            </label>

            <input
              id={`trip-check-in-${booking.id}`}
              type="date"
              min={today}
              value={checkIn}
              onChange={(event) => {
                const value =
                  event.target
                    .value;

                setCheckIn(value);

                if (
                  checkOut &&
                  checkOut <= value
                ) {
                  setCheckOut("");
                }
              }}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </div>

          <div>
            <label
              htmlFor={`trip-check-out-${booking.id}`}
              className="mb-1 block text-xs font-medium"
            >
              Trả phòng
            </label>

            <input
              id={`trip-check-out-${booking.id}`}
              type="date"
              min={
                checkIn || today
              }
              value={checkOut}
              onChange={(event) =>
                setCheckOut(
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </div>

          <div>
            <label
              htmlFor={`trip-guests-${booking.id}`}
              className="mb-1 block text-xs font-medium"
            >
              Số khách
            </label>

            <input
              id={`trip-guests-${booking.id}`}
              type="number"
              min="1"
              max={room?.khach}
              step="1"
              value={guests}
              onChange={(event) =>
                setGuests(
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </div>

          <div className="flex gap-2 sm:col-span-3">
            <button
              type="button"
              onClick={saveChanges}
              disabled={saving}
              className="rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Đang lưu..."
                : "Lưu thay đổi"}
            </button>

            <button
              type="button"
              onClick={() =>
                setEditing(false)
              }
              disabled={saving}
              className="rounded-lg border border-border px-4 py-2 text-xs font-semibold transition hover:bg-surface disabled:opacity-60"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {confirmingDelete && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm">
          <p className="font-medium text-red-700">
            Bạn chắc chắn muốn hủy
            đặt phòng này?
          </p>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={
                removeBooking
              }
              disabled={deleting}
              className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleting
                ? "Đang hủy..."
                : "Xác nhận hủy"}
            </button>

            <button
              type="button"
              onClick={() =>
                setConfirmingDelete(
                  false,
                )
              }
              disabled={deleting}
              className="rounded-lg border border-border bg-white px-4 py-2 text-xs font-semibold"
            >
              Giữ booking
            </button>
          </div>
        </div>
      )}
    </article>
  );
}