// Trang danh sách phòng, dùng cho cả hai kiểu xem: theo một vị trí cụ thể,
// và theo từ khóa tìm kiếm. Trang chạy ở máy chủ.
//
// Mọi điều kiện lọc nằm trên địa chỉ trang (vị trí, từ khóa, ngày, số khách, trang),
// nên chia sẻ link là người khác thấy đúng kết quả đó.

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

// Luôn dựng lại trang khi mở, vì phòng trống thay đổi theo ngày người dùng chọn.
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
  // Đọc và làm sạch tham số trên địa chỉ. Toàn bộ việc kiểm tra nằm trong query.ts.
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

  // Hai nhánh xử lý khác nhau: có chọn vị trí thì lấy phòng theo vị trí,
  // còn lại thì đi theo đường tìm kiếm.
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

// Nhánh một: xem phòng của một vị trí.
// Gọi cùng lúc ba việc: lấy phòng theo vị trí, lấy tên vị trí để làm tiêu đề,
// và lấy danh sách phòng đã kín trong khoảng ngày đang chọn.
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

  // Bỏ phòng nhỏ hơn số khách cần, và bỏ phòng đã có người đặt trùng ngày.
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

// Nhánh hai: tìm kiếm. Nhánh này có hai cách chạy tùy điều kiện, xem chú thích bên trong.
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
   * Cách chạy thứ nhất, nhẹ hơn: không chọn ngày và chỉ một khách.
   * Khi đó mọi việc lọc đều làm được bằng API phân trang, nên chỉ tải đúng
   * 12 phòng của trang đang xem thay vì tải cả kho phòng về.
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

    // Người dùng gõ tay số trang lớn hơn số trang thật, ví dụ ?page=99,
    // thì kéo về trang cuối và gọi lại, để không hiện danh sách rỗng.
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
   * Cách chạy thứ hai, nặng hơn: có chọn ngày hoặc cần nhiều hơn một khách.
   * API không lọc được theo sức chứa và theo lịch trống, nên phải tải hết
   * danh sách phòng về, tự lọc rồi tự cắt trang. Chậm hơn nhưng kết quả mới đúng.
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

  // Lọc theo từ khóa trên tên phòng và mô tả.
  // normalizeText bỏ dấu tiếng Việt và chuyển thành chữ thường, nên gõ "da nang"
  // vẫn tìm ra "Đà Nẵng".
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

// Chỉ hỏi phòng nào đã kín khi người dùng có chọn đủ cả ngày nhận và ngày trả.
// Không chọn ngày thì trả về danh sách rỗng, tức không loại phòng nào.
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

// Phần vẽ giao diện, dùng chung cho cả hai nhánh ở trên:
// tiêu đề, dòng tóm tắt điều kiện lọc, tổng số chỗ ở, lưới phòng và thanh phân trang.
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

// Ghép dòng tóm tắt điều kiện đang lọc, ví dụ: Từ khóa: biển · 2026-10-01 → 2026-10-05 · 2 khách
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