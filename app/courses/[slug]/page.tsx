import { getCourseBySlug, mockCourses } from "@/lib/mock-courses";

// TODO: once course data comes from Supabase (or another real source), replace
// this always-fall-back-to-mock lookup with a real fetch-by-slug and call
// notFound() from "next/navigation" when no course matches the slug.
export default async function CourseDetails({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = getCourseBySlug(slug) ?? mockCourses[0];

  return (
    <>
      {/*==============================
    Breadcumb
============================== */}
      <div className="breadcumb-wrapper " data-bg-src="/assets/img/bg/breadcumb-bg.png">
        <div className="container">
          <div className="row">
            <div className="col-lg-7">
              <div className="breadcumb-content">
                <h1 className="breadcumb-title">Course Details</h1>
                <ul className="breadcumb-menu">
                  <li><a href="/">Home</a></li>
                  <li>Courses</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-5 align-self-end d-lg-block d-none">
              <div className="breadcumb-thumb">
                <img src="/assets/img/normal/breadcumb-thumb1-1.png" alt="img" />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*==============================
    Course Details Area
==============================*/}
      <section className="space-top space-extra-bottom overflow-hidden">
        <div className="container">
          <div className="row gx-40 gy-4">
            <div className="col-xxl-8 col-lg-7">
              <div className="course-single mb-30">
                <div className="course-single-top">
                  <div className="course-img">
                    <img src={course.image} alt="Course Image" />
                  </div>
                  <h2 className="course-title">{course.title}</h2>
                  <div className="course-rating">
                    <div className="star-rating" role="img" aria-label={`Rated ${course.rating} out of 5`}>
                      <span style={{ width: "100%" }}>Rated <strong className="rating">{course.rating}</strong> out of 5</span>
                    </div>
                    ({course.rating})({course.reviewCount})
                  </div>
                  <div className="box-content">
                    <div className="meta-box">
                      <div className="meta-thumb">
                        <img src={course.instructor.photo} alt="avater" />
                      </div>
                      <div className="media-body">
                        {/* No team page yet — instructor name is plain text, not a dead link, until one exists. */}
                        <h3 className="box-name">{course.instructor.name}</h3>
                      </div>
                    </div>
                    <div className="course-info">
                      <div className="box-icon">
                        <i className="fal fa-file-lines"></i>
                      </div>
                      <div className="course-info-details">
                        <span className="course-info-title">Lessons:</span>
                        <h4 className="course-info-text">{course.lessonsCount} Lessons</h4>
                      </div>
                    </div>
                    <div className="course-info">
                      <div className="box-icon">
                        <i className="fal fa-users"></i>
                      </div>
                      <div className="course-info-details">
                        <span className="course-info-title">Students:</span>
                        <h4 className="course-info-text">{course.studentsCount} Students</h4>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="course-single-bottom">
                  <ul className="nav course-tab" id="courseTab" role="tablist">
                    <li className="nav-item" role="presentation">
                      <a className="nav-link active" id="description-tab" data-bs-toggle="tab" href="#Coursedescription" role="tab" aria-controls="Coursedescription" aria-selected="true"><i className="fa-regular fa-bookmark"></i>Overview</a>
                    </li>
                    <li className="nav-item" role="presentation">
                      <a className="nav-link" id="curriculam-tab" data-bs-toggle="tab" href="#curriculam" role="tab" aria-controls="curriculam" aria-selected="false"><i className="fa-regular fa-book"></i>Curriculam</a>
                    </li>
                    <li className="nav-item" role="presentation">
                      <a className="nav-link" id="instructor-tab" data-bs-toggle="tab" href="#instructor" role="tab" aria-controls="instructor" aria-selected="false"><i className="fa-regular fa-user"></i>Instructor</a>
                    </li>
                    <li className="nav-item" role="presentation">
                      <a className="nav-link" id="reviews-tab" data-bs-toggle="tab" href="#reviews" role="tab" aria-controls="reviews" aria-selected="false"><i className="fa-regular fa-star-sharp"></i>Reviews</a>
                    </li>
                  </ul>
                  <div className="tab-content" id="courseTabContent">
                    <div className="tab-pane fade show active" id="Coursedescription" role="tabpanel" aria-labelledby="description-tab">
                      <div className="course-description">
                        <h5 className="h5 mb-4">Description</h5>
                        {course.description.map((paragraph, i) => (
                          <p key={i}>{paragraph}</p>
                        ))}
                        <h5 className="h5 mt-40">What Will You Learn?</h5>
                        <div className="row gy-4">
                          <div className="col-lg-6">
                            <div className="checklist style3">
                              <ul>
                                {course.whatYouLearn.slice(0, Math.ceil(course.whatYouLearn.length / 2)).map((item, i) => (
                                  <li key={i}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          <div className="col-lg-6">
                            <div className="checklist style3">
                              <ul>
                                {course.whatYouLearn.slice(Math.ceil(course.whatYouLearn.length / 2)).map((item, i) => (
                                  <li key={i}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                        <h5 className="h5 mt-40">Certification</h5>
                        <p className="mb-0">{course.certificationText}</p>
                      </div>
                    </div>
                    <div className="tab-pane fade" id="curriculam" role="tabpanel" aria-labelledby="curriculam-tab">
                      <div className="course-curriculam">
                        <h5 className="h5">The Course Curriculam</h5>
                        <p className="mb-30">{course.curriculumIntro}</p>
                        {course.curriculum.map((module, i) => (
                          <div className="checklist style3" key={i}>
                            <h6 className="mb-10">{module.title}</h6>
                            <ul>
                              {module.lessons.map((lesson, j) => (
                                <li key={j}>{lesson.title}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="tab-pane fade" id="instructor" role="tabpanel" aria-labelledby="instructor-tab">
                      <div className="course-instructor">
                        <div className="course-author-box">
                          <div className="auhtor-img">
                            <img src={course.instructor.photo} alt="Author Image" />
                          </div>
                          <div className="media-body">
                            <h3 className="author-name"><a className="text-inherit" href="/team-details">{course.instructor.name}</a></h3>
                            <p className="author-text">{course.instructor.bio}</p>
                            <div className="author-meta">
                              <a href="/courses"><i className="fal fa-file-video"></i>{course.instructor.courseCount}</a>
                              <span><i className="fal fa-users"></i>{course.instructor.studentCount}</span>
                            </div>
                            <div className="th-social style3">
                              <a href="https://facebook.com/" target="_blank"><i className="fab fa-facebook-f"></i></a>
                              <a href="https://twitter.com/" target="_blank"><i className="fab fa-twitter"></i></a>
                              <a href="https://linkedin.com/" target="_blank"><i className="fab fa-linkedin-in"></i></a>
                              <a href="https://instagram.com/" target="_blank"><i className="fab fa-instagram"></i></a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="tab-pane fade" id="reviews" role="tabpanel" aria-labelledby="reviews-tab">
                      <div className="course-reviews">
                        <div className="th-comments-wrap mt-0">
                          {course.reviews.length > 0 ? (
                            <ul className="comment-list">
                              {course.reviews.map((review, i) => (
                                <li className="review th-comment-item" key={i}>
                                  <div className="th-post-comment">
                                    <div className="comment-avater">
                                      <img src={review.avatar} alt="Comment Author" />
                                    </div>
                                    <div className="comment-content">
                                      <h4 className="name">{review.name}</h4>
                                      <span className="commented-on"><i className="fal fa-calendar-alt"></i>{review.date}</span>
                                      <div className="star-rating" role="img" aria-label={`Rated ${review.rating.toFixed(2)} out of 5`}>
                                        <span style={{ width: "100%" }}>Rated <strong className="rating">{review.rating.toFixed(2)}</strong> out of 5 based on <span className="rating">1</span> customer rating</span>
                                      </div>
                                      <p className="text">{review.comment}</p>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="mb-0">No reviews yet — be the first to review this course.</p>
                          )}
                        </div>
                        {/* Comment Form */}
                        <div className="th-comment-form mb-0 mt-40">
                          <div className="form-title">
                            <h3 className="blog-inner-title ">Add a review</h3>
                          </div>
                          <div className="row">
                            <div className="form-group rating-select d-flex align-items-center">
                              <label>Your Rating</label>
                              <p className="stars">
                                <span>
                                  <a className="star-1" href="#">1</a>
                                  <a className="star-2" href="#">2</a>
                                  <a className="star-3" href="#">3</a>
                                  <a className="star-4" href="#">4</a>
                                  <a className="star-5" href="#">5</a>
                                </span>
                              </p>
                            </div>
                            <div className="col-12 form-group">
                              <textarea placeholder="Write a Message" className="form-control"></textarea>
                              <i className="text-title far fa-pencil-alt"></i>
                            </div>
                            <div className="col-md-6 form-group">
                              <input type="text" placeholder="Your Name" className="form-control" />
                              <i className="text-title far fa-user"></i>
                            </div>
                            <div className="col-md-6 form-group">
                              <input type="text" placeholder="Your Email" className="form-control" />
                              <i className="text-title far fa-envelope"></i>
                            </div>
                            <div className="col-12 form-group">
                              <input id="reviewcheck" name="reviewcheck" type="checkbox" />
                              <label htmlFor="reviewcheck">Save my name, email, and website in this browser for the next time I comment.<span className="checkmark"></span></label>
                            </div>
                            <div className="col-12 form-group mb-0">
                              <button className="th-btn">POST REVIEW</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-4 col-lg-5">
              <aside className="sidebar-area pt-0">
                <div className="widget widget_info widget_course_info  ">
                  <div className="th-video">
                    <img src="/assets/img/course/widget-course-thumb1-1.png" alt="video" />
                    <a href="https://www.youtube.com/watch?v=_sI_Ps7JSEk" className="play-btn popup-video"><i className="far fa-play"></i></a>
                  </div>
                  <h4 className="course-price">{course.price} <span className="tag">{course.discountLabel}</span></h4>
                  <div className="btn-wrap">
                    <a href="/cart" className="th-btn w-100">ADD TO CART
                      <svg className="ms-2" width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.5264 0C7.5264 0.6962 8.21633 1.738 8.9138 2.61293C9.81193 3.7394 10.8838 4.72347 12.1137 5.4748C13.0351 6.0374 14.154 6.57747 15.0528 6.57747M7.5264 13.1712C7.5264 12.475 8.21633 11.4332 8.9138 10.5583C9.81193 9.43187 10.8838 8.44773 12.1137 7.6964C13.0351 7.1338 14.154 6.59373 15.0528 6.59373M15.0528 6.5856H0" stroke="currentColor" strokeWidth="1.5"></path>
                      </svg>
                    </a>
                    <a href="/support" className="th-btn style-border2 w-100">ENROLL NOW
                      <svg className="ms-2" width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.5264 0C7.5264 0.6962 8.21633 1.738 8.9138 2.61293C9.81193 3.7394 10.8838 4.72347 12.1137 5.4748C13.0351 6.0374 14.154 6.57747 15.0528 6.57747M7.5264 13.1712C7.5264 12.475 8.21633 11.4332 8.9138 10.5583C9.81193 9.43187 10.8838 8.44773 12.1137 7.6964C13.0351 7.1338 14.154 6.59373 15.0528 6.59373M15.0528 6.5856H0" stroke="currentColor" strokeWidth="1.5"></path>
                      </svg>
                    </a>
                  </div>
                  <h3 className="widget_title">Course Information</h3>
                  <div className="info-list">
                    <ul>
                      <li>
                        <i className="fa-light fa-user"></i>
                        <strong>Instructor: </strong>
                        <span>{course.instructor.name}</span>
                      </li>
                      <li>
                        <i className="fa-light fa-file"></i>
                        <strong>Lessons: </strong>
                        <span>{course.lessonsCount}</span>
                      </li>
                      <li>
                        <i className="fa-light fa-clock"></i>
                        <strong>Duration: </strong>
                        <span>{course.duration}</span>
                      </li>
                      <li>
                        <i className="fa-light fa-tag"></i>
                        <strong>Course level: </strong>
                        <span>{course.level}</span>
                      </li>
                      <li>
                        <i className="fa-light fa-globe"></i>
                        <strong>Language: </strong>
                        <span>{course.language}</span>
                      </li>
                      <li>
                        <i className="fal fa-users"></i>
                        <strong>Students: </strong>
                        <span>{course.studentsCount}</span>
                      </li>
                    </ul>
                  </div>
                  <a href="https://www.linkedin.com/" className="th-btn w-100 style9 mt-35 mb-0"><i className="far fa-share-nodes me-2"></i>SHARE THIS COURSE</a>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>


      {/*==============================
Course Area
==============================*/}
      <section className="overflow-hidden space-bottom" id="course-sec">

        <div className="container">
          <div className="title-area text-center">
            <span className="sub-title text-theme th_fade_anim"><img src="/assets/img/icon/subtitle-icon1-1.svg" alt="img" />Our Courses</span>
            <h2 className="sec-title th_fade_anim"><span className="th-text-perspective">Our Featured Courses</span></h2>
          </div>
          <div className="slider-area">
            <div className="swiper th-slider course-slider2 has-shadow" id="CourseSlider2" data-slider-options='{"autoHeight": "true","breakpoints":{"0":{"slidesPerView":1},"576":{"slidesPerView":"1"},"768":{"slidesPerView":"2"},"992":{"slidesPerView":"2"},"1200":{"slidesPerView":"3"}}}'>
              <div className="swiper-wrapper">
                {mockCourses
                  .filter((c) => c.slug !== course.slug)
                  .map((c, i) => (
                    <div className="swiper-slide th_fade_anim" data-delay={[".3", ".5", ".7"][i % 3]} key={c.slug}>
                      <div className="course-card">
                        <div className="box-img">
                          <a href={`/courses/${c.slug}`}><img src={c.image} alt={c.title} /></a>
                          <span className="box-price">{c.price}</span>
                        </div>
                        <h3 className="box-title"><a href={`/courses/${c.slug}`}>{c.title}</a></h3>
                        {/* Star rating and review count withheld until genuine reviews exist. */}
                        <div className="box-content">
                          <div className="course-info">
                            <div className="box-icon">
                              <i className="fal fa-file-lines"></i>
                            </div>
                            <div className="course-info-details">
                              <span className="course-info-title">Lessons:</span>
                              <h4 className="course-info-text">{c.lessonsCount} Lessons</h4>
                            </div>
                          </div>
                          <div className="course-info">
                            <div className="box-icon">
                              <i className="fal fa-users"></i>
                            </div>
                            <div className="course-info-details">
                              <span className="course-info-title">Students:</span>
                              <h4 className="course-info-text">{c.studentsCount} Students</h4>
                            </div>
                          </div>
                        </div>
                        <div className="btn-wrap">
                          <div className="meta-box">
                            <div className="meta-thumb">
                              <img src={c.instructor.photo} alt="avater" />
                            </div>
                            <div className="media-body">
                              {/* No team page yet — instructor name is plain text, not a dead link, until one exists. */}
                              <h5 className="box-name">{c.instructor.name}</h5>
                            </div>
                          </div>
                          <a href={`/courses/${c.slug}`} className="th-btn btn-sm style-border2">VIEW DETAILS<svg className="ms-2" width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7.5264 0C7.5264 0.6962 8.21633 1.738 8.9138 2.61293C9.81193 3.7394 10.8838 4.72347 12.1137 5.4748C13.0351 6.0374 14.154 6.57747 15.0528 6.57747M7.5264 13.1712C7.5264 12.475 8.21633 11.4332 8.9138 10.5583C9.81193 9.43187 10.8838 8.44773 12.1137 7.6964C13.0351 7.1338 14.154 6.59373 15.0528 6.59373M15.0528 6.5856H0" stroke="currentColor" strokeWidth="1.5"></path>
                          </svg></a>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            <button data-slider-prev="#CourseSlider2" className="slider-arrow style2 slider-prev">
              <svg width="17" height="15" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.4672 0C8.4672 0.783225 7.69103 1.95525 6.90638 2.93955C5.89598 4.20682 4.69013 5.3139 3.30645 6.15915C2.26988 6.79208 1.01115 7.39965 1.90735e-06 7.39965M8.4672 14.8176C8.4672 14.0344 7.69103 12.8623 6.90638 11.878C5.89598 10.6108 4.69013 9.5037 3.30645 8.65845C2.26988 8.02552 1.01115 7.41795 1.90735e-06 7.41795M1.90735e-06 7.4088H16.9344" stroke="currentColor" />
              </svg>
            </button>
            <button data-slider-next="#CourseSlider2" className="slider-arrow style2 slider-next">
              <svg width="17" height="15" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.4672 0C8.4672 0.783225 9.24338 1.95525 10.028 2.93955C11.0384 4.20682 12.2443 5.3139 13.628 6.15915C14.6645 6.79208 15.9233 7.39965 16.9344 7.39965M8.4672 14.8176C8.4672 14.0344 9.24338 12.8623 10.028 11.878C11.0384 10.6108 12.2443 9.5037 13.628 8.65845C14.6645 8.02552 15.9233 7.41795 16.9344 7.41795M16.9344 7.4088H0" stroke="currentColor" />
              </svg>
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
