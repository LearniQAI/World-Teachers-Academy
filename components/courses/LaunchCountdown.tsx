"use client";

import { useSyncExternalStore } from "react";

// Live countdown to a fixed launch timestamp.
//
// - The server (and the browser's first paint) render "--" for every unit, so
//   the HTML is identical on both sides: no hydration mismatch, no wrong
//   server-side time. The real numbers appear once the page is running.
// - Time left = fixed launch time − the device's current time, so it is the
//   same after a refresh and does not depend on how long the visitor stays.
// - When it reaches zero it only switches the card to "Launch Update Pending".
//   It never opens enrolment; that is a deliberate change in lib/courses-catalog.ts.

const UNITS = [
  { key: "d", label: "Days", ms: 86_400_000 },
  { key: "h", label: "Hours", ms: 3_600_000 },
  { key: "m", label: "Minutes", ms: 60_000 },
  { key: "s", label: "Seconds", ms: 1_000 },
] as const;

// One shared 1-second ticker for every countdown on the page. The snapshot is
// the current time rounded down to the second, so React re-renders once per
// second and the server/hydration snapshot (null) never mismatches.
const clockListeners = new Set<() => void>();
let clockTimer: number | undefined;
let clockNow = 0;

function tick() {
  clockNow = Math.floor(Date.now() / 1000) * 1000;
  clockListeners.forEach((l) => l());
}

function subscribeToClock(listener: () => void) {
  clockListeners.add(listener);
  if (clockTimer === undefined) {
    tick();
    clockTimer = window.setInterval(tick, 1000);
  }
  return () => {
    clockListeners.delete(listener);
    if (clockListeners.size === 0 && clockTimer !== undefined) {
      window.clearInterval(clockTimer);
      clockTimer = undefined;
    }
  };
}

function getClockSnapshot(): number | null {
  if (clockNow === 0) clockNow = Math.floor(Date.now() / 1000) * 1000;
  return clockNow;
}

function getServerClockSnapshot(): number | null {
  return null;
}

function split(msLeft: number): number[] {
  let rest = Math.max(0, msLeft);
  return UNITS.map((u) => {
    const n = Math.floor(rest / u.ms);
    rest -= n * u.ms;
    return n;
  });
}

export default function LaunchCountdown({
  launchAt,
  dateLabel,
  pendingLabel,
}: {
  launchAt: string;
  /** Pre-formatted launch date, e.g. "17 November 2026". */
  dateLabel: string;
  /** Replaces "Launch update pending" when the countdown has ended. */
  pendingLabel?: string;
}) {
  const target = Date.parse(launchAt);
  // null on the server and during hydration (renders "--"), then the device's
  // current time, updated every second by one shared ticker.
  const now = useSyncExternalStore(subscribeToClock, getClockSnapshot, getServerClockSnapshot);

  if (now !== null && now >= target) {
    return (
      <div className="wta-countdown wta-countdown--pending">
        <p className="wta-countdown__date">{pendingLabel ?? "Launch update pending"}</p>
        <p className="wta-countdown__note">
          {pendingLabel ? "Enrolment opens once the launch is confirmed. Check back soon." : <>We&apos;re completing final checks. Check back soon.</>}
        </p>
      </div>
    );
  }

  const parts = now === null ? null : split(target - now);

  return (
    <div className="wta-countdown">
      <p className="wta-countdown__date">
        <span className="wta-countdown__live" aria-hidden="true" />
        Launching {dateLabel}
      </p>
      {/* Screen readers get the date once; the ticking digits are hidden from them. */}
      <div className="wta-countdown__units" aria-hidden="true">
        {UNITS.map((u, i) => (
          <div className="wta-countdown__unit" key={u.key}>
            <span className="wta-countdown__num">
              {/* Keyed by its value: each time a number changes, React mounts a new
                  span and its CSS slide-in animation plays (wta-courses.css). */}
              <span
                key={parts === null ? "--" : parts[i]}
                className={parts === null ? "wta-countdown__digit" : "wta-countdown__digit is-live"}
              >
                {parts === null ? "--" : String(parts[i]).padStart(2, "0")}
              </span>
            </span>
            <span className="wta-countdown__label">{u.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
