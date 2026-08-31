import type { Room } from "@/types/room";

const FAVORITE_KEY = "airbnb-favorites";
const FAVORITES_CHANGED_EVENT = "favorites-changed";
const EMPTY_FAVORITES_SNAPSHOT = "[]";

export function getFavoritesSnapshot(): string {
  if (typeof window === "undefined") {
    return EMPTY_FAVORITES_SNAPSHOT;
  }

  return (
    window.localStorage.getItem(FAVORITE_KEY) ??
    EMPTY_FAVORITES_SNAPSHOT
  );
}

export function getServerFavoritesSnapshot(): string {
  return EMPTY_FAVORITES_SNAPSHOT;
}

export function parseFavorites(snapshot: string): Room[] {
  try {
    const parsed: unknown = JSON.parse(snapshot);

    if (!Array.isArray(parsed)) {
      return [];
    }

    const uniqueRooms = new Map<number, Room>();

    parsed.forEach((item: unknown) => {
      if (
        typeof item === "object" &&
        item !== null &&
        "id" in item &&
        typeof item.id === "number" &&
        "tenPhong" in item &&
        typeof item.tenPhong === "string"
      ) {
        uniqueRooms.set(item.id, item as Room);
      }
    });

    return [...uniqueRooms.values()];
  } catch {
    return [];
  }
}

export function subscribeFavorites(
  onStoreChange: () => void,
): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === FAVORITE_KEY) {
      onStoreChange();
    }
  };

  window.addEventListener(
    FAVORITES_CHANGED_EVENT,
    onStoreChange,
  );

  window.addEventListener(
    "storage",
    handleStorage,
  );

  return () => {
    window.removeEventListener(
      FAVORITES_CHANGED_EVENT,
      onStoreChange,
    );

    window.removeEventListener(
      "storage",
      handleStorage,
    );
  };
}

interface ToggleFavoriteResult {
  active: boolean;
  success: boolean;
}

export function toggleFavorite(
  room: Room,
): ToggleFavoriteResult {
  if (typeof window === "undefined") {
    return {
      active: false,
      success: false,
    };
  }

  const current = parseFavorites(
    getFavoritesSnapshot(),
  );

  const wasFavorite = current.some(
    (favorite) => favorite.id === room.id,
  );

  const next = wasFavorite
    ? current.filter(
        (favorite) => favorite.id !== room.id,
      )
    : [room, ...current];

  try {
    window.localStorage.setItem(
      FAVORITE_KEY,
      JSON.stringify(next),
    );

    window.dispatchEvent(
      new Event(FAVORITES_CHANGED_EVENT),
    );

    return {
      active: !wasFavorite,
      success: true,
    };
  } catch {
    return {
      active: wasFavorite,
      success: false,
    };
  }
}