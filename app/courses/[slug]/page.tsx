import { redirect } from "next/navigation";
import { realCourses } from "@/lib/courses-catalog";

// The template course-details page (placeholder ratings, "[Price TBD]",
// "[Instructor TBD]", Add to Cart) is retired. Each course now has its own
// profile page, linked from lib/courses-catalog.ts. Old /courses/<slug> links
// go to that profile page when it exists, otherwise to the course list.
// (The old page lives in git history: commit b3c30b04.)
export default async function CourseDetails({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = realCourses.find((c) => c.slug === slug);
  redirect(course?.profileUrl ?? `/courses${course ? `?q=${encodeURIComponent(course.title)}` : ""}`);
}
