import { countries } from "@/lib/countries-data";
import CountryFlag from "@/components/layout/CountryFlag";

const DELAYS = [".3", ".5", ".7"];

export default function Countries() {
  return (
    <>
      {/*==============================
    Breadcumb
============================== */}
      <div className="breadcumb-wrapper breadcumb-wrapper--country">
        <div className="container">
          <div className="row">
            <div className="col-lg-7">
              <div className="breadcumb-content" style={{ "--space": "45px" } as React.CSSProperties}>
                <span className="sub-title text-theme"><img src="/assets/img/icon/subtitle-icon1-6.svg" alt="img" />Countries</span>
                <h1 className="breadcumb-title">Country Guides</h1>
                <ul className="breadcumb-menu">
                  <li><a href="/">Home</a></li>
                  <li>Countries</li>
                </ul>
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
                <a href={`/countries/${country.slug}`} className="country-card" aria-label={`${country.name} teaching guide`}>
                  <div className="country-card__top">
                    <span className="country-card__flag" aria-hidden="true"><CountryFlag country={country} height={28} /></span>
                    <span className="country-card__code">{country.code}</span>
                  </div>
                  <h2 className="country-card__name">{country.name}</h2>
                  <div className="country-card__pills">
                    {country.statBadges.map((b) => (
                      <span className="country-card__pill" key={b.label}>{b.value}</span>
                    ))}
                  </div>
                  <span className="country-card__cta">VIEW GUIDE <i className="fas fa-arrow-right"></i></span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
