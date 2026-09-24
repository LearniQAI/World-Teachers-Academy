"use client";

import {
  useCallback,
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import styles from "./AudioPlayer.module.css";
import { claimPlayback, onPlaybackClaimed, ownsMediaSession, releaseMediaSession } from "./playback-bus";
import { useIsClient, useStoredNumber, writeNumber } from "./persisted";

export type AudioPlayerProps = {
  src: string;
  peaksSrc: string;
  title: string;
  subtitle?: string;
  durationSec: number;
  /** Stable id for the saved resume position, e.g. "country:japan". */
  trackId: string;
  /** Content of the pill on the cover art, e.g. a country's <CountryFlag>. Defaults to a headphones icon. */
  badge?: ReactNode;
  theme?: "light" | "dark";
};

type Status = "idle" | "loading" | "playing" | "paused" | "error";

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];
const SKIP_SEC = 15;
const NUDGE_SEC = 5;
const SAVE_EVERY_MS = 5000;
const LOAD_TIMEOUT_MS = 20000; // no data for this long while loading/buffering -> error, never an endless spinner
const COMPLETE_AT = 0.95;
const MIN_RESUME_SEC = 5;
const HEADER_OFFSET_PX = 80; // the site header is fixed; count the player as hidden once it's under it
const MINI_ATTR = "data-wta-mini-player"; // lifts the scroll-to-top button, see globals.css

const ARTIST = "World Teachers Academy";
const COVER_SRC = "/assets/img/audio/podcast-cover.webp";
const ARTWORK: MediaImage[] = [
  { src: "/assets/img/audio/podcast-cover-512.webp", sizes: "512x512", type: "image/webp" },
  { src: COVER_SRC, sizes: "1024x1024", type: "image/webp" },
];
const SESSION_ACTIONS: MediaSessionAction[] = ["play", "pause", "stop", "seekbackward", "seekforward", "seekto"];

// Canvas colours per theme. Dark has no buffered split, preview fill or playhead dot.
const WAVE_COLORS = {
  dark: { played: ["#14B8A6", "#14B8A6"], buffered: "rgba(255, 255, 255, 0.25)", unbuffered: "rgba(255, 255, 255, 0.25)", preview: null, hoverLine: "rgba(255, 255, 255, 0.75)", dot: false },
  light: { played: ["#4F46E5", "#14B8A6"], buffered: "#CBD5E1", unbuffered: "#E2E8F0", preview: "#A5B4FC", hoverLine: "#4F46E5", dot: true },
} as const;
const DOT_RADIUS = 6;
const BAR_WIDTH = 2;
const BAR_GAP = 1.5;

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

function fmt(sec: number) {
  const s = Number.isFinite(sec) && sec > 0 ? Math.floor(sec) : 0;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
}

function cx(...names: (string | false | null | undefined)[]) {
  return names.filter(Boolean).join(" ");
}

/**
 * Resample the ~800 peaks to `count` bar heights (fractions of the canvas height). The peaks are
 * loudness-normalised speech, so they're nearly uniform: stretch p5..p95 to 0..1, then v^1.6 pushes
 * quiet stretches down so pauses and emphasis show, and a 3-bar average keeps it organic. Visual only.
 */
function toBars(peaks: number[] | null, count: number) {
  const bars = new Float32Array(count);
  if (!peaks?.length) return bars.fill(0.08);
  const sorted = [...peaks].sort((a, b) => a - b);
  const p5 = sorted[Math.floor((sorted.length - 1) * 0.05)];
  const p95 = sorted[Math.floor((sorted.length - 1) * 0.95)];
  const span = Math.max(1e-6, p95 - p5);
  const raw = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const start = Math.floor((i / count) * peaks.length);
    const end = Math.max(start + 1, Math.floor(((i + 1) / count) * peaks.length));
    let max = 0;
    for (let j = start; j < end; j++) if (peaks[j] > max) max = peaks[j];
    raw[i] = clamp((max - p5) / span, 0, 1) ** 1.6;
  }
  for (let i = 0; i < count; i++) {
    const v = (raw[Math.max(0, i - 1)] + raw[i] + raw[Math.min(count - 1, i + 1)]) / 3;
    bars[i] = 0.12 + 0.88 * v; // min height 12%
  }
  return bars;
}

