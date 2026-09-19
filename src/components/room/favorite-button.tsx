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

// Nút trái tim lưu phòng yêu thích. Danh sách yêu thích nằm trong bộ nhớ trình duyệt
// chứ không nằm trên server, vì API lớp học không có chức năng này.
export default function FavoriteButton({
  room,
}: FavoriteButtonProps) {
  // useSyncExternalStore là cách React đọc dữ liệu từ một kho nằm ngoài React.
  // Ba tham số: cách đăng ký nghe thay đổi, cách đọc giá trị ở trình duyệt,
  // và cách đọc khi trang được dựng ở máy chủ.
  // Nhờ nó, bấm tim ở một thẻ phòng thì mọi thẻ của cùng phòng đó cùng sáng.
  const snapshot = useSyncExternalStore(
    subscribeFavorites,
    getFavoritesSnapshot,
    getServerFavoritesSnapshot,
  );

  // Xem phòng này có trong danh sách yêu thích chưa.
  // useMemo để khỏi phải đọc và duyệt lại danh sách ở mỗi lần vẽ.
  const active = useMemo(
    () =>
      parseFavorites(snapshot).some(
        (favorite) => favorite.id === room.id,
      ),
    [room.id, snapshot],
  );

  // Bấm nút: thêm vào hoặc bỏ ra, rồi báo một câu cho người dùng biết.
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