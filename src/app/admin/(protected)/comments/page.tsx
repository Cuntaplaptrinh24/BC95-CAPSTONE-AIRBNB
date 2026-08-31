import type { Metadata } from 'next';
import { getComments } from '@/services/comment-service';
import { getRooms } from '@/services/room-service';
import AdminSearchForm from '@/components/admin/admin-search-form';
import AdminPagination from '@/components/admin/admin-pagination';
import CommentsPanel from '@/components/admin/comments/comments-panel';

export const metadata: Metadata = {
  title: 'Quản lý bình luận | Admin',
};

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 10;
const BASE_PATH = '/admin/comments';

interface AdminCommentsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// API bình luận không có endpoint phân trang/tìm kiếm sẵn, nên Admin tải toàn bộ
// danh sách rồi lọc + phân trang tại đây, tương tự trang Đặt phòng.
export default async function AdminCommentsPage({ searchParams }: AdminCommentsPageProps) {
  const raw = await searchParams;
  const rawPage = Array.isArray(raw.page) ? raw.page[0] : raw.page;
  const rawKeyword = Array.isArray(raw.keyword) ? raw.keyword[0] : raw.keyword;

  const pageIndex = Number(rawPage) > 0 ? Number(rawPage) : 1;
  const keyword = rawKeyword?.trim().toLowerCase() || undefined;

  const [allComments, rooms] = await Promise.all([getComments(), getRooms()]);
  const roomNameByCode = Object.fromEntries(rooms.map((room) => [room.id, room.tenPhong]));

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
