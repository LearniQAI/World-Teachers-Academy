"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

// Course card image with a safe fallback: if the file is missing or fails to
// load, the designed banner is shown instead of a broken image.
// The effect also catches an image that already failed before the page's
// JavaScript started (onError would not fire for it).
export default function CourseImage({
  src,
  alt,
  fallback,
  style,
}: {
  src: string | null;
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
  return <img ref={ref} src={src} alt={alt} loading="lazy" style={style} onError={() => setFailed(true)} />;
}
