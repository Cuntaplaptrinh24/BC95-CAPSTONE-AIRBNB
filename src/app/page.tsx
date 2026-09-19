// Trang chủ. Chạy ở máy chủ: gọi API lấy danh sách vị trí rồi mới gửi trang về.
// Các khối bên dưới tự lo phần của mình, HomeSearch và RecentReviews chạy ở trình duyệt,
// RoomGrid tự gọi API riêng của nó.

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

// Lấy dữ liệu mới mỗi lần mở trang, không dùng bản đã dựng sẵn.
export const dynamic =
  "force-dynamic";

export default async function Home() {
  // Gọi API trong try để nếu hỏng thì vẫn vẽ được trang, chỉ phần vị trí báo lỗi,
  // chứ không làm cả trang chủ trắng.
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