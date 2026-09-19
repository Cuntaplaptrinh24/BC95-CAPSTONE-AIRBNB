'use client';

// Ô chọn cách sắp xếp cho các màn hình quản lý.
// Giống ô tìm kiếm: không tự lọc dữ liệu, mà đổi địa chỉ trang rồi để trang
// chạy ở máy chủ sắp xếp lại và trả về. Nhờ vậy sao chép địa chỉ gửi cho người
// khác vẫn ra đúng thứ tự đang xem.

import { useRouter } from 'next/navigation';

interface SortOption {
  value: string;
  label: string;
}

interface AdminSortSelectProps {
  basePath: string;
  sort: string;
  keyword?: string;
  options: SortOption[];
}

export default function AdminSortSelect({
  basePath,
  sort,
  keyword,
  options,
}: AdminSortSelectProps) {
  const router = useRouter();

  function handleChange(value: string) {
    const params = new URLSearchParams();

    // Giữ lại từ khóa đang tìm, và luôn quay về trang 1 vì thứ tự đã đổi.
    if (keyword) params.set('keyword', keyword);
    params.set('sort', value);
    params.set('page', '1');

    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <label className="flex items-center gap-2 text-sm text-secondary">
      Sắp xếp
      <select
        value={sort}
        onChange={(event) => handleChange(event.target.value)}
        className="rounded-full border border-border px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
