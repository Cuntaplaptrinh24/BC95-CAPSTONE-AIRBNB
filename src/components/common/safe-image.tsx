"use client";

import { useState } from "react";

interface SafeImageProps {
  src: string;
  alt: string;
  fallbackSrc: string;
  className?: string;
}

export default function SafeImage({ src, alt, fallbackSrc, className }: SafeImageProps) {
  const [prevSrc, setPrevSrc] = useState(src);
  const [failed, setFailed] = useState(false);

  if (prevSrc !== src) {
    setPrevSrc(src);
    setFailed(false);
  }

  const shown = failed ? fallbackSrc : src;

  const handleError = () => {
    if (!failed) setFailed(true);
  };

  return (
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
