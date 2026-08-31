"use client";

import {
  useMemo,
  useSyncExternalStore,
} from "react";
import RoomCard from "@/components/room/room-card";
import {
  getFavoritesSnapshot,
  getServerFavoritesSnapshot,
  parseFavorites,
  subscribeFavorites,
} from "@/lib/favorite-storage";
import type { Room } from "@/types/room";

export default function FavoriteSection() {
  const snapshot = useSyncExternalStore(
    subscribeFavorites,
    getFavoritesSnapshot,
    getServerFavoritesSnapshot,
  );

  const favorites: Room[] = useMemo(
    () => parseFavorites(snapshot),
    [snapshot],
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
