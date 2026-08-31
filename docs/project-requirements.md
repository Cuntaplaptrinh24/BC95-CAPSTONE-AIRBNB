# Dự án Capstone Airbnb — User & Admin

## Mục tiêu
Capstone Next.js cho website Airbnb gồm 2 phần: **User** (đã hoàn thành) và **Admin** (đã hoàn thành). User có thể xem nhà/phòng theo vị trí, xem chi tiết phòng, tìm kiếm, đăng nhập/đăng ký, quản lý thông tin cá nhân và lịch sử đặt phòng, đặt phòng ngay trong trang chi tiết phòng. Admin quản lý toàn bộ dữ liệu hệ thống (Người dùng, Vị trí, Phòng thuê, Đặt phòng, Bình luận) tại khu vực riêng `/admin`.

## Phạm vi
- **Phần User** (route ngoài `/admin`): Trang chủ, danh sách phòng theo vị trí/tìm kiếm, chi tiết phòng (kèm form đặt phòng), đăng nhập, đăng ký, thông tin cá nhân (kèm lịch sử đặt phòng).
- **Phần Admin** (route `/admin/*`, chỉ tài khoản role `ADMIN` truy cập được):
  - Đăng nhập quản trị riêng tại `/admin/login`.
  - Tổng quan (`/admin`): số liệu tổng hợp Người dùng/Vị trí/Phòng thuê/Đặt phòng/Bình luận.
  - Người dùng (`/admin/users`): tìm kiếm, phân trang, thêm/sửa/xóa tài khoản.
  - Vị trí (`/admin/locations`): thêm/sửa/xóa vị trí, upload hình ảnh.
  - Phòng thuê (`/admin/rooms`): thêm/sửa/xóa phòng (đầy đủ tiện nghi), upload hình ảnh.
  - Đặt phòng (`/admin/bookings`): sửa ngày/số khách, xóa (không tạo mới vì đặt phòng phát sinh từ User).
  - Bình luận (`/admin/comments`): kiểm duyệt nội dung/số sao, xóa (không tạo mới vì bình luận phát sinh từ User).
  - Kiểm tra quyền truy cập được thực hiện ở phía client (`AdminGuard`) dựa trên `user.role === 'ADMIN'` lưu trong Zustand store — đây là rào chắn UI, không thay thế cho việc phân quyền ở backend.

## Stack kỹ thuật
- Next.js App Router
- TypeScript `strict`
- Tailwind CSS
- Axios cho API client
- Zustand cho store client (sẽ được thêm ở giai đoạn sau)
- react-hook-form + zod + @hookform/resolvers cho form/validation

## Quy tắc kiến trúc
- Ưu tiên **Server Component** cho dữ liệu công khai ban đầu.
- Chỉ dùng `"use client"` khi thật sự cần: form, modal, store, event và tương tác trình duyệt.
- Responsive cho desktop, iPad và iPhone.
- Có loading state, empty state, error state, validation, search và pagination khi phù hợp.

## Quy tắc code
- camelCase cho hàm/biến, PascalCase cho type/interface/component.
- Chia thư mục đúng chức năng, hàm nhỏ và mỗi hàm chỉ làm một việc.
- Không để code chết, biến thừa, import thừa, `console.log` hoặc dữ liệu nghiệp vụ hardcode.
- Comment tiếng Việt chỉ dùng cho logic khó hiểu.

## Yêu cầu nộp bài
- Nguồn trên GitHub
- Link deploy
- Video demo
