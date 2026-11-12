// Which ISO country codes have a WTA country guide, and where it lives.
// Small on purpose: the Job Portal (a client page) uses it to link back to a
// guide without loading all the guide content. Keep in step with
// lib/countries-data.ts when a guide is added (24 codes: 23 guides, Central
// Europe covers PL and HU).

export type GuideRef = { slug: string; guide: string };

export const COUNTRY_GUIDES: Record<string, GuideRef> = {
  AE: { slug: "uae", guide: "UAE" },
  AR: { slug: "argentina", guide: "Argentina" },
  BN: { slug: "brunei", guide: "Brunei" },
  BR: { slug: "brazil", guide: "Brazil" },
  CL: { slug: "chile", guide: "Chile" },
  CN: { slug: "china", guide: "China" },
  CO: { slug: "colombia", guide: "Colombia" },
  CR: { slug: "costa-rica", guide: "Costa Rica" },
  ES: { slug: "spain", guide: "Spain" },
  FR: { slug: "france", guide: "France" },
  HU: { slug: "central-europe", guide: "Central Europe" },
  IT: { slug: "italy", guide: "Italy" },
  JP: { slug: "japan", guide: "Japan" },
  KH: { slug: "cambodia", guide: "Cambodia" },
  KR: { slug: "south-korea", guide: "South Korea" },
  KW: { slug: "kuwait", guide: "Kuwait" },
  LA: { slug: "laos", guide: "Laos" },
  MX: { slug: "mexico", guide: "Mexico" },
  PL: { slug: "central-europe", guide: "Central Europe" },
  QA: { slug: "qatar", guide: "Qatar" },
  SA: { slug: "saudi-arabia", guide: "Saudi Arabia" },
  TH: { slug: "thailand", guide: "Thailand" },
  TW: { slug: "taiwan", guide: "Taiwan" },
  VN: { slug: "vietnam", guide: "Vietnam" },
};
