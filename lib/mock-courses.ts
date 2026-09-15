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
    slug: "tefl-certificate-120-hour",
    title: "TEFL Certificate — 120 Hour",
    subtitle:
      "The internationally recognized standard for teaching English abroad.",
    image: "/assets/img/course/course-details1.jpg",
    rating: 4.9,
    reviewCount: "10k",
    price: "$[TBD]",
    discountLabel: "25% Off",
    instructor: {
      name: "Michel Shon",
      photo: "/assets/img/team/team_2_1.jpg",
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
];

export function getCourseBySlug(slug: string): Course | undefined {
  return mockCourses.find((course) => course.slug === slug);
}
