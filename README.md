# BC95 Capstone — Airbnb

Thành viên nhóm:

- Võ Doãn Hoàng Long — hoanglongdoan2006@gmail.com — phần người dùng
- Nguyễn Nam Long — longnguyennam0705@gmail.com — phần quản trị

Bài capstone khóa BC95 của CyberSoft. Đây là website đặt phòng mô phỏng Airbnb, viết bằng Next.js và TypeScript, dữ liệu lấy từ API của CyberSoft.

Dự án có hai phần: trang cho người dùng và trang quản trị ở đường dẫn `/admin`.

Bản chạy thử: https://bc95-capstone-airbnb.vercel.app

## Công nghệ

- Next.js 16 và React 19
- TypeScript
- Tailwind CSS
- Axios để gọi API
- Zustand để lưu trạng thái đăng nhập
- react-hook-form và zod để kiểm tra dữ liệu người dùng nhập

## Chức năng

Trang người dùng:

- `/` — trang chủ: danh sách vị trí, tìm kiếm theo vị trí, ngày và số khách

- `/rooms` — danh sách phòng, lọc theo vị trí hoặc từ khóa, có phân trang

- `/rooms/[id]` — chi tiết phòng, xem bình luận, đặt phòng, lưu yêu thích

- `/profile` — thông tin cá nhân, đổi ảnh đại diện, lịch sử đặt phòng

- Đăng nhập và đăng ký bằng cửa sổ popup

Trang quản trị:

- `/admin/login` — đăng nhập riêng, chỉ tài khoản có quyền ADMIN vào được

- `/admin` — thống kê số lượng người dùng, vị trí, phòng, lượt đặt, bình luận

- `/admin/users`, `/admin/locations`, `/admin/rooms` — thêm, sửa, xóa, tìm kiếm, phân trang

- `/admin/bookings`, `/admin/comments` — sửa và xóa

## Cách chạy

Cần Node.js 20 trở lên.

```bash
git clone https://github.com/Cuntaplaptrinh24/BC95-CAPSTONE-AIRBNB.git
cd BC95-CAPSTONE-AIRBNB
npm install
```

Tạo file `.env.local` theo mẫu trong `.env.example`, rồi điền token lớp học vào dòng `NEXT_PUBLIC_TOKEN_CYBERSOFT`. Không có token thì không gọi được API.

Chạy:

```bash
npm run dev
```

Mở http://localhost:3000

Bản trên Vercel cũng cần hai dòng cấu hình này, khai báo ở phần Environment Variables.

## Cấu trúc thư mục

- `src/app` — các trang, chia theo đường dẫn
- `src/components` — giao diện, chia theo khu vực: admin, auth, booking, home, profile, room, common
- `src/services` — các hàm gọi API, mỗi file một nhóm: đăng nhập, người dùng, phòng, vị trí, đặt phòng, bình luận
- `src/lib` — phần dùng chung: cấu hình gọi API, đọc file cấu hình, lưu danh sách yêu thích
- `src/store` — lưu trạng thái đăng nhập
- `src/types` — khai báo kiểu dữ liệu
- `docs` — yêu cầu đề bài và danh sách API đã dùng

## Phạm vi và giới hạn

Bài này chỉ làm phần giao diện. Dữ liệu lấy từ API chung của lớp học, dự án không có máy chủ riêng. Hai điều dưới đây là do vậy.

Trang quản trị chỉ chặn được ở phía trình duyệt: ai không có quyền ADMIN mà mở đường dẫn `/admin` thì bị đẩy về trang chủ. Người rành kỹ thuật vẫn có cách lách để xem màn hình quản trị, nhưng sửa hay xóa dữ liệu thì không được, vì việc đó do máy chủ của CyberSoft quyết định.

Token của lớp học phải nằm trong phần mã chạy trên trình duyệt thì mới gọi được API, nên mở trình duyệt ra là thấy. Đây là token dùng chung cho cả khóa học, không phải mật khẩu tài khoản.
