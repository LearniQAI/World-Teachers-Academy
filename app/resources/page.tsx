const resourceCards = [
  {
    img: "/assets/img/blog/blog_1_1.jpg",
    date: "20",
    month: "Jan, 2026",
    categories: ["Certification"],
    title: "A New Teacher's Guide to Getting TEFL Certified",
    delay: ".3",
  },
  {
    img: "/assets/img/blog/blog_1_2.jpg",
    date: "15",
    month: "Feb, 2026",
    categories: ["Working Abroad"],
    title: "Visa & Work Permit Basics for Teaching Overseas",
    delay: ".5",
  },
  {
    img: "/assets/img/blog/blog_1_3.jpg",
    date: "18",
    month: "Feb, 2026",
    categories: ["Classroom"],
    title: "Classroom Management: Your First 30 Days",
    delay: ".7",
  },
  {
    img: "/assets/img/blog/blog_1_4.jpg",
    date: "25",
    month: "Mar, 2026",
    categories: ["Career"],
    title: "How to Write a Teaching CV That Actually Gets Read",
    delay: ".3",
  },
  {
    img: "/assets/img/blog/blog_1_5.jpg",
    date: "19",
    month: "Apr, 2026",
    categories: ["Certification"],
    title: "TEFL vs. TESOL vs. CELTA: What's the Difference?",
    delay: ".5",
  },
  {
    img: "/assets/img/blog/blog_1_6.jpg",
    date: "27",
    month: "Apr, 2026",
    categories: ["Working Abroad"],
    title: "What to Expect: Teaching in Southeast Asia",
    delay: ".7",
  },
  {
    img: "/assets/img/blog/blog_1_7.jpg",
    date: "12",
    month: "May, 2026",
    categories: ["Classroom"],
    title: "5 Lesson Planning Templates Every New Teacher Should Try",
    delay: ".3",
  },
  {
    img: "/assets/img/blog/blog_1_8.jpg",
    date: "07",
    month: "Jun, 2026",
    categories: ["Career"],
    title: "Interview Questions to Expect at International Schools",
    delay: ".5",
  },
  {
    img: "/assets/img/blog/blog_1_9.jpg",
    date: "21",
    month: "Jul, 2026",
    categories: ["Wellbeing"],
    title: "Avoiding Burnout in Your First Year of Teaching",
    delay: ".7",
  },
];

const READ_MORE_ICON = (
  <svg className="ms-2" width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.5264 0C7.5264 0.6962 8.21633 1.738 8.9138 2.61293C9.81193 3.7394 10.8838 4.72347 12.1137 5.4748C13.0351 6.0374 14.154 6.57747 15.0528 6.57747M7.5264 13.1712C7.5264 12.475 8.21633 11.4332 8.9138 10.5583C9.81193 9.43187 10.8838 8.44773 12.1137 7.6964C13.0351 7.1338 14.154 6.59373 15.0528 6.59373M15.0528 6.5856H0" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export default function Resources() {
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
                <span className="sub-title text-theme"><img src="/assets/img/icon/subtitle-icon1-6.svg" alt="img" />Resources</span>
                <h1 className="breadcumb-title">Guides &amp; Resources for Teachers</h1>
                <p className="breadcumb-text" style={{ maxWidth: 520 }}>Practical guides on certification, working abroad, classroom management, and building a teaching career &mdash; new resources added regularly.</p>
                <ul className="breadcumb-menu">
                  <li><a href="/">Home</a></li>
                  <li>Resources</li>
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
Blog Area
==============================*/}
      <section className="space-top space-extra-bottom" id="blog-sec">
        <div className="container">
          <div className="row gy-40">
            {resourceCards.map((card, i) => (
              <div className="col-lg-4 col-md-6 th_fade_anim th--hover-item" data-delay={card.delay} key={i}>
                <div className="blog-card">
                  <div className="blog-img">
                    <a className="th--hover-img" href="/resources" data-displacement="/assets/img/imghover/fluid.jpg" data-intensity="0.2" data-speedin="1" data-speedout="1"><img src={card.img} alt="Blog Image" /></a>
                    <a className="blog-date" href="/resources">{card.date}<span className="year">{card.month}</span></a>
                  </div>
                  <div className="blog-content">
                    <div className="blog-meta">
                      {card.categories.map((cat) => (
                        <a href="/resources" key={cat}>{cat}</a>
                      ))}
                    </div>
                    <h2 className="box-title"><a href="/resources">{card.title}</a></h2>
                    <p className="blog-text">Full guide coming soon &mdash; here&apos;s what this resource will cover...</p>
                    <a href="/resources" className="th-btn style4 btn-sm">READ MORE{READ_MORE_ICON}</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="th-pagination text-center mt-60">
            <ul>
              <li><a href="/resources"><i className="fal fa-arrow-left me-2"></i>Prev</a></li>
              <li><a href="/resources">1</a></li>
              <li><a href="/resources">2</a></li>
              <li><a href="/resources">Next<i className="fal fa-arrow-right ms-2"></i></a></li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
