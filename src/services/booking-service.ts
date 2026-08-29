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

function rangesOverlap(
  newCheckIn: string,
  newCheckOut: string,
  existingCheckIn: string,
  existingCheckOut: string,
): boolean {
  const newIn =
    new Date(newCheckIn).getTime();

  const newOut =
    new Date(newCheckOut).getTime();

  const existingIn =
    new Date(existingCheckIn).getTime();

  const existingOut =
    new Date(existingCheckOut).getTime();

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