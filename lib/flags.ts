// National flags used across the site, keyed by ISO 3166-1 alpha-2 code.
//
// The SVG files live in /public/flags/<code>.svg. They come from the
// public-domain "svg-country-flags" collection (v1.2.10, derived from the
// Wikimedia Commons flag files), minified with SVGO. Each file keeps its
// country's official proportions; `ratio` below is width ÷ height taken from
// the file's viewBox, so the component can size a flag without loading it.
//
// To add a country: copy its SVG into /public/flags, then add a line here.

export type FlagInfo = { name: string; ratio: number };

export const FLAGS: Record<string, FlagInfo> = {
  AE: { name: "United Arab Emirates", ratio: 2 },
  AR: { name: "Argentina", ratio: 1.6 },
  AU: { name: "Australia", ratio: 2 },
  BN: { name: "Brunei", ratio: 2 },
  BR: { name: "Brazil", ratio: 1.4286 },
  CA: { name: "Canada", ratio: 2 },
  CL: { name: "Chile", ratio: 1.5 },
  CN: { name: "China", ratio: 1.5 },
  CO: { name: "Colombia", ratio: 1.5 },
  CR: { name: "Costa Rica", ratio: 1.6667 },
  DE: { name: "Germany", ratio: 1.6667 },
  ES: { name: "Spain", ratio: 1.5 },
  FR: { name: "France", ratio: 1.5 },
  GB: { name: "United Kingdom", ratio: 2 },
  HU: { name: "Hungary", ratio: 2 },
  IN: { name: "India", ratio: 1.5 },
  IT: { name: "Italy", ratio: 1.5 },
  JP: { name: "Japan", ratio: 1.5 },
  KH: { name: "Cambodia", ratio: 1.5625 },
  KR: { name: "South Korea", ratio: 1.5 },
  KW: { name: "Kuwait", ratio: 2 },
  LA: { name: "Laos", ratio: 1.5 },
  MX: { name: "Mexico", ratio: 1.75 },
  NL: { name: "Netherlands", ratio: 1.5 },
  PL: { name: "Poland", ratio: 1.6 },
  QA: { name: "Qatar", ratio: 2.5455 },
  SA: { name: "Saudi Arabia", ratio: 1.5 },
  SG: { name: "Singapore", ratio: 1.5 },
  TH: { name: "Thailand", ratio: 1.5 },
  TW: { name: "Taiwan", ratio: 1.5 },
  US: { name: "United States", ratio: 1.9 },
  VN: { name: "Vietnam", ratio: 1.5 },
  ZA: { name: "South Africa", ratio: 1.5 },
};

/** Split a code field such as "JP" or "PL · HU" into known ISO codes. */
export function flagCodes(code: string): string[] {
  return code
    .split(/[·,/\s]+/)
    .map((c) => c.trim().toUpperCase())
    .filter((c) => c in FLAGS);
}
