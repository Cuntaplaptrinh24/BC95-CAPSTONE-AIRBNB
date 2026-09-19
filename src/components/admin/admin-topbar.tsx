'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { showToast } from '@/components/common/toast';

// Thanh trên cùng của khu vực Admin: hiển thị tên quản trị viên và nút đăng xuất.
export default function AdminTopbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  function handleLogout() {
    // Xóa thông tin đăng nhập, báo một câu, rồi đưa về trang đăng nhập quản trị.
    logout();
    showToast('success', 'Đã đăng xuất khỏi khu vực quản trị.');
    router.replace('/admin/login');
  }

  return (
    <header className="flex items-center justify-between border-b border-border bg-white px-4 py-3 md:px-8">
      <p className="text-sm font-semibold text-foreground">Quản trị hệ thống</p>

      <div className="flex items-center gap-3">
        {/* Tên quản trị viên, ẩn đi trên màn hình hẹp cho đỡ chật */}
        <span className="hidden text-sm text-secondary sm:inline">
          {user?.name}
        </span>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-full border border-border px-4 py-1.5 text-sm font-medium text-foreground transition hover:bg-surface"
        >
          Đăng xuất
        </button>
      </div>
    </header>
  );
}
