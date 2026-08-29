import EmptyState from "@/components/common/empty-state";
import Pagination from "@/components/common/pagination";
import RoomCard from "@/components/room/room-card";
import {
  getUnavailableRoomIds,
} from "@/services/booking-service";
import {
  getLocationById,
} from "@/services/location-service";
import {
  getRooms,
  getRoomsByLocation,
  getRoomsPaged,
} from "@/services/room-service";
import type { Room } from "@/types/room";
import {
  PAGE_SIZE,
  normalizeText,
  paginateRooms,
  parseRoomsSearchParams,
  type RoomsQueryParams,
} from "./query";

export const dynamic = "force-dynamic";

interface RoomsPageProps {
  searchParams: Promise<
    Record<
      string,
      string | string[] | undefined
    >
  >;
}

export default async function RoomsPage({
  searchParams,
}: RoomsPageProps) {
  const raw = await searchParams;
  const params =
    parseRoomsSearchParams(raw);

  const {
    locationId,
    keyword,
    checkIn,
    checkOut,
    guests,
    page,
  } = params;

  if (locationId !== null) {
    return renderByLocation({
      locationId,
      checkIn,
      checkOut,
      guests,
      page,
    });
  }

  return renderBySearch({
    keyword,
    checkIn,
    checkOut,
    guests,
    page,
  });
}

async function renderByLocation(args: {
  locationId: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  page: number;
}) {
  const {
    locationId,
    checkIn,
    checkOut,
    guests,
    page,
  } = args;

  const [
    rooms,
    location,
    unavailableRoomIds,
  ] = await Promise.all([
    getRoomsByLocation(locationId),
    getLocationById(locationId),
    loadUnavailableRoomIds(
      checkIn,
      checkOut,
    ),
  ]);

  const filtered: Room[] =
    rooms.filter(
      (room) =>
        room.khach >= guests &&
        !unavailableRoomIds.has(room.id),
    );

  const result = paginateRooms(
    filtered,
    page,
    PAGE_SIZE,
  );

  const title =
    `Chỗ ở tại ${location.tenViTri}`;

  const query: RoomsQueryParams = {
    locationId,
    checkIn,
    checkOut,
    guests,
  };

  return renderRooms(
    result,
    title,
    query,
  );
}

async function renderBySearch(args: {
  keyword: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  page: number;
}) {
  const {
    keyword,
    checkIn,
    checkOut,
    guests,
    page,
  } = args;

  const hasDateRange = Boolean(
    checkIn && checkOut,
  );

  /*
   * Khi không lọc ngày và chỉ có một khách,
   * sử dụng phân trang từ backend để tránh
   * tải toàn bộ danh sách phòng.
   */
  if (
    guests <= 1 &&
    !hasDateRange
  ) {
    let currentPage = page;

    let response =
      await getRoomsPaged({
        pageIndex: currentPage,
        pageSize: PAGE_SIZE,
        keyword:
          keyword || undefined,
      });

    const totalPages = Math.max(
      1,
      Math.ceil(
        response.totalRow /
          PAGE_SIZE,
      ),
    );

    if (
      response.totalRow > 0 &&
      currentPage > totalPages
    ) {
      currentPage = totalPages;

      response =
        await getRoomsPaged({
          pageIndex: currentPage,
          pageSize: PAGE_SIZE,
          keyword:
            keyword || undefined,
        });
    }

    const title = keyword
      ? `Kết quả cho "${keyword}"`
      : "Khám phá chỗ ở";

    const query: RoomsQueryParams = {
      keyword,
      checkIn,
      checkOut,
      guests,
      page: currentPage,
    };

    return renderRooms(
      {
        rooms: response.data,
        total: response.totalRow,
        page: currentPage,
        totalPages,
      },
      title,
      query,
    );
  }

  /*
   * Khi có ngày hoặc số khách lớn hơn một,
   * lấy danh sách đầy đủ để lọc chính xác
   * trước khi phân trang.
   */
  const [
    allRooms,
    unavailableRoomIds,
  ] = await Promise.all([
    getRooms(),
    loadUnavailableRoomIds(
      checkIn,
      checkOut,
    ),
  ]);

  let filtered: Room[] =
    allRooms.filter(
      (room) =>
        room.khach >= guests &&
        !unavailableRoomIds.has(
          room.id,
        ),
    );

  if (keyword) {
    const needle =
      normalizeText(keyword);

    filtered = filtered.filter(
      (room) =>
        normalizeText(
          room.tenPhong,
        ).includes(needle) ||
        normalizeText(
          room.moTa,
        ).includes(needle),
    );
  }

  const title = keyword
    ? `Kết quả cho "${keyword}"`
    : "Khám phá chỗ ở";

  const query: RoomsQueryParams = {
    keyword,
    checkIn,
    checkOut,
    guests,
  };

  return renderRooms(
    paginateRooms(
      filtered,
      page,
      PAGE_SIZE,
    ),
    title,
    query,
  );
}

async function loadUnavailableRoomIds(
  checkIn: string,
  checkOut: string,
): Promise<Set<number>> {
  if (!checkIn || !checkOut) {
    return new Set<number>();
  }

  return getUnavailableRoomIds(
    checkIn,
    checkOut,
  );
}

function renderRooms(
  result: ReturnType<
    typeof paginateRooms
  >,
  title: string,
  query: RoomsQueryParams,
) {
  const {
    rooms,
    total,
    page,
    totalPages,
  } = result;

  const summary =
    buildSummary(query);

  return (
    <div className="container-airbnb py-8 sm:py-10">
      <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
        {title}
      </h1>

      {summary && (
        <p className="mt-1 text-sm text-secondary">
          {summary}
        </p>
      )}

      <p className="mt-1 text-sm text-secondary">
        {total} chỗ ở
      </p>

      {rooms.length === 0 ? (
        <EmptyState
          title="Không có chỗ ở phù hợp."
          description="Thử thay đổi ngày, số khách hoặc từ khóa."
        />
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-x-6 sm:gap-y-5 md:grid-cols-3 xl:grid-cols-4">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                query={{
                  checkIn:
                    query.checkIn,
                  checkOut:
                    query.checkOut,
                  guests:
                    query.guests,
                }}
              />
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            query={query}
          />
        </>
      )}
    </div>
  );
}

function buildSummary(
  query: RoomsQueryParams,
): string {
  const parts: string[] = [];

  if (query.keyword) {
    parts.push(
      `Từ khóa: ${query.keyword}`,
    );
  }

  if (
    query.checkIn &&
    query.checkOut
  ) {
    parts.push(
      `${query.checkIn} → ${query.checkOut}`,
    );
  }

  if (
    query.guests !== undefined
  ) {
    parts.push(
      `${query.guests} khách`,
    );
  }

  return parts.join(" · ");
}