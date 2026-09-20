// Placeholder course data for the Course Details page mockup.
// TODO: replace this entire file with a real course-source API/Supabase integration.
export interface CourseLesson {
  title: string;
}

export interface CourseModule {
  title: string;
  lessons: CourseLesson[];
}

export interface CourseReview {
  name: string;
  date: string;
  rating: number;
  comment: string;
  avatar: string;
}

export interface Course {
  slug: string;
  title: string;
  subtitle: string;
  image: string;
  rating: number;
  reviewCount: string;
  price: string;
  discountLabel: string;
  instructor: {
    name: string;
    photo: string;
    bio: string;
    courseCount: string;
    studentCount: string;
  };
  lessonsCount: string;
  studentsCount: string;
  duration: string;
  level: string;
  language: string;
  description: string[];
  whatYouLearn: string[];
  curriculumIntro: string;
  curriculum: CourseModule[];
  certificationText: string;
  // Real student reviews are not available yet — left empty rather than
  // fabricated. TODO: populate once genuine reviews exist.
  reviews: CourseReview[];
}

export const mockCourses: Course[] = [
  {
    slug: "tefl-certificate-130-hour",
    title: "TEFL Certificate — 130 Hour",
    subtitle:
      "The internationally recognized standard for teaching English abroad.",
    image: "/assets/img/course/course-details-808x500.png",
    rating: 4.9,
    reviewCount: "10k",
    price: "$[TBD]",
    discountLabel: "25% Off",
    instructor: {
      name: "Michel Shon",
      photo: "/assets/img/team/instructor-272x272.png",
      bio: "TEFL-certified instructor with experience training educators for classrooms in Asia, Europe, and Latin America.",
      courseCount: "4 Courses",
      studentCount: "2500 Students",
    },
    lessonsCount: "50+",
    studentsCount: "160+",
    duration: "16h 30m",
    level: "Beginners",
    language: "English",
    description: [
      "This TEFL Certificate course prepares you to teach English as a foreign language in classrooms around the world. You'll build the practical skills employers look for: lesson planning, classroom management, and assessment design, all grounded in real teaching scenarios rather than theory alone.",
      "By the end of the course you'll have a complete teaching portfolio, a recognized certificate, and the confidence to apply for ESL roles internationally.",
    ],
    whatYouLearn: [
      "Core principles of TEFL methodology",
      "How to plan and deliver a structured lesson",
      "Classroom management techniques for mixed-level groups",
      "How to assess student progress and give feedback",
      "Adapting lessons for young learners vs. adults",
      "Preparing a teaching portfolio for job applications",
    ],
    curriculumIntro:
      "A structured, module-based curriculum designed to take you from TEFL fundamentals to a job-ready teaching portfolio.",
    curriculum: [
      {
        title: "Module 1: Foundations of TEFL",
        lessons: [
          { title: "Introduction to Teaching English as a Foreign Language" },
          { title: "Understanding your learners" },
          { title: "Setting learning objectives" },
        ],
      },
      {
        title: "Module 2: Lesson Planning & Delivery",
        lessons: [
          { title: "Structuring an effective lesson" },
          { title: "Grammar and vocabulary teaching techniques" },
          { title: "Using materials and resources effectively" },
        ],
      },
      {
        title: "Module 3: Classroom Management",
        lessons: [
          { title: "Managing mixed-ability classrooms" },
          { title: "Behavior management strategies" },
          { title: "Building an engaging classroom environment" },
        ],
      },
      {
        title: "Module 4: Assessment & Certification",
        lessons: [
          { title: "Assessing student progress" },
          { title: "Giving constructive feedback" },
          { title: "Final teaching practicum & certification" },
        ],
      },
    ],
    certificationText:
      "Graduates receive an internationally recognized TEFL Certificate validating their readiness to teach English abroad, covering both theoretical foundations and supervised practical teaching experience.",
    reviews: [],
  },
  // The three entries below give "Diploma — 320 Hour", "Advanced Diploma —
  // 395 Hour", and "TEFL Comprehensive — 520 Hours" a working details page
  // (previously all three fell back to /contact). Per the same rule as the
  // rest of this codebase, only what's actually known (title, hour count,
  // slug) is real — price, instructor, duration, level, and curriculum
  // content are explicit TBD placeholders, not invented specifics. Ratings
  // are left at 0 rather than the fabricated "4.9 (10k)" style used on the
  // TEFL entry above, since these have zero real reviews behind them.
  {
    slug: "diploma-320-hour",
    title: "Diploma — 320 Hour",
    subtitle: "[Course subtitle pending confirmation]",
    image: "/assets/diploma320.jpeg",
    rating: 0,
    reviewCount: "0",
    price: "[Price TBD]",
    discountLabel: "",
    instructor: {
      name: "[Instructor TBD]",
      photo: "/assets/img/course/course-thumb1-1.png",
      bio: "[Instructor bio pending confirmation]",
      courseCount: "[TBD]",
      studentCount: "[TBD]",
    },
    lessonsCount: "50+",
    studentsCount: "160+",
    duration: "[TBD]",
    level: "[TBD]",
    language: "English",
    description: [
      "[Course description pending confirmation — to be provided for the Diploma — 320 Hour course.]",
    ],
    whatYouLearn: ["[Learning outcomes pending confirmation]"],
    curriculumIntro: "[Curriculum overview pending confirmation]",
    curriculum: [
      {
        title: "[Curriculum pending confirmation]",
        lessons: [{ title: "[Module details pending confirmation]" }],
      },
    ],
    certificationText: "[Certification details pending confirmation]",
    reviews: [],
  },
  {
    slug: "advanced-diploma-395-hour",
    title: "Advanced Diploma — 395 Hour",
    subtitle: "[Course subtitle pending confirmation]",
    image: "/assets/adv-diploma%20395%20hours.jpeg",
    rating: 0,
    reviewCount: "0",
    price: "[Price TBD]",
    discountLabel: "",
    instructor: {
      name: "[Instructor TBD]",
      photo: "/assets/img/course/course-thumb1-1.png",
      bio: "[Instructor bio pending confirmation]",
      courseCount: "[TBD]",
      studentCount: "[TBD]",
    },
    lessonsCount: "50+",
    studentsCount: "160+",
    duration: "[TBD]",
    level: "[TBD]",
    language: "English",
    description: [
      "[Course description pending confirmation — to be provided for the Advanced Diploma — 395 Hour course.]",
    ],
    whatYouLearn: ["[Learning outcomes pending confirmation]"],
    curriculumIntro: "[Curriculum overview pending confirmation]",
    curriculum: [
      {
        title: "[Curriculum pending confirmation]",
        lessons: [{ title: "[Module details pending confirmation]" }],
      },
    ],
    certificationText: "[Certification details pending confirmation]",
    reviews: [],
  },
  {
    slug: "tefl-comprehensive-520-hour",
    title: "TEFL Comprehensive — 520 Hours",
    subtitle: "[Course subtitle pending confirmation]",
    image: "/assets/520%20hours.jpeg",
    rating: 0,
    reviewCount: "0",
    price: "[Price TBD]",
    discountLabel: "",
    instructor: {
      name: "[Instructor TBD]",
      photo: "/assets/img/course/course-thumb1-1.png",
      bio: "[Instructor bio pending confirmation]",
      courseCount: "[TBD]",
      studentCount: "[TBD]",
    },
    lessonsCount: "50+",
    studentsCount: "160+",
    duration: "[TBD]",
    level: "[TBD]",
    language: "English",
    description: [
      "[Course description pending confirmation — to be provided for the TEFL Comprehensive — 520 Hours course.]",
    ],
    whatYouLearn: ["[Learning outcomes pending confirmation]"],
    curriculumIntro: "[Curriculum overview pending confirmation]",
    curriculum: [
      {
        title: "[Curriculum pending confirmation]",
        lessons: [{ title: "[Module details pending confirmation]" }],
      },
    ],
    certificationText: "[Certification details pending confirmation]",
    reviews: [],
  },
];

export function getCourseBySlug(slug: string): Course | undefined {
  return mockCourses.find((course) => course.slug === slug);
}
