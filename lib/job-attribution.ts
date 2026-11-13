// Adzuna's API terms require each displayed advert to carry an "Adzuna" label
// linked to adzuna.co.uk or the relevant local Adzuna site. The local site is
// taken from the advert's own Adzuna link (e.g. https://www.adzuna.com.au/...).
// Anything that is not an Adzuna address falls back to the UK site, so the
// label can never link somewhere else.
export function adzunaHomeUrl(applyUrl: string | null | undefined): string {
  try {
    const host = new URL(applyUrl ?? "").hostname;
    if (/^(www\.)?adzuna\.[a-z]{2,3}(\.[a-z]{2})?$/.test(host)) return `https://${host}`;
  } catch {
    // not a valid URL: use the UK site
  }
  return "https://www.adzuna.co.uk";
}
