'use client';

export default function Preloader() {
  return (
    <div className="preloader" aria-label="Loading World Teachers Academy">
      {/* The ".preloaderCls" click handler normally lives in main.js — the
          second-to-last script in ThemeScripts' sequential vendor-script
          chain. If any earlier script in that chain fails to load (a bad
          network, a 404, a slow connection), main.js never runs and this
          button silently does nothing, leaving the visitor stuck behind the
          preloader with no way out. This native onClick works independently
          of that chain, so the escape hatch is reliable even when the
          vendor scripts aren't. */}
      <button
        className="th-btn preloaderCls"
        onClick={(e) => {
          e.preventDefault();
          e.currentTarget.closest(".preloader")?.remove();
        }}
      >
        CANCEL PRELOADER{" "}
      </button>
      <div className="preloader-inner">
        <div className="bounce mb-4">
          <img src="/assets/img/world-teachers-logo.jpeg" alt="World Teachers Academy" style={{ width: "150px", height: "auto" }} />
        </div>
        <span className="loader">
          World Teachers Academy
          <span className="loading-text">World Teachers Academy</span>
        </span>
        <div className="preloader-status" aria-live="polite">
          <span>Loading</span><span className="preloader-dots" aria-hidden="true">...</span>
        </div>
      </div>
    </div>
  );
}
