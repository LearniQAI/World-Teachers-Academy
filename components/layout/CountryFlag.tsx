import type { Country } from "@/lib/countries-data";
import { FLAGS, flagCodes } from "@/lib/flags";

// Reusable national flag, drawn from the site's own SVG files (/public/flags),
// so there are no emoji (Windows shows them as "AR", "BR"…) and no outside
// image service.
//
// - Every flag keeps its official proportions (Qatar 28:11, UK 2:1, Japan 3:2…).
//   `height` sets the size; a flag wider than 2:1 is scaled down to fit a
//   2:1 slot so it never towers over the others.
// - `frame` (default on) reserves the same 2:1 slot for every flag, so the
//   country names after them line up in menus and lists. Turn it off where a
//   flag stands on its own (a page heading, a card badge).
// - A hairline ring (wta-brand: .country-flag__img) keeps white-ground flags
//   such as Japan's visible on white, and dark ones visible on dark.
// - Screen readers hear "Flag of Japan". Pass `decorative` when the country's
//   name is already written right next to the flag, so it isn't read twice.
//
// Use it with a guide's `country`, or with an ISO code: <CountryFlag code="JP" />.
// A guide covering several countries (code "PL · HU") shows each flag.

type Props = {
  country?: Pick<Country, "code" | "name">;
  code?: string;
  height?: number;
  frame?: boolean;
  decorative?: boolean;
  /** Load straight away (above-the-fold headings). Otherwise loads when needed. */
  eager?: boolean;
  /** Largest total width allowed (e.g. a fixed badge); flags shrink evenly to fit. */
  maxWidth?: number;
};

export default function CountryFlag({ country, code, height = 16, frame = true, decorative = false, eager = false, maxWidth }: Props) {
  const codes = flagCodes(code ?? country?.code ?? "");
  if (codes.length === 0) return null;

  const multi = codes.length > 1;
  const GAP = 3;
  let h = multi ? height * 0.75 : height;
  if (maxWidth) {
    // Width the row would take at this height (each flag capped at 2:1).
    const rowWidth = (hh: number) =>
      codes.reduce((sum, c) => sum + Math.min(hh * FLAGS[c].ratio, hh * 2), 0) + GAP * (codes.length - 1);
    if (rowWidth(h) > maxWidth) h = h * ((maxWidth - GAP * (codes.length - 1)) / (rowWidth(h) - GAP * (codes.length - 1)));
  }
  h = Math.round(h);
  const maxW = h * 2;
  const flags = codes.map((c) => {
    const info = FLAGS[c];
    const w = Math.min(h * info.ratio, maxW);
    return { c, name: info.name, w: Math.round(w), h: Math.round(w / info.ratio) };
  });

  const names = flags.map((f) => f.name);
  const label = `Flag${multi ? "s" : ""} of ${names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}` : names[0]}`;
  const radius = Math.max(2, Math.round(h * 0.08));

  return (
    <span
      className="country-flag"
      {...(decorative ? { "aria-hidden": true } : { role: "img", "aria-label": label })}
      style={frame && !multi ? { width: maxW, height: h } : { height: h }}
    >
      {flags.map((f) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={f.c}
          className="country-flag__img"
          src={`/flags/${f.c.toLowerCase()}.svg`}
          alt=""
          width={f.w}
          height={f.h}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          style={{ width: f.w, height: f.h, borderRadius: radius }}
        />
      ))}
    </span>
  );
}
