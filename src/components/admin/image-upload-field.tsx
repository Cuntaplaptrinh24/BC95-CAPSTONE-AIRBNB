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

// Ô chọn ảnh dùng chung: xem trước ảnh hiện tại/ảnh vừa chọn, dùng cho
// upload avatar, hình vị trí và hình phòng ở khu vực Admin.
export default function ImageUploadField({
  label,
  currentImageUrl,
  fallbackSrc,
  onFileSelected,
  isUploading = false,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    onFileSelected(file);
  }

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
