import { notFound } from "next/navigation";
import AudioPlayer, { type AudioPlayerProps } from "@/components/audio/AudioPlayer";
import { audioTracks } from "@/lib/audio-tracks";
import { getCountryBySlug } from "@/lib/countries-data";
import CountryFlag from "@/components/layout/CountryFlag";

// Dev-only visual check of the audio player, light and dark side by side. 404s in production builds.
export default function AudioPreview() {
  if (process.env.NODE_ENV === "production") notFound();

  const country = getCountryBySlug("colombia");
  const countryTrack = audioTracks.country.colombia;
  const resourceTrack = audioTracks.resource["resume-design"];
  if (!country || !countryTrack || !resourceTrack) notFound();

  const samples: { label: string; props: Omit<AudioPlayerProps, "theme" | "trackId">; id: string }[] = [
    {
      label: "Country page (flag badge)",
      id: "country:colombia",
      props: { ...countryTrack, subtitle: country.debateAudio?.title, badge: <CountryFlag country={country} height={14} /> },
    },
    {
      label: "Resource page (headphones badge)",
      id: "resource:resume-design",
      props: { ...resourceTrack, subtitle: "Application Skills" },
    },
  ];

  return (
    <section className="space">
      <div className="container">
        <h1 style={{ fontSize: "28px", marginBottom: "32px" }}>Audio player preview</h1>
        {samples.map((sample) => (
          <div key={sample.id} style={{ marginBottom: "48px" }}>
            <h2 style={{ fontSize: "16px", marginBottom: "16px" }}>{sample.label}</h2>
            <div className="row g-4">
              {(["light", "dark"] as const).map((theme) => (
                <div key={theme} className="col-xl-6">
                  <p style={{ fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>{theme}</p>
                  {/* Separate trackIds so the preview never touches a real page's saved position. */}
                  <AudioPlayer {...sample.props} theme={theme} trackId={`preview:${theme}:${sample.id}`} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
