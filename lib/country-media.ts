// Video + debate-audio embeds per country, transcribed from Countries.pdf.
// Keyed by country slug; a country with no entry simply shows no media section.

export type CountryMedia = {
  youtubeId?: string;
  audio?: { show: string; id: string; slug: string };
};

const a = (show: string, id: string, slug: string) => ({ show, id, slug });

export const countryMedia: Record<string, CountryMedia> = {
  argentina: { youtubeId: "ZATYbLOg4Bg", audio: a("2651837", "19835312", "teaching-in-argentina-the-cultural-dream-vs-economic-reality-the-dollar-advantage") },
  brazil: { youtubeId: "FJNh-BhnPts", audio: a("2651837", "19835340", "teaching-in-brazil-the-tropical-dream-vs-real-living-costs-visa-realities") },
  brunei: { youtubeId: "N8DVL-j7Tok", audio: a("2651837", "19835378", "teaching-in-brunei-the-tax-free-haven-vs-the-quiet-rainforest-reality") },
  cambodia: { youtubeId: "r_8_CAfircU", audio: a("2651837", "19835400", "teaching-in-cambodia-southeast-asia-s-wild-west-vs-the-low-barrier-expat-dream") },
  chile: { youtubeId: "CV6_M0Ag6xg", audio: a("2651837", "19835435", "teaching-in-chile-economic-stability-vs-high-living-costs-santiago-hustle") },
  // China's PDF video link is identical to Chile's — likely a paste error, so no video until confirmed.
  china: { audio: a("2652106", "19835446", "teaching-in-china-massive-savings-potential-vs-strict-regulations-cultural-shock") },
  "costa-rica": { youtubeId: "zK8xY8uei-Q", audio: a("2652106", "19835519", "costa-rica-eco-paradise-dream-or-high-cost-lifestyle-trap") },
  france: { youtubeId: "84njS6WXxuI", audio: a("2652106", "19835581", "destination-dossier-france-the-cultural-dream-or-high-cost-expat-trap") },
  italy: { youtubeId: "8pYljsJ_ldw", audio: a("2652115", "19835755", "italy-la-dolce-vita-fantasy-or-freelance-bureaucratic-maze") },
  japan: { youtubeId: "q5mS1LPpXXg", audio: a("2652115", "19835803", "japan-cultural-sanctuary-or-high-expectation-pressure-cooker") },
  kuwait: { youtubeId: "82gcrkHd3Kg", audio: a("2652115", "19836934", "kuwait-gulf-savings-powerhouse-or-strict-expat-quarantine") },
  mexico: { youtubeId: "GL40ZnK-8q8", audio: a("2652115", "19836961", "mexico-easy-entry-vs-real-hustle") },
  "central-europe": { youtubeId: "tuIGHZ2emKI", audio: a("2652159", "19836977", "poland-hungary-central-european-gateways-vs-real-living-margins") },
  laos: { youtubeId: "86eaaLVY9Rk", audio: a("2652115", "19836954", "laos-myanmar-frontier-tefl-or-high-stakes-complexity") },
  qatar: { youtubeId: "W3nNBUMPNp8" },
  "saudi-arabia": { youtubeId: "12hQID6vnjI" },
  "south-korea": { youtubeId: "CZ4zLzMl7GQ" },
  spain: { youtubeId: "-mRjJ3t5RX8" },
};
