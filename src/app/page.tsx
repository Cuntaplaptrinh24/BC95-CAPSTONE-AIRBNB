import type {
  Location,
} from "@/types/location";

import {
  getLocations,
} from "@/services/location-service";

import EmptyState from "@/components/common/empty-state";
import DataErrorState from "@/components/common/data-error-state";
import HomeSearch from "@/components/home/home-search";
import LocationSection from "@/components/home/location-section";
import RecentReviews from "@/components/home/recent-reviews";
import RoomGrid from "@/components/room/room-grid";
import Footer from "@/components/common/footer";

export const dynamic =
  "force-dynamic";

export default async function Home() {
  let locations: Location[] = [];
  let locationError = false;

  try {
    locations =
      await getLocations();
  } catch {
    locationError = true;
  }

  return (
    <div className="flex flex-1 flex-col">
      <HomeSearch
        locations={locations}
      />

      {locationError ? (
        <section className="container-airbnb py-8 sm:py-10">
          <DataErrorState title="Không thể tải danh sách vị trí." />
        </section>
      ) : locations.length ===
        0 ? (
        <section className="container-airbnb py-8 sm:py-10">
          <EmptyState title="Chưa có vị trí nào." />
        </section>
      ) : (
        <LocationSection
          locations={locations}
        />
      )}

      <RoomGrid />

      <RecentReviews />

      <Footer />
    </div>
  );
}