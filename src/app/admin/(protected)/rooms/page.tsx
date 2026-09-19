// Trang quản lý Phòng thuê.
// Khác hai trang trước ở chỗ phải lấy thêm danh sách vị trí, để form thêm và sửa phòng
// có sẵn danh sách vị trí cho người dùng chọn.

import type { Metadata } from 'next';
import { getRoomsPaged } from '@/services/room-service';
import { getLocations } from '@/services/location-service';
import AdminSearchForm from '@/components/admin/admin-search-form';
import AdminPagination from '@/components/admin/admin-pagination';
import RoomsPanel from '@/components/admin/rooms/rooms-panel';

// Tiêu đề hiện trên tab trình duyệt khi mở trang này.
export const metadata: Metadata = {
  title: 'Quản lý phòng thuê | Admin',
};

// Bắt Next.js dựng lại trang mỗi lần mở, không dùng bản đã lưu sẵn.
// Dữ liệu quản trị thay đổi liên tục nên phải lấy mới, nếu không vừa thêm
// một dòng xong quay lại danh sách vẫn thấy dữ liệu cũ.
export const dynamic = 'force-dynamic';

const PAGE_SIZE = 10;
const BASE_PATH = '/admin/rooms';

// searchParams là phần đứng sau dấu hỏi trên địa chỉ, ví dụ ?keyword=an&page=2.
// Ở Next.js phiên bản này nó về dạng phải chờ, nên bên dưới có await.
interface AdminRoomsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminRoomsPage({ searchParams }: AdminRoomsPageProps) {
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

  // Promise.all gọi hai API cùng lúc thay vì chờ xong cái này mới gọi cái kia,
  // nên trang hiện ra nhanh hơn.
  const [result, locations] = await Promise.all([
    getRoomsPaged({ pageIndex, pageSize: PAGE_SIZE, keyword }),
    getLocations(),
  ]);
  const totalPages = Math.max(1, Math.ceil(result.totalRow / PAGE_SIZE));

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Phòng thuê</h1>
          <p className="text-sm text-secondary">Tổng số: {result.totalRow} phòng</p>
        </div>

        <AdminSearchForm
          basePath={BASE_PATH}
          keyword={keyword}
          placeholder="Tìm theo tên phòng..."
        />
      </div>

      <div className="mt-6">
        <RoomsPanel rooms={result.data} locations={locations} />

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
