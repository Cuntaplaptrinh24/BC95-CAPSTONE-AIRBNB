import type { Room } from "@/types/room";

export const PAGE_SIZE = 12;

export interface RoomsSearchParams {
  locationId: number | null;
  keyword: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  page: number;
}

function asSingle(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return value[0];
  return value;
}

/** Chấp nhận duy nhất chuỗi chữ số nguyên dương: "1", "42". Bác 0, -, ., 1e3, NaN, Infinity, chuỗi hỗn hợp. */
export function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw === "") return fallback;
  if (!/^\d+$/.test(raw)) return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1 || !Number.isInteger(n)) return fallback;
  return n;
}

/**
 * Kiểm tra ngày thật bằng cách parse YYYY-MM-DD thủ công
 * rồi kiểm tra lại giá trị bằng Date.UTC để JS không tự chuẩn hóa.
 */
function isValidCalendarDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

export function parseRoomsSearchParams(
  raw: Record<string, string | string[] | undefined>,
): RoomsSearchParams {
  const locationIdRaw = asSingle(raw.locationId);
  const locationId = parsePositiveInt(locationIdRaw ?? undefined, 0);
  const validLocationId = locationId >= 1 ? locationId : null;

  const rawKeyword = (asSingle(raw.keyword) ?? "").trim();
  // Khi có locationId hợp lệ, bỏ keyword để tránh hai chế độ lọc mâu thuẫn
  const keyword = validLocationId !== null ? "" : rawKeyword;

  let checkIn = asSingle(raw.checkIn) ?? "";
  let checkOut = asSingle(raw.checkOut) ?? "";

  if (checkIn && !isValidCalendarDate(checkIn)) checkIn = "";
  if (checkOut && !isValidCalendarDate(checkOut)) checkOut = "";
  if ((checkIn && !checkOut) || (!checkIn && checkOut)) {
    checkIn = "";
    checkOut = "";
  }
  if (checkIn && checkOut && checkOut <= checkIn) {
    checkIn = "";
    checkOut = "";
  }

  const guests = parsePositiveInt(asSingle(raw.guests), 1);
  const page = parsePositiveInt(asSingle(raw.page), 1);

  return { locationId: validLocationId, keyword, checkIn, checkOut, guests, page };
}

export function normalizeText(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export interface RoomsQueryParams {
  locationId?: number;
  keyword?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  page?: number;
}

export interface PaginatedRooms {
  rooms: Room[];
  total: number;
  page: number;
  totalPages: number;
}

export function paginateRooms(
  list: Room[],
  requestedPage: number,
  pageSize: number,
): PaginatedRooms {
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, requestedPage), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    rooms: list.slice(start, start + pageSize),
    total,
    page: safePage,
    totalPages,
  };
}
