# Dự án Capstone Airbnb — Phần User

## Mục tiêu
Capstone Next.js cho website Airbnb dành riêng cho **User**. Người dùng có thể xem nhà/phòng theo vị trí, xem chi tiết phòng, tìm kiếm, đăng nhập/đăng ký, quản lý thông tin cá nhân và lịch sử đặt phòng, đặt phòng ngay trong trang chi tiết phòng.

## Phạm vi
- **Chỉ làm phần User.** Không làm bất kỳ màn hình, route, component, service hay chức năng nào cho Admin.
- Các màn hình User dự kiến: Trang chủ, danh sách phòng theo vị trí/tìm kiếm, chi tiết phòng (kèm form đặt phòng), đăng nhập, đăng ký, thông tin cá nhân (kèm lịch sử đặt phòng).

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
