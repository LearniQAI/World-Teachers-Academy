import { CONTACT_EMAIL, START_TRAINING_URL } from "@/lib/site";
import SocialLinks from "@/components/layout/SocialLinks";
import { Fragment } from "react";
import CountryFlag from "./CountryFlag";
import { countriesByRegion } from "@/lib/countries-data";

export default function MobileMenu() {
  return (
    <div className="th-menu-wrapper">
        <div className="th-menu-area text-center">
            <button className="th-menu-toggle"><i className="fal fa-times"></i></button>
            <div className="th-menu-content">
                <div className="mobile-logo">
                    <a href="/"><img src="/assets/img/world-teachers-logo.jpeg" alt="World Teachers Academy" style={{ height: '80px', width: 'auto' }} /></a>
                </div>
                <div className="th-mobile-menu-bottom">

                    <form className="th-mobile-search" action="#">
                        <input type="text" placeholder="Search..." />
                        <button className="icon-btn" type="submit"><i className="fal fa-search"></i></button>
                    </form>
                    <div className="btn-wrap">
                        <a href={START_TRAINING_URL} className="th-btn style5 w-100">START FREE TRAINING
                            <svg className="ms-2" width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7.5264 0C7.5264 0.6962 8.21633 1.738 8.9138 2.61293C9.81193 3.7394 10.8838 4.72347 12.1137 5.4748C13.0351 6.0374 14.154 6.57747 15.0528 6.57747M7.5264 13.1712C7.5264 12.475 8.21633 11.4332 8.9138 10.5583C9.81193 9.43187 10.8838 8.44773 12.1137 7.6964C13.0351 7.1338 14.154 6.59373 15.0528 6.59373M15.0528 6.5856H0" stroke="currentColor" strokeWidth="1.5"></path>
                            </svg>
                        </a>
                    </div>
                    <div className="contact-info-wrap">
                        <div className="contact-info"><i className="fa-regular fa-envelope"></i><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></div>
                    </div>
                    <SocialLinks className="th-social style4" />
                </div>
                <div className="th-mobile-menu">
                    <ul>
                        <li><a href="/">Home</a></li>
                        <li><a href="/resources">Resources</a></li>
                        <li><a href="/courses">Courses</a></li>
                        <li className="menu-item-has-children">
                            <a href="/countries">Countries</a>
                            <ul className="sub-menu">
                                {countriesByRegion.map((g) => (
                                    <Fragment key={g.region}>
                                        <li className="country-menu__label">{g.region}</li>
                                        {g.countries.map((c) => (
                                            <li key={c.slug}><a href={`/countries/${c.slug}`}><CountryFlag country={c} decorative /> {c.name}</a></li>
                                        ))}
                                    </Fragment>
                                ))}
                            </ul>
                        </li>
                        <li><a href="/job-portal">Job Portal</a></li>
                        <li><a href="/blog">Blog</a></li>
                    </ul>
                </div>

            </div>
        </div>
    </div>
  );
}
