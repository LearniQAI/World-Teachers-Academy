export default function SideMenu() {
  return (
    <>
    <div className="sidemenu-wrapper sidemenu-info d-none d-lg-block ">
        <div className="sidemenu-content">
            <button className="closeButton sideMenuCls"><i className="far fa-times"></i></button>
            <div className="widget  ">
                <div className="th-widget-about">
                    <div className="about-logo">
                        <a href="index.html"><img src="/assets/img/logo.svg" alt="Escul" /></a>
                    </div>
                    <p className="about-text"> University education is the foundation for shaping skilled, knowledgeable, and responsible individuals who contribute meaningfully to society.</p>
                    <a href="contact.html" className="th-btn btn-sm">Enroll Now<svg className="ms-2" width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7.5264 0C7.5264 0.6962 8.21633 1.738 8.9138 2.61293C9.81193 3.7394 10.8838 4.72347 12.1137 5.4748C13.0351 6.0374 14.154 6.57747 15.0528 6.57747M7.5264 13.1712C7.5264 12.475 8.21633 11.4332 8.9138 10.5583C9.81193 9.43187 10.8838 8.44773 12.1137 7.6964C13.0351 7.1338 14.154 6.59373 15.0528 6.59373M15.0528 6.5856H0" stroke="currentColor" strokeWidth="1.5"  />
                        </svg>
                    </a>
                </div>
            </div>
            <div className="widget  ">
                <h3 className="widget_title">Recent Posts</h3>
                <div className="recent-post-wrap">
                    <div className="recent-post">
                        <div className="media-img">
                            <a href="blog-details.html"><img src="/assets/img/blog/recent-post-1-1.jpg" alt="Blog Image" /></a>
                        </div>
                        <div className="media-body">
                            <h4 className="post-title"><a className="text-inherit" href="blog-details.html">How To Start Learn Online Study From Your Home</a></h4>
                            <div className="recent-post-meta">
                                <a href="blog.html"><i className="fal fa-calendar-days"></i>21 Nov, 2026</a>
                            </div>

                        </div>
                    </div>
                    <div className="recent-post">
                        <div className="media-img">
                            <a href="blog-details.html"><img src="/assets/img/blog/recent-post-1-2.jpg" alt="Blog Image" /></a>
                        </div>
                        <div className="media-body">
                            <h4 className="post-title"><a className="text-inherit" href="blog-details.html">Time Management Tips Balancing Work and Study</a></h4>
                            <div className="recent-post-meta">
                                <a href="blog.html"><i className="fal fa-calendar-days"></i>23 Nov, 2026</a>
                            </div>
                        </div>
                    </div>
                    <div className="recent-post">
                        <div className="media-img">
                            <a href="blog-details.html"><img src="/assets/img/blog/recent-post-1-3.jpg" alt="Blog Image" /></a>
                        </div>
                        <div className="media-body">
                            <h4 className="post-title"><a className="text-inherit" href="blog-details.html">Best Online Courses Top Platforms for Learning</a></h4>
                            <div className="recent-post-meta">
                                <a href="blog.html"><i className="fal fa-calendar-days"></i>24 Nov, 2026</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="widget newsletter-widget  ">
                <h3 className="widget_title">Subscribe Now</h3>
                <form className="newsletter-form">
                    <div className="form-group">
                        <input className="form-control" type="email" placeholder="Email Address" required />
                        <button type="submit" className="th-btn btn-sm"><i className="far fa-paper-plane"></i></button>
                    </div>
                </form>
                <div className="th-social style3 mt-30">
                    <a href="https://www.facebook.com/"><i className="fab fa-facebook-f"></i></a>
                    <a href="https://www.twitter.com/"><i className="fab fa-twitter"></i></a>
                    <a href="https://www.linkedin.com/"><i className="fab fa-linkedin-in"></i></a>
                    <a href="https://www.behance.com/"><i className="fab fa-behance"></i></a>
                    <a href="https://www.vimeo.com/"><i className="fab fa-vimeo-v"></i></a>
                </div>
            </div>
        </div>
    </div>
    <div className="popup-search-box d-none d-lg-block">
        <button className="searchClose"><i className="far fa-times"></i></button>
        <form action="#">
            <input type="text" placeholder="What are you looking for?" />
            <button type="submit"><i className="fal fa-search"></i></button>
        </form>
    </div>
    </>
  );
}
