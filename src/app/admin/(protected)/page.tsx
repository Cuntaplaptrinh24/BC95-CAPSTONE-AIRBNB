import type { Metadata } from 'next';
import Link from 'next/link';
import { getUsersPaged } from '@/services/user-service';
import { getLocationsPaged } from '@/services/location-service';
import { getRoomsPaged } from '@/services/room-service';
import { getBookings } from '@/services/booking-service';
import { getComments } from '@/services/comment-service';

export const metadata: Metadata = {
  title: 'Tổng quan | Admin',
};

export const dynamic = 'force-dynamic';

interface StatCard {
  label: string;
  value: number;
  href: string;
}

// Trang tổng quan Admin: hiển thị tổng số lượng của từng loại dữ liệu.
// Với Người dùng/Vị trí/Phòng thuê, tận dụng endpoint phân trang sẵn có
// (chỉ lấy 1 dòng) để đọc totalRow thay vì gọi thêm API lấy toàn bộ danh sách.
export default async function AdminDashboardPage() {
  const [userStats, locationStats, roomStats, bookings, comments] = await Promise.all([
    getUsersPaged({ pageIndex: 1, pageSize: 1 }),
    getLocationsPaged({ pageIndex: 1, pageSize: 1 }),
    getRoomsPaged({ pageIndex: 1, pageSize: 1 }),
    getBookings(),
    getComments(),
  ]);

  const cards: StatCard[] = [
    { label: 'Người dùng', value: userStats.totalRow, href: '/admin/users' },
    { label: 'Vị trí', value: locationStats.totalRow, href: '/admin/locations' },
    { label: 'Phòng thuê', value: roomStats.totalRow, href: '/admin/rooms' },
    { label: 'Đặt phòng', value: bookings.length, href: '/admin/bookings' },
    { label: 'Bình luận', value: comments.length, href: '/admin/comments' },
  ];

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground">Tổng quan</h1>
      <p className="mt-1 text-sm text-secondary">
        Số liệu tổng hợp của toàn bộ hệ thống Airbnb.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-2xl border border-border bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <p className="text-sm text-secondary">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{card.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
