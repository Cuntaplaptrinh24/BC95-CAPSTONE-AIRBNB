"use client";

import { useSyncExternalStore } from "react";
import type { Room } from "@/types/room";

import RoomCard from "@/components/room/room-card";

const FAVORITE_KEY = "airbnb-favorites";
const EMPTY_FAVORITES: Room[] = [];

// Cache theo giá trị raw để useSyncExternalStore không tạo mảng mới mỗi lần render.
let cachedRaw: string | null = null;
let cachedFavorites: Room[] = EMPTY_FAVORITES;

function subscribeToFavorites(onStoreChange: () => void) {
  window.addEventListener("favorites-changed", onStoreChange);

  return () => {
    window.removeEventListener("favorites-changed", onStoreChange);
  };
}

function getFavoritesSnapshot(): Room[] {
  const raw = localStorage.getItem(FAVORITE_KEY);

  if (raw !== cachedRaw) {
    cachedRaw = raw;

    try {
      cachedFavorites = raw ? (JSON.parse(raw) as Room[]) : EMPTY_FAVORITES;
    } catch {
      cachedFavorites = EMPTY_FAVORITES;
    }
  }

  return cachedFavorites;
}

function getFavoritesServerSnapshot(): Room[] {
  return EMPTY_FAVORITES;
}

export default function FavoriteSection() {
  const favorites = useSyncExternalStore(
    subscribeToFavorites,
    getFavoritesSnapshot,
    getFavoritesServerSnapshot,
  );

  return (
    <section className="mt-10 border-t border-border pt-8">
      <h2 className="text-xl font-semibold text-foreground">
        Yêu thích
      </h2>

      {favorites.length === 0 ? (
        <p className="mt-4 text-sm text-secondary">
          Bạn chưa có phòng yêu thích.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {favorites.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
            />
          ))}
        </div>
      )}
    </section>
  );
}