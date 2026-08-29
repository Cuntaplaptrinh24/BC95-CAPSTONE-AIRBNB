import type { Room } from "@/types/room";

interface AmenityItem {
  label: string;
  field: keyof Room;
}

const AMENITY_LIST: AmenityItem[] = [
  { label: "Máy giặt", field: "mayGiat" },
  { label: "Bàn là", field: "banLa" },
  { label: "Ti vi", field: "tivi" },
  { label: "Điều hòa", field: "dieuHoa" },
  { label: "Wifi", field: "wifi" },
  { label: "Bếp", field: "bep" },
  { label: "Đỗ xe", field: "doXe" },
  { label: "Hồ bơi", field: "hoBoi" },
  { label: "Bàn ủi", field: "banUi" },
];

export function getActiveAmenities(room: Room): AmenityItem[] {
  return AMENITY_LIST.filter((a) => room[a.field]);
}

export default function AmenityIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
