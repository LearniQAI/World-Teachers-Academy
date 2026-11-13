import type { ReactNode } from "react";
import { courseHref, formatLaunchDate, type CourseCatalogEntry } from "@/lib/courses-catalog";
import LaunchCountdown from "@/components/courses/LaunchCountdown";
import CourseImage from "@/components/courses/CourseImage";

// One course card, used on the homepage course grid and on /courses.
// Every course is free. No lesson or student counts, no prices, no ratings,
// and no links to the old template course-details page.

const Arrow = () => (
  <svg className="ms-2" width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M7.5264 0C7.5264 0.6962 8.21633 1.738 8.9138 2.61293C9.81193 3.7394 10.8838 4.72347 12.1137 5.4748C13.0351 6.0374 14.154 6.57747 15.0528 6.57747M7.5264 13.1712C7.5264 12.475 8.21633 11.4332 8.9138 10.5583C9.81193 9.43187 10.8838 8.44773 12.1137 7.6964C13.0351 7.1338 14.154 6.59373 15.0528 6.59373M15.0528 6.5856H0" stroke="currentColor" strokeWidth="1.5"></path>
  </svg>
);

function MaybeLink({ href, children, className }: { href: string | null; children: ReactNode; className?: string }) {
  return href ? <a href={href} className={className}>{children}</a> : <span className={className}>{children}</span>;
}

export default function CourseCard({
  course,
  headingLevel = "h3",
}: {
  course: CourseCatalogEntry;
  headingLevel?: "h2" | "h3";
}) {
  const href = courseHref(course);
  const isOpen = course.status === "open";
  const Heading = headingLevel;

  return (
    <div className={`course-card wta-course-card ${isOpen ? "is-open" : "is-coming-soon"}`}>
      <div className="box-img">
        <MaybeLink href={href}>
          <CourseImage
            src={course.image}
            srcSet={course.imageSrcSet}
            alt={course.imageAlt ?? course.title}
            fallback={
              <span className="wta-course-banner" role="img" aria-label={course.title}>
                <span className="wta-course-banner__kicker">World Teachers Academy</span>
                <span className="wta-course-banner__title">{course.title.replace(/\s+—\s+\d+\s*Hours?$/, "")}</span>
                {course.hours && <span className="wta-course-banner__hours">{course.hours}</span>}
              </span>
            }
          />
        </MaybeLink>
        {course.showFreeLabel !== false && <span className="box-price wta-price">Free</span>}
      </div>

      <span className={`wta-status ${isOpen ? "wta-status--open" : "wta-status--soon"}`}>
        {isOpen ? "Free — Enrolment Open" : "Coming Soon"}
      </span>

      <Heading className="box-title">
        <MaybeLink href={href}>{course.title}</MaybeLink>
      </Heading>
      <p className="wta-course-summary">{course.summary}</p>

      {!isOpen && course.launchAt && (
        <LaunchCountdown launchAt={course.launchAt} dateLabel={formatLaunchDate(course.launchAt)} />
      )}
      {!isOpen && !course.launchAt && (
        <div className="wta-countdown wta-countdown--tba">
          <p className="wta-countdown__date">Launch date to be announced</p>
          <p className="wta-countdown__note">This programme is in final development. Check back soon.</p>
        </div>
      )}

      <div className="btn-wrap">
        {isOpen && href ? (
          <a href={href} className="th-btn btn-sm">Start Learning for Free<Arrow /></a>
        ) : href ? (
          // Coming Soon courses may link to an information page only — never to
          // a page where a visitor can enrol in an unfinished course.
          <a href={href} className="th-btn btn-sm style-border2">View Course Profile<Arrow /></a>
        ) : (
          <span className="th-btn btn-sm style-border2 wta-btn-disabled" aria-disabled="true">Coming Soon</span>
        )}
      </div>
    </div>
  );
}
