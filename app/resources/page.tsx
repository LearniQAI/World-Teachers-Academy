import { resources } from "@/lib/resources-data";
import { truncateAtWord } from "@/lib/html-text";
import { audioTracks } from "@/lib/audio-tracks";
import PageHero from "@/components/layout/PageHero";

const READ_MORE_ICON = (
  <svg className="ms-2" width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.5264 0C7.5264 0.6962 8.21633 1.738 8.9138 2.61293C9.81193 3.7394 10.8838 4.72347 12.1137 5.4748C13.0351 6.0374 14.154 6.57747 15.0528 6.57747M7.5264 13.1712C7.5264 12.475 8.21633 11.4332 8.9138 10.5583C9.81193 9.43187 10.8838 8.44773 12.1137 7.6964C13.0351 7.1338 14.154 6.59373 15.0528 6.59373M15.0528 6.5856H0" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const DELAYS = [".3", ".5", ".7", ".3", ".5", ".7", ".3", ".5"];

const RESOURCE_ICONS: Record<string, string> = {
  "resume-design": "fa-light fa-file-lines",
  "self-introduction-video": "fa-light fa-video",
  "getting-your-documents-ready": "fa-light fa-folder-open",
  "understanding-visas-work-permits": "fa-light fa-passport",
  "building-a-teaching-portfolio": "fa-light fa-briefcase",
  "reading-a-country-before-you-go": "fa-light fa-earth-americas",
  "classroom-management-from-day-one": "fa-light fa-chalkboard-user",
  "tefl-vs-tesol-vs-celta": "fa-light fa-certificate",
};

export default function Resources() {
  return (
    <>
      <PageHero
        eyebrow="Resources"
        title="Everything You Need to Prepare"
        subhead="In-depth, practical guides covering every step of getting ready to teach abroad — resumes, visas, documents, portfolios, and more."
        crumb="Resources"
        image="/assets/img/resources-hero.jpg"
        imageAlt="A teacher planning their move abroad at a desk with a laptop, passport, and globe"
      />
      {/*==============================
Resources Area
==============================*/}
      <section className="space-top space-extra-bottom" id="resources-sec">
        <div className="container">
          <div className="row gy-40">
            {resources.map((resource, i) => {
              const hasVideo = resource.videos.some((v) => v.youtubeId);
              const hasAudio = Boolean(audioTracks.resource[resource.slug]);
              return (
                <div className="col-lg-4 col-md-6 th_fade_anim" data-delay={DELAYS[i % DELAYS.length]} key={resource.slug}>
                  <a href={`/resources/${resource.slug}`} className="resource-card" aria-label={resource.title}>
                    <div className="resource-card__top">
                      <span className="resource-card__icon" aria-hidden="true">
                        <i className={RESOURCE_ICONS[resource.slug] ?? "fa-light fa-book-open"}></i>
                      </span>
                      <span className="resource-card__category">{resource.category}</span>
                    </div>
                    <h2 className="resource-card__title">{resource.title}</h2>
                    <p className="resource-card__summary">{truncateAtWord(resource.summary, 130)}</p>
                    {(hasVideo || hasAudio) && (
                      <div className="resource-card__meta">
                        {hasVideo && (
                          <span className="resource-card__meta-item">
                            <i className="fa-light fa-circle-play"></i>Video guide
                          </span>
                        )}
                        {hasAudio && (
                          <span className="resource-card__meta-item">
                            <i className="fa-light fa-headphones"></i>Audio guide
                          </span>
                        )}
                      </div>
                    )}
                    <span className="resource-card__cta">READ GUIDE{READ_MORE_ICON}</span>
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
