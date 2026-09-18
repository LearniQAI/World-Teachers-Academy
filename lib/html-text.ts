// Shared plain-text/HTML utilities for job descriptions. Deliberately
// framework-agnostic (no DOM, no Node/Next APIs) so this same file can be
// imported both by the Next.js frontend (app/job-portal/page.tsx) and the
// Deno-based Supabase Edge Function (supabase/functions/ingest-jobs) via a
// plain relative import — one implementation, not two copies drifting apart.
//
// Real ingested data has included both literal HTML markup (Reed's
// jobDescription: <p>, <ul>, <li>, numeric entities like "&#163;") and named
// HTML entities with no tags at all (an Adzuna/France listing using
// "&eacute;", "&apos;"). A pure lookup-table decode (rather than the
// DOM/innerHTML trick) is used so this produces identical output whether
// it runs at ingestion time in Deno or at render time during Next.js SSR —
// a DOM-based decode would only be available in one of those two places.
const HTML_ENTITY_MAP: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  eacute: "é", Eacute: "É", egrave: "è", Egrave: "È",
  ecirc: "ê", Ecirc: "Ê", euml: "ë", Euml: "Ë",
  agrave: "à", Agrave: "À", acirc: "â", Acirc: "Â", auml: "ä", Auml: "Ä",
  ccedil: "ç", Ccedil: "Ç", ocirc: "ô", Ocirc: "Ô", ouml: "ö", Ouml: "Ö",
  ucirc: "û", Ucirc: "Û", ugrave: "ù", Ugrave: "Ù", uuml: "ü", Uuml: "Ü",
  icirc: "î", Icirc: "Î", iuml: "ï", Iuml: "Ï",
  ntilde: "ñ", Ntilde: "Ñ", oacute: "ó", Oacute: "Ó",
  aacute: "á", Aacute: "Á", iacute: "í", Iacute: "Í", uacute: "ú", Uacute: "Ú",
  szlig: "ß", oslash: "ø", Oslash: "Ø", aring: "å", Aring: "Å",
  aelig: "æ", AElig: "Æ", oelig: "œ", OElig: "Œ",
  hellip: "…", mdash: "—", ndash: "–", rsquo: "’", lsquo: "‘",
  rdquo: "”", ldquo: "“",
};

export function stripHtml(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, " ")
    .replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g, (match, entity: string) => {
      if (entity[0] === "#") {
        const code =
          entity[1] === "x" || entity[1] === "X"
            ? parseInt(entity.slice(2), 16)
            : parseInt(entity.slice(1), 10);
        return Number.isNaN(code) ? match : String.fromCodePoint(code);
      }
      return HTML_ENTITY_MAP[entity] ?? match;
    })
    .replace(/\s+/g, " ")
    .trim();
}

export function truncateAtWord(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return `${(lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated).trim()}…`;
}

export function getDescriptionSnippet(description: string | null, maxLength = 150): string | null {
  if (!description) return null;
  const plain = stripHtml(description);
  if (!plain) return null;
  return truncateAtWord(plain, maxLength);
}
