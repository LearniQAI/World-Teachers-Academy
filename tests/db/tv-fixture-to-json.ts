// Normalises the recorded Teaching Vacancies page for the database test.
import { readFileSync } from "node:fs";
import { normaliseTeachingVacancy } from "../../supabase/functions/_shared/jobs/normalise.ts";
const page = JSON.parse(readFileSync(new URL("../fixtures/teaching-vacancies-page1.json", import.meta.url), "utf8"));
process.stdout.write(JSON.stringify(page.data.map((j: never) => normaliseTeachingVacancy(j))));
