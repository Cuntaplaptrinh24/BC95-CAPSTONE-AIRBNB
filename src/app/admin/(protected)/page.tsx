// Trang tổng quan, là trang đầu tiên hiện ra sau khi đăng nhập quản trị.
// Chỉ hiện số lượng của từng loại dữ liệu, bấm vào một thẻ thì sang trang quản lý tương ứng.

import type { Metadata } from 'next';
import Link from 'next/link';
import { getUsersPaged } from '@/services/user-service';
import { getLocationsPaged } from '@/services/location-service';
import { getRoomsPaged } from '@/services/room-service';
import { getBookings } from '@/services/booking-service';
import { getComments } from '@/services/comment-service';

// Tiêu đề hiện trên tab trình duyệt khi mở trang này.
export const metadata: Metadata = {
  title: 'Tổng quan | Admin',
};

// Bắt Next.js dựng lại trang mỗi lần mở, không dùng bản đã lưu sẵn.
// Dữ liệu quản trị thay đổi liên tục nên phải lấy mới, nếu không vừa thêm
// một dòng xong quay lại danh sách vẫn thấy dữ liệu cũ.
export const dynamic = 'force-dynamic';

// Mô tả một thẻ số liệu: nhãn hiện lên, con số, và địa chỉ bấm vào sẽ đi tới.
interface StatCard {
  label: string;
  value: number;
  href: string;
}

export default async function AdminDashboardPage() {
  // Gọi năm API cùng lúc cho nhanh.
  //
  // Ba API đầu chỉ xin một dòng dữ liệu, vì thứ cần lấy là tổng số dòng chứ không
  // phải nội dung. Xin một dòng vẫn nhận được tổng số, mà không phải tải cả danh sách.
  //
  // Hai API cuối không có chức năng phân trang nên buộc phải tải hết rồi đếm.
  const [userStats, locationStats, roomStats, bookings, comments] = await Promise.all([
    getUsersPaged({ pageIndex: 1, pageSize: 1 }),
    getLocationsPaged({ pageIndex: 1, pageSize: 1 }),
    getRoomsPaged({ pageIndex: 1, pageSize: 1 }),
    getBookings(),
    getComments(),
  ]);

  // Gom năm con số thành một danh sách, phần bên dưới vẽ ra năm thẻ giống nhau.
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
