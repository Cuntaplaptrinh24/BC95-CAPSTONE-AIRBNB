import AdminGuard from '@/components/admin/admin-guard';
import AdminSidebar from '@/components/admin/admin-sidebar';
import AdminTopbar from '@/components/admin/admin-topbar';

interface AdminProtectedLayoutProps {
  children: React.ReactNode;
}

// Khung sườn dùng chung cho toàn bộ trang Admin cần đăng nhập:
// kiểm tra quyền (AdminGuard) + menu điều hướng + thanh trên cùng.
export default function AdminProtectedLayout({
  children,
}: AdminProtectedLayoutProps) {
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
