import type {
  Location,
} from "@/types/location";

interface LocationMapProps {
  location: Location;
}

export default function LocationMap({
  location,
}: LocationMapProps) {
  const address = [
    location.tenViTri,
    location.tinhThanh,
    location.quocGia,
  ]
    .map((part) =>
      part?.trim(),
    )
    .filter(Boolean)
    .join(", ");

  if (!address) {
    return null;
  }

  const mapSource =
    `https://www.google.com/maps?q=${encodeURIComponent(
      address,
    )}&output=embed`;

  return (
    <section className="mt-10 border-t border-border pt-8">
      <h2 className="text-xl font-semibold text-foreground">
        Nơi bạn sẽ đến
      </h2>

      <p className="mt-1 text-sm text-secondary">
        {address}
      </p>

      <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-surface">
        <iframe
          src={mapSource}
          title={`Bản đồ ${address}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          className="h-[320px] w-full border-0 sm:h-[420px]"
        />
      </div>

      <p className="mt-3 text-xs text-secondary">
        Bản đồ hiển thị khu vực
        gần đúng dựa trên tên vị
        trí do API cung cấp.
      </p>
    </section>
  );
}