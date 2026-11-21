interface Testimonial {
  videoId: string;
}

// Owner-approved student testimonial Shorts (21 Nov 2026), in this order.
// No names or captions: the owner asked for the videos only.
// Thumbnails are stored in public/images/testimonials/<videoId>.webp so they
// show even where YouTube images are blocked. If a video's thumbnail changes
// on YouTube, replace its file there.
// Clicking a card opens the original Short on YouTube in a new tab.
const TESTIMONIALS: Testimonial[] = [
  { videoId: "Pbi5eriOQyc" },
  { videoId: "gW-_6vDub74" },
  { videoId: "EdgkvHHwwPk" },
  { videoId: "WGoJDenQzgw" },
];

export default function VideoTestimonials() {
  return (
    <ul className="video-testi-grid">
      {TESTIMONIALS.map((t, i) => (
        <li key={t.videoId} className="video-testi-card th_fade_anim">
          <a
            className="video-testi-link"
            href={`https://www.youtube.com/shorts/${t.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Watch student testimonial ${i + 1} on YouTube (opens in a new tab)`}
          >
            <img
              src={`/images/testimonials/${t.videoId}.webp`}
              alt=""
              width={356}
              height={632}
              loading="lazy"
              decoding="async"
            />
            <span className="video-testi-label">Watch on YouTube</span>
            <span className="video-testi-play" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z" />
              </svg>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
