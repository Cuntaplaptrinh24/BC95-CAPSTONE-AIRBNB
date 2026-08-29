import Link from "next/link";

import type {
  Location,
} from "@/types/location";

import SectionHeader from "@/components/common/section-header";
import EmptyState from "@/components/common/empty-state";
import LocationCard from "./location-card";

interface LocationSectionProps {
  locations: Location[];
}

export default function LocationSection({
  locations,
}: LocationSectionProps) {
  const featured =
    locations.slice(0, 8);

  if (featured.length === 0) {
    return (
      <section className="container-airbnb py-8 sm:py-10">
        <SectionHeader title="Khám phá điểm đến gần đây" />

        <EmptyState title="Chưa có vị trí nào." />
      </section>
    );
  }

  return (
    <section className="container-airbnb py-8 sm:py-10">
      <SectionHeader title="Khám phá điểm đến gần đây" />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {featured.map(
          (location) => (
            <LocationCard
              key={location.id}
              location={location}
            />
          ),
        )}
      </div>

      <div className="mt-6 flex justify-center">
        <Link
          href="/locations"
          className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-foreground hover:bg-surface"
        >
          Xem tất cả địa điểm
        </Link>
      </div>
    </section>
  );
}