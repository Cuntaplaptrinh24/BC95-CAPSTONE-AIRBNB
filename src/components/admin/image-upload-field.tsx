'use client';

import { useRef, useState } from 'react';
import SafeImage from '@/components/common/safe-image';

interface ImageUploadFieldProps {
  label: string;
  currentImageUrl: string;
  fallbackSrc: string;
  onFileSelected: (file: File) => void;
  isUploading?: boolean;
}

// Ô chọn ảnh dùng chung cho ảnh đại diện, ảnh vị trí và ảnh phòng.
// Chỉ lo phần chọn file và xem trước; việc gửi ảnh lên server do màn hình gọi nó làm.
export default function ImageUploadField({
  label,
  currentImageUrl,
  fallbackSrc,
  onFileSelected,
  isUploading = false,
}: ImageUploadFieldProps) {
  // Ô chọn file thật của trình duyệt bị ẩn đi vì giao diện mặc định của nó xấu.
  // inputRef giữ đường dây tới ô đó để bấm nút Chọn ảnh thì mở hộp chọn file.
  const inputRef = useRef<HTMLInputElement>(null);

  // Đường dẫn tạm của ảnh vừa chọn, dùng để xem trước ngay khi chưa gửi lên server.
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Chạy khi người dùng chọn xong một file trong hộp chọn file.
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    // Tạo đường dẫn tạm ngay trong trình duyệt để hiện ảnh xem trước,
    // rồi báo cho màn hình gọi nó biết đã chọn file nào.
    setPreviewUrl(URL.createObjectURL(file));
    onFileSelected(file);
  }

  // Có ảnh vừa chọn thì hiện ảnh đó, chưa chọn gì thì hiện ảnh đang lưu trên server.
  const displayUrl = previewUrl ?? currentImageUrl;

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-foreground">{label}</p>

      <div className="flex items-center gap-4">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-surface">
          <SafeImage
            src={displayUrl}
            alt={label}
            fallbackSrc={fallbackSrc}
            className="h-full w-full object-cover"
          />
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-surface disabled:opacity-50"
        >
          {isUploading ? 'Đang tải lên...' : 'Chọn ảnh'}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
