// Khung màn hình dùng chung cho mọi trang quản trị cần đăng nhập.
// Next.js tự bọc khung này quanh mọi trang nằm trong thư mục (protected),
// nên không phải viết lại ở từng trang.

import AdminGuard from '@/components/admin/admin-guard';
import AdminSidebar from '@/components/admin/admin-sidebar';
import AdminTopbar from '@/components/admin/admin-topbar';

interface AdminProtectedLayoutProps {
  children: React.ReactNode;
}

export default function AdminProtectedLayout({
  children,
}: AdminProtectedLayoutProps) {
  // Bọc ngoài cùng là lớp kiểm tra quyền, bên trong mới là menu bên trái,
  // thanh trên cùng, và phần nội dung riêng của từng trang (children).
  return (
    <AdminGuard>
      <div className="flex min-h-[calc(100vh-5rem)] flex-col md:flex-row">
        <AdminSidebar />

        <div className="flex-1">
          <AdminTopbar />
          <main className="p-4 md:p-8">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}
