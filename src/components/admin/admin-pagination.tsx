// Thanh phân trang dùng chung cho các bảng quản lý.
// Mỗi số trang là một đường dẫn thật chứ không phải nút bấm, nên bấm vào là
// đổi địa chỉ trang, và trang quản lý bên kia tự gọi lại API để lấy đúng trang đó.

import Link from 'next/link';

interface AdminPaginationProps {
  basePath: string;
  currentPage: number;
  totalPages: number;
  keyword?: string;
}

// Ghép ra địa chỉ cho một số trang, ví dụ /admin/users?keyword=an&page=3.
// Giữ lại từ khóa đang tìm để chuyển trang không làm mất kết quả tìm kiếm.
function buildHref(basePath: string, page: number, keyword?: string): string {
  const params = new URLSearchParams();
  if (keyword) params.set('keyword', keyword);
  params.set('page', String(page));
  return `${basePath}?${params.toString()}`;
}

// Chọn tối đa 5 số trang hiện quanh trang đang xem, tránh việc có 50 trang
// thì in ra 50 con số. Đang ở trang 10 thì hiện 8 9 10 11 12.
function getWindowPages(current: number, total: number): number[] {
  const size = 5;
  const start = Math.max(1, current - Math.floor(size / 2));
  const end = Math.min(total, start + size - 1);
  const adjustedStart = Math.max(1, end - size + 1);
  const pages: number[] = [];
  for (let i = adjustedStart; i <= end; i++) pages.push(i);
  return pages;
}

export default function AdminPagination({
  basePath,
  currentPage,
  totalPages,
  keyword,
}: AdminPaginationProps) {
  // Chỉ có một trang thì không cần vẽ thanh phân trang.
  if (totalPages <= 1) {
    return null;
  }

  // Ở trang đầu thì mũi tên lùi mờ đi, ở trang cuối thì mũi tên tiến mờ đi.
  const prevDisabled = currentPage <= 1;
  const nextDisabled = currentPage >= totalPages;
  const windowPages = getWindowPages(currentPage, totalPages);

  return (
    <nav aria-label="Phân trang" className="mt-6 flex items-center justify-center gap-1">
      {prevDisabled ? (
        <span
          className="flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-full text-secondary opacity-50"
          aria-disabled="true"
        >
          ‹
        </span>
      ) : (
        <Link
          href={buildHref(basePath, currentPage - 1, keyword)}
          aria-label="Trang trước"
          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition hover:bg-surface"
        >
          ‹
        </Link>
      )}

      {windowPages.map((page) => (
        <Link
          key={page}
          href={buildHref(basePath, page, keyword)}
          aria-label={`Trang ${page}`}
          aria-current={page === currentPage ? 'page' : undefined}
          className={`flex h-9 w-9 items-center justify-center rounded-full text-sm transition ${
            page === currentPage
              ? 'bg-brand font-semibold text-white'
              : 'text-foreground hover:bg-surface'
          }`}
        >
          {page}
        </Link>
      ))}

      {nextDisabled ? (
        <span
          className="flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-full text-secondary opacity-50"
          aria-disabled="true"
        >
          ›
        </span>
      ) : (
        <Link
          href={buildHref(basePath, currentPage + 1, keyword)}
          aria-label="Trang sau"
          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition hover:bg-surface"
        >
          ›
        </Link>
      )}
    </nav>
  );
}
