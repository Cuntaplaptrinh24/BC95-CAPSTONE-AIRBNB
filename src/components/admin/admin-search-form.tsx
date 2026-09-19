'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface AdminSearchFormProps {
  basePath: string;
  keyword?: string;
  placeholder?: string;
  sort?: string;
}

// Ô tìm kiếm dùng chung cho các màn hình quản lý.
// Bấm Tìm thì không tự gọi API, mà đổi địa chỉ trang thành dạng ?keyword=...
// Trang quản lý chạy ở máy chủ, thấy địa chỉ đổi thì tự gọi API lấy kết quả mới.
// Làm vậy để sao chép địa chỉ gửi cho người khác là ra đúng kết quả tìm kiếm đó.
export default function AdminSearchForm({
  basePath,
  keyword = '',
  placeholder = 'Tìm kiếm...',
  sort,
}: AdminSearchFormProps) {
  const router = useRouter();

  // Chữ đang gõ trong ô, giữ riêng ở đây nên gõ tới đâu hiện tới đó
  // mà chưa động gì tới địa chỉ trang.
  const [value, setValue] = useState(keyword);

  function handleSubmit(event: React.FormEvent) {
    // Chặn hành vi mặc định của trình duyệt là tải lại cả trang khi gửi form.
    event.preventDefault();
    const trimmed = value.trim();
    // Bỏ trống thì về địa chỉ gốc, tức xem lại toàn bộ danh sách.
    // encodeURIComponent mã hóa dấu cách và ký tự tiếng Việt cho hợp lệ trên địa chỉ.
    // Ghép địa chỉ mới, giữ lại cách sắp xếp đang chọn nếu có.
    const params = new URLSearchParams();
    if (trimmed) params.set('keyword', trimmed);
    if (sort) params.set('sort', sort);

    const query = params.toString();
    router.push(query ? `${basePath}?${query}` : basePath);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        className="w-56 rounded-full border border-border px-4 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
      />
      <button
        type="submit"
        className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-surface"
      >
        Tìm
      </button>
    </form>
  );
}
