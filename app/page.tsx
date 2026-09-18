import VideoTestimonials from "@/components/home/VideoTestimonials";
import HeroSearchForm from "@/components/home/HeroSearchForm";
import { realCourses } from "@/lib/courses-catalog";

export default function Home() {
  return (
    <>
            <div className="th-hero-wrapper hero-11" id="hero" data-bg-src="/assets/img/hero/hero_bg_11_1.png">
                <div className="hero-inner">
                    <div className="hero-bg-shape11-1 wow animate__fadeInUp">
                        <img src="/assets/img/hero/hero-bg-shape4-4.png" data-speed="0.8" alt="img" />
                    </div>
                    <div className="container">
                        <div className="row gy-50 flex-row-reverse">
                            <div className="col-lg-5">
                                <div className="hero-thumb11-1 wow animate__fadeInUp">
                                    <div className="thumb">
                                        <img src="/assets/hero-teacher.png" alt="World Teachers Academy student" />
                                    </div>
                                    <div className="about-tag">
                                        <div className="about-experience-tag">
                                            <span className="circle-title-anime">TRAIN. CERTIFY. TEACH ANYWHERE IN THE WORLD.BUILT BY TEACHERS, FOR TEACHERS, WORLDWIDE</span>
                                        </div>
                                    </div>
                                    <div className="hero-info-chart jump-reverse ">
                                        <img src="/assets/img/hero/hero_thumb3_2.png" alt="img" />
                                    </div>
                                    <div className="hero-thumb-info jump">
                                        {/* TODO: confirm real teacher-trained count — suggested replacement "320+ Teachers Trained" pending confirmation, or remove badge entirely if it crowds the image. */}
                                        <img src="/assets/img/hero/hero_thumb-info11_1.png" alt="img" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-7">
                                <div className="hero-style11">
                                    <div className="hero-subtitle wow animate__fadeInUp" data-wow-delay="0.2s">CERTIFY. TEACH. GET HIRED.</div>
                                    <h2 className="hero-title">
                                        <span className="title1 wow animate__fadeInUp" data-wow-delay="0.3s">Get Certified. Get Placed. Go Teach the World.</span>
                                    </h2>
                                    <p className="hero-text wow animate__fadeInUp" data-wow-delay="0.6s">
                                        Internationally recognised teaching certifications and a live directory of verified teaching jobs, in one place — so you&apos;re never juggling five different sites to build your career.
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
                                <div className="counter-card"><div className="media-body"><h2 className="box-number"><span className="counter-number">500</span>+</h2><p className="box-text">Teachers Certified</p></div></div>
                            </div>
                            <div className="col-6 col-md-3">
                                <div className="counter-card"><div className="media-body"><h2 className="box-number"><span className="counter-number">50</span>+</h2><p className="box-text">Partner Schools</p></div></div>
                            </div>
                            <div className="col-6 col-md-3">
                                <div className="counter-card"><div className="media-body"><h2 className="box-number"><span className="counter-number">20</span>+</h2><p className="box-text">Countries</p></div></div>
                            </div>
                            <div className="col-6 col-md-3">
                                <div className="counter-card"><div className="media-body"><h2 className="box-number"><span className="counter-number">150</span>+</h2><p className="box-text">Active Job Listings</p></div></div>
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
                                <h2 className="sec-title th_fade_anim"><span className="th-text-perspective">Browse Teaching Certifications & Training Programs</span></h2>
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
                        {/* TODO: add one supporting line per certification card once course names are finalized (e.g. under "TEFL / TESOL Certification": "Your first step to teaching abroad or online") */}
                        <div className="swiper th-slider has-shadow" id="categorySlider3" data-slider-options='{"breakpoints":{"0":{"slidesPerView":"1"},"526":{"slidesPerView":"2"},"768":{"slidesPerView":"3"},"991":{"slidesPerView":"4"},"1200":{"slidesPerView":"5"},"1400":{"slidesPerView":"5"}}}'>
                            <div className="swiper-wrapper">
                                <div className="swiper-slide th_fade_anim">
                                    <div className="category-card3" data-theme-color="#4F46E5" data-border="#A5B4FC">
                                        <div className="box-icon">
                                            <img src="/assets/img/icon/category/category3-1.svg" alt="Image" />
                                        </div>
                                        <h3 className="box-title"><a href="course.html">TEFL / TESOL <br /> Certification </a></h3>
                                        <a className="icon-btn style8" href="course-details.html">
                                            <svg width="17" height="15" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M8.4672 0C8.4672 0.783225 9.24338 1.95525 10.028 2.93955C11.0384 4.20682 12.2443 5.3139 13.628 6.15915C14.6645 6.79208 15.9233 7.39965 16.9344 7.39965M8.4672 14.8176C8.4672 14.0344 9.24338 12.8623 10.028 11.878C11.0384 10.6108 12.2443 9.5037 13.628 8.65845C14.6645 8.02552 15.9233 7.41795 16.9344 7.41795M16.9344 7.4088H0" stroke="currentColor"  />
                                            </svg>
                                        </a>
                                    </div>
                                </div>

                                <div className="swiper-slide th_fade_anim">
                                    <div className="category-card3" data-theme-color="#14B8A6" data-border="#5EEAD4">
                                        <div className="box-icon">
                                            <img src="/assets/img/icon/category/category3-2.svg" alt="Image" />
                                        </div>
                                        <h3 className="box-title"><a href="course.html">Classroom <br /> Management</a></h3>
                                        <a className="icon-btn style8" href="course-details.html">
                                            <svg width="17" height="15" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M8.4672 0C8.4672 0.783225 9.24338 1.95525 10.028 2.93955C11.0384 4.20682 12.2443 5.3139 13.628 6.15915C14.6645 6.79208 15.9233 7.39965 16.9344 7.39965M8.4672 14.8176C8.4672 14.0344 9.24338 12.8623 10.028 11.878C11.0384 10.6108 12.2443 9.5037 13.628 8.65845C14.6645 8.02552 15.9233 7.41795 16.9344 7.41795M16.9344 7.4088H0" stroke="currentColor"  />
                                            </svg>
                                        </a>
                                    </div>
                                </div>

                                <div className="swiper-slide th_fade_anim">
                                    <div className="category-card3" data-theme-color="#334155" data-border="#CBD5E1">
                                        <div className="box-icon">
                                            <img src="/assets/img/icon/category/category3-3.svg" alt="Image" />
                                        </div>
                                        <h3 className="box-title"><a href="course.html">Curriculum <br /> Design</a></h3>
                                        <a className="icon-btn style8" href="course-details.html">
                                            <svg width="17" height="15" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M8.4672 0C8.4672 0.783225 9.24338 1.95525 10.028 2.93955C11.0384 4.20682 12.2443 5.3139 13.628 6.15915C14.6645 6.79208 15.9233 7.39965 16.9344 7.39965M8.4672 14.8176C8.4672 14.0344 9.24338 12.8623 10.028 11.878C11.0384 10.6108 12.2443 9.5037 13.628 8.65845C14.6645 8.02552 15.9233 7.41795 16.9344 7.41795M16.9344 7.4088H0" stroke="currentColor"  />
                                            </svg>
                                        </a>
                                    </div>
                                </div>

                                <div className="swiper-slide th_fade_anim">
                                    <div className="category-card3" data-theme-color="#0F766E" data-border="#5EEAD4">
                                        <div className="box-icon">
                                            <img src="/assets/img/icon/category/category3-4.svg" alt="Image" />
                                        </div>
                                        <h3 className="box-title"><a href="course.html">Special Education <br /> Training</a></h3>
                                        <a className="icon-btn style8" href="course-details.html">
                                            <svg width="17" height="15" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M8.4672 0C8.4672 0.783225 9.24338 1.95525 10.028 2.93955C11.0384 4.20682 12.2443 5.3139 13.628 6.15915C14.6645 6.79208 15.9233 7.39965 16.9344 7.39965M8.4672 14.8176C8.4672 14.0344 9.24338 12.8623 10.028 11.878C11.0384 10.6108 12.2443 9.5037 13.628 8.65845C14.6645 8.02552 15.9233 7.41795 16.9344 7.41795M16.9344 7.4088H0" stroke="currentColor"  />
                                            </svg>
                                        </a>
                                    </div>
                                </div>

                                <div className="swiper-slide th_fade_anim">
                                    <div className="category-card3" data-theme-color="#F97316" data-border="#FDBA74">
                                        <div className="box-icon">
                                            <img src="/assets/img/icon/category/category3-5.svg" alt="Image" />
                                        </div>
                                        <h3 className="box-title"><a href="course.html">Digital Teaching <br /> Tools</a></h3>
                                        <a className="icon-btn style8" href="course-details.html">
                                            <svg width="17" height="15" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M8.4672 0C8.4672 0.783225 9.24338 1.95525 10.028 2.93955C11.0384 4.20682 12.2443 5.3139 13.628 6.15915C14.6645 6.79208 15.9233 7.39965 16.9344 7.39965M8.4672 14.8176C8.4672 14.0344 9.24338 12.8623 10.028 11.878C11.0384 10.6108 12.2443 9.5037 13.628 8.65845C14.6645 8.02552 15.9233 7.41795 16.9344 7.41795M16.9344 7.4088H0" stroke="currentColor"  />
                                            </svg>
                                        </a>
                                    </div>
                                </div>

                                <div className="swiper-slide th_fade_anim">
                                    <div className="category-card3" data-theme-color="#4F46E5" data-border="#A5B4FC">
                                        <div className="box-icon">
                                            <img src="/assets/img/icon/category/category3-1.svg" alt="Image" />
                                        </div>
                                        <h3 className="box-title"><a href="course.html">TEFL / TESOL <br /> Certification </a></h3>
                                        <a className="icon-btn style8" href="course-details.html">
                                            <svg width="17" height="15" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M8.4672 0C8.4672 0.783225 9.24338 1.95525 10.028 2.93955C11.0384 4.20682 12.2443 5.3139 13.628 6.15915C14.6645 6.79208 15.9233 7.39965 16.9344 7.39965M8.4672 14.8176C8.4672 14.0344 9.24338 12.8623 10.028 11.878C11.0384 10.6108 12.2443 9.5037 13.628 8.65845C14.6645 8.02552 15.9233 7.41795 16.9344 7.41795M16.9344 7.4088H0" stroke="currentColor"  />
                                            </svg>
                                        </a>
                                    </div>
                                </div>

                                <div className="swiper-slide th_fade_anim">
                                    <div className="category-card3" data-theme-color="#14B8A6" data-border="#5EEAD4">
                                        <div className="box-icon">
                                            <img src="/assets/img/icon/category/category3-2.svg" alt="Image" />
                                        </div>
                                        <h3 className="box-title"><a href="course.html">Classroom <br /> Management</a></h3>
                                        <a className="icon-btn style8" href="course-details.html">
                                            <svg width="17" height="15" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M8.4672 0C8.4672 0.783225 9.24338 1.95525 10.028 2.93955C11.0384 4.20682 12.2443 5.3139 13.628 6.15915C14.6645 6.79208 15.9233 7.39965 16.9344 7.39965M8.4672 14.8176C8.4672 14.0344 9.24338 12.8623 10.028 11.878C11.0384 10.6108 12.2443 9.5037 13.628 8.65845C14.6645 8.02552 15.9233 7.41795 16.9344 7.41795M16.9344 7.4088H0" stroke="currentColor"  />
                                            </svg>
                                        </a>
                                    </div>
                                </div>

                                <div className="swiper-slide th_fade_anim">
                                    <div className="category-card3" data-theme-color="#334155" data-border="#CBD5E1">
                                        <div className="box-icon">
                                            <img src="/assets/img/icon/category/category3-3.svg" alt="Image" />
                                        </div>
                                        <h3 className="box-title"><a href="course.html">Curriculum <br /> Design</a></h3>
                                        <a className="icon-btn style8" href="course-details.html">
                                            <svg width="17" height="15" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M8.4672 0C8.4672 0.783225 9.24338 1.95525 10.028 2.93955C11.0384 4.20682 12.2443 5.3139 13.628 6.15915C14.6645 6.79208 15.9233 7.39965 16.9344 7.39965M8.4672 14.8176C8.4672 14.0344 9.24338 12.8623 10.028 11.878C11.0384 10.6108 12.2443 9.5037 13.628 8.65845C14.6645 8.02552 15.9233 7.41795 16.9344 7.41795M16.9344 7.4088H0" stroke="currentColor"  />
                                            </svg>
                                        </a>
                                    </div>
                                </div>

                                <div className="swiper-slide th_fade_anim">
                                    <div className="category-card3" data-theme-color="#0F766E" data-border="#5EEAD4">
                                        <div className="box-icon">
                                            <img src="/assets/img/icon/category/category3-4.svg" alt="Image" />
                                        </div>
                                        <h3 className="box-title"><a href="course.html">Special Education <br /> Training</a></h3>
                                        <a className="icon-btn style8" href="course-details.html">
                                            <svg width="17" height="15" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M8.4672 0C8.4672 0.783225 9.24338 1.95525 10.028 2.93955C11.0384 4.20682 12.2443 5.3139 13.628 6.15915C14.6645 6.79208 15.9233 7.39965 16.9344 7.39965M8.4672 14.8176C8.4672 14.0344 9.24338 12.8623 10.028 11.878C11.0384 10.6108 12.2443 9.5037 13.628 8.65845C14.6645 8.02552 15.9233 7.41795 16.9344 7.41795M16.9344 7.4088H0" stroke="currentColor"  />
                                            </svg>
                                        </a>
                                    </div>
                                </div>

                                <div className="swiper-slide th_fade_anim">
                                    <div className="category-card3" data-theme-color="#F97316" data-border="#FDBA74">
                                        <div className="box-icon">
                                            <img src="/assets/img/icon/category/category3-5.svg" alt="Image" />
                                        </div>
                                        <h3 className="box-title"><a href="course.html">Digital Teaching <br /> Tools</a></h3>
                                        <a className="icon-btn style8" href="course-details.html">
                                            <svg width="17" height="15" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M8.4672 0C8.4672 0.783225 9.24338 1.95525 10.028 2.93955C11.0384 4.20682 12.2443 5.3139 13.628 6.15915C14.6645 6.79208 15.9233 7.39965 16.9344 7.39965M8.4672 14.8176C8.4672 14.0344 9.24338 12.8623 10.028 11.878C11.0384 10.6108 12.2443 9.5037 13.628 8.65845C14.6645 8.02552 15.9233 7.41795 16.9344 7.41795M16.9344 7.4088H0" stroke="currentColor"  />
                                            </svg>
                                        </a>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            <div className="space-bottom overflow-hidden" id="about-sec">
                <div className="about-bg-shape11-1 d-xxl-block d-none shape-mockup" data-speed="0.8" data-top="15%" data-left="5%">
                    <img src="/assets/img/shape/course_shape5_1.png" alt="img" />
                </div>
                <div className="about-bg-shape10-2 shape-mockup d-xxl-block d-none" data-speed="0.9" data-bottom="15%" data-right="5%">
                    <img src="/assets/img/shape/about_shape3_2.png" alt="img" />
                </div>
                <div className="about-wrap11 space-bottom">
                    <div className="container">
                        <div className="row gy-50 gx-80 align-items-center">
                            <div className="col-xl-6 col-lg-10">
                                <div className="img-box11">
                                    <div className="img1 th--hover-item th_fade_anim">
                                        <div className="thumb th--hover-img" data-displacement="/assets/img/imghover/fluid.jpg" data-intensity="0.2" data-speedin="1" data-speedout="1">
                                            <img className="img-cover" src="/assets/img/normal/more-aboutus-1.jpg" alt="World Teachers Academy team" />
                                        </div>
                                    </div>
                                    <div className="img2 th--hover-item th_fade_anim">
                                        <div className="thumb th--hover-img" data-displacement="/assets/img/imghover/fluid.jpg" data-intensity="0.2" data-speedin="1" data-speedout="1">
                                            <img className="img-cover" src="/assets/img/normal/more-aboutus-2.jpg" alt="World Teachers Academy team" />
                                        </div>
                                    </div>
                                    <div className="about-tag th_fade_anim">
                                        <div className="about-experience-tag">
                                            <span className="circle-title-anime">Years Of Experience ** Years Of Experience **</span>
                                        </div>
                                        <div className="year-counter">
                                            <div className="box-title"><span className="counter-number">8</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-6">
                                <div className="title-area mb-35">
                                    <span className="sub-title text-theme th_fade_anim"><img src="/assets/img/icon/subtitle-icon1-6.svg" alt="img" />More About Us</span>
                                    <h2 className="sec-title th_fade_anim"><span className="th-text-perspective">Everything a Teacher Needs to Build a Global Career</span></h2>
                                    <p className="th_fade_anim">World Teachers Academy was built for one purpose: helping educators get certified, stay current, and find teaching roles that genuinely fit their skills — without juggling five different websites to do it.</p>
                                    <p className="th_fade_anim">From certification courses taught by educators who actually teach, to a live directory of verified teaching jobs across multiple countries, we bring the training and the opportunity together in one place.</p>
                                </div>
                                <div className="about-info-card style2 th_fade_anim">
                                    <div className="box-icon">
                                        <svg width="19" height="16" viewBox="0 0 19 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M0.75 10.1252C0.75 10.1252 2.625 10.1252 5.125 14.5002C5.125 14.5002 12.0735 3.04191 18.25 0.750244" stroke="#1E1E1E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"  />
                                        </svg>
                                    </div>
                                    <div className="box-content">
                                        <h3 className="box-title">Certified Teaching Programs</h3>
                                        <p className="box-text">Every course is designed around real classroom needs, not generic online-course filler — built by people who&apos;ve actually stood in front of a class.</p>
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
                                    <h3 className="box-title"><span className="text-theme">320+</span> Teachers Trained</h3>
                                    <p className="box-text">Real educators, genuinely certified and placed — not a projection.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-4 col-md-6 d-flex th_fade_anim">
                            <div className="about-info-wrap11">
                                <div className="box-icon">
                                    <img src="/assets/img/icon/about-card-icon11-2.svg" alt="img" />
                                </div>
                                <div className="box-details">
                                    <h3 className="box-title"><span className="text-theme">200+</span> Partner Schools</h3>
                                    <p className="box-text">A real, growing network of schools that hire our graduates directly.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-4 col-md-6 d-flex th_fade_anim">
                            <div className="about-info-wrap11">
                                <div className="box-icon">
                                    <img src="/assets/img/icon/about-card-icon11-3.svg" alt="img" />
                                </div>
                                <div className="box-details">
                                    <h3 className="box-title">Job Listings Updated Daily</h3>
                                    <p className="box-text">Kept as-is if genuinely true — a strong claim worth keeping if your Job Portal is actively maintained.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>




            
            <section className="space bg-smoke3 overflow-hidden" id="course-sec">
                <div className="course-bg-shape7-1 shape-mockup" data-speed="0.9" data-left="6%" data-bottom="30%">
                    <div className="thumb">
                        <img src="/assets/img/shape/course_shape7_1.png" alt="img" />
                    </div>
                </div>
                <div className="course-bg-shape7-2 shape-mockup th_fade_anim" data-speed="1.08" data-right="3%" data-top="30%">
                    <img src="/assets/img/shape/about_shape1_1.png" alt="img" />
                </div>
                <div className="container">
                    <div className="row justify-content-center align-items-center">
                        <div className="col-lg-7">
                            <div className="title-area text-center">
                                <span className="sub-title text-theme th_fade_anim"><img src="/assets/img/icon/subtitle-icon1-6.svg" alt="img" />Our Courses</span>
                                <h2 className="sec-title th_fade_anim"><span className="th-text-perspective">Our Featured Courses</span></h2>
                                {/* Course images/titles now come from lib/courses-catalog.ts (the 5 real
                                    courses). Still need real data — price, hours/access period, and
                                    instructor name only if crediting one is confirmed — do NOT re-add star
                                    ratings or review counts unless there are genuine reviews to back them. */}
                            </div>
                        </div>
                    </div>
                    <div className="slider-area">
                        <div className="swiper th-slider course-slider11 has-shadow" id="CourseSlider11" data-slider-options='{"autoHeight": "true","breakpoints":{"0":{"slidesPerView":1},"576":{"slidesPerView":"1"},"768":{"slidesPerView":"2"},"992":{"slidesPerView":"2"},"1200":{"slidesPerView":"3"}}}'>
                            <div className="swiper-wrapper">
                                {realCourses.map((course, i) => {
                                    // Supply Chain Management has no course-details entry yet
                                    // (pending confirmation it should exist on the site at all) —
                                    // linking it to /courses/supply-chain-management would silently
                                    // fall back to showing the TEFL course's details instead.
                                    const detailsHref =
                                        course.slug === "supply-chain-management"
                                            ? "/contact"
                                            : `/courses/${course.slug}`;
                                    return (
                                    <div className="swiper-slide th_fade_anim" data-delay={[".3", ".5", ".7", ".3", ".5"][i]} key={course.slug}>
                                        <div className="course-card">
                                            <div className="box-img">
                                                <a href={detailsHref}><img src={course.image} alt={course.title} /></a>
                                                <span className="box-price">[Price TBD]</span>
                                            </div>
                                            <h3 className="box-title"><a href={detailsHref}>{course.title}</a></h3>
                                            {/* Star rating and review count withheld until genuine reviews exist. */}
                                            <div className="box-content">
                                                <div className="course-info">
                                                    <div className="box-icon">
                                                        <i className="fal fa-file-lines"></i>
                                                    </div>
                                                    <div className="course-info-details">
                                                        <span className="course-info-title">Lessons:</span>
                                                        <h4 className="course-info-text">50+ Lessons</h4>
                                                    </div>
                                                </div>
                                                <div className="course-info">
                                                    <div className="box-icon">
                                                        <i className="fal fa-users"></i>
                                                    </div>
                                                    <div className="course-info-details">
                                                        <span className="course-info-title">Students:</span>
                                                        <h4 className="course-info-text">160+ Students</h4>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="btn-wrap">
                                                <div className="meta-box">
                                                    <div className="meta-thumb">
                                                        <img src="/assets/img/course/course-thumb1-1.png" alt="avater" />
                                                    </div>
                                                    <div className="media-body">
                                                        <h5 className="box-name"><a href="/team">[Instructor TBD]</a></h5>
                                                    </div>
                                                </div>
                                                <a href={detailsHref} className="th-btn btn-sm style-border2">VIEW DETAILS<svg className="ms-2" width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M7.5264 0C7.5264 0.6962 8.21633 1.738 8.9138 2.61293C9.81193 3.7394 10.8838 4.72347 12.1137 5.4748C13.0351 6.0374 14.154 6.57747 15.0528 6.57747M7.5264 13.1712C7.5264 12.475 8.21633 11.4332 8.9138 10.5583C9.81193 9.43187 10.8838 8.44773 12.1137 7.6964C13.0351 7.1338 14.154 6.59373 15.0528 6.59373M15.0528 6.5856H0" stroke="currentColor" strokeWidth="1.5"></path>
                                                    </svg></a>
                                            </div>
                                        </div>
                                    </div>
                                    );
                                })}
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
                                <h2 className="box-number text-white"><span className="counter-number">3.9</span>k+</h2>
                                <p className="box-text">Teachers Certified</p>
                            </div>
                        </div>
                        <div className="divider"></div>
                        <div className="counter-card">
                            <div className="media-body">
                                {/* TODO: "85+" predates the real 5-course catalog wired in above and is now
                                    inconsistent with it — confirm the real course count with the client. */}
                                <h2 className="box-number text-white"><span className="counter-number">85</span>+</h2>
                                <p className="box-text">Courses Available</p>
                            </div>
                        </div>
                        <div className="divider"></div>
                        <div className="counter-card">
                            <div className="media-body">
                                <h2 className="box-number text-white"><span className="counter-number">320</span>+</h2>
                                <p className="box-text">Verified Instructors</p>
                            </div>
                        </div>
                        <div className="divider"></div>
                        <div className="counter-card">
                            <div className="media-body">
                                <h2 className="box-number text-white"><span className="counter-number">5.5</span>k+</h2>
                                <p className="box-text">Job Placements Facilitated</p>
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
                                        {/* TODO: confirm replacement stat before changing — candidate is "200+ Partner Schools" but confirm this doesn't duplicate Section 4's stat awkwardly, or remove the badge entirely. */}
                                        <img src="/assets/img/hero/hero_thumb-info3_1.png" alt="img" />
                                    </div>
                                    <div className="why-info-card11-2 jump-reverse">
                                        {/* TODO: replace with a real scheduled session snippet (e.g. "TEFL Foundations — Live Q&A, Today at 6:00 PM") once a real session exists, or remove this widget entirely if no live sessions are scheduled yet. */}
                                        <img src="/assets/img/hero/hero_thumb-info11_2.png" alt="img" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-5">
                            <div className="title-area mb-50">
                                <span className="sub-title text-theme th_fade_anim"><img src="/assets/img/icon/subtitle-icon1-6.svg" alt="img" />Why Choose World Teachers Academy</span>
                                <h2 className="sec-title th_fade_anim"><span className="th-text-perspective">Train With People Who Actually Teach</span></h2>
                                <p className="th_fade_anim">Every course here is built by educators who&apos;ve genuinely stood in front of a classroom — not a generic curriculum written by people who&apos;ve never taught. That&apos;s the difference between a certificate and real preparation.</p>
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
                            <p className="box-text">Credentials that schools and recruiters actually trust.</p>
                        </div>
                        <div className="why-card10 th_fade_anim">
                            <div className="box-icon">
                                <img src="/assets/img/icon/why-card-icon10-2.svg" alt="img" />
                            </div>
                            <h3 className="box-title">Certified Trainers</h3>
                            <p className="box-text">Learn from educators who&apos;ve taught in real classrooms, not just online.</p>
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
            <section className="space overflow-hidden" id="job-portal-sec">
                <div className="container">
                    <div className="row gy-40 gx-80 align-items-center">
                        <div className="col-lg-6">
                            <div className="img-box11">
                                <div className="img1 th--hover-item th_fade_anim">
                                    <div className="thumb th--hover-img" data-displacement="/assets/img/imghover/fluid.jpg" data-intensity="0.2" data-speedin="1" data-speedout="1">
                                        <img className="img-cover" src="/assets/img/normal/about_11_1.jpg" alt="Job Portal" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="title-area mb-35">
                                <span className="sub-title text-theme th_fade_anim"><img src="/assets/img/icon/subtitle-icon1-6.svg" alt="img" />Job Portal</span>
                                <h2 className="sec-title th_fade_anim"><span className="th-text-perspective">Certified? Your Next Teaching Job Is Already Listed</span></h2>
                                <p className="th_fade_anim">Browse verified teaching positions across multiple countries — updated regularly, with direct application links.</p>
                            </div>
                            <div className="btn-wrap th_fade_anim">
                                <a href="/job-portal" className="th-btn">Browse Open Positions
                                    <svg className="ms-2" width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M7.5264 0C7.5264 0.6962 8.21633 1.738 8.9138 2.61293C9.81193 3.7394 10.8838 4.72347 12.1137 5.4748C13.0351 6.0374 14.154 6.57747 15.0528 6.57747M7.5264 13.1712C7.5264 12.475 8.21633 11.4332 8.9138 10.5583C9.81193 9.43187 10.8838 8.44773 12.1137 7.6964C13.0351 7.1338 14.154 6.59373 15.0528 6.59373M15.0528 6.5856H0" stroke="currentColor" strokeWidth="1.5"></path>
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="overflow-hidden position-relative z-index-common" data-bg-src="/assets/img/bg/cta-bg10-1.jpg">
                <div className="cta-wrap10 space">
                    <div className="cta-thumb-wrap10-1 th_fade_anim">
                        <img src="/assets/img/normal/cta-thumb8-1.png" alt="img" />
                    </div>
                    <div className="cta-thumb-wrap10-2 th_fade_anim">
                        <img src="/assets/img/normal/cta-thumb8-2.png" alt="img" />
                    </div>
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-xl-7 col-lg-8">
                                <div className="title-area text-center mb-0">
                                    {/* TODO: confirm this 30%-off-first-100-teachers promotion is a real, currently-live offer with an actually-enforced 100-teacher cap before publishing this headline. A scarcity claim that isn't real is the kind of thing that damages trust if a customer notices later — do not apply this copy until I explicitly confirm the offer is real. */}
                                    <h2 className="sec-title text-white th-text-perspective"><span className="text-theme2">30%</span> Off Certification for Our First 100 Teachers</h2>
                                    <p className="fw-semibold text-white th_fade_anim mb-0 mt-30">Get certified and get matched with real teaching opportunities — join early and lock in founder pricing.</p>
                                    <div className="btn-wrap mt-40 th_fade_anim justify-content-center">
                                        <a href="/courses" className="th-btn style5">JOIN WITH US
                                            <svg className="ms-2" width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M7.5264 0C7.5264 0.6962 8.21633 1.738 8.9138 2.61293C9.81193 3.7394 10.8838 4.72347 12.1137 5.4748C13.0351 6.0374 14.154 6.57747 15.0528 6.57747M7.5264 13.1712C7.5264 12.475 8.21633 11.4332 8.9138 10.5583C9.81193 9.43187 10.8838 8.44773 12.1137 7.6964C13.0351 7.1338 14.154 6.59373 15.0528 6.59373M15.0528 6.5856H0" stroke="currentColor" strokeWidth="1.5"></path>
                                            </svg>
                                        </a>
                                        <a href="contact.html" className="th-btn style-border3">BECOME AN INSTRUCTOR
                                            <svg className="ms-2" width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M7.5264 0C7.5264 0.6962 8.21633 1.738 8.9138 2.61293C9.81193 3.7394 10.8838 4.72347 12.1137 5.4748C13.0351 6.0374 14.154 6.57747 15.0528 6.57747M7.5264 13.1712C7.5264 12.475 8.21633 11.4332 8.9138 10.5583C9.81193 9.43187 10.8838 8.44773 12.1137 7.6964C13.0351 7.1338 14.154 6.59373 15.0528 6.59373M15.0528 6.5856H0" stroke="currentColor" strokeWidth="1.5"></path>
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Events section — commented out (disabled via `false &&`) rather than deleted, in case it's needed again later */}
            {false && (
            <section className="space bg-smoke3 overflow-hidden">
                <div className="event-bg-shape3-1 shape-mockup th_fade_anim d-xxl-block d-none" data-speed="0.9" data-left="4%" data-top="10%">
                    <img src="/assets/img/shape/event_shape2_1.png" alt="img" />
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
            <section className="space overflow-hidden" id="video-testi-sec">
                <div className="container">
                    <div className="title-area text-center">
                        <span className="sub-title text-theme th_fade_anim"><img src="/assets/img/icon/subtitle-icon1-1.svg" alt="img" />Student Stories</span>
                        <h2 className="sec-title th_fade_anim"><span className="th-text-perspective">Don&apos;t Take Our Word For It — Hear From Our Students</span></h2>
                    </div>
                    <VideoTestimonials />
                </div>
            </section>

            <section className="testi-area-1 space overflow-hidden" id="testi-sec">
                <div className="testi-bg-shape8-1 shape-mockup th_fade_anim d-xxl-block d-none" data-speed="0.9" data-left="6%" data-top="7%">
                    <img src="/assets/img/shape/testi_shape8_1.png" alt="img" />
                </div>
                <div className="container">
                    <div className="row gy-40 gx-80">
                        <div className="col-xl-6">
                            <div className="title-area">
                                <span className="sub-title text-theme th_fade_anim"><img src="/assets/img/icon/subtitle-icon1-6.svg" alt="img" />Testimonials</span>
                                <h2 className="sec-title th_fade_anim"><span className="th-text-perspective">What Trainer Says</span></h2>
                            </div>
                            <div className="slider-area testi-slider7 th_fade_anim">
                                <div className="swiper th-slider" id="testiSlide7" data-slider-options='{"effect":"fade", "autoHeight": "true"}'>
                                    <div className="swiper-wrapper">
                                        <div className="swiper-slide">
                                            <div className="testi-card">
                                                <div className="testi-meta-wrap">
                                                    <div className="quote-icon">
                                                        <img src="/assets/img/icon/quote5.svg" alt="img" />
                                                    </div>
                                                    <div className="testi-review-wrap">
                                                        <h3 className="rating-title"><strong>4.9</strong>/5.0</h3>
                                                        <span className="testi-card_review">
                                                            <i className="fas fa-star"></i>
                                                            <i className="fas fa-star"></i>
                                                            <i className="fas fa-star"></i>
                                                            <i className="fas fa-star"></i>
                                                            <i className="fas fa-star"></i>
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="box-text">“Online mentorship is a personalized, one-to-one guidance system where learners connect with industry experts, coaches, or professionals through digital platforms. It helps individuals gain skills, solve challenges, and grow faster by receiving tailored advice.”</p>
                                                <div className="testi-card-profile">
                                                    <div className="box-thumb">
                                                        <img src="/assets/img/testimonial/testi_1_1.png" alt="img" />
                                                    </div>
                                                    <div className="media-left">
                                                        <h3 className="testi-card_name">Alex James</h3>
                                                        <span className="testi-card_desig">University Student</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="swiper-slide">
                                            <div className="testi-card">
                                                <div className="testi-meta-wrap">
                                                    <div className="quote-icon">
                                                        <img src="/assets/img/icon/quote5.svg" alt="img" />
                                                    </div>
                                                    <div className="testi-review-wrap">
                                                        <h3 className="rating-title"><strong>4.9</strong>/5.0</h3>
                                                        <span className="testi-card_review">
                                                            <i className="fas fa-star"></i>
                                                            <i className="fas fa-star"></i>
                                                            <i className="fas fa-star"></i>
                                                            <i className="fas fa-star"></i>
                                                            <i className="fas fa-star"></i>
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="box-text">“University education is the foundation for shaping skilled, knowledgeable, and responsible individuals who contribute meaningfully to society. It provides students with a deeper understanding of their chosen fields through a blend of theoretical learning, practical experience,”</p>
                                                <div className="testi-card-profile">
                                                    <div className="box-thumb">
                                                        <img src="/assets/img/testimonial/testi_1_2.png" alt="img" />
                                                    </div>
                                                    <div className="media-left">
                                                        <h3 className="testi-card_name">Maria Gonzalez</h3>
                                                        <span className="testi-card_desig">University Student</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="icon-box th_fade_anim">
                                    <button data-slider-prev="#testiSlide7" className="slider-arrow default style3 slider-prev">
                                        <svg width="17" height="15" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M8.4672 0C8.4672 0.783225 7.69103 1.95525 6.90638 2.93955C5.89598 4.20682 4.69013 5.3139 3.30645 6.15915C2.26988 6.79208 1.01115 7.39965 1.90735e-06 7.39965M8.4672 14.8176C8.4672 14.0344 7.69103 12.8623 6.90638 11.878C5.89598 10.6108 4.69013 9.5037 3.30645 8.65845C2.26988 8.02552 1.01115 7.41795 1.90735e-06 7.41795M1.90735e-06 7.4088H16.9344" stroke="currentColor"  />
                                        </svg>
                                    </button>
                                    <button data-slider-next="#testiSlide7" className="slider-arrow default style3 slider-next">
                                        <svg width="17" height="15" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M8.4672 0C8.4672 0.783225 9.24338 1.95525 10.028 2.93955C11.0384 4.20682 12.2443 5.3139 13.628 6.15915C14.6645 6.79208 15.9233 7.39965 16.9344 7.39965M8.4672 14.8176C8.4672 14.0344 9.24338 12.8623 10.028 11.878C11.0384 10.6108 12.2443 9.5037 13.628 8.65845C14.6645 8.02552 15.9233 7.41795 16.9344 7.41795M16.9344 7.4088H0" stroke="currentColor"  />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-6">
                            
                            <div className="contact-form contact-form-4 th_fade_anim" id="contact-sec">
                                {/* TODO: wire to actual form handler */}
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
                    <img src="/assets/img/shape/faq_shape1_1.png" alt="img" />
                </div>
                <div className="faq-bg-shape4-2 d-xxl-block d-none shape-mockup th_fade_anim" data-speed="0.9" data-right="0%" data-bottom="5%">
                    <img src="/assets/img/shape/faq_shape4_1.png" alt="img" />
                </div>
                <div className="container">
                    <div className="row gy-40">
                        <div className="col-xl-6">
                            <div className="faq-img-box1">
                                <div className="img1 th--hover-item th_fade_anim">
                                    <div className="thumb th--hover-img" data-displacement="/assets/img/imghover/fluid.jpg" data-intensity="0.2" data-speedin="1" data-speedout="1">
                                        <img className="img-cover" src="/assets/img/normal/faq_4_1.jpg" alt="img" />
                                    </div>
                                </div>
                                <div className="img2 th--hover-item th_fade_anim">
                                    <div className="thumb th--hover-img" data-displacement="/assets/img/imghover/fluid.jpg" data-intensity="0.2" data-speedin="1" data-speedout="1">
                                        <img className="img-cover" src="/assets/img/normal/faq_4_2.jpg" alt="img" />
                                    </div>
                                </div>
                                <div className="faq-counter-wrap jump">
                                    <div className="thumb">
                                        <img src="/assets/img/normal/volunteer-group2.png" alt="img" />
                                    </div>
                                    <div className="box-details">
                                        <h3 className="box-title"><span className="counter-number">10</span>K +</h3>
                                        <p className="box-text">Active students</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-6">
                            <div className="faq-wrap1">
                                <div className="title-area">
                                    <span className="sub-title text-theme th_fade_anim"><img src="/assets/img/icon/subtitle-icon1-6.svg" alt="img" />Faq’s</span>
                                    <h2 className="sec-title th_fade_anim"><span className="th-text-perspective">Frequently Asked have any questions?</span></h2>
                                </div>
                                <div className="accordion" id="faqAccordion">


                                    <div className="accordion-card style2 th_fade_anim">
                                        <div className="accordion-header" id="collapse-item-1">
                                            <button className="accordion-button " type="button" data-bs-toggle="collapse" data-bs-target="#collapse-1" aria-expanded="true" aria-controls="collapse-1">Do I need teaching experience to get certified?</button>
                                        </div>
                                        <div id="collapse-1" className="accordion-collapse collapse show" data-bs-parent="#faqAccordion">
                                            <div className="accordion-body">
                                                <p className="faq-text">No — our foundational certifications (like TEFL) are designed for both new and experienced educators.</p>
                                            </div>
                                        </div>
                                    </div>


                                    <div className="accordion-card style2 th_fade_anim">
                                        <div className="accordion-header" id="collapse-item-2">
                                            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-2" aria-expanded="false" aria-controls="collapse-2">Are these certifications recognized internationally?</button>
                                        </div>
                                        <div id="collapse-2" className="accordion-collapse collapse " data-bs-parent="#faqAccordion">
                                            <div className="accordion-body">
                                                <p className="faq-text">Yes, our certification programs follow internationally recognized standards accepted by schools and language institutes worldwide.</p>
                                            </div>
                                        </div>
                                    </div>


                                    <div className="accordion-card style2 th_fade_anim">
                                        <div className="accordion-header" id="collapse-item-3">
                                            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-3" aria-expanded="false" aria-controls="collapse-3">Can I find a job through World Teachers Academy after I'm certified?</button>
                                        </div>
                                        <div id="collapse-3" className="accordion-collapse collapse " data-bs-parent="#faqAccordion">
                                            <div className="accordion-body">
                                                <p className="faq-text">Yes — our Job Portal lists verified teaching positions you can apply to directly once you've completed a relevant certification.</p>
                                            </div>
                                        </div>
                                    </div>


                                    <div className="accordion-card style2 th_fade_anim">
                                        <div className="accordion-header" id="collapse-item-4">
                                            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-4" aria-expanded="false" aria-controls="collapse-4">How long does certification take?</button>
                                        </div>
                                        <div id="collapse-4" className="accordion-collapse collapse " data-bs-parent="#faqAccordion">
                                            <div className="accordion-body">
                                                <p className="faq-text">This depends on the course — most programs range from a few days of intensive study to several weeks of self-paced learning.</p>
                                            </div>
                                        </div>
                                    </div>


                                    {/* TODO: confirm whether visa/relocation support is actually offered before launch — remove this FAQ entirely if not, per user's own flag that false claims here are reputationally risky */}
                                    <div className="accordion-card style2 th_fade_anim">
                                        <div className="accordion-header" id="collapse-item-5">
                                            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-5" aria-expanded="false" aria-controls="collapse-5">Do you help with visa or relocation support for teaching abroad?</button>
                                        </div>
                                        <div id="collapse-5" className="accordion-collapse collapse " data-bs-parent="#faqAccordion">
                                            <div className="accordion-body">
                                                <p className="faq-text">This depends on the program — check each course's details page for visa/relocation support information.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    </>
  );
}
