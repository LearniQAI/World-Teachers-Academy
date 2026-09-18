"use client";

import { useState } from "react";

interface Testimonial {
  videoId: string;
  caption: string;
}

// TODO: replace with real student name + course/certification once
// confirmed — do not reuse the old "TEFL Graduate / Certified 2026" style
// captions, they were placeholder content not tied to these actual videos
const TESTIMONIALS: Testimonial[] = [
  { videoId: "eIfd4NEZyNg", caption: "Student Testimonial 1" },
  { videoId: "Yi9lpwk1dxg", caption: "Student Testimonial 2" },
  { videoId: "-gMCdjqscSc", caption: "Student Testimonial 3" },
  { videoId: "M59LuXqw8UY", caption: "Student Testimonial 4" },
];

export default function VideoTestimonials() {
  return (
    <div className="video-testi-grid">
      {TESTIMONIALS.map((t) => (
        <VideoTestimonialTile key={t.videoId} {...t} />
      ))}
    </div>
  );
}

function VideoTestimonialTile({ videoId, caption }: Testimonial) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="video-testi-card th_fade_anim">
      {playing ? (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title={caption}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
        />
      ) : (
        <>
          {/* hqdefault.jpg comes back landscape/letterboxed even for vertical
              Shorts — position:absolute + inset:0 + object-fit:cover takes it
              fully out of flow and crops it to fill this portrait tile,
              instead of sizing the tile to the image's own aspect ratio. */}
          <img
            src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
            alt={caption}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          <button
            type="button"
            className="play-btn"
            aria-label={`Play ${caption}`}
            onClick={() => setPlaying(true)}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              zIndex: 2,
            }}
          >
            <i className="fas fa-solid fa-play"></i>
          </button>
          <div className="video-testi-caption" style={{ zIndex: 1 }}>
            <h4 className="box-name">{caption}</h4>
          </div>
        </>
      )}
    </div>
  );
}
