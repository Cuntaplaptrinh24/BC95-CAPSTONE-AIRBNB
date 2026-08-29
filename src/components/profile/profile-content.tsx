"use client";

import { Fragment, useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { getUserById } from "@/services/user-service";
import { getBookingsByUser } from "@/services/booking-service";
import { getRoomById } from "@/services/room-service";
import { normalizeApiError } from "@/lib/api-error";
import { requestAuthModal } from "@/lib/auth-events";
import SafeImage from "@/components/common/safe-image";
import DataErrorState from "@/components/common/data-error-state";
import EmptyState from "@/components/common/empty-state";
import BookingHistoryCard from "@/components/profile/booking-history-card";
import ProfileEditor from "@/components/profile/profile-editor";
import type { User } from "@/types/user";
import type { Booking } from "@/types/booking";
import type { Room } from "@/types/room";

const STATUS_UPCOMING = "Sắp tới";
const STATUS_ONGOING = "Đang ở";
const STATUS_COMPLETED = "Đã hoàn thành";
const STATUS_UNKNOWN = "Không xác định";

const TEXT = {
  titleProfile: "Hồ sơ của tôi",
  titleTrips: "Chuyến đi của bạn",
  loginReq: "Vui lòng đăng nhập để xem hồ sơ.",
  loginHint: "Bạn có thể đăng nhập từ menu trên cùng.",
  btnLogin: "Đăng nhập",
  name: "Họ tên",
  email: "Email",
  phone: "Số điện thoại",
  birthday: "Ngày sinh",
  gender: "Giới tính",
  genderMale: "Nam",
  genderFemale: "Nữ",
  noUpdate: "Chưa cập nhật",
  errorUser: "Không thể tải thông tin người dùng.",
  errorBooking: "Không thể tải lịch sử đặt phòng.",
  emptyBooking: "Chưa có chuyến đi nào.",
  emptyBookingDesc:
    "Hãy khám phá các chỗ ở và đặt phòng ngay!",
  unknown: "Không xác định",
};

function parseLocalDate(iso: string): Date | null {
  if (!iso) return null;

  const parts = iso.slice(0, 10).split("-");

  if (parts.length !== 3) return null;

  const nums = parts.map(Number);

  if (nums.some((number) => !Number.isFinite(number))) {
    return null;
  }

  const [year, month, day] = nums;
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function formatBirthday(value: string): string {
  const trimmed = (value || "").trim();

  if (!trimmed) return TEXT.noUpdate;

  const date = parseLocalDate(trimmed);

  if (!date) return TEXT.unknown;

  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getTripStatus(booking: Booking): string {
  const checkIn = parseLocalDate(booking.ngayDen);
  const checkOut = parseLocalDate(booking.ngayDi);

  if (!checkIn || !checkOut) {
    return STATUS_UNKNOWN;
  }

  if (checkOut.getTime() <= checkIn.getTime()) {
    return STATUS_UNKNOWN;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayTime = today.getTime();
  const checkInTime = checkIn.getTime();
  const checkOutTime = checkOut.getTime();

  if (todayTime < checkInTime) {
    return STATUS_UPCOMING;
  }

  if (
    todayTime >= checkInTime &&
    todayTime < checkOutTime
  ) {
    return STATUS_ONGOING;
  }

  return STATUS_COMPLETED;
}

const STATUS_ORDER: string[] = [
  STATUS_UPCOMING,
  STATUS_ONGOING,
  STATUS_COMPLETED,
  STATUS_UNKNOWN,
];

function statusWeight(status: string): number {
  const index = STATUS_ORDER.indexOf(status);

  return index >= 0
    ? index
    : STATUS_ORDER.length;
}

interface EnrichedBooking {
  booking: Booking;
  room: Room | null;
  status: string;
}

function sortEnrichedBookings(
  bookings: EnrichedBooking[],
): EnrichedBooking[] {
  return [...bookings].sort((first, second) => {
    const firstWeight =
      statusWeight(first.status);

    const secondWeight =
      statusWeight(second.status);

    if (firstWeight !== secondWeight) {
      return firstWeight - secondWeight;
    }

    if (first.status === STATUS_UPCOMING) {
      const firstDate =
        parseLocalDate(
          first.booking.ngayDen,
        )?.getTime() ?? 0;

      const secondDate =
        parseLocalDate(
          second.booking.ngayDen,
        )?.getTime() ?? 0;

      return firstDate - secondDate;
    }

    if (first.status === STATUS_ONGOING) {
      const firstDate =
        parseLocalDate(
          first.booking.ngayDi,
        )?.getTime() ?? 0;

      const secondDate =
        parseLocalDate(
          second.booking.ngayDi,
        )?.getTime() ?? 0;

      return firstDate - secondDate;
    }

    if (first.status === STATUS_COMPLETED) {
      const firstDate =
        parseLocalDate(
          first.booking.ngayDi,
        )?.getTime() ?? 0;

      const secondDate =
        parseLocalDate(
          second.booking.ngayDi,
        )?.getTime() ?? 0;

      return secondDate - firstDate;
    }

    return 0;
  });
}

export default function ProfileContent() {
  const {
    user,
    accessToken,
    isAuthenticated,
    hasHydrated,
    setAuth,
  } = useAuthStore();

  const [profileUser, setProfileUser] =
    useState<User | null>(null);

  const [userLoading, setUserLoading] =
    useState(true);

  const [userError, setUserError] =
    useState("");

  const [bookings, setBookings] =
    useState<EnrichedBooking[]>([]);

  const [bookingLoading, setBookingLoading] =
    useState(true);

  const [bookingError, setBookingError] =
    useState("");

  useEffect(() => {
    if (
      !hasHydrated ||
      !isAuthenticated ||
      !user ||
      !accessToken
    ) {
      return;
    }

    let cancelled = false;

    const loadUser = async () => {
      setUserLoading(true);
      setUserError("");

      try {
        const profile = await getUserById(user.id);

        if (!cancelled) {
          setProfileUser(profile);
        }
      } catch (error: unknown) {
        if (!cancelled) {
          setUserError(
            normalizeApiError(error).message,
          );
        }
      } finally {
        if (!cancelled) {
          setUserLoading(false);
        }
      }
    };

    const loadBookings = async () => {
      setBookingLoading(true);
      setBookingError("");

      try {
        const rawBookings =
          await getBookingsByUser(user.id);

        if (cancelled) return;

        const roomIds = [
          ...new Set(
            rawBookings.map(
              (booking) => booking.maPhong,
            ),
          ),
        ];

        const roomMap = new Map<number, Room>();

        const results = await Promise.allSettled(
          roomIds.map((roomId) =>
            getRoomById(roomId),
          ),
        );

        results.forEach((result, index) => {
          if (result.status === "fulfilled") {
            roomMap.set(
              roomIds[index],
              result.value,
            );
          }
        });

        if (cancelled) return;

        const enriched: EnrichedBooking[] =
          rawBookings.map((booking) => ({
            booking,
            room:
              roomMap.get(booking.maPhong) ??
              null,
            status: getTripStatus(booking),
          }));

        setBookings(
          sortEnrichedBookings(enriched),
        );
      } catch (error: unknown) {
        if (!cancelled) {
          setBookingError(
            normalizeApiError(error).message,
          );
        }
      } finally {
        if (!cancelled) {
          setBookingLoading(false);
        }
      }
    };

    loadUser();
    loadBookings();

    return () => {
      cancelled = true;
    };
  }, [
    hasHydrated,
    isAuthenticated,
    user,
    accessToken,
  ]);

  if (!hasHydrated) {
    return (
      <div className="container-airbnb py-16">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-56 rounded bg-surface" />

          <div className="flex items-center gap-6">
            <div className="h-28 w-28 rounded-full bg-surface" />

            <div className="space-y-2">
              <div className="h-5 w-48 rounded bg-surface" />
              <div className="h-4 w-64 rounded bg-surface" />
              <div className="h-4 w-40 rounded bg-surface" />
            </div>
          </div>

          <div className="h-8 w-48 rounded bg-surface" />

          {Array.from({ length: 2 }).map(
            (_, index) => (
              <div
                key={index}
                className="flex gap-4 rounded-xl border border-border p-4"
              >
                <div className="h-24 w-28 shrink-0 rounded-lg bg-surface" />

                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 w-40 rounded bg-surface" />
                  <div className="h-3 w-56 rounded bg-surface" />
                  <div className="h-3 w-24 rounded bg-surface" />
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    );
  }

  if (
    !isAuthenticated ||
    !user ||
    !accessToken
  ) {
    return (
      <div className="container-airbnb flex flex-col items-center justify-center py-24 text-center">
        <EmptyState
          title={TEXT.loginReq}
          description={TEXT.loginHint}
        />

        <button
          type="button"
          onClick={() => requestAuthModal()}
          className="mt-4 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          {TEXT.btnLogin}
        </button>
      </div>
    );
  }

  const ui = profileUser ?? user;

  const avatarSrc =
    ui.avatar?.trim() ||
    "/placeholder-avatar.svg";

  const handleUserUpdated = (
    updatedUser: User,
  ) => {
    const mergedUser = {
      ...ui,
      ...updatedUser,
    };

    setProfileUser(mergedUser);
    setAuth(mergedUser, accessToken);
  };

  const profileFields: {
    label: string;
    value: string;
  }[] = [
    {
      label: TEXT.name,
      value: ui.name,
    },
    {
      label: TEXT.email,
      value: ui.email,
    },
    {
      label: TEXT.phone,
      value: ui.phone,
    },
    {
      label: TEXT.birthday,
      value: formatBirthday(ui.birthday),
    },
    {
      label: TEXT.gender,
      value: ui.gender
        ? TEXT.genderMale
        : TEXT.genderFemale,
    },
  ];

  const handleBookingUpdated = (
    updatedBooking: Booking,
  ) => {
    setBookings((current) =>
      sortEnrichedBookings(
        current.map((item) =>
          item.booking.id === updatedBooking.id
            ? {
                ...item,
                booking: updatedBooking,
                status:
                  getTripStatus(updatedBooking),
              }
            : item,
        ),
      ),
    );
  };

  const handleBookingDeleted = (
    bookingId: number,
  ) => {
    setBookings((current) =>
      current.filter(
        (item) =>
          item.booking.id !== bookingId,
      ),
    );
  };

  return (
    <div className="container-airbnb py-8 sm:py-12">
      <section>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          {TEXT.titleProfile}
        </h1>

        {userLoading && (
          <div className="mt-6 flex animate-pulse items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-surface" />

            <div className="space-y-2">
              <div className="h-5 w-40 rounded bg-surface" />
              <div className="h-4 w-56 rounded bg-surface" />
            </div>
          </div>
        )}

        {userError && !userLoading && (
          <div className="mt-4">
            <DataErrorState
              title={TEXT.errorUser}
              message={userError}
            />
          </div>
        )}

        {!userLoading && !userError && (
          <div className="mt-6 space-y-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
              <SafeImage
                src={avatarSrc}
                alt={ui.name}
                fallbackSrc="/placeholder-avatar.svg"
                className="h-24 w-24 shrink-0 rounded-full object-cover sm:h-28 sm:w-28"
              />

              <dl className="grid w-full max-w-md grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm text-foreground sm:w-auto">
                {profileFields.map(
                  (field) => (
                    <Fragment
                      key={field.label}
                    >
                      <dt className="font-medium text-secondary">
                        {field.label}
                      </dt>

                      <dd>
                        {field.value ||
                          TEXT.noUpdate}
                      </dd>
                    </Fragment>
                  ),
                )}
              </dl>
            </div>

            <ProfileEditor
              key={`${ui.id}-${ui.name}-${ui.email}-${ui.phone}-${ui.birthday}-${ui.gender}-${ui.avatar ?? ""}`}
              user={ui}
              accessToken={accessToken}
              onUpdated={handleUserUpdated}
            />
          </div>
        )}
      </section>

      <section className="mt-10 border-t border-border pt-8">
        <h2 className="text-xl font-semibold text-foreground">
          {TEXT.titleTrips}
        </h2>

        {bookingLoading && (
          <div className="mt-6 space-y-4">
            {Array.from({ length: 3 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="flex animate-pulse gap-4 rounded-xl border border-border p-4"
                >
                  <div className="h-24 w-28 shrink-0 rounded-lg bg-surface" />

                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 w-40 rounded bg-surface" />
                    <div className="h-3 w-56 rounded bg-surface" />
                    <div className="h-3 w-24 rounded bg-surface" />
                  </div>
                </div>
              ),
            )}
          </div>
        )}

        {bookingError &&
          !bookingLoading && (
            <div className="mt-6">
              <DataErrorState
                title={TEXT.errorBooking}
                message={bookingError}
              />
            </div>
          )}

        {!bookingLoading &&
          !bookingError &&
          bookings.length === 0 && (
            <div className="mt-6">
              <EmptyState
                title={TEXT.emptyBooking}
                description={
                  TEXT.emptyBookingDesc
                }
              />
            </div>
          )}

        {!bookingLoading &&
          !bookingError &&
          bookings.length > 0 && (
            <div className="mt-6 space-y-6">
              {STATUS_ORDER.map(
                (status) => {
                  const group =
                    bookings.filter(
                      (item) =>
                        item.status === status,
                    );

                  if (group.length === 0) {
                    return null;
                  }

                  return (
                    <div key={status}>
                      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-secondary">
                        {status}
                      </h3>

                      <div className="space-y-3">
                        {group.map(
                          ({
                            booking,
                            room,
                            status,
                          }) => (
                            <BookingHistoryCard
                              key={booking.id}
                              booking={booking}
                              room={room}
                              userId={user.id}
                              accessToken={
                                accessToken
                              }
                              canManage={
                                status ===
                                STATUS_UPCOMING
                              }
                              onUpdated={
                                handleBookingUpdated
                              }
                              onDeleted={
                                handleBookingDeleted
                              }
                            />
                          ),
                        )}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}
      </section>
    </div>
  );
}
