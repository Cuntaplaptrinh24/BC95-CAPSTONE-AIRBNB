// Thẻ một điểm đến ở trang chủ. Bấm vào là sang trang danh sách phòng
// đã lọc sẵn theo vị trí đó.

import Link from "next/link";
import type { Location } from "@/types/location";
import SafeImage from "@/components/common/safe-image";

interface LocationCardProps {
  location: Location;
}

export default function LocationCard({ location }: LocationCardProps) {
  return (
    <Link
      href={`/rooms?locationId=${location.id}&page=1`}
      className="flex items-center gap-3 rounded-lg bg-white p-2 transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg sm:h-24 sm:w-24">
        {location.hinhAnh ? (
          <SafeImage
            src={location.hinhAnh}
            alt={location.tenViTri}
            fallbackSrc="/placeholder-location.svg"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-surface text-xs text-secondary">
            Không có ảnh
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-foreground">{location.tenViTri}</h3>
        <p className="truncate text-xs text-secondary">
          {location.tinhThanh}, {location.quocGia}
        </p>
      </div>
    </Link>
  );
}
