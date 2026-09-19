// Trang quản lý Vị trí. Cấu trúc giống hệt trang Người dùng:
// chạy ở máy chủ, đọc số trang và từ khóa trên địa chỉ, gọi API lấy một trang dữ liệu,
// rồi giao cho LocationsPanel vẽ bảng và xử lý thêm sửa xóa.

import type { Metadata } from 'next';
import { getLocationsPaged } from '@/services/location-service';
import AdminSearchForm from '@/components/admin/admin-search-form';
import AdminPagination from '@/components/admin/admin-pagination';
import LocationsPanel from '@/components/admin/locations/locations-panel';

// Tiêu đề hiện trên tab trình duyệt khi mở trang này.
export const metadata: Metadata = {
  title: 'Quản lý vị trí | Admin',
};

// Bắt Next.js dựng lại trang mỗi lần mở, không dùng bản đã lưu sẵn.
// Dữ liệu quản trị thay đổi liên tục nên phải lấy mới, nếu không vừa thêm
// một dòng xong quay lại danh sách vẫn thấy dữ liệu cũ.
export const dynamic = 'force-dynamic';

const PAGE_SIZE = 10;
const BASE_PATH = '/admin/locations';

// searchParams là phần đứng sau dấu hỏi trên địa chỉ, ví dụ ?keyword=an&page=2.
// Ở Next.js phiên bản này nó về dạng phải chờ, nên bên dưới có await.
interface AdminLocationsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminLocationsPage({ searchParams }: AdminLocationsPageProps) {
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

  // Gọi API lấy đúng một trang vị trí, kèm tổng số dòng để tính số trang.
  const result = await getLocationsPaged({ pageIndex, pageSize: PAGE_SIZE, keyword });

  const totalPages = Math.max(1, Math.ceil(result.totalRow / PAGE_SIZE));

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Vị trí</h1>
          <p className="text-sm text-secondary">Tổng số: {result.totalRow} vị trí</p>
        </div>

        <AdminSearchForm
          basePath={BASE_PATH}
          keyword={keyword}
          placeholder="Tìm theo tên vị trí..."
        />
      </div>

      <div className="mt-6">
        <LocationsPanel locations={result.data} />

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
