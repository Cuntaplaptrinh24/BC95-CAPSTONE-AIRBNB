// Lưu danh sách phòng yêu thích trong bộ nhớ trình duyệt.
// API của lớp học không có chức năng này, nên phòng đã lưu chỉ nằm trên máy
// đang dùng: đổi máy hoặc xóa dữ liệu duyệt web là mất.

import type { Room } from "@/types/room";

// Tên chỗ lưu trong bộ nhớ trình duyệt, và tên tín hiệu phát ra mỗi khi danh sách đổi
// để các phần khác của trang cập nhật theo.
const FAVORITE_KEY = "airbnb-favorites";
const FAVORITES_CHANGED_EVENT = "favorites-changed";
const EMPTY_FAVORITES_SNAPSHOT = "[]";

// Đọc chuỗi đang lưu. Chạy ở máy chủ thì không có bộ nhớ trình duyệt nên trả về rỗng.
export function getFavoritesSnapshot(): string {
  if (typeof window === "undefined") {
    return EMPTY_FAVORITES_SNAPSHOT;
  }

  return (
    window.localStorage.getItem(FAVORITE_KEY) ??
    EMPTY_FAVORITES_SNAPSHOT
  );
}

// Giá trị dùng khi trang được dựng ở máy chủ, để lần vẽ đầu tiên ở hai bên giống nhau.
export function getServerFavoritesSnapshot(): string {
  return EMPTY_FAVORITES_SNAPSHOT;
}

// Đổi chuỗi đã lưu thành danh sách phòng.
// Dữ liệu trong bộ nhớ trình duyệt có thể bị sửa tay hoặc hỏng, nên phải kiểm tra
// từng phần tử có đúng hình dạng một phòng không, sai thì bỏ qua thay vì để trang vỡ.
// Dùng Map theo mã phòng để loại trùng.
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

// Đăng ký lắng nghe thay đổi, để nút yêu thích ở mọi nơi cùng sáng hoặc cùng tắt.
// Nghe hai loại tín hiệu: tín hiệu tự phát trong cùng một tab, và tín hiệu 'storage'
// của trình duyệt khi người dùng sửa ở tab khác.
// Hàm trả về một hàm khác dùng để hủy lắng nghe khi component bị gỡ đi.
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

// Bấm nút yêu thích: đang có thì bỏ ra, chưa có thì thêm vào đầu danh sách.
// Ghi xong thì phát tín hiệu cho những chỗ khác biết.
// Bộ nhớ trình duyệt có thể đầy hoặc bị chặn, nên bọc trong try và trả về
// cờ success để nút biết mà báo lỗi thay vì im lặng.
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