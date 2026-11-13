import type React from "react";
import VideoTestimonials from "@/components/home/VideoTestimonials";
import TextTestimonials from "@/components/home/TextTestimonials";
import { SHOW_UNVERIFIED_TESTIMONIALS } from "@/lib/site";
import HeroSearchForm from "@/components/home/HeroSearchForm";
import { realCourses } from "@/lib/courses-catalog";
import CourseCard from "@/components/courses/CourseCard";
import { getJobStats } from "@/lib/job-stats";

export const revalidate = 3600;

// Job Portal section is hidden for now (kept in the code, not deleted). Flip to
// true to bring it back — the live job stats are only fetched while it is shown.
const SHOW_JOB_PORTAL: boolean = false;
// Resource sign-up form: off until its backend (storage, consent, spam
// protection, confirmation email) is built, tested and approved. See B1 in
// docs/review/2026-11-functionality-backlog.md.
const SHOW_RESOURCE_SIGNUP_FORM: boolean = false;

export default async function Home() {
  const jobStats = SHOW_JOB_PORTAL ? await getJobStats() : { openRoles: null, countries: null };

  return (
    <>
            <div className="th-hero-wrapper hero-11" id="hero" data-bg-src="/assets/img/hero/hero_bg_11_1.png">
                <div className="hero-inner">
                    <div className="container">
                        <div className="row gy-50 flex-row-reverse align-items-center">
                            <div className="col-lg-6">
                                {/* Owner-supplied hero image (12 Nov 2026). Headline and text stay as HTML.
                                    WebP for speed; the PNG is the fallback for very old browsers. */}
                                <div className="global-career-hero wow animate__fadeInUp">
                                    <picture>
                                        <source type="image/webp" srcSet="/images/your-future-no-borders-768.webp 768w, /images/your-future-no-borders.webp 1536w" sizes="(min-width: 992px) 50vw, 100vw" />
                                        <img
                                            src="/images/your-future-no-borders.png"
                                            alt="International career opportunities with a professional traveller, world landmarks and global connections"
                                            width={1536}
                                            height={1024}
                                            loading="eager"
                                            fetchPriority="high"
                                        />
                                    </picture>
                                    <div className="wta-badge wta-badge--hero">
                                        <img src="/assets/img/hero/wta-badge-icon.png" alt="" width={48} height={48} />
                                        <div><strong>Free</strong><span>Courses open now</span></div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="hero-style11">
                                    <div className="hero-subtitle wow animate__fadeInUp" data-wow-delay="0.2s">EXPLORE. PREPARE. WORK ABROAD.</div>
                                    <h2 className="hero-title">
                                        <span className="title1 wow animate__fadeInUp" data-wow-delay="0.3s">Your Future Has No Borders.</span>
                                    </h2>
                                    <p className="hero-text wow animate__fadeInUp" data-wow-delay="0.6s">
                                        Explore countries, understand international job opportunities, and prepare with the skills, knowledge, and confidence to work abroad.
                                    </p>
                                    <div className="header-search-form wow animate__fadeInUp" data-wow-delay="0.7s">
                                        <HeroSearchForm />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="pt-60 space-bottom overflow-hidden brand-area-1">
                    <div className="container">
                        <div className="row gy-4 justify-content-center text-center stat-strip">
                            <div className="col-6 col-md-3">
                                <div className="counter-card"><div className="media-body"><h2 className="box-number">Free</h2><p className="box-text">Online Courses</p></div></div>
                            </div>
                            <div className="col-6 col-md-3">
                                <div className="counter-card"><div className="media-body"><h2 className="box-number">Global</h2><p className="box-text">Country Guides</p></div></div>
                            </div>
                            <div className="col-6 col-md-3">
                                <div className="counter-card"><div className="media-body"><h2 className="box-number">Verified</h2><p className="box-text">Job Listings</p></div></div>
                            </div>
                            <div className="col-6 col-md-3">
                                <div className="counter-card"><div className="media-body"><h2 className="box-number">Direct</h2><p className="box-text">Applications</p></div></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            
            <section className="space overflow-hidden" id="category-sec">
                <div className="container">
                    <div className="row justify-content-lg-between justify-content-center align-items-center">
                        <div className="col-xxl-7 col-lg-8">
                            <div className="title-area text-lg-start text-center">
                                <h2 className="sec-title th_fade_anim"><span className="th-text-perspective">Browse Certifications & Training Programmes</span></h2>
                            </div>
                        </div>
                        <div className="col-auto">
                            <div className="sec-btn th_fade_anim">
                                <div className="icon-box btn-wrap style3">
                                    <button data-slider-prev="#categorySlider3" className="slider-arrow default style9 slider-prev">
                                        <svg width="17" height="15" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M8.4672 0C8.4672 0.783225 7.69103 1.95525 6.90638 2.93955C5.89598 4.20682 4.69013 5.3139 3.30645 6.15915C2.26988 6.79208 1.01115 7.39965 1.90735e-06 7.39965M8.4672 14.8176C8.4672 14.0344 7.69103 12.8623 6.90638 11.878C5.89598 10.6108 4.69013 9.5037 3.30645 8.65845C2.26988 8.02552 1.01115 7.41795 1.90735e-06 7.41795M1.90735e-06 7.4088H16.9344" stroke="currentColor"  />
                                        </svg>
                                    </button>
                                    <button data-slider-next="#categorySlider3" className="slider-arrow default style9 slider-next">
                                        <svg width="17" height="15" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M8.4672 0C8.4672 0.783225 9.24338 1.95525 10.028 2.93955C11.0384 4.20682 12.2443 5.3139 13.628 6.15915C14.6645 6.79208 15.9233 7.39965 16.9344 7.39965M8.4672 14.8176C8.4672 14.0344 9.24338 12.8623 10.028 11.878C11.0384 10.6108 12.2443 9.5037 13.628 8.65845C14.6645 8.02552 15.9233 7.41795 16.9344 7.41795M16.9344 7.4088H0" stroke="currentColor"  />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="category-slider3 th_fade_anim">
                                                <div className="swiper th-slider has-shadow" id="categorySlider3" data-slider-options='{"spaceBetween":20,"breakpoints":{"0":{"slidesPerView":1.15},"526":{"slidesPerView":2.15},"768":{"slidesPerView":3},"991":{"slidesPerView":4},"1200":{"slidesPerView":5},"1400":{"slidesPerView":5}}}'>
                            <div className="swiper-wrapper">
                                {/* Cards and destinations: CATEGORY_CARDS at the bottom of this file.
                                    Listed twice so the looping slider always has enough slides. */}
                                {[...CATEGORY_CARDS, ...CATEGORY_CARDS].map((card, i) => (
                                    <div className="swiper-slide" key={`${card.title}-${i}`}>
                                        <div className={`category-card3 wta-cat wta-cat--${card.theme}`}>
                                            <div className="wta-cat__top">
                                                <span className="wta-cat__icon"><CategoryIcon name={card.icon} /></span>
                                                <span className="wta-cat__tag">{THEME_LABEL[card.theme]}</span>
                                            </div>
                                            <h3 className="box-title">
                                                {card.href ? <a href={card.href}>{card.title}</a> : <span>{card.title}</span>}
                                            </h3>
                                            <p className="wta-cat__text">{card.text}</p>
                                            {card.href ? (
                                                <a className="icon-btn style8 wta-cat__btn" href={card.href} aria-label={card.title}><CategoryArrow /></a>
                                            ) : (
                                                <span className="wta-category-soon wta-cat__btn">Coming soon</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            <div className="space-bottom overflow-hidden" id="about-sec">
                <div className="about-bg-shape11-1 d-xxl-block d-none shape-mockup" data-speed="0.8" data-top="15%" data-left="5%">
                </div>
                <div className="about-bg-shape10-2 shape-mockup d-xxl-block d-none" data-speed="0.9" data-bottom="15%" data-right="5%">
                </div>
                <div className="about-wrap11 space-bottom">
                    <div className="container">
                        <div className="row gy-50 gx-80 align-items-center">
                            <div className="col-xl-6 col-lg-10">
                                <div className="img-box11">
                                    <div className="img1 th--hover-item th_fade_anim">
                                        <div className="thumb th--hover-img" data-displacement="/assets/img/imghover/fluid.jpg" data-intensity="0.2" data-speedin="1" data-speedout="1">
                                            {/* Owner-supplied photo (13 Nov 2026). Master: /images/global-career-professional.png (1122×1402).
                                                Served as a 3:5 WebP crop that matches this frame exactly, so the hover
                                                ripple (which reads the img src directly) never stretches it. */}
                                            <img className="img-cover" src="/images/global-career-professional-3x5.webp" width={841} height={1402} loading="lazy" decoding="async" alt="Black African professional woman working on a laptop in a bright modern workspace, preparing for global career opportunities" />
                                        </div>
                                    </div>
                                    <div className="img2 th--hover-item th_fade_anim">
                                        <div className="thumb th--hover-img" data-displacement="/assets/img/imghover/fluid.jpg" data-intensity="0.2" data-speedin="1" data-speedout="1">
                                            <img className="img-cover" src="/assets/img/normal/more-aboutus-2.jpg" alt="World Teachers Academy team" />
                                        </div>
                                    </div>
                                    <div className="about-tag th_fade_anim">
                                        <div className="about-experience-tag">
                                            <span className="circle-title-anime">Your Future Has No Borders ** Work Abroad **</span>
                                        </div>
                                        <div className="year-counter">
                                            <div className="box-title wta-circle-word">WTA</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-6">
                                <div className="title-area mb-35">
                                    <span className="sub-title text-theme th_fade_anim"><img src="/assets/img/icon/subtitle-icon1-6.svg" alt="img" />More About Us</span>
                                    <h2 className="sec-title th_fade_anim"><span className="th-text-perspective">Everything You Need to Build a Global Career</span></h2>
                                    <p className="th_fade_anim">World Teachers Academy was built for one purpose: helping people get certified, stay current, and find international roles that genuinely fit their skills — without juggling five different websites to do it.</p>
                                    <p className="th_fade_anim">From practical certification courses to a live directory of verified jobs across multiple countries, we bring the training and the opportunity together in one place.</p>
                                </div>
                                <div className="about-info-card style2 th_fade_anim">
                                    <div className="box-icon">
                                        <svg width="19" height="16" viewBox="0 0 19 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M0.75 10.1252C0.75 10.1252 2.625 10.1252 5.125 14.5002C5.125 14.5002 12.0735 3.04191 18.25 0.750244" stroke="#1E1E1E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"  />
                                        </svg>
                                    </div>
                                    <div className="box-content">
                                        <h3 className="box-title">Certified Career Programmes</h3>
                                        <p className="box-text">Every course is designed around real workplace needs, not generic online-course filler — built by people with genuine international experience.</p>
                                    </div>
                                </div>
                                <div className="btn-wrap mt-40 th_fade_anim">
                                    <a href="about.html" className="th-btn">MORE ABOUT US
                                        <svg className="ms-2" width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M7.5264 0C7.5264 0.6962 8.21633 1.738 8.9138 2.61293C9.81193 3.7394 10.8838 4.72347 12.1137 5.4748C13.0351 6.0374 14.154 6.57747 15.0528 6.57747M7.5264 13.1712C7.5264 12.475 8.21633 11.4332 8.9138 10.5583C9.81193 9.43187 10.8838 8.44773 12.1137 7.6964C13.0351 7.1338 14.154 6.59373 15.0528 6.59373M15.0528 6.5856H0" stroke="currentColor" strokeWidth="1.5"></path>
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="container">
                    <div className="row gy-4 justify-content-center">
                        <div className="col-xl-4 col-md-6 d-flex th_fade_anim">
                            <div className="about-info-wrap11">
                                <div className="box-icon">
                                    <img src="/assets/img/icon/about-card-icon11-1.svg" alt="img" />
                                </div>
                                <div className="box-details">
                                    <h3 className="box-title"><span className="text-theme">Free</span> Online Training</h3>
                                    <p className="box-text">All our courses are currently free, with more programmes coming soon.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-4 col-md-6 d-flex th_fade_anim">
                            <div className="about-info-wrap11">
                                <div className="box-icon">
                                    <img src="/assets/img/icon/about-card-icon11-2.svg" alt="img" />
                                </div>
                                <div className="box-details">
                                    <h3 className="box-title"><span className="text-theme">Global</span> Country Guides</h3>
                                    <p className="box-text">Practical guides to living and working in countries around the world.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-4 col-md-6 d-flex th_fade_anim">
                            <div className="about-info-wrap11">
                                <div className="box-icon">
                                    <img src="/assets/img/icon/about-card-icon11-3.svg" alt="img" />
                                </div>
                                <div className="box-details">
                                    <h3 className="box-title"><span className="text-theme">Verified</span> Job Listings</h3>
                                    <p className="box-text">Browse verified international vacancies and apply directly on the employer&apos;s own website.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>




            
            <section className="space bg-smoke3 overflow-hidden" id="course-sec">
                <div className="course-bg-shape7-1 shape-mockup" data-speed="0.9" data-left="6%" data-bottom="30%">
                    <div className="thumb">
                    </div>
                </div>
                <div className="course-bg-shape7-2 shape-mockup th_fade_anim" data-speed="1.08" data-right="3%" data-top="30%">
                </div>
                <div className="container">
                    <div className="row justify-content-center align-items-center">
                        <div className="col-lg-7">
                            <div className="title-area text-center">
                                <span className="sub-title text-theme th_fade_anim"><img src="/assets/img/icon/subtitle-icon1-6.svg" alt="img" />Our Courses</span>
                                <h2 className="sec-title th_fade_anim"><span className="th-text-perspective">Our Featured Courses</span></h2>
                                {/* Cards: components/courses/CourseCard.tsx (no prices, lesson or student
                                    counts, or ratings; "Free" label per course, see showFreeLabel). */}
                            </div>
                        </div>
                    </div>
                    <div className="slider-area">
                        <div className="swiper th-slider course-slider11 has-shadow" id="CourseSlider11" data-slider-options='{"loop": false, "autoplay": {"enabled": false}, "autoHeight": "true","breakpoints":{"0":{"slidesPerView":1},"576":{"slidesPerView":"1"},"768":{"slidesPerView":"2"},"992":{"slidesPerView":"2"},"1200":{"slidesPerView":"3"}}}'>
                            <div className="swiper-wrapper">
                                {/* The new course cards (free, with launch countdowns) from
                                    components/courses/CourseCard.tsx, inside the original slider.
                                    Order and launch dates come from lib/courses-catalog.ts; the
                                    Online Teaching & Tutoring course is first and open now. */}
                                {realCourses.map((course, i) => (
                                    <div className="swiper-slide th_fade_anim" data-delay={[".3", ".5", ".7", ".3", ".5", ".7"][i] ?? ".3"} key={course.slug}>
                                        <CourseCard course={course} />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button data-slider-prev="#CourseSlider11" className="slider-arrow style9 slider-prev">
                            <svg width="17" height="15" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8.4672 0C8.4672 0.783225 7.69103 1.95525 6.90638 2.93955C5.89598 4.20682 4.69013 5.3139 3.30645 6.15915C2.26988 6.79208 1.01115 7.39965 1.90735e-06 7.39965M8.4672 14.8176C8.4672 14.0344 7.69103 12.8623 6.90638 11.878C5.89598 10.6108 4.69013 9.5037 3.30645 8.65845C2.26988 8.02552 1.01115 7.41795 1.90735e-06 7.41795M1.90735e-06 7.4088H16.9344" stroke="currentColor"  />
                            </svg>
                        </button>
                        <button data-slider-next="#CourseSlider11" className="slider-arrow style9 slider-next">
                            <svg width="17" height="15" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8.4672 0C8.4672 0.783225 9.24338 1.95525 10.028 2.93955C11.0384 4.20682 12.2443 5.3139 13.628 6.15915C14.6645 6.79208 15.9233 7.39965 16.9344 7.39965M8.4672 14.8176C8.4672 14.0344 9.24338 12.8623 10.028 11.878C11.0384 10.6108 12.2443 9.5037 13.628 8.65845C14.6645 8.02552 15.9233 7.41795 16.9344 7.41795M16.9344 7.4088H0" stroke="currentColor"  />
                            </svg>
                        </button>
                    </div>
                </div>
            </section>


            
            <div className="overflow-hidden bg-theme">
                <div className="container">
                    <div className="counter-wrap1 bg-theme th_fade_anim p-lg-0">
                        <div className="counter-card">
                            <div className="media-body">
                                <h2 className="box-number text-white">Free</h2>
                                <p className="box-text">Courses to Start Today</p>
                            </div>
                        </div>
                        <div className="divider"></div>
                        <div className="counter-card">
                            <div className="media-body">
                                <h2 className="box-number text-white">Online</h2>
                                <p className="box-text">Learn From Anywhere</p>
                            </div>
                        </div>
                        <div className="divider"></div>
                        <div className="counter-card">
                            <div className="media-body">
                                <h2 className="box-number text-white">Global</h2>
                                <p className="box-text">Career Opportunities</p>
                            </div>
                        </div>
                        <div className="divider"></div>
                        <div className="counter-card">
                            <div className="media-body">
                                <h2 className="box-number text-white">Direct</h2>
                                <p className="box-text">Applications to Employers</p>
                            </div>
                        </div>
                        <div className="divider"></div>
                    </div>
                </div>
            </div>
            
            <section className="space overflow-hidden">
                <div className="container">
                    <div className="row justify-content-between flex-row-reverse">
                        <div className="col-xl-7">
                            <div className="why-img-box10 th_fade_anim">
                                <div className="img1">
                                    <div className="why-img-shape" data-mask-src="/assets/img/normal/why-thumb-mask10-1.png">
                                        <div className="why-img-shape-line" data-mask-src="/assets/img/normal/why-thumb-mask10-1.png"></div>
                                    </div>
                                    <div className="thumb" data-mask-src="/assets/img/normal/why-thumb-mask10-1.png">
                                        <img src="/assets/Why-choose-section.jpeg" alt="Student holding books" />
                                    </div>
                                    <div className="why-info-card11-1 jump">
                                        {/* Replaces the template image "275k+ Assigned Students" (unverified figure). */}
                                        <div className="wta-badge">
                                            <img src="/assets/img/hero/wta-badge-icon.png" alt="" width={56} height={56} />
                                            <div><strong>Free</strong><span>Online training</span></div>
                                        </div>
                                    </div>
                                    <div className="why-info-card11-2 jump-reverse">
                                        {/* Replaces the template image "User Experience Class, Today at 12.00 PM" (not a real session). */}
                                        <div className="wta-badge wta-badge--wide">
                                            <img src="/assets/img/hero/wta-badge-icon.png" alt="" width={56} height={56} />
                                            <div><strong>Online Teaching &amp; Tutoring</strong><span>Free — enrolment open now</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-5">
                            <div className="title-area mb-50">
                                <span className="sub-title text-theme th_fade_anim"><img src="/assets/img/icon/subtitle-icon1-6.svg" alt="img" />Why Choose World Teachers Academy</span>
                                <h2 className="sec-title th_fade_anim"><span className="th-text-perspective">Learn From Real-World Experience</span></h2>
                                <p className="th_fade_anim">Every course here is built by professionals who have genuinely lived and worked abroad — not a generic curriculum written by people who never have. That&apos;s the difference between a certificate and real preparation.</p>
                                <div className="btn-wrap mt-40 th_fade_anim">
                                    <a href="about.html" className="th-btn">Get Started
                                        <svg className="ms-2" width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M7.5264 0C7.5264 0.6962 8.21633 1.738 8.9138 2.61293C9.81193 3.7394 10.8838 4.72347 12.1137 5.4748C13.0351 6.0374 14.154 6.57747 15.0528 6.57747M7.5264 13.1712C7.5264 12.475 8.21633 11.4332 8.9138 10.5583C9.81193 9.43187 10.8838 8.44773 12.1137 7.6964C13.0351 7.1338 14.154 6.59373 15.0528 6.59373M15.0528 6.5856H0" stroke="currentColor" strokeWidth="1.5"></path>
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="why-wrap10">
                        <div className="why-card10 th_fade_anim">
                            <div className="why-card-bg"><img src="/assets/img/normal/certification-card-image.jpg" alt="Certified student" /></div>
                            <div className="box-icon">
                                <img src="/assets/img/icon/why-card-icon10-1.svg" alt="img" />
                            </div>
                            <h3 className="box-title">Recognized Certification</h3>
                            <p className="box-text">Credentials that employers and recruiters actually trust.</p>
                        </div>
                        <div className="why-card10 th_fade_anim">
                            <div className="box-icon">
                                <img src="/assets/img/icon/why-card-icon10-2.svg" alt="img" />
                            </div>
                            <h3 className="box-title">Certified Trainers</h3>
                            <p className="box-text">Learn from trainers with real international experience, not just theory.</p>
                        </div>
                        <div className="why-card10 th_fade_anim">
                            <div className="box-icon">
                                <img src="/assets/img/icon/why-card-icon10-3.svg" alt="img" />
                            </div>
                            <h3 className="box-title">Direct Job Access</h3>
                            <p className="box-text">Finish your certification and go straight to real job listings — no separate site, no waiting.</p>
                        </div>
                        <div className="why-card10 th_fade_anim">
                            <div className="why-card-bg"><img src="/assets/img/normal/support-card-image.jpg" alt="Supported student" /></div>
                            <div className="box-icon">
                                <img src="/assets/img/icon/why-card-icon10-4.svg" alt="img" />
                            </div>
                            <h3 className="box-title">Support That Doesn&apos;t Disappear</h3>
                            <p className="box-text">Real help before, during, and after certification.</p>
                        </div>
                    </div>
                </div>
            </section>
            {/* Job Portal section — commented out (disabled via SHOW_JOB_PORTAL) rather than deleted, in case it's needed again later */}
            {SHOW_JOB_PORTAL && (
            <section className="space overflow-hidden job-portal-sec" id="job-portal-sec">
                <div className="container">
                    <div className="row gy-50 gx-80 align-items-center">
                        <div className="col-lg-6">
                            <div className="jp-visual th_fade_anim">
                                <span className="jp-deco" aria-hidden="true" />
                                <span className="jp-card" aria-hidden="true" />
                                {/* Cutout generated from about-job-portal-346x580.png by scripts/cutout-job-portal.cjs. TODO: source is only 346px wide — swap in a higher-res photo for sharper high-DPI rendering when available. */}
                                <img className="jp-girl" src="/assets/img/normal/job-portal-cutout.png" alt="Professional thinking about her next job" width={341} height={492} />
                                {jobStats.openRoles !== null && (
                                    <div className="jp-chip jp-chip--roles">
                                        <span className="jp-chip-icon">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2.5" stroke="currentColor" strokeWidth="2" /><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 12.5h18" stroke="currentColor" strokeWidth="2" /></svg>
                                        </span>
                                        <span><strong>{jobStats.openRoles.toLocaleString("en-US")}+</strong> open roles</span>
                                    </div>
                                )}
                                {jobStats.countries !== null && (
                                    <div className="jp-chip jp-chip--countries">
                                        <span className="jp-chip-icon">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" /><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" stroke="currentColor" strokeWidth="2" /></svg>
                                        </span>
                                        <span>Jobs in <strong>{jobStats.countries}</strong> {jobStats.countries === 1 ? "country" : "countries"}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="jp-content">
                                <div className="title-area mb-0">
                                    <span className="sub-title text-theme th_fade_anim"><img src="/assets/img/icon/subtitle-icon1-6.svg" alt="img" />Job Portal</span>
                                    <h2 className="sec-title th_fade_anim"><span className="th-text-perspective">Certified? Your Next Job Abroad Is Already Listed</span></h2>
                                    <p className="th_fade_anim">Browse verified positions across multiple countries — updated regularly, with direct application links.</p>
                                </div>
                                <ul className="jp-features th_fade_anim">
                                    <li><span className="jp-check"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2.5 6.2 5 8.5l4.5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></span>Roles pulled from official job boards</li>
                                    <li><span className="jp-check"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2.5 6.2 5 8.5l4.5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></span>Listings refreshed daily, expired ones removed</li>
                                    <li><span className="jp-check"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2.5 6.2 5 8.5l4.5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></span>Apply on the original job listing</li>
                                </ul>
                                <div className="btn-wrap jp-actions th_fade_anim">
                                    <a href="/job-portal" className="th-btn">Browse Open Positions
                                        <svg className="ms-2" width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M7.5264 0C7.5264 0.6962 8.21633 1.738 8.9138 2.61293C9.81193 3.7394 10.8838 4.72347 12.1137 5.4748C13.0351 6.0374 14.154 6.57747 15.0528 6.57747M7.5264 13.1712C7.5264 12.475 8.21633 11.4332 8.9138 10.5583C9.81193 9.43187 10.8838 8.44773 12.1137 7.6964C13.0351 7.1338 14.154 6.59373 15.0528 6.59373M15.0528 6.5856H0" stroke="currentColor" strokeWidth="1.5"></path>
                                        </svg>
                                    </a>
                                    <a href="/job-portal" className="jp-link">See jobs by country <span aria-hidden="true">→</span></a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            )}

            {/* Promotional banner (owner-approved reference, 13 Nov 2026). Text and buttons are HTML;
                the professionals are one separate image extracted from the owner's reference. */}
            <section className="wta-journey-wrap" aria-labelledby="wta-journey-title">
                <div className="container">
                    <div className="wta-journey">
                        <div className="wta-journey__content">
                            <span className="wta-journey__eyebrow">YOUR GLOBAL JOURNEY STARTS HERE</span>
                            <h2 id="wta-journey-title">
                                Free Training. Global Opportunities.
                                <span>A Future Without Borders.</span>
                            </h2>
                            <p>
                                Whatever your profession or ambition, start preparing for opportunities at home and abroad.
                                Explore countries, understand international employment requirements, and build the skills
                                and confidence to take your career further.
                            </p>
                            <div className="wta-journey__actions">
                                <a href="/courses" className="wta-journey__btn wta-journey__btn--primary">EXPLORE FREE TRAINING <span aria-hidden="true">&rarr;</span></a>
                                <a href="/countries" className="wta-journey__btn wta-journey__btn--secondary">EXPLORE COUNTRIES <span aria-hidden="true">&rarr;</span></a>
                            </div>
                        </div>
                        <div className="wta-journey__image">
                            <picture>
                                <source type="image/webp" srcSet="/images/global-professionals-600.webp 591w, /images/global-professionals.webp 1182w" sizes="(min-width: 992px) 55vw, 100vw" />
                                <img src="/images/global-professionals.png" width={1182} height={724} loading="lazy" decoding="async"
                                    alt="Professionals from different industries preparing for international careers" />
                            </picture>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Events section — commented out (disabled via `false &&`) rather than deleted, in case it's needed again later */}
            {false && (
            <section className="space bg-smoke3 overflow-hidden">
                <div className="event-bg-shape3-1 shape-mockup th_fade_anim d-xxl-block d-none" data-speed="0.9" data-left="4%" data-top="10%">
                </div>
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-xxl-8 col-xl-9">
                            <div className="title-area text-center">
                                <span className="sub-title text-theme th_fade_anim"><img src="/assets/img/icon/subtitle-icon1-6.svg" alt="img" />Featured Events</span>
                                <h2 className="sec-title th_fade_anim"><span className="th-text-perspective">Our Upcoming Educational Events</span></h2>
                            </div>
                        </div>
                    </div>
                    <div className="row gy-4">
                        <div className="col-xl-6 th_fade_anim">
                            <div className="event-card">
                                <div className="box-img">
                                    <img src="/assets/img/event/event1-1.jpg" alt="event" />
                                </div>
                                <div className="box-content">
                                    <h3 className="box-title"><a href="event-details.html">What Soul Can Tech Us About Web Design</a></h3>
                                    <div className="event-meta-wrap">
                                        <span className="event-meta"><i className="fas fa-map-marker-alt"></i>Hilton Street, New York</span>
                                        <span className="event-meta"><i className="fas fa-clock"></i>8am - 10am</span>
                                    </div>
                                    <div className="event-speaker-wrap">
                                        <div className="box-thumb">
                                            <img src="/assets/img/event/event-thumb1-1.jpg" alt="img" />
                                        </div>
                                        <div className="event-speaker-details">
                                            <h4 className="speaker-name">David Smith</h4>
                                            <p className="speaker-desig">Chief - Executive</p>
                                        </div>
                                    </div>
                                    <a href="event-details.html" className="th-btn btn-sm">JOIN WITH US
                                        <svg className="ms-2" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M7.99997 1.41455C7.99997 2.11075 8.68991 3.15255 9.38737 4.02748C10.2855 5.15395 11.3574 6.13802 12.5873 6.88935C13.5087 7.45195 14.6276 7.99202 15.5264 7.99202M7.99997 14.5858C7.99997 13.8896 8.68991 12.8477 9.38737 11.9728C10.2855 10.8464 11.3574 9.86228 12.5873 9.11095C13.5087 8.54835 14.6276 8.00828 15.5264 8.00828M15.5264 8.00015H0.473572" stroke="currentColor" strokeWidth="1.5"  />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="col-xl-6 th_fade_anim">
                            <div className="event-card">
                                <div className="box-img">
                                    <img src="/assets/img/event/event1-2.jpg" alt="event" />
                                </div>
                                <div className="box-content">
                                    <h3 className="box-title"><a href="event-details.html">The Future of User Experience</a></h3>
                                    <div className="event-meta-wrap">
                                        <span className="event-meta"><i className="fas fa-map-marker-alt"></i>Broadway Avenue, Usa</span>
                                        <span className="event-meta"><i className="fas fa-clock"></i>10am - 12pm</span>
                                    </div>
                                    <div className="event-speaker-wrap">
                                        <div className="box-thumb">
                                            <img src="/assets/img/event/event-thumb1-1.jpg" alt="img" />
                                        </div>
                                        <div className="event-speaker-details">
                                            <h4 className="speaker-name">Emily Johnson</h4>
                                            <p className="speaker-desig">UX Designer</p>
                                        </div>
                                    </div>
                                    <a href="event-details.html" className="th-btn btn-sm">JOIN WITH US
                                        <svg className="ms-2" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M7.99997 1.41455C7.99997 2.11075 8.68991 3.15255 9.38737 4.02748C10.2855 5.15395 11.3574 6.13802 12.5873 6.88935C13.5087 7.45195 14.6276 7.99202 15.5264 7.99202M7.99997 14.5858C7.99997 13.8896 8.68991 12.8477 9.38737 11.9728C10.2855 10.8464 11.3574 9.86228 12.5873 9.11095C13.5087 8.54835 14.6276 8.00828 15.5264 8.00828M15.5264 8.00015H0.473572" stroke="currentColor" strokeWidth="1.5"  />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="col-xl-6 th_fade_anim">
                            <div className="event-card">
                                <div className="box-img">
                                    <img src="/assets/img/event/event1-3.jpg" alt="event" />
                                </div>
                                <div className="box-content">
                                    <h3 className="box-title"><a href="event-details.html">Innovations in Responsive Design</a></h3>
                                    <div className="event-meta-wrap">
                                        <span className="event-meta"><i className="fas fa-map-marker-alt"></i>Market Street, Chicago</span>
                                        <span className="event-meta"><i className="fas fa-clock"></i>1pm - 3pm</span>
                                    </div>
                                    <div className="event-speaker-wrap">
                                        <div className="box-thumb">
                                            <img src="/assets/img/event/event-thumb1-1.jpg" alt="img" />
                                        </div>
                                        <div className="event-speaker-details">
                                            <h4 className="speaker-name">Michael Brown</h4>
                                            <p className="speaker-desig">Lead Developer</p>
                                        </div>
                                    </div>
                                    <a href="event-details.html" className="th-btn btn-sm">JOIN WITH US
                                        <svg className="ms-2" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M7.99997 1.41455C7.99997 2.11075 8.68991 3.15255 9.38737 4.02748C10.2855 5.15395 11.3574 6.13802 12.5873 6.88935C13.5087 7.45195 14.6276 7.99202 15.5264 7.99202M7.99997 14.5858C7.99997 13.8896 8.68991 12.8477 9.38737 11.9728C10.2855 10.8464 11.3574 9.86228 12.5873 9.11095C13.5087 8.54835 14.6276 8.00828 15.5264 8.00828M15.5264 8.00015H0.473572" stroke="currentColor" strokeWidth="1.5"  />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="col-xl-6 th_fade_anim">
                            <div className="event-card">
                                <div className="box-img">
                                    <img src="/assets/img/event/event1-1.jpg" alt="event" />
                                </div>
                                <div className="box-content">
                                    <h3 className="box-title"><a href="event-details.html">What Soul Can Tech Us About Web Design</a></h3>
                                    <div className="event-meta-wrap">
                                        <span className="event-meta"><i className="fas fa-map-marker-alt"></i>Hilton Street, New York</span>
                                        <span className="event-meta"><i className="fas fa-clock"></i>8am - 10am</span>
                                    </div>
                                    <div className="event-speaker-wrap">
                                        <div className="box-thumb">
                                            <img src="/assets/img/event/event-thumb1-1.jpg" alt="img" />
                                        </div>
                                        <div className="event-speaker-details">
                                            <h4 className="speaker-name">David Smith</h4>
                                            <p className="speaker-desig">Chief - Executive</p>
                                        </div>
                                    </div>
                                    <a href="event-details.html" className="th-btn btn-sm">JOIN WITH US
                                        <svg className="ms-2" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M7.99997 1.41455C7.99997 2.11075 8.68991 3.15255 9.38737 4.02748C10.2855 5.15395 11.3574 6.13802 12.5873 6.88935C13.5087 7.45195 14.6276 7.99202 15.5264 7.99202M7.99997 14.5858C7.99997 13.8896 8.68991 12.8477 9.38737 11.9728C10.2855 10.8464 11.3574 9.86228 12.5873 9.11095C13.5087 8.54835 14.6276 8.00828 15.5264 8.00828M15.5264 8.00015H0.473572" stroke="currentColor" strokeWidth="1.5"  />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
            )}

            {/*==============================
Video Testimonials Area
==============================*/}
            {/* Hidden until verified (B2): see SHOW_UNVERIFIED_TESTIMONIALS in lib/site.ts */}
            {SHOW_UNVERIFIED_TESTIMONIALS && (
            <section className="space overflow-hidden" id="video-testi-sec">
                <div className="container">
                    <div className="title-area text-center">
                        <span className="sub-title text-theme th_fade_anim"><img src="/assets/img/icon/subtitle-icon1-1.svg" alt="img" />Student Stories</span>
                        <h2 className="sec-title th_fade_anim"><span className="th-text-perspective">Don&apos;t Take Our Word For It — Hear From Our Students</span></h2>
                    </div>
                    <VideoTestimonials />
                </div>
            </section>
            )}

            <section className="testi-area-1 space overflow-hidden" id="testi-sec">
                <div className="testi-bg-shape8-1 shape-mockup th_fade_anim d-xxl-block d-none" data-speed="0.9" data-left="6%" data-top="7%">
                </div>
                <div className="container">
                    <div className="row gy-40 gx-80">
                        {SHOW_UNVERIFIED_TESTIMONIALS && (
                        <div className="col-xl-6">
                            <TextTestimonials />
                        </div>
                        )}
                        <div className={SHOW_UNVERIFIED_TESTIMONIALS ? "col-xl-6" : "col-xl-8 col-lg-10 mx-auto"}>
                            
                            <div className="contact-form contact-form-4 th_fade_anim" id="contact-sec">
                                {/* B1 (13 Nov 2026): the template form posted to mail.php, which does not
                                    exist, so every submission was lost. It stays switched off (markup kept
                                    below) until a tested backend is approved. Nothing is collected. */}
                                {SHOW_RESOURCE_SIGNUP_FORM ? (
                                <form action="mail.php" method="POST" className="contact-form ajax-contact">
                                    <div className="title-area">
                                        <span className="sub-title text-theme"><img src="/assets/img/icon/subtitle-icon1-6.svg" alt="img" />Get In Touch</span>
                                        <h2 className="sec-title"><span className="th-text-perspective">Sign Up For Free Resources</span></h2>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 form-group style-border3">
                                            <input type="text" placeholder="Your Name" className="form-control" />
                                            <i className="fal fa-user"></i>
                                        </div>
                                        <div className="col-md-6 form-group style-border3">
                                            <input type="text" placeholder="Your Email" className="form-control" />
                                            <i className="fal fa-envelope"></i>
                                        </div>
                                        <div className="col-md-6 form-group style-border3">
                                            <input type="number" className="form-control" name="number" id="number" placeholder="Phone Number" />
                                            <i className="fal fa-phone-alt"></i>
                                        </div>
                                        <div className="col-md-6 form-group style-border3">
                                            <select name="subject" id="subject" className="form-select" defaultValue="">
                                                <option value="" disabled hidden>Select Subjects</option>
                                                <option value="Software Development">Software Development</option>
                                                <option value="Website Development">Website Development</option>
                                                <option value="Digital Marketing">Digital Marketing</option>
                                                <option value="Business Management">Business Management</option>
                                            </select>
                                            <i className="fal fa-chevron-down"></i>
                                        </div>
                                        <div className="col-12 form-group style-border3">
                                            <textarea name="message" id="message" cols={30} rows={3} className="form-control" placeholder="Write Message...."></textarea>
                                            <i className="fal fa-pencil"></i>
                                        </div>
                                        <div className="form-btn mt-15 col-12">
                                            <button className="th-btn">SEND MESSAGE
                                                <svg className="ms-2" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <g clipPath="url(#clip0_458_9379)">
                                                        <path d="M14.0331 2.03512C12.5811 0.471411 1.65895 4.30197 1.66797 5.7005C1.6782 7.28644 5.93336 7.7743 7.11277 8.10524C7.82203 8.30417 8.01197 8.50817 8.1755 9.2519C8.91617 12.6202 9.28803 14.2955 10.1356 14.3329C11.4865 14.3926 15.4502 3.56117 14.0331 2.03512Z" fill="transparent" stroke="currentColor" strokeWidth="1.5"></path>
                                                        <path d="M7.66797 8.33333L10.0013 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                                    </g>
                                                    <defs>
                                                        <clipPath id="clip0_458_9379">
                                                            <rect width="16" height="16" fill="currentColor"></rect>
                                                        </clipPath>
                                                    </defs>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    <p className="form-messages mb-0 mt-3"></p>
                                </form>
                                ) : (
                                <div className="wta-signup-soon">
                                    <div className="title-area mb-0">
                                        <span className="sub-title text-theme"><img src="/assets/img/icon/subtitle-icon1-6.svg" alt="" />Free Resources</span>
                                        <h2 className="sec-title">Free Resource Sign-Up Opens Soon</h2>
                                    </div>
                                    <p className="wta-signup-soon__text">We&apos;re setting up our free resources mailing list and aren&apos;t collecting sign-ups yet. Until it opens, all of our free guides and country information are available without signing up.</p>
                                    <div className="wta-signup-soon__actions">
                                        <a href="/resources" className="th-btn">Browse Free Resources</a>
                                        <a href="/countries" className="th-btn style-border2">Explore Country Guides</a>
                                    </div>
                                </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            
            {/* News & Blog section — commented out per request (keep markup, don't delete). */}
            {/*
            <section className="space-bottom overflow-hidden" id="blog-sec">
                <div className="container">
                    <div className="row justify-content-lg-between justify-content-center align-items-center">
                        <div className="col-lg-7">
                            <div className="title-area text-lg-start text-center">
                                <span className="sub-title text-theme th_fade_anim"><img src="/assets/img/icon/subtitle-icon1-6.svg" alt="img" />News & Blog</span>
                                <h2 className="sec-title th_fade_anim"><span className="th-text-perspective">Our Latest News & Blog</span></h2>
                            </div>
                        </div>
                        <div className="col-auto">
                            <div className="sec-btn th_fade_anim">
                                <a href="blog.html" className="th-btn">VIEW ALL POST<svg className="ms-2" width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M7.5264 0C7.5264 0.6962 8.21633 1.738 8.9138 2.61293C9.81193 3.7394 10.8838 4.72347 12.1137 5.4748C13.0351 6.0374 14.154 6.57747 15.0528 6.57747M7.5264 13.1712C7.5264 12.475 8.21633 11.4332 8.9138 10.5583C9.81193 9.43187 10.8838 8.44773 12.1137 7.6964C13.0351 7.1338 14.154 6.59373 15.0528 6.59373M15.0528 6.5856H0" stroke="currentColor" strokeWidth="1.5"></path>
                                    </svg></a>
                            </div>
                        </div>
                    </div>

                    <div className="slider-area">
                        <div className="swiper th-slider has-shadow" id="blogSlider1" data-slider-options='{"breakpoints":{"0":{"slidesPerView":1},"576":{"slidesPerView":"1"},"768":{"slidesPerView":"2"},"992":{"slidesPerView":"3"},"1200":{"slidesPerView":"3"}}, "autoHeight": "true"}'>
                            <div className="swiper-wrapper">
                                <div className="swiper-slide th_fade_anim th--hover-item" data-delay=".3">
                                    <div className="blog-card">
                                        <div className="blog-img">
                                            <a className="th--hover-img" href="blog-details.html" data-displacement="/assets/img/imghover/fluid.jpg" data-intensity="0.2" data-speedin="1" data-speedout="1"><img src="/assets/img/blog/blog_1_1.jpg" alt="Blog Image" /></a>
                                            <a className="blog-date" href="blog.html">20<span className="year">Jan, 2026</span></a>
                                        </div>
                                        <div className="blog-content">
                                            <div className="blog-meta">
                                                <a href="blog.html">Learning</a><a href="blog.html">Education</a>
                                            </div>
                                            <h2 className="box-title"><a href="blog-details.html">The Power of Education: Unlocking Your Best True Potential</a></h2>
                                            <a href="blog-details.html" className="th-btn style4 btn-sm">READ MORE<svg className="ms-2" width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M7.5264 0C7.5264 0.6962 8.21633 1.738 8.9138 2.61293C9.81193 3.7394 10.8838 4.72347 12.1137 5.4748C13.0351 6.0374 14.154 6.57747 15.0528 6.57747M7.5264 13.1712C7.5264 12.475 8.21633 11.4332 8.9138 10.5583C9.81193 9.43187 10.8838 8.44773 12.1137 7.6964C13.0351 7.1338 14.154 6.59373 15.0528 6.59373M15.0528 6.5856H0" stroke="currentColor" strokeWidth="1.5"  />
                                                </svg></a>
                                        </div>
                                    </div>
                                </div>

                                <div className="swiper-slide th_fade_anim th--hover-item" data-delay=".5">
                                    <div className="blog-card">
                                        <div className="blog-img">
                                            <a className="th--hover-img" href="blog-details.html" data-displacement="/assets/img/imghover/fluid.jpg" data-intensity="0.2" data-speedin="1" data-speedout="1"><img src="/assets/img/blog/blog_1_2.jpg" alt="Blog Image" /></a>
                                            <a className="blog-date" href="blog.html">15<span className="year">Feb, 2026</span></a>
                                        </div>
                                        <div className="blog-content">
                                            <div className="blog-meta">
                                                <a href="blog.html">Innovation</a><a href="blog.html">Technology</a>
                                            </div>
                                            <h2 className="box-title"><a href="blog-details.html">Embracing Innovation: Transforming Ideas into Reality</a></h2>
                                            <a href="blog-details.html" className="th-btn style4 btn-sm">READ MORE<svg className="ms-2" width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M7.5264 0C7.5264 0.6962 8.21633 1.738 8.9138 2.61293C9.81193 3.7394 10.8838 4.72347 12.1137 5.4748C13.0351 6.0374 14.154 6.57747 15.0528 6.57747M7.5264 13.1712C7.5264 12.475 8.21633 11.4332 8.9138 10.5583C9.81193 9.43187 10.8838 8.44773 12.1137 7.6964C13.0351 7.1338 14.154 6.59373 15.0528 6.59373M15.0528 6.5856H0" stroke="currentColor" strokeWidth="1.5"  />
                                                </svg></a>
                                        </div>
                                    </div>
                                </div>

                                <div className="swiper-slide th_fade_anim th--hover-item" data-delay=".7">
                                    <div className="blog-card">
                                        <div className="blog-img">
                                            <a className="th--hover-img" href="blog-details.html" data-displacement="/assets/img/imghover/fluid.jpg" data-intensity="0.2" data-speedin="1" data-speedout="1"><img src="/assets/img/blog/blog_1_3.jpg" alt="Blog Image" /></a>
                                            <a className="blog-date" href="blog.html">18<span className="year">Feb, 2026</span></a>
                                        </div>
                                        <div className="blog-content">
                                            <div className="blog-meta">
                                                <a href="blog.html">Wellness</a><a href="blog.html">Health</a>
                                            </div>
                                            <h2 className="box-title"><a href="blog-details.html">The Importance of Wellness: Nurturing Your Mind and Body</a></h2>
                                            <a href="blog-details.html" className="th-btn style4 btn-sm">READ MORE<svg className="ms-2" width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M7.5264 0C7.5264 0.6962 8.21633 1.738 8.9138 2.61293C9.81193 3.7394 10.8838 4.72347 12.1137 5.4748C13.0351 6.0374 14.154 6.57747 15.0528 6.57747M7.5264 13.1712C7.5264 12.475 8.21633 11.4332 8.9138 10.5583C9.81193 9.43187 10.8838 8.44773 12.1137 7.6964C13.0351 7.1338 14.154 6.59373 15.0528 6.59373M15.0528 6.5856H0" stroke="currentColor" strokeWidth="1.5"  />
                                                </svg></a>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </section>
            */}

            {/*==============================
FAQ Area
==============================*/}
            <div className="space overflow-hidden">
                <div className="faq-bg-shape4-1 d-xxl-block d-none shape-mockup th_fade_anim" data-speed="0.9" data-left="4%" data-top="10%">
                </div>
                <div className="faq-bg-shape4-2 d-xxl-block d-none shape-mockup th_fade_anim" data-speed="0.9" data-right="0%" data-bottom="5%">
                    <img src="/assets/img/shape/faq_shape4_1.png" alt="img" />
                </div>
                <div className="container">
                    <div className="row gy-40">
                        <div className="col-xl-6">
                            <div className="faq-img-box1">
                                <div className="faq-side">
                                <div className="img1 th--hover-item th_fade_anim">
                                    <div className="thumb th--hover-img" data-displacement="/assets/img/imghover/fluid.jpg" data-intensity="0.2" data-speedin="1" data-speedout="1">
                                        <img className="img-cover" src="/assets/img/normal/faq-1-mentor-desk.png" alt="Professional at his desk with a certificate" />
                                    </div>
                                </div>
                                <div className="faq-counter-wrap jump">
                                    <div className="thumb">
                                        <img src="/assets/img/normal/faq-3-notes.jpg" alt="Handwritten notes beside a stack of books" />
                                    </div>
                                    <div className="box-details">
                                        <h3 className="box-title">Free</h3>
                                        <p className="box-text">Courses open now</p>
                                    </div>
                                </div>
                                </div>
                                <div className="img2 th--hover-item th_fade_anim">
                                    <div className="thumb th--hover-img" data-displacement="/assets/img/imghover/fluid.jpg" data-intensity="0.2" data-speedin="1" data-speedout="1">
                                        <img className="img-cover" src="/assets/img/normal/faq-2-teacher.jpg" alt="Smiling professional at her desk with a certificate" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-6">
                            <div className="faq-wrap1">
                                <div className="title-area">
                                    <span className="sub-title text-theme th_fade_anim"><img src="/assets/img/icon/subtitle-icon1-6.svg" alt="" />FAQs</span>
                                    <h2 className="sec-title th_fade_anim"><span className="th-text-perspective">Frequently Asked Questions</span></h2>
                                </div>
                                <div className="accordion" id="faqAccordion">
                                    {/* Owner-approved wording, 13 Nov 2026 (B6). Keep in step with /faqs. */}
                                    {HOME_FAQS.map((item, i) => (
                                    <div className="accordion-card style2 th_fade_anim" key={item.q}>
                                        <div className="accordion-header" id={`collapse-item-${i + 1}`}>
                                            <button className={`accordion-button${i === 0 ? "" : " collapsed"}`} type="button" data-bs-toggle="collapse" data-bs-target={`#collapse-${i + 1}`} aria-expanded={i === 0} aria-controls={`collapse-${i + 1}`}>{item.q}</button>
                                        </div>
                                        <div id={`collapse-${i + 1}`} className={`accordion-collapse collapse${i === 0 ? " show" : ""}`} data-bs-parent="#faqAccordion">
                                            <div className="accordion-body">
                                                <p className="faq-text">{item.a}</p>
                                            </div>
                                        </div>
                                    </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    </>
  );
}

// Homepage category cards (owner-approved design, 12 Nov 2026): three themes,
// mixed order so every view of the slider shows teaching, career and abroad.
// Each card links to a real page, or shows "Coming soon" when its page doesn't
// exist yet (never a template placeholder page).
type CategoryTheme = "teaching" | "career" | "abroad";
const THEME_LABEL: Record<CategoryTheme, string> = { teaching: "TEACHING", career: "CAREER", abroad: "ABROAD" };
const CATEGORY_CARDS: { title: string; text: string; href: string | null; icon: IconName; theme: CategoryTheme }[] = [
  { title: "TEFL / TESOL Certification", text: "Build the skills to teach English locally or internationally.", href: "/courses?q=TEFL", icon: "language", theme: "teaching" },
  { title: "Working Abroad", text: "Explore countries, work requirements and life overseas.", href: "/countries", icon: "globe", theme: "abroad" },
  { title: "Career Readiness", text: "Prepare your CV, interviews and professional skills for global opportunities.", href: "/resources", icon: "briefcase", theme: "career" },
  { title: "Online Teaching & Tutoring", text: "Learn to teach and tutor students from anywhere.", href: "/courses?q=Online", icon: "laptop", theme: "teaching" },
  { title: "International Job Search", text: "Discover international vacancies and apply directly to employers.", href: "/job-portal", icon: "search", theme: "abroad" },
  { title: "Digital Skills & Tools", text: "Develop practical digital skills for today\u2019s global workplace.", href: "/courses?q=Coding", icon: "code", theme: "career" },
];

type IconName = "language" | "globe" | "briefcase" | "laptop" | "search" | "code";
// One line-icon set: 48×48 grid, 1.8 stroke, round caps — same size and weight everywhere.
const ICON_PATHS: Record<IconName, React.ReactNode> = {
  language: (<><path d="M6 10h22a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H15l-6 5v-5H6a3 3 0 0 1-3-3V13a3 3 0 0 1 3-3z" /><path d="M34 18h8a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3h-3v5l-6-5h-9a3 3 0 0 1-3-3v-2" /><path d="M11 22l3.5-8 3.5 8M12.2 19.5h4.6" /></>),
  globe: (<><circle cx="22" cy="25" r="15" /><path d="M7 25h30M22 10c4.3 4.2 6.2 9.5 6.2 15S26.3 35.8 22 40c-4.3-4.2-6.2-9.5-6.2-15S17.7 14.2 22 10z" /><path d="M34 6l8 2.5-2.5 1.8 1.7 5-2.6.9-2.5-4.2-2.6 1.7-.9-2.6z" /></>),
  briefcase: (<><rect x="5" y="14" width="38" height="26" rx="4" /><path d="M17 14v-3a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v3" /><path d="M5 24h38" /><path d="M19 31l4 4 7-8" /></>),
  laptop: (<><rect x="6" y="9" width="36" height="24" rx="3" /><path d="M2 39h44" /><circle cx="24" cy="18" r="4" /><path d="M16 29c1.5-4 4.5-6 8-6s6.5 2 8 6" /></>),
  search: (<><path d="M12 5h16l8 8v28a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" /><path d="M28 5v8h8" /><path d="M16 20h12M16 26h8" /><circle cx="31" cy="32" r="6" /><path d="M35.5 36.5L42 43" /></>),
  code: (<><rect x="5" y="8" width="38" height="26" rx="3" /><path d="M17 41h14M24 34v7" /><path d="M19 17l-5 4 5 4M29 17l5 4-5 4M26 15l-4 12" /></>),
};

function CategoryIcon({ name }: { name: IconName }) {
  return (
    <svg viewBox="0 0 48 48" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICON_PATHS[name]}
    </svg>
  );
}

function CategoryArrow() {
  return (
    <svg width="17" height="15" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M8.4672 0C8.4672 0.783225 9.24338 1.95525 10.028 2.93955C11.0384 4.20682 12.2443 5.3139 13.628 6.15915C14.6645 6.79208 15.9233 7.39965 16.9344 7.39965M8.4672 14.8176C8.4672 14.0344 9.24338 12.8623 10.028 11.878C11.0384 10.6108 12.2443 9.5037 13.628 8.65845C14.6645 8.02552 15.9233 7.41795 16.9344 7.41795M16.9344 7.4088H0" stroke="currentColor" />
    </svg>
  );
}

// Homepage FAQ — owner-approved wording (13 Nov 2026, B6; "Are the courses
// free?" updated by the owner the same day: all eight courses are free). No certificate
// promises until the completion and certificate rules are confirmed.
const HOME_FAQS: { q: string; a: string }[] = [
  {
    q: "Do I need work experience to join a course?",
    a: "No. You can join our courses without previous work experience. Each course description explains who it is designed for, so check it before you enrol.",
  },
  {
    q: "Will my qualification be recognised abroad?",
    a: "Recognition of qualifications varies by country and by employer. Our Country Guides explain what each destination typically asks for, so check those requirements before you apply.",
  },
  {
    q: "How long are the courses?",
    a: "Our programmes range from 120 to 520 study hours: Professional Online Teaching & Tutoring (120 hours), TEFL Certificate (130), Diploma (320), Advanced Diploma (395) and TEFL Comprehensive (520). How long you take depends on how many hours a week you study. Study hours for Coding & Software Development, Business English and Supply Chain Management will be confirmed before those courses launch.",
  },
  {
    q: "Are the courses free?",
    a: "Yes. All eight World Teachers Academy courses are currently offered free of charge. Some courses are already available, while others will open for enrolment on their announced launch dates, subject to confirmation. Course availability and pricing may change in the future.",
  },
  {
    q: "Do you arrange visas, work permits or relocation?",
    a: "World Teachers Academy provides educational resources and career guidance. We do not arrange or guarantee visas, work permits, employment or relocation.",
  },
  {
    q: "Will you help me find a job?",
    a: "We provide Country Guides and career resources to help you explore international employment opportunities. Our updated Job Portal is being developed to make discovering opportunities easier. We do not guarantee employment or placement.",
  },
];
