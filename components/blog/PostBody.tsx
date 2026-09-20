import ReactMarkdown from "react-markdown";

const INK_NAVY = "#0F172A";
const INDIGO = "#4F46E5";
const BORDER = "#E2E5EE";

// react-markdown does not render raw HTML by default, so post bodies can't
// inject markup/scripts. Element styling is inline to match the rest of the site.
export default function PostBody({ markdown }: { markdown: string }) {
  return (
    <div style={{ color: INK_NAVY, fontSize: "17px", lineHeight: 1.75 }}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h2 style={{ fontSize: "28px", margin: "36px 0 14px" }}>{children}</h2>,
          h2: ({ children }) => <h2 style={{ fontSize: "26px", margin: "36px 0 14px" }}>{children}</h2>,
          h3: ({ children }) => <h3 style={{ fontSize: "21px", margin: "28px 0 12px" }}>{children}</h3>,
          p: ({ children }) => <p style={{ marginBottom: "18px" }}>{children}</p>,
          ul: ({ children }) => <ul style={{ paddingLeft: "22px", marginBottom: "18px" }}>{children}</ul>,
          ol: ({ children }) => <ol style={{ paddingLeft: "22px", marginBottom: "18px" }}>{children}</ol>,
          li: ({ children }) => <li style={{ marginBottom: "8px" }}>{children}</li>,
          a: ({ href, children }) => (
            <a href={href} style={{ color: INDIGO, textDecoration: "underline" }}>
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote style={{ borderLeft: `4px solid ${INDIGO}`, paddingLeft: "18px", margin: "0 0 18px", fontStyle: "italic" }}>
              {children}
            </blockquote>
          ),
          hr: () => <hr style={{ border: 0, borderTop: `1px solid ${BORDER}`, margin: "28px 0" }} />,
          img: ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={typeof src === "string" ? src : undefined} alt={alt ?? ""} style={{ maxWidth: "100%", height: "auto", borderRadius: "10px" }} />
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
