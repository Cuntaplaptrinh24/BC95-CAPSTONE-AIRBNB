// Trang quản lý Bình luận.

import type { Metadata } from 'next';
import { getComments } from '@/services/comment-service';
import { getRooms } from '@/services/room-service';
import AdminSearchForm from '@/components/admin/admin-search-form';
import AdminPagination from '@/components/admin/admin-pagination';
import AdminSortSelect from '@/components/admin/admin-sort-select';
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

// Bốn cách sắp xếp cho người kiểm duyệt chọn.
// Mặc định là mới nhất trước, vì bình luận mới là thứ cần xem trước.
// Sao thấp nhất trước dùng khi muốn soi những đánh giá tệ.
const SORT_OPTIONS = [
  { value: 'moi-nhat', label: 'Mới nhất' },
  { value: 'cu-nhat', label: 'Cũ nhất' },
  { value: 'sao-thap', label: 'Sao thấp trước' },
  { value: 'sao-cao', label: 'Sao cao trước' },
];
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

  // Cách sắp xếp cũng đọc từ địa chỉ. Giá trị lạ thì quay về mặc định.
  const rawSort = Array.isArray(raw.sort) ? raw.sort[0] : raw.sort;
  const sort = SORT_OPTIONS.some((option) => option.value === rawSort)
    ? (rawSort as string)
    : 'moi-nhat';

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

  // Sắp xếp trước khi cắt trang, để thứ tự áp dụng cho cả danh sách
  // chứ không chỉ cho 10 dòng đang xem.
  // Hai cách sắp theo sao thì cùng số sao lấy bình luận mới hơn lên trước.
  const sorted = [...filtered].sort((first, second) => {
    const firstTime = new Date(first.ngayBinhLuan).getTime() || 0;
    const secondTime = new Date(second.ngayBinhLuan).getTime() || 0;

    if (sort === 'cu-nhat') {
      return firstTime - secondTime || first.id - second.id;
    }

    if (sort === 'sao-thap' && first.saoBinhLuan !== second.saoBinhLuan) {
      return first.saoBinhLuan - second.saoBinhLuan;
    }

    if (sort === 'sao-cao' && first.saoBinhLuan !== second.saoBinhLuan) {
      return second.saoBinhLuan - first.saoBinhLuan;
    }

    return secondTime - firstTime || second.id - first.id;
  });

  // Tự cắt danh sách đã lọc thành từng trang 10 dòng.
  const totalRow = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalRow / PAGE_SIZE));
  const startIndex = (pageIndex - 1) * PAGE_SIZE;
  const pageItems = sorted.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Bình luận</h1>
          <p className="text-sm text-secondary">Tổng số: {totalRow} bình luận</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <AdminSortSelect
            basePath={BASE_PATH}
            sort={sort}
            keyword={keyword}
            options={SORT_OPTIONS}
          />

          <AdminSearchForm
            basePath={BASE_PATH}
            keyword={keyword}
            sort={sort}
            placeholder="Tìm theo phòng, nội dung, người bình luận..."
          />
        </div>
      </div>

      <div className="mt-6">
        <CommentsPanel comments={pageItems} roomNameByCode={roomNameByCode} />

        <AdminPagination
          basePath={BASE_PATH}
          currentPage={pageIndex}
          totalPages={totalPages}
          keyword={keyword}
          sort={sort}
        />
      </div>
    </div>
  );
}
