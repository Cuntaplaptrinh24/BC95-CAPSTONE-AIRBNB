// Trang quản lý Đặt phòng.

import type { Metadata } from 'next';
import { getBookings } from '@/services/booking-service';
import { getRooms } from '@/services/room-service';
import { getUserById } from '@/services/user-service';
import AdminSearchForm from '@/components/admin/admin-search-form';
import AdminPagination from '@/components/admin/admin-pagination';
import BookingsPanel from '@/components/admin/bookings/bookings-panel';

// Tiêu đề hiện trên tab trình duyệt khi mở trang này.
export const metadata: Metadata = {
  title: 'Quản lý đặt phòng | Admin',
};

// Bắt Next.js dựng lại trang mỗi lần mở, không dùng bản đã lưu sẵn.
// Dữ liệu quản trị thay đổi liên tục nên phải lấy mới, nếu không vừa thêm
// một dòng xong quay lại danh sách vẫn thấy dữ liệu cũ.
export const dynamic = 'force-dynamic';

const PAGE_SIZE = 10;
const BASE_PATH = '/admin/bookings';

// searchParams là phần đứng sau dấu hỏi trên địa chỉ, ví dụ ?keyword=an&page=2.
// Ở Next.js phiên bản này nó về dạng phải chờ, nên bên dưới có await.
interface AdminBookingsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// Khác các trang trước: API đặt phòng của CyberSoft không có sẵn chức năng
// phân trang và tìm kiếm, nên trang này tải toàn bộ danh sách rồi tự lọc,
// tự cắt thành từng trang. Số lượng đặt phòng trong bài đủ nhỏ để làm vậy.
export default async function AdminBookingsPage({ searchParams }: AdminBookingsPageProps) {
  // Chờ lấy phần tham số trên địa chỉ.
  const raw = await searchParams;

  // Một tham số có thể xuất hiện nhiều lần trên địa chỉ, ví dụ ?page=1&page=2,
  // khi đó nó về dạng danh sách. Lấy giá trị đầu tiên cho chắc.
  const rawPage = Array.isArray(raw.page) ? raw.page[0] : raw.page;
  const rawKeyword = Array.isArray(raw.keyword) ? raw.keyword[0] : raw.keyword;

  // Không có số trang hoặc số trang không hợp lệ thì coi như trang 1.
  // Từ khóa rỗng thì coi như không tìm kiếm.
  const pageIndex = Number(rawPage) > 0 ? Number(rawPage) : 1;
  const keyword = rawKeyword?.trim().toLowerCase() || undefined;

  // Lấy cùng lúc toàn bộ lượt đặt và toàn bộ phòng.
  const [allBookings, rooms] = await Promise.all([getBookings(), getRooms()]);

  // Mỗi lượt đặt chỉ lưu mã phòng chứ không lưu tên phòng. Dòng này dựng ra một
  // bảng tra cứu từ mã sang tên, để bảng bên dưới hiện tên phòng cho dễ đọc.
  const roomNameByCode = Object.fromEntries(rooms.map((room) => [room.id, room.tenPhong]));

  // Bảng tra sức chứa theo mã phòng, để form sửa chặn số khách vượt quá phòng.
  const roomCapacityByCode = Object.fromEntries(
    rooms.map((room) => [room.id, room.khach]),
  );

  // Có từ khóa thì lọc theo tên phòng, mã phòng hoặc mã người đặt.
  // Không có thì giữ nguyên cả danh sách.
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

  // Tự cắt danh sách đã lọc thành từng trang: bỏ qua các dòng của những trang trước,
  // rồi lấy đúng 10 dòng tiếp theo.
  const totalRow = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalRow / PAGE_SIZE));
  const startIndex = (pageIndex - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  // Bảng chỉ lưu mã người đặt. Lấy tên của đúng những người xuất hiện trên trang này
  // (nhiều nhất 10 người) thay vì tải cả mấy nghìn tài khoản về.
  // Dùng allSettled để một lời gọi hỏng không làm cả trang lỗi; chỗ nào thiếu tên
  // thì bảng hiện lại mã như cũ.
  const userIds = Array.from(
    new Set(pageItems.map((booking) => booking.maNguoiDung)),
  );

  const userResults = await Promise.allSettled(
    userIds.map((id) => getUserById(id)),
  );

  const userNameByCode: Record<number, string> = {};

  userResults.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      userNameByCode[userIds[index]] = result.value.name;
    }
  });

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
        <BookingsPanel
          bookings={pageItems}
          roomNameByCode={roomNameByCode}
          roomCapacityByCode={roomCapacityByCode}
          userNameByCode={userNameByCode}
        />

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
