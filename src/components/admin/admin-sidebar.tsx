'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminNavItem {
  href: string;
  label: string;
}

// Danh sách các mục trong menu. Thêm một trang quản trị mới thì
// chỉ cần thêm một dòng vào đây, phần bên dưới tự vẽ ra.
const NAV_ITEMS: AdminNavItem[] = [
  { href: '/admin', label: 'Tổng quan' },
  { href: '/admin/users', label: 'Người dùng' },
  { href: '/admin/locations', label: 'Vị trí' },
  { href: '/admin/rooms', label: 'Phòng thuê' },
  { href: '/admin/bookings', label: 'Đặt phòng' },
  { href: '/admin/comments', label: 'Bình luận' },
];

// Xác định mục nào đang được mở để tô màu khác.
// Riêng mục Tổng quan phải so sánh bằng đúng, vì mọi đường dẫn quản trị
// đều bắt đầu bằng /admin, nếu so kiểu bắt đầu bằng thì mục nào cũng sáng.
function isActive(pathname: string, href: string): boolean {
  if (href === '/admin') {
    return pathname === '/admin';
  }
  return pathname.startsWith(href);
}

// Menu điều hướng dùng chung cho toàn bộ khu vực quản trị.
// Trên điện thoại thì nằm ngang và cuộn được, trên máy tính thì nằm dọc bên trái.
export default function AdminSidebar() {
  // Lấy đường dẫn của trang đang mở để biết mục nào cần tô sáng.
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border bg-white px-4 py-2 md:w-56 md:shrink-0 md:flex-col md:gap-1 md:overflow-visible md:border-b-0 md:border-r md:px-3 md:py-6">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition md:rounded-lg ${
              active
                ? 'bg-brand text-white'
                : 'text-foreground hover:bg-surface'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
