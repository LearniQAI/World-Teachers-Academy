export default function MobileMenu() {
  return (
    <div className="th-menu-wrapper">
        <div className="th-menu-area text-center">
            <button className="th-menu-toggle"><i className="fal fa-times"></i></button>
            <div className="th-menu-content">
                <div className="mobile-logo">
                    <a href="index.html"><img src="/assets/img/logo.svg" alt="Escul" /></a>
                </div>
                <div className="th-mobile-menu-bottom">

                    <form className="th-mobile-search" action="#">
                        <input type="text" placeholder="Search..." />
                        <button className="icon-btn" type="submit"><i className="fal fa-search"></i></button>
                    </form>
                    <div className="btn-wrap">
                        <a href="contact.html" className="th-btn w-100">APPLY NOW
                            <svg className="ms-2" width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7.5264 0C7.5264 0.6962 8.21633 1.738 8.9138 2.61293C9.81193 3.7394 10.8838 4.72347 12.1137 5.4748C13.0351 6.0374 14.154 6.57747 15.0528 6.57747M7.5264 13.1712C7.5264 12.475 8.21633 11.4332 8.9138 10.5583C9.81193 9.43187 10.8838 8.44773 12.1137 7.6964C13.0351 7.1338 14.154 6.59373 15.0528 6.59373M15.0528 6.5856H0" stroke="currentColor" strokeWidth="1.5"></path>
                            </svg>
                        </a>
                    </div>
                    <div className="contact-info-wrap">
                        <div className="contact-info"><i className="fa-regular fa-envelope"></i><a href="mailto:info@escul.com">info@escul.com</a></div>
                        <div className="contact-info"><i className="fa-regular fa-phone"></i><a href="tel:256214203215">256 214 203 215</a></div>
                    </div>
                    <div className="th-social style4">
                        <a href="https://www.facebook.com/"><i className="fab fa-facebook-f"></i></a>
                        <a href="https://www.twitter.com/"><i className="fab fa-twitter"></i></a>
                        <a href="https://www.linkedin.com/"><i className="fab fa-linkedin-in"></i></a>
                        <a href="https://www.youtube.com/"><i className="fab fa-youtube"></i></a>
                        <a href="https://www.instagram.com/"><i className="fab fa-instagram"></i></a>
                    </div>
                </div>
                <div className="th-mobile-menu">
                    <ul>
                        <li className="menu-item-has-children">
                            <a href="index.html">Home</a>
                            <ul className="sub-menu">
                                <li className="menu-item-has-children">
                                    <a href="#">Multipage</a>
                                    <ul className="sub-menu">
                                        <li><a href="index.html">Home I (University)</a></li>
                                        <li><a href="home-2.html">Home II (Online Education)</a></li>
                                        <li><a href="home-3.html">Home III (Digital Education)</a></li>
                                        <li><a href="home-4.html">Home IV (University Admission)</a></li>
                                        <li><a href="home-5.html">Home V (Online Academy)</a></li>
                                        <li><a href="home-6.html">Home VI (Online Training)</a></li>
                                        <li><a href="home-7.html">Home VII (Online Mentor)</a></li>
                                        <li><a href="home-8.html">Home VIII (Online Courses)</a></li>
                                        <li><a href="home-9.html">Home IX (Kindergarden)</a></li>
                                        <li><a href="home-10.html">Home X (Online Trainer)</a></li>
                                        <li><a href="home-11.html">Home XI (Skill Development)</a></li>
                                    </ul>
                                </li>
                                <li className="menu-item-has-children">
                                    <a href="#">Onepage</a>
                                    <ul className="sub-menu">
                                        <li><a href="home-1-op.html">Home I (University)</a></li>
                                        <li><a href="home-2-op.html">Home II (Online Education)</a></li>
                                        <li><a href="home-3-op.html">Home III (Digital Education)</a></li>
                                        <li><a href="home-4-op.html">Home IV (University Admission)</a></li>
                                        <li><a href="home-5-op.html">Home V (Online Academy)</a></li>
                                        <li><a href="home-6-op.html">Home VI (Online Training)</a></li>
                                        <li><a href="home-7-op.html">Home VII (Online Mentor)</a></li>
                                        <li><a href="home-8-op.html">Home VIII (Online Courses)</a></li>
                                        <li><a href="home-9-op.html">Home IX (Kindergarden)</a></li>
                                        <li><a href="home-10-op.html">Home X (Online Trainer)</a></li>
                                        <li><a href="home-11-op.html">Home XI (Skill Development)</a></li>
                                    </ul>
                                </li>
                            </ul>
                        </li>
                        <li><a href="about.html">About Us</a></li>
                        <li className="menu-item-has-children">
                            <a href="#">Courses</a>
                            <ul className="sub-menu">
                                <li><a href="course.html">Courses</a></li>
                                <li><a href="course-details.html">Course Details</a></li>
                                <li><a href="course-categories.html">Course Categories</a></li>
                            </ul>
                        </li>
                        <li className="menu-item-has-children">
                            <a href="#">Events</a>
                            <ul className="sub-menu">
                                <li><a href="event.html">Events</a></li>
                                <li><a href="event-details.html">Event Details</a></li>
                            </ul>
                        </li>
                        <li className="menu-item-has-children">
                            <a href="#">Pages</a>
                            <ul className="sub-menu">
                                <li className="menu-item-has-children">
                                    <a href="#">Shop</a>
                                    <ul className="sub-menu">
                                        <li><a href="shop.html">Shop</a></li>
                                        <li><a href="shop-details.html">Shop Details</a></li>
                                        <li><a href="cart.html">Cart Page</a></li>
                                        <li><a href="checkout.html">Checkout</a></li>
                                        <li><a href="wishlist.html">Wishlist</a></li>
                                    </ul>
                                </li>
                                <li><a href="team.html">Instructor</a></li>
                                <li><a href="team-details.html">Instructor Details</a></li>
                                <li><a href="pricing.html">Pricing Plans</a></li>
                                <li><a href="gallery.html">Gallery Showcase </a></li>
                                <li><a href="faq.html">FAQS</a></li>
                                <li><a href="testimonial.html">Testimonials</a></li>
                                <li><a href="error.html">Error Page</a></li>
                            </ul>
                        </li>
                        <li className="menu-item-has-children">
                            <a href="#">Blog</a>
                            <ul className="sub-menu">
                                <li><a href="blog.html">Blog Standard</a></li>
                                <li><a href="blog-2.html">Blog Grid</a></li>
                                <li><a href="blog-details.html">Blog Details</a></li>
                            </ul>
                        </li>
                        <li>
                            <a href="contact.html">Contact Us</a>
                        </li>
                    </ul>
                </div>

            </div>
        </div>
    </div>
  );
}
