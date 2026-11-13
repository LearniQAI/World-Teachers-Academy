import NavSearchForm from "@/components/layout/NavSearchForm";
import SocialLinks from "@/components/layout/SocialLinks";
import { CONTACT_EMAIL, MISSION_LINE, START_TRAINING_URL } from "@/lib/site";
import { formatPostDate, getLatestPosts } from "@/lib/posts-data";

export default async function SideMenu() {
  const latestPosts = await getLatestPosts(3);

  return (
    <>
    <div className="sidemenu-wrapper sidemenu-info d-none d-lg-block ">
        <div className="sidemenu-content">
            <button className="closeButton sideMenuCls"><i className="far fa-times"></i></button>
            <div className="widget  ">
                <div className="th-widget-about">
                    <div className="about-logo">
                        <a href="/"><img src="/assets/img/world-teachers-logo.jpeg" alt="World Teachers Academy" style={{ height: '70px', width: 'auto' }} /></a>
                    </div>
                    <p className="about-text">{MISSION_LINE}</p>
                    <a href={START_TRAINING_URL} className="th-btn btn-sm">Start Free Training<svg className="ms-2" width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7.5264 0C7.5264 0.6962 8.21633 1.738 8.9138 2.61293C9.81193 3.7394 10.8838 4.72347 12.1137 5.4748C13.0351 6.0374 14.154 6.57747 15.0528 6.57747M7.5264 13.1712C7.5264 12.475 8.21633 11.4332 8.9138 10.5583C9.81193 9.43187 10.8838 8.44773 12.1137 7.6964C13.0351 7.1338 14.154 6.59373 15.0528 6.59373M15.0528 6.5856H0" stroke="currentColor" strokeWidth="1.5"  />
                        </svg>
                    </a>
                </div>
            </div>
            <div className="widget  ">
                <h3 className="widget_title">Recent Posts</h3>
                <div className="recent-post-wrap">
                    {latestPosts.map((post) => (
                        <div className="recent-post" key={post.id}>
                            {post.cover_image_url && (
                                <div className="media-img">
                                    <a href={`/blog/${post.slug}`}><img src={post.cover_image_url} alt={post.title} /></a>
                                </div>
                            )}
                            <div className="media-body">
                                <h4 className="post-title"><a className="text-inherit" href={`/blog/${post.slug}`}>{post.title}</a></h4>
                                <div className="recent-post-meta">
                                    <a href={`/blog/${post.slug}`}><i className="fal fa-calendar-days"></i>{formatPostDate(post.published_at)}</a>
                                </div>
                            </div>
                        </div>
                    ))}
                    {latestPosts.length === 0 && <p style={{ margin: 0 }}>No articles published yet.</p>}
                </div>
            </div>
            <div className="widget">
                <h3 className="widget_title">Questions?</h3>
                {/* The template's newsletter form was not connected to anything (emails were lost).
                    Until a real, consented newsletter exists, invite visitors to email us instead. */}
                <p style={{ marginBottom: 16 }}>Ask us about our programmes, launch dates or your teaching plans.</p>
                <a href={`mailto:${CONTACT_EMAIL}`} className="th-btn btn-sm">Email us</a>
                <SocialLinks className="th-social style3 mt-30" />
            </div>
        </div>
    </div>
    <div className="popup-search-box d-none d-lg-block">
        <button className="searchClose"><i className="far fa-times"></i></button>
        <NavSearchForm />
    </div>
    </>
  );
}
