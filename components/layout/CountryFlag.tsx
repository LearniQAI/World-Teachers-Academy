import type { Country } from "@/lib/countries-data";

// Windows browsers don't render flag emoji (they show "AR", "BR"...), so flags
// are real images. Multi-country guides carry codes like "PL · HU".
// Every flag gets the same 3:2 box (so country names line up) and a hairline
// border (so white-ground flags like Japan's don't vanish on a white menu).
export default function CountryFlag({ country, height = 16 }: { country: Country; height?: number }) {
  const codes = country.code.split("·").map((c) => c.trim().toLowerCase());
  const h = codes.length > 1 ? Math.round(height * 0.7) : height;
  const w = Math.round(h * 1.5);
  return (
    <span className="country-flag" aria-hidden="true">
      {codes.map((c) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={c}
          src={`https://flagcdn.com/${c}.svg`}
          alt=""
          width={w}
          height={h}
          style={{ width: w, height: h, objectFit: "cover", borderRadius: 2, border: "1px solid #E2E5EE", boxSizing: "border-box", flex: "none" }}
        />
      ))}
    </span>
  );
}
