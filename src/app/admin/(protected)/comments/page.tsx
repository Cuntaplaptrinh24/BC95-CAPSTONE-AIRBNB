// Trang quản lý Bình luận.

import type { Metadata } from 'next';
import { getComments } from '@/services/comment-service';
import { getRooms } from '@/services/room-service';
import AdminSearchForm from '@/components/admin/admin-search-form';
import AdminPagination from '@/components/admin/admin-pagination';
import CommentsPanel from '@/components/admin/comments/comments-panel';

// Tiêu đề hiện trên tab trình duyệt khi mở trang này.
export const metadata: Metadata = {
  title: 'Quản lý bình luận | Admin',
};

// Bắt Next.js dựng lại trang mỗi lần mở, không dùng bản đã lưu sẵn.
// Dữ liệu quản trị thay đổi liên tục nên phải lấy mới, nếu không vừa thêm
// một dòng xong quay lại danh sách vẫn thấy dữ liệu cũ.
export const dynamic = 'force-dynamic';

const PAGE_SIZE = 10;
const BASE_PATH = '/admin/comments';

// searchParams là phần đứng sau dấu hỏi trên địa chỉ, ví dụ ?keyword=an&page=2.
// Ở Next.js phiên bản này nó về dạng phải chờ, nên bên dưới có await.
interface AdminCommentsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// Giống trang Đặt phòng: API bình luận không có sẵn phân trang và tìm kiếm,
// nên tải hết về rồi tự lọc và tự cắt trang.
export default async function AdminCommentsPage({ searchParams }: AdminCommentsPageProps) {
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

  const [allComments, rooms] = await Promise.all([getComments(), getRooms()]);

  // Bình luận chỉ lưu mã phòng, nên dựng bảng tra cứu từ mã sang tên phòng.
  const roomNameByCode = Object.fromEntries(rooms.map((room) => [room.id, room.tenPhong]));

  // Có từ khóa thì lọc theo tên phòng, nội dung bình luận hoặc tên người bình luận.
  const filtered = keyword
    ? allComments.filter((comment) => {
        const roomName = roomNameByCode[comment.maPhong] ?? '';
        return (
          roomName.toLowerCase().includes(keyword) ||
          comment.noiDung.toLowerCase().includes(keyword) ||
          (comment.tenNguoiBinhLuan ?? '').toLowerCase().includes(keyword)
        );
      })
    : allComments;

  // Tự cắt danh sách đã lọc thành từng trang 10 dòng.
  const totalRow = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalRow / PAGE_SIZE));
  const startIndex = (pageIndex - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Bình luận</h1>
          <p className="text-sm text-secondary">Tổng số: {totalRow} bình luận</p>
        </div>

        <AdminSearchForm
          basePath={BASE_PATH}
          keyword={keyword}
          placeholder="Tìm theo phòng, nội dung, người bình luận..."
        />
      </div>

      <div className="mt-6">
        <CommentsPanel comments={pageItems} roomNameByCode={roomNameByCode} />

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
