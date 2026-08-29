import { getRoomsPaged } from "@/services/room-service";
import type { Room } from "@/types/room";
import SectionHeader from "@/components/common/section-header";
import EmptyState from "@/components/common/empty-state";
import DataErrorState from "@/components/common/data-error-state";
import RoomCard from "./room-card";

export default async function RoomGrid() {
  let rooms: Room[] = [];

  try {
    const page = await getRoomsPaged({ pageIndex: 1, pageSize: 12 });
    rooms = page?.data ?? [];
  } catch {
    return (
      <section id="room-grid" className="container-airbnb py-8 sm:py-10">
        <SectionHeader title="Gợi ý dành cho bạn" />
        <DataErrorState title="Không thể tải danh sách chỗ ở." />
      </section>
    );
  }

  if (rooms.length === 0) {
    return (
      <section id="room-grid" className="container-airbnb py-8 sm:py-10">
        <SectionHeader title="Gợi ý dành cho bạn" />
        <EmptyState title="Chưa có chỗ ở nào." />
      </section>
    );
  }

  return (
    <section id="room-grid" className="container-airbnb py-8 sm:py-10">
      <SectionHeader title="Gợi ý dành cho bạn" />
      <div className="grid grid-cols-2 gap-4 sm:gap-x-6 sm:gap-y-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>
    </section>
  );
}
