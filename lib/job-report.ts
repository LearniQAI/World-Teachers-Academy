// Shared by app/api/jobs/report and its tests.

/** Removes e-mail addresses and phone numbers someone may type into the note. */
export function scrubNote(note: unknown): string | null {
  if (typeof note !== "string") return null;
  const clean = note
    .replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, "[removed]")
    .replace(/\+?\d[\d\s().-]{7,}\d/g, "[removed]")
    .trim()
    .slice(0, 500);
  return clean || null;
}
