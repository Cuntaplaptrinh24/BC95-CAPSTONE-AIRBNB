"use client";

import {
  useMemo,
  useSyncExternalStore,
} from "react";
import { showToast } from "@/components/common/toast";
import {
  getFavoritesSnapshot,
  getServerFavoritesSnapshot,
  parseFavorites,
  subscribeFavorites,
  toggleFavorite,
} from "@/lib/favorite-storage";
import type { Room } from "@/types/room";

interface FavoriteButtonProps {
  room: Room;
}

export default function FavoriteButton({
  room,
}: FavoriteButtonProps) {
  const snapshot = useSyncExternalStore(
    subscribeFavorites,
    getFavoritesSnapshot,
    getServerFavoritesSnapshot,
  );

  const active = useMemo(
    () =>
      parseFavorites(snapshot).some(
        (favorite) => favorite.id === room.id,
      ),
    [room.id, snapshot],
  );

  const handleToggle = () => {
    const result = toggleFavorite(room);

    if (!result.success) {
      showToast(
        "error",
        "Không thể cập nhật danh sách yêu thích.",
      );
      return;
    }

    showToast(
      "success",
      result.active
        ? "Đã thêm vào yêu thích."
        : "Đã bỏ khỏi yêu thích.",
    );
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={
        active
          ? "Bỏ yêu thích"
          : "Thêm yêu thích"
      }
      aria-pressed={active}
      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/10 transition hover:bg-black/20"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={active ? "#FF385C" : "none"}
        stroke={active ? "#FF385C" : "white"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}