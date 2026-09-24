// Video embeds per country, transcribed from Countries.pdf.
// Keyed by country slug; a country with no entry simply shows no video.
//
// Debate audio now comes from lib/audio-tracks.ts (self-hosted, custom player). `audio` is only a
// Buzzsprout fallback for a country that has no track there yet; every former Buzzsprout entry has
// one, so none are left.

export type CountryMedia = {
  youtubeId?: string;
  audio?: { show: string; id: string; slug: string };
};

export const countryMedia: Record<string, CountryMedia> = {
  argentina: { youtubeId: "ZATYbLOg4Bg" },
  brazil: { youtubeId: "FJNh-BhnPts" },
  brunei: { youtubeId: "N8DVL-j7Tok" },
  cambodia: { youtubeId: "r_8_CAfircU" },
  chile: { youtubeId: "CV6_M0Ag6xg" },
  // China: its PDF video link is identical to Chile's (likely a paste error), so no video until confirmed.
  "costa-rica": { youtubeId: "zK8xY8uei-Q" },
  france: { youtubeId: "84njS6WXxuI" },
  italy: { youtubeId: "8pYljsJ_ldw" },
  japan: { youtubeId: "q5mS1LPpXXg" },
  kuwait: { youtubeId: "82gcrkHd3Kg" },
  mexico: { youtubeId: "GL40ZnK-8q8" },
  "central-europe": { youtubeId: "tuIGHZ2emKI" },
  laos: { youtubeId: "86eaaLVY9Rk" },
  qatar: { youtubeId: "W3nNBUMPNp8" },
  "saudi-arabia": { youtubeId: "12hQID6vnjI" },
  "south-korea": { youtubeId: "CZ4zLzMl7GQ" },
  spain: { youtubeId: "-mRjJ3t5RX8" },
};
