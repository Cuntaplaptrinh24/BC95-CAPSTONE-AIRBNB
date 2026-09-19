"use client";

import { useState } from "react";

interface SafeImageProps {
  src: string;
  alt: string;
  fallbackSrc: string;
  className?: string;
}

// Ảnh có ảnh dự phòng. Ảnh từ API đôi khi hỏng hoặc đường dẫn không còn,
// khi đó trình duyệt báo lỗi tải ảnh và component đổi sang ảnh thay thế.
export default function SafeImage({ src, alt, fallbackSrc, className }: SafeImageProps) {
  const [prevSrc, setPrevSrc] = useState(src);
  const [failed, setFailed] = useState(false);

  // Khi nơi gọi truyền vào một ảnh khác, phải quên trạng thái hỏng của ảnh cũ đi,
  // nếu không thì ảnh mới cũng bị hiện thành ảnh dự phòng dù nó còn tốt.
  if (prevSrc !== src) {
    setPrevSrc(src);
    setFailed(false);
  }

  const shown = failed ? fallbackSrc : src;

  const handleError = () => {
    if (!failed) setFailed(true);
  };

  return (
    // Dùng thẻ img thường thay vì next/image, vì ảnh đến từ nhiều tên miền khác nhau
    // do API trả về, khai báo trước hết trong cấu hình thì không xuể.
    // Dòng eslint-disable ngay dưới là để tắt cảnh báo của công cụ kiểm tra mã.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={shown}
      alt={alt}
      className={className}
      onError={handleError}
      loading="lazy"
    />
  );
}
