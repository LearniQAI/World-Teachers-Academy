import SocialLinks from "@/components/layout/SocialLinks";
import { CONTACT_EMAIL, MISSION_LINE, START_TRAINING_URL } from "@/lib/site";

export default function Footer() {
  return (
    <>
            <footer className="footer-wrapper footer-layout6">
                <div className="footer-top">
                    <div className="container">
                        <div className="subscribe-box">
                            <div className="row gy-40 align-items-center justify-content-center">
                                <div className="col-xl-6">
                                    <h3 className="subscribe-box_title text-title th-text-perspective">Preparing for your next teaching opportunity?</h3>
                                </div>
                                <div className="col-xl-6 col-lg-8">
                                    {/* The template's subscribe form was not connected to anything (emails were lost).
                                        Until a real, consented newsletter exists, this invites visitors to email us. */}
                                    <div className="th_fade_anim" data-delay=".3" style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "flex-end" }}>
                                        <p style={{ margin: 0 }}>Questions about a programme or a launch date?</p>
                                        <a href={`mailto:${CONTACT_EMAIL}`} className="th-btn">Email us</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="widget-area">
                    <div className="container">
                        <div className="row justify-content-between">
                            <div className="col-md-6 col-xl-auto">
                                <div className="widget footer-widget th_fade_anim" data-delay=".3">
                                    <div className="th-widget-about">
                                        <div className="about-logo">
                                            <a href="/">
                                                <img src="/assets/img/world-teachers-logo.png" alt="World Teachers Academy" style={{ height: '96px', width: 'auto' }} />
                                            </a>
                                        </div>
                                        <p className="about-text">{MISSION_LINE}</p>
                                        <a href={START_TRAINING_URL} className="th-btn style2 btn-sm">Start Free Training<svg className="ms-2" width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M7.5264 0C7.5264 0.6962 8.21633 1.738 8.9138 2.61293C9.81193 3.7394 10.8838 4.72347 12.1137 5.4748C13.0351 6.0374 14.154 6.57747 15.0528 6.57747M7.5264 13.1712C7.5264 12.475 8.21633 11.4332 8.9138 10.5583C9.81193 9.43187 10.8838 8.44773 12.1137 7.6964C13.0351 7.1338 14.154 6.59373 15.0528 6.59373M15.0528 6.5856H0" stroke="currentColor" strokeWidth="1.5"  />
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-6 col-xl-auto">
                                <div className="widget widget_nav_menu footer-widget th_fade_anim" data-delay=".5">
                                    <h3 className="widget_title">Quick Links</h3>
                                    <div className="menu-all-pages-container">
                                        <ul className="menu">
                                            <li><a href="/about">About Us</a></li>
                                            <li><a href="/courses">Courses</a></li>
                                            <li><a href="/job-portal">Job Portal</a></li>
                                            <li><a href="/support">Support</a></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-6 col-xl-auto">
                                <div className="widget widget_nav_menu footer-widget th_fade_anim" data-delay=".7">
                                    <h3 className="widget_title">Resources</h3>
                                    <div className="menu-all-pages-container">
                                        <ul className="menu">
                                            <li><a href="/faqs">FAQs</a></li>
                                            <li><a href="/support">Support</a></li>
                                            <li><a href="/terms-of-service">Terms of Service</a></li>
                                            <li><a href="/privacy-policy">Privacy Policy</a></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6 col-xl-auto">
                                <div className="widget footer-widget th_fade_anim" data-delay=".9">
                                    <div className="th-widget-contact">
                                        <h3 className="widget_title">Get In Touch</h3>
                                        <div className="info-box">
                                            <div className="box-icon">
                                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M12.9154 9.16667C12.9154 10.7775 11.6095 12.0833 9.9987 12.0833C8.38786 12.0833 7.08203 10.7775 7.08203 9.16667C7.08203 7.55583 8.38786 6.25 9.9987 6.25C11.6095 6.25 12.9154 7.55583 12.9154 9.16667Z" stroke="currentColor" strokeWidth="1.5"  />
                                                    <path d="M10 1.6665C14.0588 1.6665 17.5 5.02732 17.5 9.10467C17.5 13.2469 14.0027 16.1538 10.7725 18.1304C10.5371 18.2633 10.2708 18.3332 10 18.3332C9.72917 18.3332 9.46292 18.2633 9.2275 18.1304C6.00325 16.1345 2.5 13.2613 2.5 9.10467C2.5 5.02732 5.9412 1.6665 10 1.6665Z" stroke="currentColor" strokeWidth="1.5"  />
                                                </svg>
                                            </div>
                                            <div className="box-details">
                                                <p className="box-text">267 Oak Avenue Ferndale, Randburg</p>
                                                <p className="box-text">Johannesburg, South Africa</p>
                                            </div>
                                        </div>
                                        <div className="info-box">
                                            <div className="box-icon">
                                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M5.83203 7.0835L8.28372 8.533C9.71303 9.37808 10.2844 9.37808 11.7137 8.533L14.1654 7.0835" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"  />
                                                    <path d="M1.68111 11.2295C1.73559 13.7842 1.76283 15.0614 2.70544 16.0077C3.64804 16.9538 4.95991 16.9868 7.58366 17.0527C9.20072 17.0933 10.8019 17.0933 12.419 17.0527C15.0427 16.9868 16.3546 16.9538 17.2972 16.0077C18.2398 15.0614 18.2671 13.7842 18.3215 11.2295C18.3391 10.4081 18.3391 9.59159 18.3215 8.77017C18.2671 6.21555 18.2398 4.93825 17.2972 3.99205C16.3546 3.04586 15.0427 3.0129 12.419 2.94698C10.8019 2.90635 9.20072 2.90635 7.58365 2.94697C4.95991 3.01289 3.64804 3.04585 2.70543 3.99205C1.76282 4.93824 1.73559 6.21555 1.6811 8.77017C1.66359 9.59159 1.66359 10.4081 1.68111 11.2295Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"  />
                                                </svg>
                                            </div>
                                            <div className="box-details">
                                                <p className="box-text"><a href={`mailto:${CONTACT_EMAIL}`} className="box-link">{CONTACT_EMAIL}</a></p>
                                            </div>
                                        </div>
                                        <SocialLinks className="th-social style6" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="copyright-wrap bg-theme">
                    <div className="container">
                        <div className="row gy-2 align-items-center">
                            <div className="col-lg-6">
                                <p className="copyright-text">Copyright
                                    <i className="fal fa-copyright"></i> 2026 <a href="/">World Teachers Academy</a>, All rights reserved.
                                </p>
                            </div>
                            <div className="col-lg-6 text-center text-lg-end">
                                <div className="footer-links">
                                    <ul>
                                        <li><a href="/terms-of-service">Terms of service</a></li>
                                        <li><a href="/privacy-policy">Privacy policy</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
    <div className="scroll-top">
        <svg className="progress-circle svg-content" width="100%" height="100%" viewBox="-1 -1 102 102">
            <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98" style={{ transition: 'stroke-dashoffset 10ms linear 0s', strokeDasharray: '307.919, 307.919', strokeDashoffset: '307.919' }}></path>
        </svg>
    </div>
    </>
  );
}