/** End of the buffered range that contains `t`, or `t` itself if nothing around it is buffered. */
function bufferedEnd(a: HTMLAudioElement, t: number) {
  const b = a.buffered;
  for (let i = 0; i < b.length; i++) if (b.start(i) <= t + 0.5 && t <= b.end(i)) return b.end(i);
  return t;
}

export default function AudioPlayer({ src, peaksSrc, title, subtitle, durationSec, trackId, badge, theme = "light" }: AudioPlayerProps) {
  const instanceId = useId();
  const posKey = `pos:${trackId}`;
  const isClient = useIsClient();

  const audioRef = useRef<HTMLAudioElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const waveRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playBtnRef = useRef<HTMLButtonElement>(null);
  const miniFillRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false); // audio src attached (first play happened)
  const pendingSeekRef = useRef<number | null>(null); // applied once metadata is in
  const dragRef = useRef<{ id: number; startX: number; moved: boolean } | null>(null);
  const lastSaveRef = useRef(0);
  const lastActivityRef = useRef(0);
  const lastPositionStateRef = useRef(0);
  const barsRef = useRef<{ peaks: number[] | null; w: number; h: number; dpr: number; path: Path2D } | null>(null);
  // Latest render values for the canvas painter, which also runs outside renders (rAF, resize).
  const paintRef = useRef({ peaks: null as number[] | null, hover: null as number | null, scrub: null as number | null, idleRatio: 0, duration: durationSec, theme });

  const [status, setStatus] = useState<Status>("idle");
  const [buffering, setBuffering] = useState(false);
  const [started, setStarted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(durationSec);
  const [startAt, setStartAt] = useState<number | null>(null); // position picked before the first play
  const [muted, setMuted] = useState(false);
  const [peaks, setPeaks] = useState<number[] | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [scrub, setScrub] = useState<number | null>(null);
  const [inView, setInView] = useState(true);
  const [engaged, setEngaged] = useState(false); // eligible for the sticky mini-player

  const storedRate = useStoredNumber("rate");
  const rate = storedRate !== null && SPEEDS.includes(storedRate) ? storedRate : 1;
  const storedVolume = useStoredNumber("volume");
  const volume = storedVolume === null ? 1 : clamp(storedVolume, 0, 1);
  const savedPos = useStoredNumber(posKey);
  const resumeAt = savedPos !== null && savedPos >= MIN_RESUME_SEC && savedPos < duration * COMPLETE_AT ? savedPos : null;

  const idleTime = startAt ?? resumeAt ?? 0;
  const shownTime = scrub !== null ? scrub * duration : started ? time : idleTime;
  const ratio = duration > 0 ? clamp(shownTime / duration, 0, 1) : 0;
  const isActive = status === "playing" || status === "loading";
  const isBusy = status === "loading" || (status === "playing" && buffering);
  const showResume = !started && resumeAt !== null && startAt === null;
  const miniOpen = engaged && started && !inView;

  // ---------- playback ----------

  function markActivity() {
    lastActivityRef.current = Date.now();
  }

  function savePosition(t: number) {
    lastSaveRef.current = Date.now();
    writeNumber(posKey, t < MIN_RESUME_SEC || t >= duration * COMPLETE_AT ? null : Math.floor(t));
  }

  function updatePositionState() {
    const a = audioRef.current;
    if (!a || !ownsMediaSession(instanceId) || !("mediaSession" in navigator)) return;
    const d = a.duration;
    if (!Number.isFinite(d) || d <= 0) return;
    lastPositionStateRef.current = Date.now();
    try {
      navigator.mediaSession.setPositionState({ duration: d, playbackRate: a.playbackRate || 1, position: clamp(a.currentTime, 0, d) });
    } catch {
      // Older Safari: no position state; lock screen still gets play/pause/skip.
    }
  }

  function play() {
    const a = audioRef.current;
    if (!a) return;
    // Already playing (e.g. a repeated lock-screen "play"): no new "playing" event would clear "loading".
    if (startedRef.current && !a.paused && status !== "error") return;
    if (!startedRef.current) {
      // First play: only now does the browser start downloading the file.
      const from = startAt ?? resumeAt ?? 0;
      startedRef.current = true;
      pendingSeekRef.current = from > 0 ? from : null;
      setStarted(true);
      setTime(from);
      a.src = src;
    } else if (status === "error") {
      pendingSeekRef.current = time > 0 ? time : null;
      a.load();
    }
    claimPlayback(instanceId);
    setEngaged(true);
    setStatus("loading");
    markActivity();
    a.play().catch((err: unknown) => {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "AbortError") return; // superseded by a pause() or load()
      if (name === "NotAllowedError") return setStatus("paused");
      setStatus("error");
    });
  }

  function pause() {
    audioRef.current?.pause();
  }

  function toggle() {
    if (isActive) pause();
    else play();
  }

  function currentPosition() {
    const a = audioRef.current;
    if (!startedRef.current || !a) return idleTime;
    return pendingSeekRef.current ?? a.currentTime;
  }

  function seekTo(sec: number) {
    const t = clamp(sec, 0, duration);
    const a = audioRef.current;
    if (!startedRef.current || !a) {
      setStartAt(t); // before the first play: just move the start point, don't download anything
      return;
    }
    if (a.readyState >= HTMLMediaElement.HAVE_METADATA) a.currentTime = t;
    else pendingSeekRef.current = t;
    setTime(t);
    savePosition(t);
    updatePositionState();
  }

  function skip(delta: number) {
    seekTo(currentPosition() + delta);
  }

  function cycleRate() {
    writeNumber("rate", SPEEDS[(SPEEDS.indexOf(rate) + 1) % SPEEDS.length]);
  }

  function startOver() {
    setStartAt(0);
    writeNumber(posKey, null);
  }

  function returnToPlayer() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    rootRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    playBtnRef.current?.focus({ preventScroll: true });
  }

  function closeMini() {
    pause();
    setEngaged(false);
  }

  // ---------- audio element events ----------

  function onLoadedMetadata() {
    const a = audioRef.current;
    if (!a) return;
    if (Number.isFinite(a.duration) && a.duration > 0) setDuration(a.duration);
    a.defaultPlaybackRate = rate; // load() resets playbackRate to the default
    a.playbackRate = rate;
    if (pendingSeekRef.current !== null) {
      a.currentTime = pendingSeekRef.current;
      pendingSeekRef.current = null;
    }
    markActivity();
  }

  function onTimeUpdate() {
    const a = audioRef.current;
    if (!a || pendingSeekRef.current !== null) return;
    setTime(a.currentTime);
    markActivity();
    const now = Date.now();
    if (!a.paused && now - lastSaveRef.current > SAVE_EVERY_MS) savePosition(a.currentTime);
    if (now - lastPositionStateRef.current > 1000) updatePositionState();
  }

  function onPause() {
    const a = audioRef.current;
    setStatus((s) => (s === "error" ? s : "paused"));
    setBuffering(false);
    if (a && startedRef.current) savePosition(a.currentTime);
  }

  // ---------- waveform scrubbing ----------

  function ratioAt(clientX: number) {
    const r = waveRef.current?.getBoundingClientRect();
    return r && r.width ? clamp((clientX - r.left) / r.width, 0, 1) : 0;
  }

  function onWavePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.button !== 0 || status === "error") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { id: e.pointerId, startX: e.clientX, moved: false };
  }

  function onWavePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const r = ratioAt(e.clientX);
    const drag = dragRef.current;
    if (drag?.id === e.pointerId) {
      // Wait for real horizontal movement so a tap or the start of a scroll doesn't flash a jump.
      if (!drag.moved && Math.abs(e.clientX - drag.startX) > 3) drag.moved = true;
      if (drag.moved) {
        setScrub(r);
        setHover(r);
      }
    } else if (e.pointerType === "mouse") {
      setHover(r);
    }
  }

  function onWavePointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    if (dragRef.current?.id !== e.pointerId) return;
    dragRef.current = null;
    seekTo(ratioAt(e.clientX) * duration);
    setScrub(null);
    if (e.pointerType !== "mouse") setHover(null);
  }

  function onWavePointerCancel() {
    // e.g. the touch turned into a vertical page scroll: drop the scrub without seeking.
    dragRef.current = null;
    setScrub(null);
    setHover(null);
  }

  // ---------- keyboard ----------

  function onKeyDown(e: ReactKeyboardEvent<HTMLDivElement>) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const target = e.target as HTMLElement;
    const onButton = target.tagName === "BUTTON";
    const onRange = target.tagName === "INPUT";
    const onSlider = target === waveRef.current;
    let handled = true;
    switch (e.key) {
      case " ":
        if (onButton || onRange) return; // let the focused control activate itself
        toggle();
        break;
      case "k":
      case "K":
        toggle();
        break;
      case "ArrowLeft":
        if (onRange) return;
        skip(-NUDGE_SEC);
        break;
      case "ArrowRight":
        if (onRange) return;
        skip(NUDGE_SEC);
        break;
      case "j":
      case "J":
        skip(-SKIP_SEC);
        break;
      case "l":
      case "L":
        skip(SKIP_SEC);
        break;
      case "ArrowDown":
      case "ArrowUp":
      case "PageDown":
      case "PageUp":
      case "Home":
      case "End":
        if (!onSlider) return;
        if (e.key === "Home") seekTo(0);
        else if (e.key === "End") seekTo(duration);
        else if (e.key.startsWith("Page")) skip(e.key === "PageUp" ? SKIP_SEC : -SKIP_SEC);
        else skip(e.key === "ArrowUp" ? NUDGE_SEC : -NUDGE_SEC);
        break;
      default:
        handled = false;
    }
    if (handled) e.preventDefault();
  }

  // ---------- canvas ----------

  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const pw = Math.round(w * dpr);
    const ph = Math.round(h * dpr);
    if (canvas.width !== pw || canvas.height !== ph) {
      canvas.width = pw;
      canvas.height = ph;
    }

    const s = paintRef.current;
    const a = audioRef.current;
    const liveRatio =
      startedRef.current && a && s.duration > 0 ? clamp((pendingSeekRef.current ?? a.currentTime) / s.duration, 0, 1) : s.idleRatio;
    const r = s.scrub ?? liveRatio;
    const colors = WAVE_COLORS[s.theme];
    if (miniFillRef.current) miniFillRef.current.style.transform = `scaleX(${r})`;
    if (s.theme === "light" && !s.peaks) return; // keep the shimmer skeleton until the shape is in

    let bars = barsRef.current;
    if (!bars || bars.peaks !== s.peaks || bars.w !== w || bars.h !== h || bars.dpr !== dpr) {
      const count = Math.max(1, Math.floor((w + BAR_GAP) / (BAR_WIDTH + BAR_GAP)));
      const values = toBars(s.peaks, count);
      const step = w / count;
      const path = new Path2D();
      for (let i = 0; i < count; i++) {
        const bh = Math.max(2, Math.round(values[i] * (h - 2) * dpr) / dpr);
        const x = Math.round(i * step * dpr) / dpr; // snap to device pixels for crisp edges
        path.rect(x, Math.round(((h - bh) / 2) * dpr) / dpr, BAR_WIDTH, bh);
      }
      bars = barsRef.current = { peaks: s.peaks, w, h, dpr, path };
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const fillBetween = (from: number, to: number, style: string | CanvasGradient) => {
      if (to <= from) return;
      ctx.save();
      ctx.beginPath();
      ctx.rect(from * w, 0, (to - from) * w, h);
      ctx.clip();
      ctx.fillStyle = style;
      ctx.fill(bars.path);
      ctx.restore();
    };
    ctx.fillStyle = colors.unbuffered;
    ctx.fill(bars.path);
    if (colors.buffered !== colors.unbuffered) {
      // Before the first play nothing is downloaded yet; show the shape in the buffered tone so it reads.
      const loaded = !startedRef.current || !a ? 1 : s.duration > 0 ? clamp(bufferedEnd(a, a.currentTime) / s.duration, 0, 1) : 0;
      fillBetween(0, loaded, colors.buffered);
    }
    if (r > 0) {
      const played = ctx.createLinearGradient(0, 0, Math.max(1, r * w), 0); // spans the played length
      played.addColorStop(0, colors.played[0]);
      played.addColorStop(1, colors.played[1]);
      fillBetween(0, r, played);
    }
    if (s.hover !== null) {
      if (colors.preview) fillBetween(Math.min(r, s.hover), Math.max(r, s.hover), colors.preview);
      ctx.fillStyle = colors.hoverLine;
      ctx.fillRect(Math.round(s.hover * w * dpr) / dpr, 0, 1, h);
    }
    if (colors.dot) {
      const x = clamp(r * w, DOT_RADIUS + 2, w - DOT_RADIUS - 2);
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, h / 2, DOT_RADIUS, 0, Math.PI * 2);
      ctx.shadowColor = "rgba(15, 23, 42, 0.25)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 1;
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#4F46E5";
      ctx.stroke();
      ctx.restore();
    }
    waveRef.current?.setAttribute("data-painted", ""); // hides the pre-hydration placeholder
  }, []);

  useEffect(() => {
    paintRef.current = { peaks, hover, scrub, idleRatio: duration > 0 ? idleTime / duration : 0, duration, theme };
    paint();
  });

  // Smooth progress while playing (timeupdate only fires ~4×/s).
  useEffect(() => {
    if (status !== "playing") return;
    let raf = requestAnimationFrame(function tick() {
      paint();
      raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [status, paint]);

  useEffect(() => {
    const el = waveRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => paint());
    ro.observe(el);
    // Zoom or moving to a screen with a different pixel ratio changes devicePixelRatio.
    let mql = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    const onDpr = () => {
      paint();
      mql.removeEventListener("change", onDpr);
      mql = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      mql.addEventListener("change", onDpr);
    };
    mql.addEventListener("change", onDpr);
    return () => {
      ro.disconnect();
      mql.removeEventListener("change", onDpr);
    };
  }, [paint]);

  // ---------- effects ----------

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(peaksSrc, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`peaks ${r.status}`))))
      .then((data: { peaks?: unknown }) => {
        if (Array.isArray(data.peaks)) setPeaks(data.peaks.map((v) => (Number.isFinite(Number(v)) ? Number(v) : 0)));
      })
      .catch(() => {
        // Flat placeholder bars; seeking still works without the shape.
        if (!ctrl.signal.aborted) setPeaks([]);
      });
    return () => ctrl.abort();
  }, [peaksSrc]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.defaultPlaybackRate = rate;
    a.playbackRate = rate;
  }, [rate]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = volume;
    a.muted = muted;
  }, [volume, muted]);

  // Watchdog: loading or buffering with no data arriving for LOAD_TIMEOUT_MS becomes an error.
  useEffect(() => {
    if (!isBusy) return;
    lastActivityRef.current = Date.now();
    const id = window.setInterval(() => {
      if (Date.now() - lastActivityRef.current > LOAD_TIMEOUT_MS) {
        setStatus("error");
        audioRef.current?.pause();
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [isBusy]);

  // Only one player plays at a time.
  const onOtherPlayerStarted = useEffectEvent((ownerId: string) => {
    if (ownerId === instanceId) return;
    audioRef.current?.pause();
    setEngaged(false);
  });
  useEffect(() => onPlaybackClaimed((ownerId) => onOtherPlayerStarted(ownerId)), []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: `-${HEADER_OFFSET_PX}px 0px 0px 0px`,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!miniOpen) return;
    const html = document.documentElement;
    html.setAttribute(MINI_ATTR, "");
    return () => html.removeAttribute(MINI_ATTR);
  }, [miniOpen]);

  // Media Session: lock screen / notification / headset controls.
  const onSessionAction = useEffectEvent((details: MediaSessionActionDetails) => {
    switch (details.action) {
      case "play":
        play();
        break;
      case "pause":
      case "stop":
        pause();
        break;
      case "seekbackward":
        skip(-(details.seekOffset ?? SKIP_SEC));
        break;
      case "seekforward":
        skip(details.seekOffset ?? SKIP_SEC);
        break;
      case "seekto":
        if (details.seekTime != null) seekTo(details.seekTime);
        break;
    }
  });
  const syncPositionState = useEffectEvent(() => updatePositionState());

  useEffect(() => {
    if (status !== "playing" || !("mediaSession" in navigator)) return;
    const ms = navigator.mediaSession;
    ms.metadata = new MediaMetadata({ title, artist: ARTIST, album: subtitle ?? "", artwork: ARTWORK });
    for (const action of SESSION_ACTIONS) {
      try {
        ms.setActionHandler(action, (details) => onSessionAction(details));
      } catch {
        // Action not supported by this browser.
      }
    }
    syncPositionState();
  }, [status, title, subtitle]);

  useEffect(() => {
    if (status === "idle" || !ownsMediaSession(instanceId) || !("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = isActive ? "playing" : "paused";
  }, [status, isActive, instanceId]);

  const onUnmount = useEffectEvent((a: HTMLAudioElement | null) => {
    if (a && startedRef.current) {
      a.pause();
      savePosition(a.currentTime);
    }
    if (ownsMediaSession(instanceId) && "mediaSession" in navigator) {
      const ms = navigator.mediaSession;
      ms.metadata = null;
      ms.playbackState = "none";
      for (const action of SESSION_ACTIONS) {
        try {
          ms.setActionHandler(action, null);
        } catch {
          // ignore
        }
      }
      releaseMediaSession(instanceId);
    }
  });
  const onPageHide = useEffectEvent(() => {
    const a = audioRef.current;
    if (a && startedRef.current) savePosition(a.currentTime);
  });
  useEffect(() => {
    const a = audioRef.current; // refs are detached before this cleanup runs
    const handlePageHide = () => onPageHide();
    window.addEventListener("pagehide", handlePageHide);
    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      onUnmount(a);
    };
  }, []);

  // ---------- render ----------

  const volumeStyle = { "--fill": `${(muted ? 0 : volume) * 100}%` } as CSSProperties;
  const rateLabel = `${rate}×`;

  return (
    <div ref={rootRef} className={cx(styles.root, theme === "light" && styles.light)} role="region" aria-label={`Audio player: ${title}`} onKeyDown={onKeyDown}>
      <audio
        ref={audioRef}
        preload="metadata"
        onLoadedMetadata={onLoadedMetadata}
        onPlay={() => {
          claimPlayback(instanceId);
          setEngaged(true);
        }}
        onPlaying={() => {
          setStatus("playing");
          setBuffering(false);
          markActivity();
        }}
        onWaiting={() => {
          setBuffering(true);
          markActivity();
        }}
        onPause={onPause}
        onEnded={() => writeNumber(posKey, null)}
        onTimeUpdate={onTimeUpdate}
        onProgress={() => {
          markActivity();
          paint(); // buffered bars move even while paused
        }}
        onCanPlay={markActivity}
        onRateChange={updatePositionState}
        onError={() => {
          if (startedRef.current) setStatus("error");
        }}
      />

      <div className={styles.layout}>
        <Cover className={cx(styles.cover, status === "playing" && styles.coverPlaying)} sizes="(max-width: 575px) 72px, (max-width: 767px) 120px, 168px">
          <span className={styles.coverBadge} aria-hidden="true">
            {badge ?? <HeadphonesIcon />}
          </span>
        </Cover>

        <div className={styles.header}>
          <div className={styles.heading}>
            <div className={styles.eyebrow}>{subtitle ?? "Listen"}</div>
            <div className={styles.title} title={title}>
              {title}
            </div>
          </div>
          <div className={cx(styles.resume, !showResume && styles.hidden)} inert={!showResume}>
            <button type="button" className={cx(styles.btn, styles.resumeMain)} onClick={play}>
              <span className={styles.resumeDot} aria-hidden="true" />
              <span className={styles.wideOnly}>Resume from&nbsp;</span>
              <span className={styles.narrowOnly}>Resume&nbsp;</span>
              {fmt(resumeAt ?? 0)}
            </button>
            <button type="button" className={cx(styles.btn, styles.resumeReset)} onClick={startOver} aria-label="Start from the beginning" title="Start over">
              <ReplayIcon />
            </button>
          </div>
        </div>

        <div className={styles.main}>
          <button
            ref={playBtnRef}
            type="button"
            className={cx(styles.btn, styles.play, isActive && styles.isPlaying, status === "playing" && !buffering && styles.pulsing)}
            onClick={toggle}
            aria-label={isActive ? "Pause" : "Play"}
            aria-busy={isBusy}
          >
            <span className={styles.icon} aria-hidden="true" />
            {isBusy && (
              <svg className={styles.spinner} viewBox="0 0 50 50" aria-hidden="true">
                <circle cx="25" cy="25" r="23" />
              </svg>
            )}
          </button>

          <div className={styles.waveWrap}>
            <div
              ref={waveRef}
              className={styles.wave}
              role="slider"
              tabIndex={0}
              aria-label="Seek"
              aria-valuemin={0}
              aria-valuemax={Math.round(duration)}
              aria-valuenow={Math.round(shownTime)}
              aria-valuetext={`${fmt(shownTime)} of ${fmt(duration)}`}
              aria-disabled={status === "error" || undefined}
              onPointerDown={onWavePointerDown}
              onPointerMove={onWavePointerMove}
              onPointerUp={onWavePointerUp}
              onPointerCancel={onWavePointerCancel}
              onPointerLeave={() => {
                if (!dragRef.current) setHover(null);
              }}
            >
              <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
              {hover !== null && (
                <div className={styles.tooltip} style={{ left: `${clamp(hover * 100, 5, 95)}%` }} aria-hidden="true">
                  {fmt(hover * duration)}
                </div>
              )}
            </div>
            {status === "error" && (
              <div className={styles.error} role="alert">
                <span>Couldn&rsquo;t load this audio. Check your connection and try again.</span>
                <button type="button" className={cx(styles.btn, styles.retry)} onClick={play}>
                  Retry
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={styles.controls}>
          <span className={styles.time}>
            {fmt(shownTime)}
            <span className={styles.timeSep}> / </span>
            <span className={styles.timeTotal}>{fmt(duration)}</span>
          </span>
          <button type="button" className={cx(styles.btn, styles.iconBtn)} onClick={() => skip(-SKIP_SEC)} aria-label="Back 15 seconds">
            <SkipIcon />
          </button>
          <button type="button" className={cx(styles.btn, styles.iconBtn)} onClick={() => skip(SKIP_SEC)} aria-label="Forward 15 seconds">
            <SkipIcon forward />
          </button>
          <button type="button" className={cx(styles.btn, styles.speed)} onClick={cycleRate} aria-label={`Playback speed ${rateLabel}`}>
            {rateLabel}
          </button>
          <div className={styles.volume}>
            <button type="button" className={cx(styles.btn, styles.iconBtn)} onClick={() => setMuted((m) => !m)} aria-label="Mute" aria-pressed={muted}>
              <VolumeIcon off={muted || volume === 0} />
            </button>
            <input
              type="range"
              className={styles.range}
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              style={volumeStyle}
              aria-label="Volume"
              onChange={(e) => {
                const v = Number(e.target.value);
                writeNumber("volume", v);
                setMuted(v === 0);
              }}
            />
          </div>
        </div>
      </div>

      {isClient &&
        createPortal(
          <div className={cx(styles.mini, miniOpen && styles.miniOpen)} role="region" aria-label="Now playing" inert={!miniOpen} onKeyDown={onKeyDown}>
            <div className={styles.miniTrack} aria-hidden="true">
              <div ref={miniFillRef} className={styles.miniFill} style={{ transform: `scaleX(${ratio})` }} />
            </div>
            <Cover className={styles.miniCover} sizes="40px" />
            <button
              type="button"
              className={cx(styles.btn, styles.miniPlay, isActive && styles.isPlaying)}
              onClick={toggle}
              aria-label={isActive ? "Pause" : "Play"}
              aria-busy={isBusy}
            >
              <span className={styles.icon} aria-hidden="true" />
            </button>
            <button type="button" className={cx(styles.btn, styles.miniTitle)} onClick={returnToPlayer} aria-label={`Back to player: ${title}`}>
              <span className={styles.miniName}>{title}</span>
              <span className={styles.miniTime}>
                {fmt(shownTime)} / {fmt(duration)}
              </span>
            </button>
            <button type="button" className={cx(styles.btn, styles.miniClose)} onClick={closeMini} aria-label="Stop and close player">
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path fill="currentColor" d="M18.3 5.71 12 12.01l-6.3-6.3-1.41 1.41 6.3 6.3-6.3 6.3 1.41 1.41 6.3-6.3 6.3 6.3 1.41-1.41-6.3-6.3 6.3-6.3z" />
              </svg>
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}

/** Square cover art in a fixed-size box, so it takes no layout shift while it loads. */
function Cover({ className, sizes, children }: { className: string; sizes: string; children?: ReactNode }) {
  return (
    <div className={className}>
      <Image className={styles.coverImg} src={COVER_SRC} alt="" width={1024} height={1024} sizes={sizes} preload={false} />
      {children}
    </div>
  );
}

function HeadphonesIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 3a9 9 0 0 0-9 9v7a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H5v-1a7 7 0 0 1 14 0v1h-2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-7a9 9 0 0 0-9-9z"
      />
    </svg>
  );
}

const REPLAY_PATH = "M12 5V1.5L7 6l5 4.5V7a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z";

function SkipIcon({ forward = false }: { forward?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path fill="currentColor" d={REPLAY_PATH} transform={forward ? "translate(24 0) scale(-1 1)" : undefined} />
      <text x="12" y="16.2" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="currentColor">
        15
      </text>
    </svg>
  );
}

function ReplayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path fill="currentColor" d={REPLAY_PATH} />
    </svg>
  );
}

function VolumeIcon({ off }: { off: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="currentColor"
        d={
          off
            ? "M16.5 12A4.5 4.5 0 0 0 14 8v2.18l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.8 8.8 0 0 0 21 12a9 9 0 0 0-7-8.77v2.06A7 7 0 0 1 19 12zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a9 9 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z"
            : "M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4zM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06A9 9 0 0 0 14 3.23z"
        }
      />
    </svg>
  );
}
