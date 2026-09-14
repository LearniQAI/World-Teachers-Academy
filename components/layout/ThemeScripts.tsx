'use client';

import { useState } from 'react';
import Script from 'next/script';

// These theme vendor scripts depend on one another (e.g. hover-effect.umd.js
// expects the global THREE from three.js to already be defined, main.js
// expects jQuery/Swiper/etc.), so they must execute strictly in this order.
// Rendering them all at once with strategy="afterInteractive" does not
// guarantee order (dynamically-inserted <script> elements default to
// async), so each script is only mounted once the previous one has loaded.
const scripts = [
  '/assets/js/vendor/jquery-3.7.1.min.js',
  '/assets/js/plugin.min.js',
  '/assets/js/swiper-bundle.min.js',
  '/assets/js/bootstrap.min.js',
  '/assets/js/jquery.magnific-popup.min.js',
  '/assets/js/jquery.counterup.min.js',
  '/assets/js/jquery-ui.min.js',
  '/assets/js/three.js',
  '/assets/js/hover-effect.umd.js',
  '/assets/js/imagesloaded.pkgd.min.js',
  '/assets/js/isotope.pkgd.min.js',
  '/assets/js/wow.min.js',
  '/assets/js/main.js',
  '/assets/js/th-cursor.js',
];

export default function ThemeScripts() {
  const [loadedCount, setLoadedCount] = useState(1);

  return (
    <>
      {scripts.slice(0, loadedCount).map((src, i) => (
        <Script
          key={src}
          src={src}
          strategy="afterInteractive"
          onReady={() => {
            if (i === loadedCount - 1) {
              if (loadedCount === scripts.length) {
                // main.js (and everything after it) has now executed, so its
                // window.addEventListener("load", ...) handler (preloader
                // fadeOut, wowAnimation) and GSAP ScrollTrigger's own load
                // listener (which recalculates .th_fade_anim trigger
                // positions) are already attached — but the browser's real
                // "load" event fired long before these scripts were injected
                // via next/script, so those handlers never ran. Re-dispatch
                // it now that every listener is in place.
                window.dispatchEvent(new Event('load'));
              } else {
                setLoadedCount((c) => Math.min(c + 1, scripts.length));
              }
            }
          }}
        />
      ))}
    </>
  );
}
