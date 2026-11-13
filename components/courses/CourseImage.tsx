"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

// Course card image with a safe fallback: if the file is missing or fails to
// load, the designed banner is shown instead of a broken image.
// The effect also catches an image that already failed before the page's
// JavaScript started (onError would not fire for it).
export default function CourseImage({
  src,
  srcSet,
  alt,
  fallback,
  style,
}: {
  src: string | null;
  srcSet?: string;
  alt: string;
  fallback: ReactNode;
  style?: CSSProperties;
}) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  if (!src || failed) return <>{fallback}</>;
  return (
    <img
      ref={ref}
      src={src}
      srcSet={srcSet}
      sizes={srcSet ? "(min-width: 1200px) 400px, (min-width: 768px) 45vw, 92vw" : undefined}
      alt={alt}
      loading="lazy"
      decoding="async"
      style={style}
      onError={() => setFailed(true)}
    />
  );
}
