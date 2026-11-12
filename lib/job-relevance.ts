// Which job-feed listings belong on a teacher-development site.
//
// The feeds are searched with the keyword "teacher", which also matches words
// in the *description*, so they return babysitting, software, HR-trainee and
// similar posts. This filter looks at the job TITLE only and is applied when
// the Job Portal reads listings — the stored data and the feed configuration
// are not changed.
//
// A title is kept when it
//   1. clearly names a teaching role (teacher, tutor, lecturer, instructor…,
//      including the French, German and Dutch words the feeds return), or
//   2. names an education setting or support role (school, SEN, learning
//      support, early years, professor…) AND is not one of the clearly
//      unrelated roles below (cleaner, caretaker, solicitor, software…).
//
// Tested against all 1,074 live listings on 12 Nov 2026: 837 kept (693 after
// duplicates are collapsed); the rest are HR, cyber-security and marketing
// trainees, babysitting and care posts, software roles and similar. Update the word lists here,
// not in the API routes.

const TEACHING_ROLE =
  /teach|tutor|lectur|instructor|educator|\bhlta\b|\bta\b|\bect\b|paraprofessional|enseignant|professeur|lehrer|lehrkraft|leraar|leerkracht|docent|p[aä]dagog|p[ée]dagog|formateur|formatrice/i;

const EDUCATION_SETTING =
  /school|education|[ée]ducati|\besl\b|\befl\b|tefl|tesol|\belt\b|\bsen\b|\bsend\b|senco|eyfs|classroom|learning (support|assistant)|cover supervisor|invigilat|examiner|\bbtec\b|\byear \d\b|principal|early years|nursery|pre-?school|kindergarten|montessori|curriculum|academic|professor|faculty|erzieher|\bkita\b|onderwijs/i;

const UNRELATED_ROLE =
  /babysit|nanny|au ?pair|caregiver|software|developer|engineer|\bsales\b|driver|clean|caretaker|housekeep|solicitor|lawyer|nurse|accountant|care worker|support worker|\baes\b|accompagnant|chef|\bcook\b|security|receptionist|warehouse|retail|lunchtime|marketing|social media|\bhr\b|finance|\boffice\b|data analyst|cyber/i;

export function isRelevantTeachingJob(title: string | null | undefined): boolean {
  if (!title) return false;
  if (TEACHING_ROLE.test(title)) return true;
  return EDUCATION_SETTING.test(title) && !UNRELATED_ROLE.test(title);
}
