import { searchCourses } from "@/lib/courses-catalog";
import CourseSearchForm from "@/components/courses/CourseSearchForm";
import TextTestimonials from "@/components/home/TextTestimonials";

const DELAYS = [".3", ".5", ".7", ".3", ".5"];

export default async function Courses({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q ?? "";
  const courses = searchCourses(query);

  return (
    <>
      {/*==============================
    Breadcumb
============================== */}
          <div className="courses-hero">
            <h1 className="visually-hidden">Courses</h1>
            <img src="/assets/img/bg/courses-hero-1920x400.png" alt="Courses — World Teachers Academy" style={{ display: "block", width: "100%", height: "auto" }} />
          </div>
          {/*==============================
Course Area
==============================*/}
          <section className="overflow-hidden th-anim-trigger space overflow-hidden" id="course-sec">
            <div className="course-bg-shape1-1 shape-mockup th_fade_anim" data-speed="0.9" data-left="6%" data-top="20%">
              <img src="/assets/img/shape/course_shape1_1.png" alt="img" />
            </div>
            <div className="course-bg-shape1-2 shape-mockup" data-right="6%" data-bottom="20%">
              <div className="thumb th-anim-spin">
                <img src="/assets/img/shape/course_shape1_2.png" alt="img" />
              </div>
            </div>
            <div className="container">
              <CourseSearchForm defaultQuery={query} />
              {query && (
                <p className="mb-30">
                  {courses.length > 0
                    ? `Showing ${courses.length} result${courses.length === 1 ? "" : "s"} for "${query}"`
                    : `No courses found for "${query}" — try a different search term.`}
                </p>
              )}
              <div className="th-course-row columns-3">
                {courses.map((course, i) => {
                  // Supply Chain Management has no course-details entry yet
                  // (pending confirmation it should exist on the site at all) —
                  // linking it to /courses/supply-chain-management would silently
                  // fall back to showing the TEFL course's details instead.
                  const detailsHref =
                    course.slug === "supply-chain-management"
                      ? "/contact"
                      : `/courses/${course.slug}`;
                  return (
                  <div className="th-course-single th_fade_anim" data-delay={DELAYS[i]} key={course.slug}>
                    <div className="course-card">
                      <div className="box-img">
                        <a href={detailsHref}><img src={course.image} alt={course.title} /></a>
                        <span className="box-price">[Price TBD]</span>
                      </div>
                      <h2 className="box-title"><a href={detailsHref}>{course.title}</a></h2>
                      {/* Star rating and review count withheld until genuine reviews exist. */}
                      <div className="box-content">
                        <div className="course-info">
                          <div className="box-icon">
                            <i className="fal fa-file-lines"></i>
                          </div>
                          <div className="course-info-details">
                            <span className="course-info-title">Lessons:</span>
                            <h3 className="course-info-text">50+ Lessons</h3>
                          </div>
                        </div>
                        <div className="course-info">
                          <div className="box-icon">
                            <i className="fal fa-users"></i>
                          </div>
                          <div className="course-info-details">
                            <span className="course-info-title">Students:</span>
                            <h3 className="course-info-text">160+ Students</h3>
                          </div>
                        </div>
                      </div>
                      {/* Instructor meta-box removed — no real instructor is confirmed yet, and a
                          "[Instructor TBD]" placeholder next to a generic stock photo reads as broken,
                          not as pending content. */}
                      <div className="btn-wrap">
                        <a href={detailsHref} className="th-btn btn-sm style-border2">VIEW DETAILS<svg className="ms-2" width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7.5264 0C7.5264 0.6962 8.21633 1.738 8.9138 2.61293C9.81193 3.7394 10.8838 4.72347 12.1137 5.4748C13.0351 6.0374 14.154 6.57747 15.0528 6.57747M7.5264 13.1712C7.5264 12.475 8.21633 11.4332 8.9138 10.5583C9.81193 9.43187 10.8838 8.44773 12.1137 7.6964C13.0351 7.1338 14.154 6.59373 15.0528 6.59373M15.0528 6.5856H0" stroke="currentColor" strokeWidth="1.5"></path>
                        </svg></a>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
              {/* Pagination removed — all 5 real courses fit on one page. The old
                  "Prev/1/2/Next" links pointed at /blog and were themselves
                  placeholder artifacts. */}
            </div>
          </section>


          {/*==============================
Cta Area
==============================*/}
          <section className="pt-80 pb-80 bg-theme overflow-hidden" data-bg-src="/assets/img/bg/cta-bg5-1.png">
            <div className="container">
              <div className="row gy-40 justify-content-between align-items-center">
                <div className="col-xxl-6 col-xl-7 col-lg-7">
                  <div className="title-area mb-0 text-lg-start text-center">
                    <h2 className="sec-title text-white">Get 15% off tuition for all <span className="fw-normal">courses this Spring!</span></h2>
                    <p className="text-white mb-0 mt-30">Don&apos;t forget to register for the course to unlock access to all learning materials.</p>
                  </div>
                </div>
                <div className="col-lg-auto">
                  <div className="btn-wrap justify-content-center">
                    <a href="/support" className="th-btn style5">GET STARTED NOW<svg className="ms-2" width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7.5264 0C7.5264 0.6962 8.21633 1.738 8.9138 2.61293C9.81193 3.7394 10.8838 4.72347 12.1137 5.4748C13.0351 6.0374 14.154 6.57747 15.0528 6.57747M7.5264 13.1712C7.5264 12.475 8.21633 11.4332 8.9138 10.5583C9.81193 9.43187 10.8838 8.44773 12.1137 7.6964C13.0351 7.1338 14.154 6.59373 15.0528 6.59373M15.0528 6.5856H0" stroke="currentColor" strokeWidth="1.5"></path>
                    </svg></a>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/*==============================
Testimonial Area
==============================*/}
          <section className="space overflow-hidden" id="testi-sec">
            <div className="container">
              <div className="row justify-content-center">
                <div className="col-12">
                  <TextTestimonials variant="carousel" />
                </div>
              </div>
            </div>
          </section>

          {/*==============================
Cta Area
==============================*/}
          <section className="cta-area-2 space-bottom overflow-hidden" id="contact-sec">
            <div className="cta-bg-shape2-1 shape-mockup th_fade_anim" data-speed="0.9" data-right="6%" data-top="20%">
              <img src="/assets/img/shape/course_shape1_1.png" alt="img" />
            </div>
            <div className="container">
              <div className="row gy-30 justify-content-center">
                <div className="col-lg-6">
                  <div className="cta-card2 cta-card2-dark" style={{ background: "#0B0B0F" }}>
                    <div className="title-area mb-0">
                      <span className="sub-title text-white th_fade_anim"><img src="/assets/img/icon/subtitle-icon1-2.svg" alt="img" />POPULAR COURSES</span>
                      <h2 className="sec-title text-white th_fade_anim"><span className="th-text-perspective">Get The Best Courses &amp; Upgrade Your Skills</span></h2>
                      <div className="btn-wrap mt-45 th_fade_anim">
                        <a href="/support" className="th-btn style5">JOIN WITH US<svg className="ms-2" width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7.5264 0C7.5264 0.6962 8.21633 1.738 8.9138 2.61293C9.81193 3.7394 10.8838 4.72347 12.1137 5.4748C13.0351 6.0374 14.154 6.57747 15.0528 6.57747M7.5264 13.1712C7.5264 12.475 8.21633 11.4332 8.9138 10.5583C9.81193 9.43187 10.8838 8.44773 12.1137 7.6964C13.0351 7.1338 14.154 6.59373 15.0528 6.59373M15.0528 6.5856H0" stroke="currentColor" strokeWidth="1.5"></path>
                        </svg></a>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="cta-card2" style={{ background: "#F5F7FF" }}>
                    <div className="title-area mb-0">
                      <span className="sub-title th_fade_anim"><img src="/assets/img/icon/subtitle-icon1-3.svg" alt="img" />POPULAR COURSES</span>
                      <h2 className="sec-title th_fade_anim"><span className="th-text-perspective">Get The Best Courses &amp; Upgrade Your Skills</span></h2>
                      <div className="btn-wrap mt-40 th_fade_anim">
                        <a href="/support" className="th-btn style6">JOIN WITH US<svg className="ms-2" width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7.5264 0C7.5264 0.6962 8.21633 1.738 8.9138 2.61293C9.81193 3.7394 10.8838 4.72347 12.1137 5.4748C13.0351 6.0374 14.154 6.57747 15.0528 6.57747M7.5264 13.1712C7.5264 12.475 8.21633 11.4332 8.9138 10.5583C9.81193 9.43187 10.8838 8.44773 12.1137 7.6964C13.0351 7.1338 14.154 6.59373 15.0528 6.59373M15.0528 6.5856H0" stroke="currentColor" strokeWidth="1.5"></path>
                        </svg></a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
    </>
  );
}
