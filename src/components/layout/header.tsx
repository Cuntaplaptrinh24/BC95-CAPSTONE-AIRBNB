"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import AuthModal from "@/components/auth/auth-modal";
import {
  AUTH_MODAL_OPEN_EVENT,
} from "@/lib/auth-events";

// Thanh đầu trang, có mặt ở mọi trang phía người dùng.
// Gồm ô tìm kiếm nhanh, menu tài khoản, và chứa luôn cửa sổ đăng nhập.

// Ngày hôm nay theo giờ máy, dùng làm giới hạn nhỏ nhất cho ô chọn ngày.
function todayISO(): string {
  const date = new Date();
  const offset = date.getTimezoneOffset();

  const localDate = new Date(
    date.getTime() -
      offset * 60 * 1000,
  );

  return localDate
    .toISOString()
    .slice(0, 10);
}

// Ô tìm kiếm ở đây chỉ cho chọn một ngày cho gọn, nên ngày trả lấy là ngày kế tiếp.
function nextDayISO(
  value: string,
): string {
  const [year, month, day] = value
    .split("-")
    .map(Number);

  const date = new Date(
    Date.UTC(
      year,
      month - 1,
      day,
    ),
  );

  date.setUTCDate(
    date.getUTCDate() + 1,
  );

  return date
    .toISOString()
    .slice(0, 10);
}

