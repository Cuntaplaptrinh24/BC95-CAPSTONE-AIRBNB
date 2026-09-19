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

// Các lời gọi API về đặt phòng, cộng thêm phần tự kiểm tra trùng lịch ở cuối file.

const RESOURCE = "/dat-phong";

// Lấy toàn bộ lượt đặt. API không có phân trang nên trang quản lý Đặt phòng
// tải hết rồi tự lọc và tự cắt trang.
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

// Kiểm tra hai khoảng thời gian có đè lên nhau không.
// Quy tắc: đè nhau khi ngày nhận mới sớm hơn ngày trả cũ, và ngày trả mới
// muộn hơn ngày nhận cũ. Cả hai phải cùng đúng.
//
// Ví dụ phòng đã có người đặt từ 10 tới 15.
//   Đặt 12 tới 14: đè nhau, vì 12 sớm hơn 15 và 14 muộn hơn 10.
//   Đặt 15 tới 18: không đè, vì 15 không sớm hơn 15. Ai trả phòng hôm nào thì
//   hôm đó người khác nhận được luôn.
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

  // Ngày không đọc được, hoặc ngày trả không sau ngày nhận, thì coi như không đè,
  // vì dữ liệu đó vốn đã sai, không dùng để chặn người khác đặt phòng.
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

// Trả về danh sách mã phòng đã kín trong khoảng ngày đang tìm,
// để trang tìm phòng loại chúng ra khỏi kết quả.
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

// Kiểm tra một phòng cụ thể đã có ai đặt trùng ngày chưa.
// Lấy toàn bộ lượt đặt, giữ lại những lượt của đúng phòng đó, rồi so ngày.
// excludeBookingId dùng khi đang sửa một lượt đặt: bỏ qua chính nó,
// nếu không thì lượt đặt đó tự báo trùng với chính mình.
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