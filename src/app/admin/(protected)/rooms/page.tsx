import type { Metadata } from 'next';
import { getRoomsPaged } from '@/services/room-service';
import { getLocations } from '@/services/location-service';
import AdminSearchForm from '@/components/admin/admin-search-form';
import AdminPagination from '@/components/admin/admin-pagination';
import RoomsPanel from '@/components/admin/rooms/rooms-panel';

export const metadata: Metadata = {
  title: 'Quản lý phòng thuê | Admin',
};

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 10;
const BASE_PATH = '/admin/rooms';

interface AdminRoomsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminRoomsPage({ searchParams }: AdminRoomsPageProps) {
  const raw = await searchParams;
  const rawPage = Array.isArray(raw.page) ? raw.page[0] : raw.page;
  const rawKeyword = Array.isArray(raw.keyword) ? raw.keyword[0] : raw.keyword;

  const pageIndex = Number(rawPage) > 0 ? Number(rawPage) : 1;
  const keyword = rawKeyword?.trim() || undefined;

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