export default function Header() {
  const router = useRouter();

  const {
    user,
    isAuthenticated,
    hasHydrated,
    logout,
  } = useAuthStore();

  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  const [
    authOpen,
    setAuthOpen,
  ] = useState(false);

  const [
    authView,
    setAuthView,
  ] = useState<
    "signin" | "signup"
  >("signin");

  const [
    keyword,
    setKeyword,
  ] = useState("");

  const [
    checkIn,
    setCheckIn,
  ] = useState("");

  const [
    guests,
    setGuests,
  ] = useState("1");

  const menuRef =
    useRef<HTMLDivElement>(null);

  // Bấm tìm: ghép điều kiện thành địa chỉ rồi chuyển sang trang danh sách phòng.
  // Số khách bằng 1 thì bỏ qua cho địa chỉ gọn, vì đó là giá trị mặc định.
  const handleSearch = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const params =
      new URLSearchParams();

    const trimmedKeyword =
      keyword.trim();

    if (trimmedKeyword) {
      params.set(
        "keyword",
        trimmedKeyword,
      );
    }

    if (checkIn) {
      params.set(
        "checkIn",
        checkIn,
      );

      params.set(
        "checkOut",
        nextDayISO(checkIn),
      );
    }

    if (guests !== "1") {
      params.set(
        "guests",
        guests,
      );
    }

    params.set("page", "1");

    router.push(
      `/rooms?${params.toString()}`,
    );
  };

  const pathname = usePathname();

  // Lắng nghe tín hiệu mở cửa sổ đăng nhập do nơi khác phát ra, ví dụ khi người
  // chưa đăng nhập bấm đặt phòng hoặc bấm gửi bình luận. Cửa sổ đăng nhập nằm ở
  // Header nên chỉ Header mở được, các nơi kia chỉ phát tín hiệu.
  useEffect(() => {
    const openAuth = () => {
      setMenuOpen(false);
      setAuthView("signin");
      setAuthOpen(true);
    };

    window.addEventListener(
      AUTH_MODAL_OPEN_EVENT,
      openAuth,
    );

    return () => {
      window.removeEventListener(
        AUTH_MODAL_OPEN_EVENT,
        openAuth,
      );
    };
  }, []);

  // Khi menu tài khoản đang mở: bấm ra ngoài hoặc bấm Esc thì đóng.
  // Chỉ đăng ký lắng nghe trong lúc menu mở, đóng rồi thì gỡ đi.
  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handleClickOutside = (
      event: MouseEvent,
    ) => {
      if (
        !menuRef.current?.contains(
          event.target as Node,
        )
      ) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );

      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [menuOpen]);

  const openSignIn = () => {
    setMenuOpen(false);
    setAuthView("signin");
    setAuthOpen(true);
  };

  const openSignUp = () => {
    setMenuOpen(false);
    setAuthView("signup");
    setAuthOpen(true);
  };

  // Khu vực Admin có thanh điều hướng riêng, không hiển thị Header của User.
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur">
        <div className="container-airbnb flex h-20 items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            aria-label="Airbnb - Trang chủ"
            className="flex shrink-0 items-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%C3%A9lo.svg"
              alt="Airbnb"
              width={128}
              height={40}
              loading="eager"
              draggable={false}
              className="h-10 w-auto"
            />
          </Link>

          {/* Thanh tìm kiếm */}
          <div className="hidden flex-1 justify-center px-4 md:flex">
            <form
              onSubmit={handleSearch}
              aria-label="Tìm kiếm chỗ ở"
              className="flex h-12 w-full max-w-[620px] items-center rounded-full border border-border bg-white p-1 pl-3 text-sm text-foreground shadow-sm transition hover:shadow-md focus-within:border-brand focus-within:ring-1 focus-within:ring-brand"
            >
              {/* Từ khóa */}
              <div className="flex min-w-0 flex-1 items-center gap-2 px-2">
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="shrink-0 text-brand"
                >
                  <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                  <circle
                    cx="12"
                    cy="10"
                    r="2.5"
                  />
                </svg>

                <label
                  htmlFor="header-keyword"
                  className="sr-only"
                >
                  Địa điểm hoặc tên phòng
                </label>

                <input
                  id="header-keyword"
                  type="text"
                  value={keyword}
                  onChange={(event) =>
                    setKeyword(
                      event.target.value,
                    )
                  }
                  placeholder="Bất kỳ đâu"
                  autoComplete="off"
                  className="min-w-0 flex-1 bg-transparent font-medium outline-none placeholder:text-foreground"
                />
              </div>

              <span
                aria-hidden="true"
                className="h-6 w-px shrink-0 bg-border"
              />

              {/* Ngày */}
              <div className="flex shrink-0 items-center gap-2 px-3">
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="shrink-0 text-brand"
                >
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="16"
                    rx="2"
                  />

                  <path d="M16 3v4M8 3v4M3 11h18" />
                </svg>

                <label
                  htmlFor="header-checkin"
                  className="sr-only"
                >
                  Ngày nhận phòng
                </label>

                <input
                  id="header-checkin"
                  type="date"
                  min={todayISO()}
                  value={checkIn}
                  onChange={(event) =>
                    setCheckIn(
                      event.target.value,
                    )
                  }
                  className="w-[122px] bg-transparent text-secondary outline-none"
                />
              </div>

              <span
                aria-hidden="true"
                className="h-6 w-px shrink-0 bg-border"
              />

              {/* Khách */}
              <div className="flex shrink-0 items-center gap-2 px-3">
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="shrink-0 text-brand"
                >
                  <circle
                    cx="9"
                    cy="8"
                    r="4"
                  />

                  <path d="M3 21v-2a6 6 0 0 1 12 0v2M16 4.5a4 4 0 0 1 0 7M17 15a6 6 0 0 1 4 5.65" />
                </svg>

                <label
                  htmlFor="header-guests"
                  className="sr-only"
                >
                  Số khách
                </label>

                <select
                  id="header-guests"
                  value={guests}
                  onChange={(event) =>
                    setGuests(
                      event.target.value,
                    )
                  }
                  className="w-[82px] cursor-pointer bg-transparent text-secondary outline-none"
                >
                  {Array.from(
                    { length: 10 },
                    (_, index) =>
                      index + 1,
                  ).map((number) => (
                    <option
                      key={number}
                      value={number}
                    >
                      {number} khách
                    </option>
                  ))}
                </select>
              </div>

              {/* Nút tìm kiếm */}
              <button
                type="submit"
                aria-label="Tìm kiếm"
                className="ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white transition hover:bg-brand-dark active:scale-95"
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
                    strokeWidth="1.8"
                  />

                  <path
                    d="M11 11L14.5 14.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </form>
          </div>

          {/* Menu tài khoản */}
          <div
            ref={menuRef}
            className="relative shrink-0"
          >
            <button
              type="button"
              onClick={() =>
                setMenuOpen(
                  (current) =>
                    !current,
                )
              }
              aria-label="Mở menu tài khoản"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              className="flex items-center gap-3 rounded-full border border-border bg-white px-3 py-2 text-sm text-foreground shadow-sm transition hover:shadow-md"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 4H14M2 8H14M2 12H14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>

              {hasHydrated &&
              isAuthenticated &&
              user ? (
                user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white">
                    {user.name
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                )
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      cx="10"
                      cy="6"
                      r="3.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />

                    <path
                      d="M3 17C4.5 14 6.5 12.5 10 12.5C13.5 12.5 15.5 14 17 17"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              )}
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-white py-2 text-sm shadow-xl"
              >
                {hasHydrated &&
                isAuthenticated &&
                user ? (
                  <>
                    <p className="truncate px-4 py-2 font-semibold text-foreground">
                      {user.name}
                    </p>

                    <p className="truncate px-4 pb-2 text-xs text-secondary">
                      {user.email}
                    </p>

                    <div className="my-1 h-px bg-border" />

                    <Link
                      href="/profile"
                      role="menuitem"
                      onClick={() =>
                        setMenuOpen(false)
                      }
                      className="block w-full px-4 py-2 text-left text-foreground transition hover:bg-surface"
                    >
                      Hồ sơ và chuyến đi
                    </Link>

                    <Link
                      href="/rooms?page=1"
                      role="menuitem"
                      onClick={() =>
                        setMenuOpen(false)
                      }
                      className="block w-full px-4 py-2 text-left text-foreground transition hover:bg-surface"
                    >
                      Khám phá chỗ ở
                    </Link>

                    <Link
                      href="/locations"
                      role="menuitem"
                      onClick={() =>
                        setMenuOpen(false)
                      }
                      className="block w-full px-4 py-2 text-left text-foreground transition hover:bg-surface"
                    >
                      Khám phá địa điểm
                    </Link>

                    <div className="my-1 h-px bg-border" />

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        logout();
                        setMenuOpen(false);
                      }}
                      className="block w-full px-4 py-2 text-left text-foreground transition hover:bg-surface"
                    >
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={openSignIn}
                      className="block w-full px-4 py-2 text-left font-semibold text-foreground transition hover:bg-surface"
                    >
                      Đăng nhập
                    </button>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={openSignUp}
                      className="block w-full px-4 py-2 text-left text-foreground transition hover:bg-surface"
                    >
                      Đăng ký
                    </button>

                    <div className="my-1 h-px bg-border" />

                    <Link
                      href="/rooms?page=1"
                      role="menuitem"
                      onClick={() =>
                        setMenuOpen(false)
                      }
                      className="block w-full px-4 py-2 text-left text-foreground transition hover:bg-surface"
                    >
                      Khám phá chỗ ở
                    </Link>

                    <Link
                      href="/locations"
                      role="menuitem"
                      onClick={() =>
                        setMenuOpen(false)
                      }
                      className="block w-full px-4 py-2 text-left text-foreground transition hover:bg-surface"
                    >
                      Khám phá địa điểm
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {authOpen && (
        <AuthModal
          open
          initialView={authView}
          onClose={() =>
            setAuthOpen(false)
          }
        />
      )}
    </>
  );
}