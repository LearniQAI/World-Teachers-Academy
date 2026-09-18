import { realCourses } from "@/lib/courses-catalog";

const DELAYS = [".3", ".5", ".7", ".3", ".5"];

export default function Courses() {
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
                    <h1 className="breadcumb-title">Courses</h1>
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
              <div className="th-course-row columns-3">
                {realCourses.map((course, i) => (
                  <div className="th-course-single th_fade_anim" data-delay={DELAYS[i]} key={course.slug}>
                    <div className="course-card">
                      <div className="box-img">
                        <a href="/contact"><img src={course.image} alt={course.title} /></a>
                        <span className="box-price">[Price TBD]</span>
                      </div>
                      <h2 className="box-title"><a href="/contact">{course.title}</a></h2>
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
                      <div className="btn-wrap">
                        <div className="meta-box">
                          <div className="meta-thumb">
                            <img src="/assets/img/course/course-thumb1-1.png" alt="avater" />
                          </div>
                          <div className="media-body">
                            <h3 className="box-name"><a href="/team">[Instructor TBD]</a></h3>
                          </div>
                        </div>
                        <a href="/contact" className="th-btn btn-sm style-border2">VIEW DETAILS<svg className="ms-2" width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7.5264 0C7.5264 0.6962 8.21633 1.738 8.9138 2.61293C9.81193 3.7394 10.8838 4.72347 12.1137 5.4748C13.0351 6.0374 14.154 6.57747 15.0528 6.57747M7.5264 13.1712C7.5264 12.475 8.21633 11.4332 8.9138 10.5583C9.81193 9.43187 10.8838 8.44773 12.1137 7.6964C13.0351 7.1338 14.154 6.59373 15.0528 6.59373M15.0528 6.5856H0" stroke="currentColor" strokeWidth="1.5"></path>
                        </svg></a>
                      </div>
                    </div>
                  </div>
                ))}
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
                    <a href="/contact" className="th-btn style5">GET STARTED NOW<svg className="ms-2" width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
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
          <section className="testi-area-2 space overflow-hidden" id="testi-sec">
            <div className="container">
              <div className="title-area text-center">
                <span className="sub-title text-theme th_fade_anim"><img src="/assets/img/icon/subtitle-icon1-1.svg" alt="img" />Testimonials</span>
                <h2 className="sec-title th_fade_anim"><span className="th-text-perspective">Students Say&apos;s About us!</span></h2>
              </div>
              <div className="testi-slider2 slider-area">
                <div className="swiper th-slider has-shadow" id="testiSlide2" data-slider-options='{"breakpoints":{"0":{"slidesPerView":1},"576":{"slidesPerView":"1"},"768":{"slidesPerView":"1"},"992":{"slidesPerView":"2"},"1200":{"slidesPerView":"3"}},"autoHeight": "true"}'>
                  <div className="swiper-wrapper">
                    <div className="swiper-slide th_fade_anim">
                      <div className="testi-card2">
                        <div className="box-icon">
                          <img src="/assets/img/icon/quote2.svg" alt="icon" />
                        </div>
                        <h3 className="box-title">Start Learning Today</h3>
                        <p className="box-text">Online education learning has revolutionized the way knowledge is shared and accessed, offering flexibility, convenience, and inclusivity for learners around the world.</p>
                        <div className="testi-review-wrap">
                          <span className="testi-card_review">
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                          </span>
                          <span className="rating-title">4.8 (8k)</span>
                        </div>
                        <div className="testi-card-profile">
                          <div className="box-thumb">
                            <img src="/assets/img/testimonial/testi_2_1.png" alt="img" />
                          </div>
                          <div className="media-left">
                            <h4 className="testi-card_name">Alex James</h4>
                            <span className="testi-card_desig">Online Student</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="swiper-slide th_fade_anim">
                      <div className="testi-card2">
                        <div className="box-icon">
                          <img src="/assets/img/icon/quote2.svg" alt="icon" />
                        </div>
                        <h3 className="box-title">Unlock Your Potential</h3>
                        <p className="box-text">Personalized learning paths enable students to tailor their education to meet individual needs and goals, fostering a more engaging learning experience.</p>
                        <div className="testi-review-wrap">
                          <span className="testi-card_review">
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                          </span>
                          <span className="rating-title">4.6 (5k)</span>
                        </div>
                        <div className="testi-card-profile">
                          <div className="box-thumb">
                            <img src="/assets/img/testimonial/testi_2_2.png" alt="img" />
                          </div>
                          <div className="media-left">
                            <h4 className="testi-card_name">Maria Gonzalez</h4>
                            <span className="testi-card_desig">Part-time Learner</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="swiper-slide th_fade_anim">
                      <div className="testi-card2">
                        <div className="box-icon">
                          <img src="/assets/img/icon/quote2.svg" alt="icon" />
                        </div>
                        <h3 className="box-title">Join the Future of Education</h3>
                        <p className="box-text">Innovative technologies such as AI and VR are enhancing online education, making it more interactive and effective, preparing students for the challenges of tomorrow.</p>
                        <div className="testi-review-wrap">
                          <span className="testi-card_review">
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                          </span>
                          <span className="rating-title">4.9 (10k)</span>
                        </div>
                        <div className="testi-card-profile">
                          <div className="box-thumb">
                            <img src="/assets/img/testimonial/testi_2_3.png" alt="img" />
                          </div>
                          <div className="media-left">
                            <h4 className="testi-card_name">David Lee</h4>
                            <span className="testi-card_desig">Full-time Professional</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="swiper-slide th_fade_anim">
                      <div className="testi-card2">
                        <div className="box-icon">
                          <img src="/assets/img/icon/quote2.svg" alt="icon" />
                        </div>
                        <h3 className="box-title">Expand Your Horizons</h3>
                        <p className="box-text">With diverse course offerings and expert instructors, online education empowers learners to explore new fields and develop essential skills for the modern workforce.</p>
                        <div className="testi-review-wrap">
                          <span className="testi-card_review">
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                          </span>
                          <span className="rating-title">4.8 (8k)</span>
                        </div>
                        <div className="testi-card-profile">
                          <div className="box-thumb">
                            <img src="/assets/img/testimonial/testi_2_4.png" alt="img" />
                          </div>
                          <div className="media-left">
                            <h4 className="testi-card_name">Emily Chen</h4>
                            <span className="testi-card_desig">Career Changer</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="swiper-slide th_fade_anim">
                      <div className="testi-card2">
                        <div className="box-icon">
                          <img src="/assets/img/icon/quote2.svg" alt="icon" />
                        </div>
                        <h3 className="box-title">Transform Your Career</h3>
                        <p className="box-text">Online certifications and degrees provide opportunities for advancement and can significantly enhance job prospects in competitive markets.</p>
                        <div className="testi-review-wrap">
                          <span className="testi-card_review">
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                          </span>
                          <span className="rating-title">4.6 (5k)</span>
                        </div>
                        <div className="testi-card-profile">
                          <div className="box-thumb">
                            <img src="/assets/img/testimonial/testi_2_5.png" alt="img" />
                          </div>
                          <div className="media-left">
                            <h4 className="testi-card_name">Michael Brown</h4>
                            <span className="testi-card_desig">Aspiring Professional</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="swiper-slide th_fade_anim">
                      <div className="testi-card2">
                        <div className="box-icon">
                          <img src="/assets/img/icon/quote2.svg" alt="icon" />
                        </div>
                        <h3 className="box-title">Join the Future of Education</h3>
                        <p className="box-text">Innovative technologies such as AI and VR are enhancing online education, making it more interactive and effective, preparing students for the challenges of tomorrow.</p>
                        <div className="testi-review-wrap">
                          <span className="testi-card_review">
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                          </span>
                          <span className="rating-title">4.9 (10k)</span>
                        </div>
                        <div className="testi-card-profile">
                          <div className="box-thumb">
                            <img src="/assets/img/testimonial/testi_2_6.png" alt="img" />
                          </div>
                          <div className="media-left">
                            <h4 className="testi-card_name">David Lee</h4>
                            <span className="testi-card_desig">Full-time Professional</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="swiper-slide th_fade_anim">
                      <div className="testi-card2">
                        <div className="box-icon">
                          <img src="/assets/img/icon/quote2.svg" alt="icon" />
                        </div>
                        <h3 className="box-title">Pursue Your Passion</h3>
                        <p className="box-text">Online education learning has revolutionized the way knowledge is shared and accessed, offering flexibility, convenience, and inclusivity for learners around the world.</p>
                        <div className="testi-review-wrap">
                          <span className="testi-card_review">
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                          </span>
                          <span className="rating-title">4.8 (8k)</span>
                        </div>
                        <div className="testi-card-profile">
                          <div className="box-thumb">
                            <img src="/assets/img/testimonial/testi_2_7.png" alt="img" />
                          </div>
                          <div className="media-left">
                            <h4 className="testi-card_name">Sophia Martinez</h4>
                            <span className="testi-card_desig">Enthusiastic Learner</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="swiper-slide th_fade_anim">
                      <div className="testi-card2">
                        <div className="box-icon">
                          <img src="/assets/img/icon/quote2.svg" alt="icon" />
                        </div>
                        <h3 className="box-title">Achieve Your Goals</h3>
                        <p className="box-text">With diverse course offerings and expert instructors, online education empowers learners to explore new fields and develop essential skills for the modern workforce.</p>
                        <div className="testi-review-wrap">
                          <span className="testi-card_review">
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                          </span>
                          <span className="rating-title">4.6 (5k)</span>
                        </div>
                        <div className="testi-card-profile">
                          <div className="box-thumb">
                            <img src="/assets/img/testimonial/testi_2_8.png" alt="img" />
                          </div>
                          <div className="media-left">
                            <h4 className="testi-card_name">James Smith</h4>
                            <span className="testi-card_desig">Goal-Oriented Student</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="swiper-slide th_fade_anim">
                      <div className="testi-card2">
                        <div className="box-icon">
                          <img src="/assets/img/icon/quote2.svg" alt="icon" />
                        </div>
                        <h3 className="box-title">Join the Future of Education</h3>
                        <p className="box-text">Innovative technologies such as AI and VR are enhancing online education, making it more interactive and effective, preparing students for the challenges of tomorrow.</p>
                        <div className="testi-review-wrap">
                          <span className="testi-card_review">
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                          </span>
                          <span className="rating-title">4.9 (10k)</span>
                        </div>
                        <div className="testi-card-profile">
                          <div className="box-thumb">
                            <img src="/assets/img/testimonial/testi_2_9.png" alt="img" />
                          </div>
                          <div className="media-left">
                            <h4 className="testi-card_name">David Lee</h4>
                            <span className="testi-card_desig">Full-time Professional</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <button data-slider-prev="#testiSlide2" className="slider-arrow style3 slider-prev"><i className="far fa-arrow-left"></i></button>
                <button data-slider-next="#testiSlide2" className="slider-arrow style3 slider-next"><i className="far fa-arrow-right"></i></button>
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
                  <div className="cta-card2 bg-theme" data-bg-src="/assets/img/bg/cta-card-bg2-1.png">
                    <div className="title-area mb-0">
                      <span className="sub-title text-white th_fade_anim"><img src="/assets/img/icon/subtitle-icon1-2.svg" alt="img" />POPULAR COURSES</span>
                      <h2 className="sec-title text-white th_fade_anim"><span className="th-text-perspective">Get The Best Courses &amp; Upgrade Your Skills</span></h2>
                      <div className="btn-wrap mt-45 th_fade_anim">
                        <a href="/contact" className="th-btn style5">JOIN WITH US<svg className="ms-2" width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7.5264 0C7.5264 0.6962 8.21633 1.738 8.9138 2.61293C9.81193 3.7394 10.8838 4.72347 12.1137 5.4748C13.0351 6.0374 14.154 6.57747 15.0528 6.57747M7.5264 13.1712C7.5264 12.475 8.21633 11.4332 8.9138 10.5583C9.81193 9.43187 10.8838 8.44773 12.1137 7.6964C13.0351 7.1338 14.154 6.59373 15.0528 6.59373M15.0528 6.5856H0" stroke="currentColor" strokeWidth="1.5"></path>
                        </svg></a>
                      </div>
                    </div>
                    <div className="box-thumb th_fade_anim">
                      <img src="/assets/img/normal/cta-thumb2-1.png" alt="img" />
                    </div>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="cta-card2 bg-black3" data-bg-src="/assets/img/bg/cta-card-bg2-1.png">
                    <div className="title-area mb-0">
                      <span className="sub-title th_fade_anim"><img src="/assets/img/icon/subtitle-icon1-3.svg" alt="img" />POPULAR COURSES</span>
                      <h2 className="sec-title th_fade_anim"><span className="th-text-perspective">Get The Best Courses &amp; Upgrade Your Skills</span></h2>
                      <div className="btn-wrap mt-40 th_fade_anim">
                        <a href="/contact" className="th-btn style6">JOIN WITH US<svg className="ms-2" width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7.5264 0C7.5264 0.6962 8.21633 1.738 8.9138 2.61293C9.81193 3.7394 10.8838 4.72347 12.1137 5.4748C13.0351 6.0374 14.154 6.57747 15.0528 6.57747M7.5264 13.1712C7.5264 12.475 8.21633 11.4332 8.9138 10.5583C9.81193 9.43187 10.8838 8.44773 12.1137 7.6964C13.0351 7.1338 14.154 6.59373 15.0528 6.59373M15.0528 6.5856H0" stroke="currentColor" strokeWidth="1.5"></path>
                        </svg></a>
                      </div>
                    </div>
                    <div className="box-thumb th_fade_anim">
                      <img src="/assets/img/normal/cta-thumb2-2.png" alt="img" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
    </>
  );
}
