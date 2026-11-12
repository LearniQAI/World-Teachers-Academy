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
// Tested against all 1,074 live listings on 12 Nov 2026: 855 listings pass
// (853 before the Nov 2026 additions), about 707 distinct jobs are
// shown after duplicates are collapsed; the rest are HR, cyber-security and
// marketing trainees, babysitting and care posts, software roles and similar.
// School-based behaviour, SEMH and study-skills support roles are kept. Update the word lists here,
// not in the API routes, and add a title to tests/unit/job-relevance.test.ts for
// every change (run: node --experimental-strip-types --test tests/unit/*.test.ts).
// Nov 2026: nursery nurses, childcare practitioners, literacy/phonics/reading
// specialists, heads of subject and instructional aides are kept; recruitment
// consultants and driving/fitness instructors are dropped.

// Titles that sound like teaching but are not teaching vacancies. Checked first.
const NOT_A_TEACHING_VACANCY =
  /recruitment consultant|recruiter|resourcer|talent acquisition|driving instructor|fitness instructor|gym instructor|personal trainer/i;

const TEACHING_ROLE =
  /teach|tutor|lectur|instructor|instructional (aide|assistant|coach)|educator|\bhlta\b|\bta\b|\bect\b|paraprofessional|enseignant|professeur|ma[iî]tre de conf[ée]rences|lehrer|lehrkraft|leraar|leerkracht|docent|p[aä]dagog|p[ée]dagog|formateur|formatrice|nursery (nurse|practitioner)|childcare (practitioner|worker)|early childhood|literacy (coach|lead|specialist)|numeracy (coach|lead)|phonics|reading (interventionist|specialist|recovery)|\bhead of (maths|mathematics|english|science|department|faculty|key stage|year)\b/i;

const EDUCATION_SETTING =
  /school|education|[ée]ducati|\besl\b|\befl\b|tefl|tesol|\belt\b|\bsen\b|\bsend\b|senco|eyfs|classroom|learning (support|assistant)|cover supervisor|invigilat|examiner|\bbtec\b|\byear \d\b|principal|early years|nursery|pre-?school|kindergarten|montessori|curriculum|academic|professor|faculty|erzieher|\bkita\b|onderwijs|behaviou?r\W*(mentor|support)|learning mentor|study skills|\bsemh\b/i;

const UNRELATED_ROLE =
  /babysit|nanny|au ?pair|caregiver|software|developer|engineer|\bsales\b|driver|clean|caretaker|housekeep|solicitor|lawyer|\bnurse\b|accountant|care worker|support worker|\baes\b|accompagnant|chef|\bcook\b|security|receptionist|warehouse|retail|lunchtime|marketing|social media|\bhr\b|finance|\boffice\b|data analyst|cyber/i;

export function isRelevantTeachingJob(title: string | null | undefined): boolean {
  if (!title || !title.trim()) return false;
  if (NOT_A_TEACHING_VACANCY.test(title)) return false;
  if (TEACHING_ROLE.test(title)) return true;
  return EDUCATION_SETTING.test(title) && !UNRELATED_ROLE.test(title);
}
