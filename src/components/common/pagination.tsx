import Link from "next/link";
import type { RoomsQueryParams } from "@/app/rooms/query";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  query: RoomsQueryParams;
}

function buildHref(q: RoomsQueryParams, page: number): string {
  const params = new URLSearchParams();
  if (q.locationId !== undefined) params.set("locationId", String(q.locationId));
  if (q.keyword) params.set("keyword", q.keyword);
  if (q.checkIn) params.set("checkIn", q.checkIn);
  if (q.checkOut) params.set("checkOut", q.checkOut);
  if (q.guests !== undefined && q.guests !== 1) params.set("guests", String(q.guests));
  params.set("page", String(page));
  return `/rooms?${params.toString()}`;
}

function getWindowPages(current: number, total: number): number[] {
  const size = 5;
  const start = Math.max(1, current - Math.floor(size / 2));
  const end = Math.min(total, start + size - 1);
  const adjustedStart = Math.max(1, end - size + 1);
  const pages: number[] = [];
  for (let i = adjustedStart; i <= end; i++) pages.push(i);
  return pages;
}

export default function Pagination({ currentPage, totalPages, query }: PaginationProps) {
  if (totalPages <= 1) return null;

  const prevDisabled = currentPage <= 1;
  const nextDisabled = currentPage >= totalPages;
  const windowPages = getWindowPages(currentPage, totalPages);

  return (
    <nav aria-label="Phân trang" className="mt-10 flex items-center justify-center gap-1">
      {prevDisabled ? (
        <span
          className="flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-full text-secondary opacity-50"
          aria-disabled="true"
        >
          ‹
        </span>
      ) : (
        <Link
          href={buildHref(query, currentPage - 1)}
          aria-label="Trang trước"
          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition hover:bg-surface"
        >
          ‹
        </Link>
      )}

      {windowPages.map((p) => (
        <Link
          key={p}
          href={buildHref(query, p)}
          aria-label={`Trang ${p}`}
          aria-current={p === currentPage ? "page" : undefined}
          className={`flex h-9 w-9 items-center justify-center rounded-full text-sm transition ${
            p === currentPage
              ? "bg-brand font-semibold text-white"
              : "text-foreground hover:bg-surface"
          }`}
        >
          {p}
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
          href={buildHref(query, currentPage + 1)}
          aria-label="Trang sau"
          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition hover:bg-surface"
        >
          ›
        </Link>
      )}
    </nav>
  );
}
