import Link from "next/link";

import DataErrorState from "@/components/common/data-error-state";
import EmptyState from "@/components/common/empty-state";
import LocationCard from "@/components/home/location-card";

import {
  getLocationsPaged,
} from "@/services/location-service";

export const dynamic =
  "force-dynamic";

const PAGE_SIZE = 12;

interface LocationsPageProps {
  searchParams: Promise<
    Record<
      string,
      string | string[] | undefined
    >
  >;
}

function asSingle(
  value:
    | string
    | string[]
    | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function parsePage(
  value: string | undefined,
): number {
  if (
    !value ||
    !/^\d+$/.test(value)
  ) {
    return 1;
  }

  const page = Number(value);

  if (
    !Number.isSafeInteger(page) ||
    page < 1
  ) {
    return 1;
  }

  return page;
}

function buildPageHref(
  page: number,
  keyword: string,
): string {
  const params =
    new URLSearchParams();

  if (keyword) {
    params.set(
      "keyword",
      keyword,
    );
  }

  params.set(
    "page",
    String(page),
  );

  return `/locations?${params.toString()}`;
}

function getWindowPages(
  currentPage: number,
  totalPages: number,
): number[] {
  const windowSize = 5;

  const start = Math.max(
    1,
    currentPage -
      Math.floor(
        windowSize / 2,
      ),
  );

  const end = Math.min(
    totalPages,
    start + windowSize - 1,
  );

  const adjustedStart =
    Math.max(
      1,
      end - windowSize + 1,
    );

  return Array.from(
    {
      length:
        end -
        adjustedStart +
        1,
    },
    (_, index) =>
      adjustedStart + index,
  );
}

export default async function LocationsPage({
  searchParams,
}: LocationsPageProps) {
  const raw =
    await searchParams;

  const keyword = (
    asSingle(raw.keyword) ?? ""
  ).trim();

  let currentPage =
    parsePage(
      asSingle(raw.page),
    );

  let response;

  try {
    response =
      await getLocationsPaged({
        pageIndex: currentPage,
        pageSize: PAGE_SIZE,
        keyword:
          keyword || undefined,
      });

    const availablePages =
      Math.max(
        1,
        Math.ceil(
          response.totalRow /
            PAGE_SIZE,
        ),
      );

    if (
      response.totalRow > 0 &&
      currentPage >
        availablePages
    ) {
      currentPage =
        availablePages;

      response =
        await getLocationsPaged({
          pageIndex:
            currentPage,
          pageSize:
            PAGE_SIZE,
          keyword:
            keyword ||
            undefined,
        });
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Đã xảy ra lỗi không xác định.";

    return (
      <div className="container-airbnb py-10 sm:py-12">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Khám phá địa điểm
        </h1>

        <div className="mt-6">
          <DataErrorState
            title="Không thể tải danh sách địa điểm."
            message={message}
          />
        </div>
      </div>
    );
  }

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        response.totalRow /
          PAGE_SIZE,
      ),
    );

  const pages =
    getWindowPages(
      currentPage,
      totalPages,
    );

  return (
    <div className="container-airbnb py-10 sm:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Khám phá địa điểm
          </h1>

          <p className="mt-1 text-sm text-secondary">
            {response.totalRow}{" "}
            địa điểm
            {keyword
              ? ` phù hợp với “${keyword}”`
              : ""}
          </p>
        </div>

        <form
          action="/locations"
          method="get"
          className="flex w-full gap-2 sm:w-auto"
        >
          <label
            htmlFor="location-keyword"
            className="sr-only"
          >
            Tìm địa điểm
          </label>

          <input
            id="location-keyword"
            name="keyword"
            type="search"
            defaultValue={
              keyword
            }
            placeholder="Nhập tên địa điểm..."
            className="min-w-0 flex-1 rounded-full border border-border px-4 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-1 focus:ring-brand sm:w-72"
          />

          <button
            type="submit"
            className="shrink-0 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            Tìm kiếm
          </button>
        </form>
      </div>

      {keyword && (
        <Link
          href="/locations"
          className="mt-3 inline-block text-sm font-medium text-brand hover:underline"
        >
          Xóa từ khóa tìm kiếm
        </Link>
      )}

      {response.data.length ===
      0 ? (
        <div className="mt-8">
          <EmptyState
            title="Không tìm thấy địa điểm phù hợp."
            description="Hãy thử một tên địa điểm hoặc tỉnh thành khác."
          />
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {response.data.map(
              (location) => (
                <LocationCard
                  key={
                    location.id
                  }
                  location={
                    location
                  }
                />
              ),
            )}
          </div>

          {totalPages > 1 && (
            <nav
              aria-label="Phân trang địa điểm"
              className="mt-10 flex items-center justify-center gap-1"
            >
              {currentPage <=
              1 ? (
                <span
                  aria-disabled="true"
                  className="flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-full text-secondary opacity-50"
                >
                  ‹
                </span>
              ) : (
                <Link
                  href={buildPageHref(
                    currentPage -
                      1,
                    keyword,
                  )}
                  aria-label="Trang trước"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition hover:bg-surface"
                >
                  ‹
                </Link>
              )}

              {pages.map(
                (page) => (
                  <Link
                    key={page}
                    href={buildPageHref(
                      page,
                      keyword,
                    )}
                    aria-label={`Trang ${page}`}
                    aria-current={
                      page ===
                      currentPage
                        ? "page"
                        : undefined
                    }
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm transition ${
                      page ===
                      currentPage
                        ? "bg-brand font-semibold text-white"
                        : "text-foreground hover:bg-surface"
                    }`}
                  >
                    {page}
                  </Link>
                ),
              )}

              {currentPage >=
              totalPages ? (
                <span
                  aria-disabled="true"
                  className="flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-full text-secondary opacity-50"
                >
                  ›
                </span>
              ) : (
                <Link
                  href={buildPageHref(
                    currentPage +
                      1,
                    keyword,
                  )}
                  aria-label="Trang sau"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition hover:bg-surface"
                >
                  ›
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}