'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface AdminSearchFormProps {
  basePath: string;
  keyword?: string;
  placeholder?: string;
}

// Ô tìm kiếm dùng chung cho các trang danh sách ở Admin.
// Cập nhật từ khóa qua URL (?keyword=...) để trang Server Component tự tải lại dữ liệu.
export default function AdminSearchForm({
  basePath,
  keyword = '',
  placeholder = 'Tìm kiếm...',
}: AdminSearchFormProps) {
  const router = useRouter();
  const [value, setValue] = useState(keyword);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = value.trim();
    const query = trimmed ? `?keyword=${encodeURIComponent(trimmed)}` : '';
    router.push(`${basePath}${query}`);
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
