// Cách để một chỗ bất kỳ trong trang yêu cầu mở cửa sổ đăng nhập.
// Cửa sổ đó nằm trong Header, còn nút bấm có thể nằm ở chi tiết phòng hay trang hồ sơ.
// Thay vì truyền hàm qua nhiều lớp component, ở đây phát một tín hiệu chung
// cho cả trang, Header nghe được thì mở cửa sổ lên.

export const AUTH_MODAL_OPEN_EVENT = "airbnb:open-auth";

// Phát tín hiệu. Dòng kiểm tra window phòng trường hợp hàm bị gọi ở phía máy chủ,
// nơi không có trình duyệt, gọi thẳng sẽ lỗi.
export function requestAuthModal(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_MODAL_OPEN_EVENT));
}
