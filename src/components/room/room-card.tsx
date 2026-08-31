import Link from "next/link";
import type { Room } from "@/types/room";
import SafeImage from "@/components/common/safe-image";
import FavoriteButton from "./favorite-button";

interface RoomCardQuery {
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}

interface RoomCardProps {
  room: Room;
  query?: RoomCardQuery;
}

function formatUsd(price: number): string {
  return `$${price.toLocaleString("en-US")} / đêm`;
}

function buildHref(
  roomId: number,
  query?: RoomCardQuery,
): string {
  const params = new URLSearchParams();

  if (query?.checkIn) {
    params.set("checkIn", query.checkIn);
  }

  if (query?.checkOut) {
    params.set("checkOut", query.checkOut);
  }

  if (
    query?.guests !== undefined &&
    query.guests >= 1
  ) {
    params.set(
      "guests",
      String(query.guests),
    );
  }

  const queryString = params.toString();

  return queryString
    ? `/rooms/${roomId}?${queryString}`
    : `/rooms/${roomId}`;
}

export default function RoomCard({
  room,
  query,
}: RoomCardProps) {
  const href = buildHref(room.id, query);

  return (
    <div className="group rounded-xl bg-transparent">
      <div className="relative aspect-square overflow-hidden rounded-xl">
        <Link
          href={href}
          aria-label={room.tenPhong}
          className="block h-full w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          {room.hinhAnh ? (
            <SafeImage
              src={room.hinhAnh}
              alt={room.tenPhong}
              fallbackSrc="/placeholder-room.svg"
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-surface text-sm text-secondary">
              Không có ảnh
            </div>
          )}
        </Link>

        <FavoriteButton room={room} />
      </div>

      <Link
        href={href}
        className="block pt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <h3 className="truncate text-sm font-semibold text-foreground">
          {room.tenPhong}
        </h3>

        <p className="truncate text-xs text-secondary">
          {room.khach} khách · {room.phongNgu} phòng
          ngủ · {room.giuong} giường
        </p>

        <p className="mt-1 text-sm text-foreground">
          <span className="font-semibold">
            {formatUsd(room.giaTien)}
          </span>
        </p>
      </Link>
    </div>
  );
}