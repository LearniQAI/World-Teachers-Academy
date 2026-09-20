// TODO: COUNTRY CONTENT — source from official/verified sources before this
// section goes live. Every section below is an intentional placeholder: do NOT
// fill in cost-of-living figures, safety claims, legal/visa details or
// healthcare info from memory — outdated or wrong specifics can mislead
// someone's relocation decision.

export const COUNTRY_SECTIONS = [
  "Culture & Daily Life",
  "Cost of Living",
  "Safety & Stability",
  "Local Laws & Customs",
  "Transport & Getting Around",
  "Climate & Seasons",
  "Healthcare Access",
  "Classroom Norms & Workplace Culture",
] as const;

export const PENDING_TEXT = "[Content pending — to be sourced and verified before publishing]";

export type Country = {
  slug: string;
  name: string;
  code: string; // ISO 3166-1 alpha-2, shown as a small badge
};

export const countries: Country[] = [
  { slug: "south-africa", name: "South Africa", code: "ZA" },
  { slug: "united-kingdom", name: "United Kingdom", code: "GB" },
  { slug: "united-states", name: "United States", code: "US" },
  { slug: "canada", name: "Canada", code: "CA" },
  { slug: "australia", name: "Australia", code: "AU" },
  { slug: "singapore", name: "Singapore", code: "SG" },
  { slug: "india", name: "India", code: "IN" },
  { slug: "germany", name: "Germany", code: "DE" },
  { slug: "france", name: "France", code: "FR" },
  { slug: "netherlands", name: "Netherlands", code: "NL" },
];

export function getCountryBySlug(slug: string): Country | undefined {
  return countries.find((c) => c.slug === slug);
}
