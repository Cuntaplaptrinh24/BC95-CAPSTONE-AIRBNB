"use client";

// Lớp chắn cho toàn bộ khu vực quản trị: ai không phải quản trị viên
// thì bị đẩy ra ngoài trước khi nhìn thấy nội dung bên trong.
// File chạy trong trình duyệt vì cần đọc bộ nhớ trình duyệt và chuyển trang.

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { showToast } from "@/components/common/toast";

// children là phần nội dung được bọc bên trong khi gọi <AdminGuard>...</AdminGuard>,
// ở đây là menu bên trái cộng nội dung của từng trang quản trị.
interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  // Lấy ba thứ từ kho dữ liệu đăng nhập dùng chung:
  //   user            thông tin người đang đăng nhập: tên, email, quyền hạn
  //   isAuthenticated đã đăng nhập hay chưa
  //   hasHydrated     đã đọc xong dữ liệu đăng nhập từ bộ nhớ trình duyệt hay chưa
  const { user, isAuthenticated, hasHydrated } = useAuthStore();

  // Dùng để chuyển trang bằng code.
  const router = useRouter();

  // Chạy sau khi giao diện vẽ xong, và chạy lại mỗi khi một trong bốn giá trị
  // theo dõi ở cuối thay đổi. Nhờ vậy vừa bấm đăng xuất là bị đẩy ra ngay.
  useEffect(() => {
    // Lúc trang vừa mở, kho dữ liệu còn rỗng vì chưa đọc xong bộ nhớ trình duyệt.
    // Không chờ thì bấm F5 là bị đá về trang đăng nhập dù đang đăng nhập.
    if (!hasHydrated) return;

    // Chưa đăng nhập thì đưa về trang đăng nhập quản trị.
    // Dùng replace thay vì push để bấm nút Back không quay lại được khu quản trị.
    if (!isAuthenticated) {
      router.replace("/admin/login");
      return;
    }

    // Đã đăng nhập nhưng là tài khoản thường: báo một câu rồi đưa về trang chủ.
    // Không đưa về trang đăng nhập vì họ đã đăng nhập rồi.
    if (user?.role !== "ADMIN") {
      showToast("error", "Bạn không có quyền truy cập khu vực quản trị.");
      router.replace("/");
    }
  }, [hasHydrated, isAuthenticated, user, router]);

  // Kiểm tra lại đúng ba điều kiện trên, lần này để quyết định có vẽ hay không.
  // Phải có dòng này vì useEffect chỉ chạy sau khi màn hình đã vẽ xong; thiếu nó
  // thì nội dung quản trị chớp lên một nhịp rồi mới bị chuyển trang.
  if (!hasHydrated || !isAuthenticated || user?.role !== "ADMIN") {
    return null;
  }

  // Qua hết các cửa thì trả lại nguyên phần nội dung bên trong.
  return <>{children}</>;
}
