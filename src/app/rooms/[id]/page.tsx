import axios from "axios";
import { notFound } from "next/navigation";
import type { Room } from "@/types/room";
import { getRoomById } from "@/services/room-service";
import { getLocationById } from "@/services/location-service";
import { getCommentsByRoom } from "@/services/comment-service";
import SafeImage from "@/components/common/safe-image";
import AmenityIcon, {
  getActiveAmenities,
} from "@/components/room/amenities";
import CommentSection from "@/components/room/comment-section";
import LocationMap from "@/components/room/location-map";
import BookingCard from "@/components/booking/booking-card";
import DataErrorState from "@/components/common/data-error-state";

export const dynamic = "force-dynamic";

function parseId(raw: string): number {
  if (!/^\d+$/.test(raw)) {
    return -1;
  }

  const number = Number(raw);

  return Number.isInteger(number) &&
    number >= 1
    ? number
    : -1;
}

interface RoomDetailPageProps {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<
    Record<
      string,
      string | string[] | undefined
    >
  >;
}

export default async function RoomDetailPage({
  params,
  searchParams,
}: RoomDetailPageProps) {
  const { id: rawId } = await params;
  const roomId = parseId(rawId);

  if (roomId === -1) {
    notFound();
  }

  const query = await searchParams;

  const initialCheckIn =
    typeof query.checkIn === "string"
      ? query.checkIn
      : "";

  const initialCheckOut =
    typeof query.checkOut === "string"
      ? query.checkOut
      : "";

  const rawGuests =
    typeof query.guests === "string"
      ? query.guests
      : "";

  const initialGuests =
    /^\d+$/.test(rawGuests)
      ? Math.max(
          1,
          Number.parseInt(
            rawGuests,
            10,
          ),
        )
      : 1;

  let room: Room;

  try {
    room = await getRoomById(roomId);
  } catch (error: unknown) {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 404
    ) {
      notFound();
    }

    throw error;
  }

  let location:
    | Awaited<
        ReturnType<
          typeof getLocationById
        >
      >
    | null = null;

  let locationFailed = false;

  let comments: Awaited<
    ReturnType<
      typeof getCommentsByRoom
    >
  > = [];

  let commentsFailed = false;

  const [
    locationResult,
    commentsResult,
  ] = await Promise.allSettled([
    getLocationById(room.maViTri),
    getCommentsByRoom(room.id),
  ]);

  if (
    locationResult.status ===
    "fulfilled"
  ) {
    location = locationResult.value;
  } else {
    locationFailed = true;
  }

  if (
    commentsResult.status ===
    "fulfilled"
  ) {
    comments =
      commentsResult.value ?? [];
  } else {
    commentsFailed = true;
  }

  const amenities =
    getActiveAmenities(room);

  return (
    <div className="container-airbnb py-8 sm:py-10">
      {/* Ảnh phòng */}
      <div className="overflow-hidden rounded-2xl">
        {room.hinhAnh ? (
          <SafeImage
            src={room.hinhAnh}
            alt={room.tenPhong}
            fallbackSrc="/placeholder-room.svg"
            className="aspect-[16/9] w-full object-cover sm:aspect-[21/9]"
          />
        ) : (
          <div className="flex aspect-[16/9] w-full items-center justify-center bg-surface text-secondary sm:aspect-[21/9]">
            Không có ảnh
          </div>
        )}
      </div>

      {/* Bố cục hai cột */}
      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Thông tin phòng */}
        <div className="min-w-0 [overflow-wrap:anywhere]">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {room.tenPhong}
          </h1>

          {location ? (
            <p className="mt-1 text-sm text-secondary">
              {location.tenViTri},{" "}
              {location.tinhThanh},{" "}
              {location.quocGia}
            </p>
          ) : locationFailed ? (
            <div className="mt-2">
              <DataErrorState title="Không thể tải thông tin vị trí." />
            </div>
          ) : null}

          {/* Sức chứa */}
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-b border-border pb-6 text-sm text-foreground">
            <span>
              {room.khach} khách
            </span>

            <span>
              {room.phongNgu} phòng ngủ
            </span>

            <span>
              {room.giuong} giường
            </span>

            <span>
              {room.phongTam} phòng tắm
            </span>
          </div>

          {/* Mô tả */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-foreground">
              Giới thiệu
            </h2>

            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground">
              {room.moTa}
            </p>
          </div>

          {/* Tiện nghi */}
          {amenities.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-foreground">
                Tiện nghi
              </h2>

              <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {amenities.map(
                  (amenity) => (
                    <li
                      key={
                        amenity.field
                      }
                      className="flex items-center gap-2 text-sm text-foreground"
                    >
                      <AmenityIcon className="text-brand" />

                      {amenity.label}
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}

          {/* Bình luận */}
          <div className="mt-10 border-t border-border pt-8">
            <h2 className="text-lg font-semibold text-foreground">
              Đánh giá từ khách
            </h2>

            <div className="mt-4">
              <CommentSection
                roomId={room.id}
                initialComments={
                  comments
                }
                failed={
                  commentsFailed
                }
              />
            </div>
          </div>
        </div>

        {/* Thẻ đặt phòng */}
        <div className="w-full min-w-0 lg:sticky lg:top-24 lg:self-start">
          <BookingCard
            room={room}
            initialCheckIn={
              initialCheckIn
            }
            initialCheckOut={
              initialCheckOut
            }
            initialGuests={
              initialGuests
            }
          />
        </div>
      </div>

      {/* Bản đồ vị trí */}
      {location && (
        <LocationMap
          location={location}
        />
      )}
    </div>
  );
}