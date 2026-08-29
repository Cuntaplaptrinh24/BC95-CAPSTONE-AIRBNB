"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import Link from "next/link";

import {
  useAuthStore,
} from "@/store/auth-store";

import AuthModal from "@/components/auth/auth-modal";

import {
  AUTH_MODAL_OPEN_EVENT,
} from "@/lib/auth-events";

export default function Header() {
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

  const menuRef =
    useRef<HTMLDivElement>(
      null,
    );

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
      if (
        event.key === "Escape"
      ) {
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

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur">
        <div className="container-airbnb flex h-20 items-center justify-between gap-4">
          {/* Logo Airbnb */}
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

          {/* Thanh tìm kiếm nhỏ */}
          <div className="hidden flex-1 justify-center px-4 md:flex">
            <Link
              href="/#home-search"
              className="flex w-full max-w-md items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm text-foreground shadow-sm transition hover:shadow-md"
            >
              <span className="font-medium">
                Bất kỳ đâu
              </span>

              <span className="text-secondary">
                ·
              </span>

              <span className="text-secondary">
                Tuần nào
              </span>

              <span className="text-secondary">
                ·
              </span>

              <span className="text-secondary">
                Thêm khách
              </span>

              <span className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white">
                <svg
                  width="17"
                  height="17"
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
              </span>
            </Link>
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
              aria-expanded={
                menuOpen
              }
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
                    src={
                      user.avatar
                    }
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
                        setMenuOpen(
                          false,
                        )
                      }
                      className="block w-full px-4 py-2 text-left text-foreground transition hover:bg-surface"
                    >
                      Hồ sơ và chuyến đi
                    </Link>

                    <Link
                      href="/rooms?page=1"
                      role="menuitem"
                      onClick={() =>
                        setMenuOpen(
                          false,
                        )
                      }
                      className="block w-full px-4 py-2 text-left text-foreground transition hover:bg-surface"
                    >
                      Khám phá chỗ ở
                    </Link>

                    <Link
                      href="/locations"
                      role="menuitem"
                      onClick={() =>
                        setMenuOpen(
                          false,
                        )
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
                        setMenuOpen(
                          false,
                        );
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
                      onClick={
                        openSignIn
                      }
                      className="block w-full px-4 py-2 text-left font-semibold text-foreground transition hover:bg-surface"
                    >
                      Đăng nhập
                    </button>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={
                        openSignUp
                      }
                      className="block w-full px-4 py-2 text-left text-foreground transition hover:bg-surface"
                    >
                      Đăng ký
                    </button>

                    <div className="my-1 h-px bg-border" />

                    <Link
                      href="/rooms?page=1"
                      role="menuitem"
                      onClick={() =>
                        setMenuOpen(
                          false,
                        )
                      }
                      className="block w-full px-4 py-2 text-left text-foreground transition hover:bg-surface"
                    >
                      Khám phá chỗ ở
                    </Link>

                    <Link
                      href="/locations"
                      role="menuitem"
                      onClick={() =>
                        setMenuOpen(
                          false,
                        )
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
          initialView={
            authView
          }
          onClose={() =>
            setAuthOpen(false)
          }
        />
      )}
    </>
  );
}