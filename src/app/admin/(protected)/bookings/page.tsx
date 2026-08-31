import type { Metadata } from 'next';
import { getBookings } from '@/services/booking-service';
import { getRooms } from '@/services/room-service';
import AdminSearchForm from '@/components/admin/admin-search-form';
import AdminPagination from '@/components/admin/admin-pagination';
import BookingsPanel from '@/components/admin/bookings/bookings-panel';

export const metadata: Metadata = {
  title: 'Quản lý đặt phòng | Admin',
};

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 10;
const BASE_PATH = '/admin/bookings';

interface AdminBookingsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// API đặt phòng không có endpoint phân trang/tìm kiếm sẵn, nên Admin tải toàn bộ
// danh sách rồi lọc + phân trang tại đây (số lượng đặt phòng của một dự án capstone
// đủ nhỏ để làm việc này phía server mà không cần tối ưu thêm).
export default async function AdminBookingsPage({ searchParams }: AdminBookingsPageProps) {
  const raw = await searchParams;
  const rawPage = Array.isArray(raw.page) ? raw.page[0] : raw.page;
  const rawKeyword = Array.isArray(raw.keyword) ? raw.keyword[0] : raw.keyword;

  const pageIndex = Number(rawPage) > 0 ? Number(rawPage) : 1;
  const keyword = rawKeyword?.trim().toLowerCase() || undefined;

  const [allBookings, rooms] = await Promise.all([getBookings(), getRooms()]);
  const roomNameByCode = Object.fromEntries(rooms.map((room) => [room.id, room.tenPhong]));

  const filtered = keyword
    ? allBookings.filter((booking) => {
        const roomName = roomNameByCode[booking.maPhong] ?? '';
        return (
          roomName.toLowerCase().includes(keyword) ||
          String(booking.maPhong).includes(keyword) ||
          String(booking.maNguoiDung).includes(keyword)
        );
      })
    : allBookings;

  const totalRow = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalRow / PAGE_SIZE));
  const startIndex = (pageIndex - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Đặt phòng</h1>
          <p className="text-sm text-secondary">Tổng số: {totalRow} đặt phòng</p>
        </div>

        <AdminSearchForm
          basePath={BASE_PATH}
          keyword={keyword}
          placeholder="Tìm theo tên phòng hoặc mã người dùng..."
        />
      </div>

      <div className="mt-6">
        <BookingsPanel bookings={pageItems} roomNameByCode={roomNameByCode} />

        <AdminPagination
          basePath={BASE_PATH}
          currentPage={pageIndex}
          totalPages={totalPages}
          keyword={keyword}
        />
      </div>
    </div>
  );
}
