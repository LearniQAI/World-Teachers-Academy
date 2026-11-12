// Run: node --experimental-strip-types --test tests/unit/
// Titles are real-world patterns seen in the Adzuna/Reed feeds or common in
// Teaching Vacancies / USAJOBS / international school postings.
import { test } from "node:test";
import assert from "node:assert/strict";
import { isRelevantTeachingJob } from "../../lib/job-relevance.ts";

const KEEP: Record<string, string[]> = {
  "teaching assistants": [
    "Teaching Assistant", "Level 3 Teaching Assistant", "Teaching Assistant - SEN", "HLTA", "Higher Level Teaching Assistant",
    "Graduate Teaching Assistant", "TA - Year 2", "Learning Support Assistant", "SEN Learning Support Assistant",
    "Classroom Assistant", "Classroom Aide", "Teacher Aide", "Instructional Aide", "Paraprofessional - Special Education",
    "Special Education Aide", "Cover Supervisor", "Exam Invigilator",
  ],
  "nursery and early years": [
    "Nursery Teacher", "Nursery Nurse", "Nursery Nurse Level 3", "Nursery Practitioner", "Nursery Room Leader",
    "Early Years Practitioner", "Early Years Educator", "Early Years Teacher", "EYFS Lead", "Preschool Teacher",
    "Pre-School Assistant", "Kindergarten Teacher", "Montessori Teacher", "Early Childhood Educator",
    "Childcare Practitioner", "Level 3 Childcare Worker", "Erzieher (m/w/d) Kita", "Pädagogische Fachkraft",
  ],
  "SEN and inclusion": [
    "SEN Teacher", "SEND Teacher", "SENCO", "Special Educational Needs Coordinator", "Special Education Teacher",
    "SEMH Teaching Assistant", "Behaviour Mentor - Secondary School", "Learning Mentor", "Behaviour ,Mentor", "Autism Specialist Teacher",
    "Teacher of the Deaf", "Reading Interventionist", "Literacy Coach", "Phonics Lead",
  ],
  "lecturers and higher education": [
    "Lecturer in Mathematics", "Senior Lecturer in Nursing", "FE Lecturer - Construction", "Assistant Professor of Education",
    "Associate Professor", "Professor of Physics", "Teaching Fellow", "Academic Tutor", "Docent Engels", "Maître de conférences",
  ],
  "online and private tutors": [
    "Online Tutor", "Online English Tutor", "Maths Tutor (GCSE)", "Private Tutor", "Home Tutor", "Apprenticeship Tutor",
  ],
  "language teachers": [
    "ESL Teacher", "EFL Teacher", "TEFL Teacher - Vietnam", "English Language Instructor", "English Teacher",
    "Professeur d'anglais", "Enseignant", "Lehrer (m/w/d) Mathematik", "Lehrkraft für Deutsch als Fremdsprache", "Leerkracht basisonderwijs",
  ],
  "school teachers and leaders": [
    "Primary Teacher", "Secondary Science Teacher", "Teacher of Maths", "ECT Primary", "Early Career Teacher",
    "Supply Teacher", "Daily Supply Teacher", "Trainee Teacher", "Headteacher", "Deputy Headteacher", "Assistant Principal",
    "Head of Maths", "Head of Mathematics", "Head of Year 9", "Head of Department - English", "Curriculum Leader",
    "School Counselor", "Music Instructor", "STEM Educator",
  ],
};

const DROP: Record<string, string[]> = {
  "care, childminding and health": [
    "Babysitter", "Nanny", "Au Pair", "Care Worker", "Support Worker", "School Nurse", "Registered Nurse", "Caregiver",
  ],
  "school non-teaching jobs": [
    "School Cleaner", "Caretaker", "School Chef", "Lunchtime Supervisor", "School Receptionist", "School Business Manager - Finance",
    "School Office Administrator", "Youth Support Worker - Primary School",
  ],
  "corporate and unrelated": [
    "Software Developer", "Software Engineer - EdTech", "HR Trainee", "Cyber Security Trainee", "Marketing Executive - Education",
    "Social Media Assistant - Schools", "Data Analyst - Education", "Solicitor - Education Law", "Warehouse Operative",
    "Delivery Driver", "Sales Executive",
  ],
  "teaching-sounding but not a teaching vacancy": [
    "Teacher Recruitment Consultant", "Education Recruitment Consultant", "Recruiter - Teaching", "Driving Instructor",
    "Fitness Instructor", "Personal Trainer",
  ],
  // Reviewed borderline titles from the live feed (Nov 2026) — excluded for now.
  "borderline, excluded": [
    "Kids Coach", "Youth Mentor", "Outreach Mentor", "Behavior Technician", "Library Manager - Manchester", "Librarian",
    "IT Coach / Assessor", "Power Trainer and Assessor", "Science Technician", "Lunchtime Supervisor / Lunchtime Organiser - Primary School",
    "Chargé·e de développement e-learning et formation F/H", "Trainee Learning and Development Administrator",
  ],
  "empty": ["", "   "],
};

for (const [group, titles] of Object.entries(KEEP)) {
  test(`keeps ${group}`, () => {
    const missed = titles.filter((t) => !isRelevantTeachingJob(t));
    assert.deepEqual(missed, [], `wrongly excluded: ${missed.join(", ")}`);
  });
}
for (const [group, titles] of Object.entries(DROP)) {
  test(`drops ${group}`, () => {
    const kept = titles.filter((t) => isRelevantTeachingJob(t));
    assert.deepEqual(kept, [], `wrongly included: ${kept.join(", ")}`);
  });
}
test("null and undefined are dropped", () => {
  assert.equal(isRelevantTeachingJob(null), false);
  assert.equal(isRelevantTeachingJob(undefined), false);
});
