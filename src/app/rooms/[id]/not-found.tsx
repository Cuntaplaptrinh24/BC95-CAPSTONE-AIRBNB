// Màn hình báo không tìm thấy phòng.
// Khác file error ở chỗ: error dành cho lỗi ngoài ý muốn, còn file này hiện khi
// trang chi tiết gọi notFound() vì mã phòng trên địa chỉ không tồn tại.

import Link from "next/link";

export default function RoomNotFound() {
  return (
    <div className="container-airbnb flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-4xl font-bold text-foreground">404</h1>
      <p className="mt-4 text-lg font-medium text-foreground">
        Không tìm thấy chỗ ở này
      </p>
      <p className="mt-2 text-sm text-secondary">
        Chỗ ở không tồn tại hoặc đã bị xóa.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
      >
        Quay về trang chủ
      </Link>
    </div>
  );
}
