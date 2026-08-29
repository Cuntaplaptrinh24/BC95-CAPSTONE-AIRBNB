# Phạm vi API — Airbnb User

## Base URL
- Base URL đọc từ biến môi trường `NEXT_PUBLIC_API_URL` và **đã bao gồm `/api`**.
- Service chỉ viết đường dẫn như `/auth/signin`, `/vi-tri`, ... KHÔNG viết `/api/auth/signin` để tránh URL sai dạng `/api/api/...`.

## Header
- Mọi request API dùng header phiên bản trung gian: `tokenCybersoft` (lấy từ `NEXT_PUBLIC_TOKEN_CYBERSOFT`).
- Với request cần xác thực người dùng, bổ sung header chính xác là `token` và giá trị là access token của người dùng. KHÔNG tự đổi sang `Authorization: Bearer ...` trừ khi Swagger chứng minh endpoint yêu cầu như vậy.

## Envelope response chuẩn (CyberSoft)
```json
{
  "statusCode": 200,
  "content": <dữ liệu>,
  "dateTime": "2026-08-27T..."
}
```
- `content` có thể là một object/list, hoặc object phân trang:
```json
{
  "pageIndex": 1,
  "pageSize": 5,
  "totalRow": 100,
  "keywords": null,
  "data": []
}
```

## Endpoint User được sử dụng
### Auth
- `POST /auth/signin`
- `POST /auth/signup`

### User
- `GET /users/{id}`
- `PUT /users/{id}`
- `POST /users/upload-avatar`

### Location (chỉ đọc)
- `GET /vi-tri`
- `GET /vi-tri/phan-trang-tim-kiem`
- `GET /vi-tri/{id}`

### Room (chỉ đọc)
- `GET /phong-thue`
- `GET /phong-thue/lay-phong-theo-vi-tri`
- `GET /phong-thue/phan-trang-tim-kiem`
- `GET /phong-thue/{id}`

### Booking
- `GET /dat-phong`
- `POST /dat-phong`
- `GET /dat-phong/lay-theo-nguoi-dung/{MaNguoiDung}`

### Comment
- `GET /binh-luan/lay-binh-luan-theo-phong/{MaPhong}`
- `POST /binh-luan`
- `PUT /binh-luan/{id}`
- `DELETE /binh-luan/{id}`

KHÔNG triển khai phần CRUD quản trị cho User, Location, Room hay Booking.

## Công thức kiểm tra trùng lịch đặt phòng
Một khoảng thời gian mới trùng lịch với khoảng đã có khi:

```ts
newCheckIn < existingCheckOut && newCheckOut > existingCheckIn
```

Cách kiểm tra phòng đã có lịch:
1. Gọi `GET /dat-phong`.
2. Lọc các booking theo `maPhong` cần kiểm tra.
3. Áp dụng công thức overlap trên.

KHÔNG dùng `GET /dat-phong/{id}` để kiểm tra trùng lịch vì `{id}` là mã booking, không phải mã phòng.

## Bảo mật
- KHÔNG ghi giá trị token thật vào tài liệu.
- Treat `.env` như bí mật: không sửa, xóa hay hiển thị nội dung.
