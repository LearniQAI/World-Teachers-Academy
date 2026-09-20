import { countries } from "@/lib/countries-data";

const READ_MORE_ICON = (
  <svg className="ms-2" width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.5264 0C7.5264 0.6962 8.21633 1.738 8.9138 2.61293C9.81193 3.7394 10.8838 4.72347 12.1137 5.4748C13.0351 6.0374 14.154 6.57747 15.0528 6.57747M7.5264 13.1712C7.5264 12.475 8.21633 11.4332 8.9138 10.5583C9.81193 9.43187 10.8838 8.44773 12.1137 7.6964C13.0351 7.1338 14.154 6.59373 15.0528 6.59373M15.0528 6.5856H0" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const DELAYS = [".3", ".5", ".7"];

export default function Countries() {
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
                <span className="sub-title text-theme"><img src="/assets/img/icon/subtitle-icon1-6.svg" alt="img" />Countries</span>
                <h1 className="breadcumb-title">Country Guides</h1>
                <ul className="breadcumb-menu">
                  <li><a href="/">Home</a></li>
                  <li>Countries</li>
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
Countries Area
==============================*/}
      <section className="space-top space-extra-bottom" id="countries-sec">
        <div className="container">
          <div className="row gy-40">
            {countries.map((country, i) => (
              <div className="col-lg-4 col-md-6 th_fade_anim" data-delay={DELAYS[i % 3]} key={country.slug}>
                <div className="blog-card" style={{ padding: "30px", border: "1px solid #E2E5EE", borderRadius: "16px" }}>
                  <div className="blog-content" style={{ padding: 0 }}>
                    <div className="blog-meta">
                      <span>{country.code}</span>
                    </div>
                    <h2 className="box-title"><a href={`/countries/${country.slug}`}>{country.name}</a></h2>
                    <a href={`/countries/${country.slug}`} className="th-btn style4 btn-sm">VIEW GUIDE{READ_MORE_ICON}</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
