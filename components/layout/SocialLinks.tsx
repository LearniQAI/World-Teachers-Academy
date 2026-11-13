import { SOCIAL_LINKS } from "@/lib/site";

// Renders the official social links, or nothing until they are configured.
export default function SocialLinks({ className }: { className: string }) {
  if (SOCIAL_LINKS.length === 0) return null;
  return (
    <div className={className}>
      {SOCIAL_LINKS.map((s) => (
        <a key={s.href} href={s.href} aria-label={s.label} target="_blank" rel="noopener noreferrer">
          <i className={s.icon} aria-hidden="true"></i>
        </a>
      ))}
    </div>
  );
}
