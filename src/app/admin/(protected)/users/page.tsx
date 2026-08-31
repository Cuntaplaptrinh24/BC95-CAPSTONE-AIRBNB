import type { Metadata } from 'next';
import { getUsersPaged } from '@/services/user-service';
import AdminSearchForm from '@/components/admin/admin-search-form';
import AdminPagination from '@/components/admin/admin-pagination';
import UsersPanel from '@/components/admin/users/users-panel';

export const metadata: Metadata = {
  title: 'Quản lý người dùng | Admin',
};

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 10;
const BASE_PATH = '/admin/users';

interface AdminUsersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const raw = await searchParams;
  const rawPage = Array.isArray(raw.page) ? raw.page[0] : raw.page;
  const rawKeyword = Array.isArray(raw.keyword) ? raw.keyword[0] : raw.keyword;

  const pageIndex = Number(rawPage) > 0 ? Number(rawPage) : 1;
  const keyword = rawKeyword?.trim() || undefined;

  const result = await getUsersPaged({ pageIndex, pageSize: PAGE_SIZE, keyword });
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
