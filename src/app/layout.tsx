// Khung ngoài cùng của cả website. Next.js bọc file này quanh mọi trang,
// nên Header và ô thông báo chỉ khai báo một lần ở đây là có mặt ở mọi nơi.

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/header';
import ToastContainer from '@/components/common/toast';

// Nạp hai bộ phông từ Google Fonts. Next.js tải sẵn lúc dựng trang,
// nên trình duyệt không phải gọi sang Google khi người dùng mở web.
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Tiêu đề và mô tả mặc định, hiện trên tab trình duyệt và khi chia sẻ link.
// Từng trang con có thể khai báo đè lên.
export const metadata: Metadata = {
  title: 'Airbnb | Nghỉ dưỡng, nhà gỗ, nơi độc đáo',
  description:
    'Tìm nơi ở, trải nghiệm và địa điểm độc đáo trên Airbnb.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Header có thanh tìm kiếm và cửa sổ đăng nhập, chung cho mọi trang */}
        <Header />
        <main className="flex-1">{children}</main>
        {/* Nơi các ô thông báo bật lên. Đặt ở đây một lần, mọi nơi gọi showToast đều dùng chung */}
        <ToastContainer />
      </body>
    </html>
  );
}
