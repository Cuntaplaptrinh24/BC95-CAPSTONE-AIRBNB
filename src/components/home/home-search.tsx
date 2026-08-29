"use client";

import {
  useId,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  useRouter,
} from "next/navigation";

import type {
  Location,
} from "@/types/location";

import {
  showToast,
} from "@/components/common/toast";

import {
  normalizeText,
} from "@/app/rooms/query";

interface HomeSearchProps {
  locations: Location[];
}

function todayISO(): string {
  const date = new Date();

  const offset =
    date.getTimezoneOffset();

  const localDate = new Date(
    date.getTime() -
      offset * 60 * 1000,
  );

  return localDate
    .toISOString()
    .slice(0, 10);
}

function isValidGuestsInput(
  value: string,
): boolean {
  if (
    value === "" ||
    !/^\d+$/.test(value)
  ) {
    return false;
  }

  const number =
    Number(value);

  return (
    Number.isFinite(number) &&
    Number.isInteger(number) &&
    number >= 1
  );
}

export default function HomeSearch({
  locations,
}: HomeSearchProps) {
  const router =
    useRouter();

  const listId =
    useId();

  const [
    location,
    setLocation,
  ] = useState("");

  const [
    checkIn,
    setCheckIn,
  ] = useState("");

  const [
    checkOut,
    setCheckOut,
  ] = useState("");

  const [
    guests,
    setGuests,
  ] = useState("1");

  const today = todayISO();

  const locationOptions =
    useMemo(
      () =>
        locations.slice(0, 8),
      [locations],
    );

  const matchedLocation =
    useMemo(() => {
      const input =
        normalizeText(
          location.trim(),
        );

      if (!input) {
        return null;
      }

      return (
        locations.find(
          (item) =>
            normalizeText(
              item.tenViTri,
            ) === input,
        ) ?? null
      );
    }, [
      location,
      locations,
    ]);

  const handleCheckInChange = (
    value: string,
  ) => {
    setCheckIn(value);

    if (
      checkOut &&
      value &&
      checkOut <= value
    ) {
      setCheckOut("");
    }
  };

  const handleSubmit = (
    event:
      FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (
      !isValidGuestsInput(
        guests,
      )
    ) {
      showToast(
        "error",
        "Số khách phải là số nguyên từ 1 trở lên.",
      );

      return;
    }

    const guestCount =
      Number(guests);

    if (
      (checkIn &&
        !checkOut) ||
      (!checkIn &&
        checkOut)
    ) {
      showToast(
        "error",
        "Vui lòng chọn cả ngày nhận phòng và trả phòng.",
      );

      return;
    }

    if (
      checkIn &&
      checkOut
    ) {
      if (checkIn < today) {
        showToast(
          "error",
          "Ngày nhận phòng không được ở quá khứ.",
        );

        return;
      }

      if (
        checkOut <= checkIn
      ) {
        showToast(
          "error",
          "Ngày trả phòng phải sau ngày nhận phòng.",
        );

        return;
      }
    }

    const params =
      new URLSearchParams();

    if (matchedLocation) {
      params.set(
        "locationId",
        String(
          matchedLocation.id,
        ),
      );
    } else if (
      location.trim()
    ) {
      params.set(
        "keyword",
        location.trim(),
      );
    }

    if (checkIn) {
      params.set(
        "checkIn",
        checkIn,
      );
    }

    if (checkOut) {
      params.set(
        "checkOut",
        checkOut,
      );
    }

    if (guestCount !== 1) {
      params.set(
        "guests",
        String(guestCount),
      );
    }

    params.set("page", "1");

    router.push(
      `/rooms?${params.toString()}`,
    );
  };

  const inputMobile =
    "w-full rounded-full border border-border bg-white px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-secondary focus:border-brand focus:ring-1 focus:ring-brand";

  return (
    <section
      id="home-search"
      className="relative scroll-mt-24 overflow-hidden border-b border-border"
    >
      {/* Ảnh nền */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://images.unsplash.com/photo-1594910137478-e0f5d906ac6f?auto=format&fit=crop&w=2400&q=85"
        alt=""
        loading="eager"
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Lớp phủ tối */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/15" />

      <div className="container-airbnb relative flex min-h-[520px] flex-col justify-center py-12 sm:py-16">
        {/* Nội dung */}
        <div className="max-w-2xl text-white">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Chỗ ở cho chuyến đi
            tiếp theo của bạn
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-6 text-white/90 sm:text-base">
            Khám phá căn hộ, nhà
            nghỉ và những không
            gian độc đáo tại nhiều
            điểm đến.
          </p>
        </div>

        {/* Form tìm kiếm */}
        <form
          onSubmit={
            handleSubmit
          }
          className="mt-8 max-w-5xl rounded-3xl border border-white/60 bg-white/95 p-2 shadow-2xl backdrop-blur md:rounded-full"
        >
          {/* Desktop */}
          <div className="hidden items-stretch md:flex">
            {/* Địa điểm */}
            <div className="flex min-w-0 flex-1 flex-col justify-center rounded-full px-4 transition hover:bg-surface">
              <label
                htmlFor="hs-location"
                className="px-3 text-xs font-semibold text-foreground"
              >
                Địa điểm
              </label>

              <input
                id="hs-location"
                type="text"
                list={listId}
                placeholder="Bạn muốn đi đâu?"
                value={location}
                onChange={(
                  event,
                ) =>
                  setLocation(
                    event.target
                      .value,
                  )
                }
                className="min-w-0 rounded-full bg-transparent px-3 py-1.5 text-sm text-foreground outline-none placeholder:text-secondary"
                autoComplete="off"
              />
            </div>

            <div className="my-2 w-px bg-border" />

            {/* Nhận phòng */}
            <div className="flex flex-col justify-center rounded-full px-4 transition hover:bg-surface">
              <label
                htmlFor="hs-checkin"
                className="px-3 text-xs font-semibold text-foreground"
              >
                Nhận phòng
              </label>

              <input
                id="hs-checkin"
                type="date"
                min={today}
                value={checkIn}
                onChange={(
                  event,
                ) =>
                  handleCheckInChange(
                    event.target
                      .value,
                  )
                }
                className="rounded-full bg-transparent px-3 py-1.5 text-sm text-foreground outline-none"
              />
            </div>

            <div className="my-2 w-px bg-border" />

            {/* Trả phòng */}
            <div className="flex flex-col justify-center rounded-full px-4 transition hover:bg-surface">
              <label
                htmlFor="hs-checkout"
                className="px-3 text-xs font-semibold text-foreground"
              >
                Trả phòng
              </label>

              <input
                id="hs-checkout"
                type="date"
                min={
                  checkIn ||
                  today
                }
                value={checkOut}
                onChange={(
                  event,
                ) =>
                  setCheckOut(
                    event.target
                      .value,
                  )
                }
                className="rounded-full bg-transparent px-3 py-1.5 text-sm text-foreground outline-none"
              />
            </div>

            <div className="my-2 w-px bg-border" />

            {/* Số khách */}
            <div className="flex items-center gap-2 pl-4 pr-1">
              <div className="flex flex-col justify-center">
                <label
                  htmlFor="hs-guests"
                  className="px-3 text-xs font-semibold text-foreground"
                >
                  Khách
                </label>

                <input
                  id="hs-guests"
                  type="number"
                  min="1"
                  step="1"
                  value={guests}
                  onChange={(
                    event,
                  ) =>
                    setGuests(
                      event.target
                        .value,
                    )
                  }
                  className="w-24 rounded-full bg-transparent px-3 py-1.5 text-sm text-foreground outline-none"
                />
              </div>

              <button
                type="submit"
                aria-label="Tìm chỗ ở"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-sm transition hover:scale-105 hover:bg-brand-dark"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="7"
                    cy="7"
                    r="5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />

                  <path
                    d="M11 11L14.5 14.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile */}
          <div className="grid grid-cols-1 gap-2 md:hidden">
            <div>
              <label
                htmlFor="hs-mb-location"
                className="sr-only"
              >
                Địa điểm
              </label>

              <input
                id="hs-mb-location"
                type="text"
                list={listId}
                placeholder="Bạn muốn đi đâu?"
                value={location}
                onChange={(
                  event,
                ) =>
                  setLocation(
                    event.target
                      .value,
                  )
                }
                className={
                  inputMobile
                }
                autoComplete="off"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label
                  htmlFor="hs-mb-checkin"
                  className="sr-only"
                >
                  Nhận phòng
                </label>

                <input
                  id="hs-mb-checkin"
                  type="date"
                  min={today}
                  value={checkIn}
                  onChange={(
                    event,
                  ) =>
                    handleCheckInChange(
                      event.target
                        .value,
                    )
                  }
                  className={
                    inputMobile
                  }
                />
              </div>

              <div>
                <label
                  htmlFor="hs-mb-checkout"
                  className="sr-only"
                >
                  Trả phòng
                </label>

                <input
                  id="hs-mb-checkout"
                  type="date"
                  min={
                    checkIn ||
                    today
                  }
                  value={checkOut}
                  onChange={(
                    event,
                  ) =>
                    setCheckOut(
                      event.target
                        .value,
                    )
                  }
                  className={
                    inputMobile
                  }
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label
                  htmlFor="hs-mb-guests"
                  className="sr-only"
                >
                  Số khách
                </label>

                <input
                  id="hs-mb-guests"
                  type="number"
                  min="1"
                  step="1"
                  value={guests}
                  onChange={(
                    event,
                  ) =>
                    setGuests(
                      event.target
                        .value,
                    )
                  }
                  placeholder="Số khách"
                  className={
                    inputMobile
                  }
                />
              </div>

              <button
                type="submit"
                className="h-12 flex-1 rounded-full bg-brand px-6 text-sm font-semibold text-white transition hover:bg-brand-dark"
              >
                Tìm kiếm
              </button>
            </div>
          </div>

          {/* Gợi ý địa điểm */}
          <datalist id={listId}>
            {locationOptions.map(
              (item) => (
                <option
                  key={item.id}
                  value={
                    item.tenViTri
                  }
                >
                  {
                    item.tinhThanh
                  }
                  ,{" "}
                  {
                    item.quocGia
                  }
                </option>
              ),
            )}
          </datalist>
        </form>
      </div>
    </section>
  );
}