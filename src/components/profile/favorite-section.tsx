"use client";

import { useEffect, useState } from "react";
import type { Room } from "@/types/room";

import RoomCard from "@/components/room/room-card";

const FAVORITE_KEY = "airbnb-favorites";

export default function FavoriteSection() {
  const [favorites, setFavorites] = useState<Room[]>(
    [],
  );

  const loadFavorites = () => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(FAVORITE_KEY) || "[]",
      ) as Room[];

      setFavorites(saved);
    } catch {
      setFavorites([]);
    }
  };

  useEffect(() => {
    loadFavorites();

    window.addEventListener(
      "favorites-changed",
      loadFavorites,
    );

    return () => {
      window.removeEventListener(
        "favorites-changed",
        loadFavorites,
      );
    };
  }, []);

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