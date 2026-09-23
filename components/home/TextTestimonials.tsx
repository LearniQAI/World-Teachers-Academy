// Real student text testimonials, shared by the homepage and /courses so both
// pages show the same cards.
const testimonials = [
    { name: "Anika van der Merwe", image: "/assets/Image testimonial 1.jpeg", quote: "The online mentorship program completely transformed how I approach my university studies. Having a dedicated coach helped me break down complex assignments and manage my time so much better!" },
    { name: "Liam du Plessis", image: "/assets/Testimonial image 2.jpeg", quote: "I was struggling to figure out my career path after graduation. The personalized advice and industry insights I received gave me the exact clarity and confidence I needed to land my first role." },
    { name: "Lwazi Mokoena", image: "/assets/Testimonial image 3.jpeg", quote: "Connecting one-on-one with an industry expert changed everything for me. Instead of guessing my way through professional challenges, I had tailored guidance every step of the way." },
    { name: "Zola Dlamini", image: "/assets/Testimonial image 4.jpeg", quote: "The resources and mentorship platform provided an incredible support system. It’s amazing how fast you can grow and gain practical skills when you have a mentor who truly listens to your goals." },
    { name: "Priya Naidoo", image: "/assets/Testimonial image 5.jpeg", quote: "This mentorship framework is absolute gold. Being able to solve real-world challenges through direct digital sessions accelerated my learning curve beyond what I expected." },
    { name: "Keegan van Rooyen", image: "/assets/Testimonial image 6.jpeg", quote: "Having direct access to experienced professionals through this platform helped me bridge the gap between classroom theory and real industry practice. Highly recommended for any student!" },
];

// "fade" is the homepage layout (one quote at a time beside the contact form);
// "carousel" shows several cards that slide right-to-left, used on /courses.
const SLIDER_OPTIONS = {
    fade: { effect: "fade", autoHeight: "true" },
    carousel: {
        effect: "slide",
        loop: true,
        speed: 800,
        autoplay: { delay: 2000, disableOnInteraction: false },
        breakpoints: { "0": { slidesPerView: 1 }, "768": { slidesPerView: 2 }, "1200": { slidesPerView: 3 } },
    },
};

export default function TextTestimonials({ variant = "fade" }: { variant?: "fade" | "carousel" }) {
    const isCarousel = variant === "carousel";
    const sliderId = isCarousel ? "testiSlideCarousel" : "testiSlide7";
    return (
        <>
            <div className={isCarousel ? "title-area text-center" : "title-area"}>
                <span className="sub-title text-theme th_fade_anim"><img src="/assets/img/icon/subtitle-icon1-6.svg" alt="img" />Testimonials</span>
                <h2 className="sec-title th_fade_anim"><span className="th-text-perspective">What Trainer Says</span></h2>
            </div>
            <div className={isCarousel ? "slider-area testi-carousel th_fade_anim" : "slider-area testi-slider7 th_fade_anim"}>
                <div className="swiper th-slider" id={sliderId} data-slider-options={JSON.stringify(SLIDER_OPTIONS[variant])}>
                    <div className="swiper-wrapper">
                        {testimonials.map((t) => (
                            <div className="swiper-slide" key={t.name}>
                                <div className="testi-card">
                                    <div className="testi-meta-wrap">
                                        <div className="quote-icon">
                                            <img src="/assets/img/icon/quote5.svg" alt="" />
                                        </div>
                                        <div className="testi-review-wrap">
                                            <h3 className="rating-title"><strong>4.9</strong>/5.0</h3>
                                            <span className="testi-card_review">
                                                <i className="fas fa-star"></i>
                                                <i className="fas fa-star"></i>
                                                <i className="fas fa-star"></i>
                                                <i className="fas fa-star"></i>
                                                <i className="fas fa-star"></i>
                                            </span>
                                        </div>
                                    </div>
                                    <p className="box-text">“{t.quote}”</p>
                                    <div className="testi-card-profile">
                                        <div className="box-thumb">
                                            <img src={t.image} alt={t.name} />
                                        </div>
                                        <div className="media-left">
                                            <h3 className="testi-card_name">{t.name}</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="icon-box th_fade_anim">
                    <button data-slider-prev={`#${sliderId}`} className="slider-arrow default style3 slider-prev">
                        <svg width="17" height="15" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.4672 0C8.4672 0.783225 7.69103 1.95525 6.90638 2.93955C5.89598 4.20682 4.69013 5.3139 3.30645 6.15915C2.26988 6.79208 1.01115 7.39965 1.90735e-06 7.39965M8.4672 14.8176C8.4672 14.0344 7.69103 12.8623 6.90638 11.878C5.89598 10.6108 4.69013 9.5037 3.30645 8.65845C2.26988 8.02552 1.01115 7.41795 1.90735e-06 7.41795M1.90735e-06 7.4088H16.9344" stroke="currentColor"  />
                        </svg>
                    </button>
                    <button data-slider-next={`#${sliderId}`} className="slider-arrow default style3 slider-next">
                        <svg width="17" height="15" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.4672 0C8.4672 0.783225 9.24338 1.95525 10.028 2.93955C11.0384 4.20682 12.2443 5.3139 13.628 6.15915C14.6645 6.79208 15.9233 7.39965 16.9344 7.39965M8.4672 14.8176C8.4672 14.0344 9.24338 12.8623 10.028 11.878C11.0384 10.6108 12.2443 9.5037 13.628 8.65845C14.6645 8.02552 15.9233 7.41795 16.9344 7.41795M16.9344 7.4088H0" stroke="currentColor"  />
                        </svg>
                    </button>
                </div>
            </div>
        </>
    );
}
