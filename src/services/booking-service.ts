import {
  apiClient,
  type AuthHeader,
} from "@/lib/api-client";

import type {
  CyberSoftEnvelope,
  Booking,
  CreateBookingPayload,
  UpdateBookingPayload,
} from "@/types";

const RESOURCE = "/dat-phong";

export async function getBookings(): Promise<
  Booking[]
> {
  const { data } = await apiClient.get<
    CyberSoftEnvelope<Booking[]>
  >(RESOURCE);

  return data.content;
}

export async function createBooking(
  payload: CreateBookingPayload,
  authHeader: AuthHeader,
): Promise<Booking> {
  const { data } = await apiClient.post<
    CyberSoftEnvelope<Booking>
  >(
    RESOURCE,
    payload,
    {
      headers: authHeader,
    },
  );

  return data.content;
}

export async function getBookingsByUser(
  maNguoiDung: number,
): Promise<Booking[]> {
  const { data } = await apiClient.get<
    CyberSoftEnvelope<Booking[]>
  >(
    `${RESOURCE}/lay-theo-nguoi-dung/${encodeURIComponent(
      maNguoiDung,
    )}`,
  );

  return data.content;
}

export async function getBookingById(
  id: number,
): Promise<Booking> {
  const { data } = await apiClient.get<
    CyberSoftEnvelope<Booking>
  >(
    `${RESOURCE}/${encodeURIComponent(id)}`,
  );

  return data.content;
}

export async function updateBooking(
  id: number,
  payload: UpdateBookingPayload,
  authHeader: AuthHeader,
): Promise<Booking> {
  const { data } = await apiClient.put<
    CyberSoftEnvelope<Booking>
  >(
    `${RESOURCE}/${encodeURIComponent(id)}`,
    {
      ...payload,
      id,
    },
    {
      headers: authHeader,
    },
  );

  return data.content;
}

export async function deleteBooking(
  id: number,
  authHeader: AuthHeader,
): Promise<void> {
  await apiClient.delete(
    `${RESOURCE}/${encodeURIComponent(id)}`,
    {
      headers: authHeader,
    },
  );
}

// Cắt lấy phần ngày, bỏ phần giờ.
// Ngày từ ô chọn có dạng 2026-09-20, còn ngày từ API có kèm giờ.
// Hai dạng đó được JavaScript hiểu theo hai mốc giờ khác nhau, lệch 7 tiếng
// ở Việt Nam, nên phải đưa về cùng một dạng rồi mới so.
function toDayStamp(value: string): number {
  return new Date(
    `${value.slice(0, 10)}T00:00:00.000Z`,
  ).getTime();
}

function rangesOverlap(
  newCheckIn: string,
  newCheckOut: string,
  existingCheckIn: string,
  existingCheckOut: string,
): boolean {
  const newIn =
    toDayStamp(newCheckIn);

  const newOut =
    toDayStamp(newCheckOut);

  const existingIn =
    toDayStamp(existingCheckIn);

  const existingOut =
    toDayStamp(existingCheckOut);

  if (
    Number.isNaN(newIn) ||
    Number.isNaN(newOut) ||
    Number.isNaN(existingIn) ||
    Number.isNaN(existingOut) ||
    newOut <= newIn ||
    existingOut <= existingIn
  ) {
    return false;
  }

  return (
    newIn < existingOut &&
    newOut > existingIn
  );
}

// Lấy các khoảng ngày đã có người đặt của một phòng, sắp theo thứ tự thời gian.
// Trang chi tiết dùng danh sách này để báo trước cho người dùng biết ngày nào đã kín.
export async function getBookedRangesByRoom(
  maPhong: number,
): Promise<{ from: string; to: string }[]> {
  const bookings = await getBookings();

  return bookings
    .filter(
      (booking) =>
        booking.maPhong === maPhong,
    )
    .map((booking) => ({
      from: booking.ngayDen.slice(0, 10),
      to: booking.ngayDi.slice(0, 10),
    }))
    .filter(
      (range) =>
        range.from &&
        range.to &&
        range.to > range.from,
    )
    .sort((first, second) =>
      first.from.localeCompare(second.from),
    );
}

export async function getUnavailableRoomIds(
  checkIn: string,
  checkOut: string,
): Promise<Set<number>> {
  const bookings = await getBookings();

  const unavailableRoomIds =
    new Set<number>();

  bookings.forEach((booking) => {
    const hasConflict = rangesOverlap(
      checkIn,
      checkOut,
      booking.ngayDen,
      booking.ngayDi,
    );

    if (hasConflict) {
      unavailableRoomIds.add(
        booking.maPhong,
      );
    }
  });

  return unavailableRoomIds;
}

export async function hasRoomBookingConflict(
  maPhong: number,
  newCheckIn: string,
  newCheckOut: string,
  excludeBookingId?: number,
): Promise<boolean> {
  const bookings = await getBookings();

  return bookings.some(
    (booking) =>
      booking.id !== excludeBookingId &&
      booking.maPhong === maPhong &&
      rangesOverlap(
        newCheckIn,
        newCheckOut,
        booking.ngayDen,
        booking.ngayDi,
      ),
  );
}