'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminNavItem {
  href: string;
  label: string;
}

const NAV_ITEMS: AdminNavItem[] = [
  { href: '/admin', label: 'Tổng quan' },
  { href: '/admin/users', label: 'Người dùng' },
  { href: '/admin/locations', label: 'Vị trí' },
  { href: '/admin/rooms', label: 'Phòng thuê' },
  { href: '/admin/bookings', label: 'Đặt phòng' },
  { href: '/admin/comments', label: 'Bình luận' },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/admin') {
    return pathname === '/admin';
  }
  return pathname.startsWith(href);
}

// Menu điều hướng dùng chung cho toàn bộ khu vực Admin.
// Nằm ngang cuộn được trên màn hình nhỏ, dọc cố định trên desktop.
export default function AdminSidebar() {
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
