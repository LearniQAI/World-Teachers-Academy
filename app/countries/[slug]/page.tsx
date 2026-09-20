import { notFound } from "next/navigation";
import { COUNTRY_SECTIONS, PENDING_TEXT, countries, getCountryBySlug } from "@/lib/countries-data";

// TODO: COUNTRY CONTENT — source from official/verified sources before this
// section goes live. Every section on this page is a marked placeholder.

const INK_NAVY = "#0F172A";
const PAPER_DIM = "#6B7280";
const BORDER = "#E2E5EE";

export function generateStaticParams() {
  return countries.map((c) => ({ slug: c.slug }));
}

export default async function CountryDetails({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const country = getCountryBySlug(slug);

  if (!country) {
    notFound();
  }

  return (
    <>
      {/*==============================
    Breadcumb
============================== */}
      <div className="breadcumb-wrapper " data-bg-src="/assets/img/bg/breadcumb-bg.png">
        <div className="container">
          <div className="row">
            <div className="col-lg-9">
              <div className="breadcumb-content">
                <span className="sub-title text-theme"><img src="/assets/img/icon/subtitle-icon1-6.svg" alt="img" />Country Guide</span>
                <h1 className="breadcumb-title">{country.name}</h1>
                <ul className="breadcumb-menu">
                  <li><a href="/">Home</a></li>
                  <li><a href="/countries">Countries</a></li>
                  <li>{country.name}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/*==============================
    Country Details
============================== */}
      <section className="space-top space-extra-bottom overflow-hidden">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-9 col-lg-10">
              {COUNTRY_SECTIONS.map((heading) => (
                <div key={heading} style={{ marginBottom: "32px" }}>
                  <h3 style={{ fontSize: "20px", color: INK_NAVY, marginBottom: "14px" }}>{heading}</h3>
                  <div style={{ border: `1px dashed ${BORDER}`, borderRadius: "10px", padding: "20px", color: PAPER_DIM, background: "#FAFBFF" }}>
                    {PENDING_TEXT}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
