// Trang quản lý Người dùng.
// Trang này chạy ở máy chủ: nó gọi API lấy dữ liệu rồi mới gửi trang về trình duyệt.
// Phần bảng và các nút thêm sửa xóa nằm ở UsersPanel, vì những việc đó cần
// bắt sự kiện bấm chuột nên phải chạy trong trình duyệt.

import type { Metadata } from 'next';
import { getUsersPaged } from '@/services/user-service';
import AdminSearchForm from '@/components/admin/admin-search-form';
import AdminPagination from '@/components/admin/admin-pagination';
import UsersPanel from '@/components/admin/users/users-panel';

// Tiêu đề hiện trên tab trình duyệt khi mở trang này.
export const metadata: Metadata = {
  title: 'Quản lý người dùng | Admin',
};

// Bắt Next.js dựng lại trang mỗi lần mở, không dùng bản đã lưu sẵn.
// Dữ liệu quản trị thay đổi liên tục nên phải lấy mới, nếu không vừa thêm
// một dòng xong quay lại danh sách vẫn thấy dữ liệu cũ.
export const dynamic = 'force-dynamic';

// Mỗi trang hiện 10 dòng. BASE_PATH dùng để ghép địa chỉ cho ô tìm kiếm và phân trang.
const PAGE_SIZE = 10;
const BASE_PATH = '/admin/users';

// searchParams là phần đứng sau dấu hỏi trên địa chỉ, ví dụ ?keyword=an&page=2.
// Ở Next.js phiên bản này nó về dạng phải chờ, nên bên dưới có await.
interface AdminUsersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  // Chờ lấy phần tham số trên địa chỉ.
  const raw = await searchParams;

  // Một tham số có thể xuất hiện nhiều lần trên địa chỉ, ví dụ ?page=1&page=2,
  // khi đó nó về dạng danh sách. Lấy giá trị đầu tiên cho chắc.
  const rawPage = Array.isArray(raw.page) ? raw.page[0] : raw.page;
  const rawKeyword = Array.isArray(raw.keyword) ? raw.keyword[0] : raw.keyword;

  // Không có số trang hoặc số trang không hợp lệ thì coi như trang 1.
  // Từ khóa rỗng thì coi như không tìm kiếm.
  const pageIndex = Number(rawPage) > 0 ? Number(rawPage) : 1;
  const keyword = rawKeyword?.trim() || undefined;

  // Gọi API lấy đúng một trang dữ liệu. API trả về danh sách dòng kèm tổng số dòng.
  const result = await getUsersPaged({ pageIndex, pageSize: PAGE_SIZE, keyword });

  // Tổng số trang: lấy tổng số dòng chia cho số dòng mỗi trang rồi làm tròn lên.
  // Luôn tối thiểu là 1 để danh sách rỗng không ra 0 trang.
  const totalPages = Math.max(1, Math.ceil(result.totalRow / PAGE_SIZE));

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Người dùng</h1>
          <p className="text-sm text-secondary">Tổng số: {result.totalRow} người dùng</p>
        </div>

        <AdminSearchForm
          basePath={BASE_PATH}
          keyword={keyword}
          placeholder="Tìm theo tên hoặc email..."
        />
      </div>

      <div className="mt-6">
        {/* Truyền danh sách xuống panel để vẽ bảng và xử lý thêm sửa xóa */}
        <UsersPanel users={result.data} />

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
