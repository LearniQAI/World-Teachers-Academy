// Shared rendering for Privacy Policy / Terms of Service sections — same
// bordered-card treatment used for structured content elsewhere on the site
// (e.g. the Country Guides' Reading blocks), sized for long-form legal text.
const INK_NAVY = "#0F172A";
const INDIGO = "#4F46E5";
const BORDER = "#E2E5EE";
const PAPER_DIM = "#4B5563";

export type PolicyBlock =
  | { kind: "text"; text: React.ReactNode }
  | { kind: "list"; items: React.ReactNode[] }
  | { kind: "tbd"; text: React.ReactNode };

export type PolicySectionData = {
  heading: string;
  blocks: PolicyBlock[];
};

function TbdNote({ text }: { text: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#FFF4EA",
        borderLeft: "4px solid #F97316",
        borderRadius: "8px",
        padding: "14px 18px",
        marginBottom: "14px",
        color: "#9A3412",
        fontSize: "14px",
        fontWeight: 600,
      }}
    >
      {text}
    </div>
  );
}

function BlockView({ block }: { block: PolicyBlock }) {
  switch (block.kind) {
    case "text":
      return (
        <p style={{ color: PAPER_DIM, lineHeight: 1.7, marginBottom: "14px" }}>{block.text}</p>
      );
    case "list":
      return (
        <ul style={{ paddingLeft: "20px", marginBottom: "14px" }}>
          {block.items.map((item, i) => (
            <li key={i} style={{ color: PAPER_DIM, lineHeight: 1.7, marginBottom: "8px" }}>
              {item}
            </li>
          ))}
        </ul>
      );
    case "tbd":
      return <TbdNote text={block.text} />;
  }
}

export default function PolicySection({ section, index }: { section: PolicySectionData; index: number }) {
  return (
    <div style={{ border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "28px 30px", marginBottom: "22px", background: "#fff" }}>
      <h2 style={{ fontSize: "20px", color: INK_NAVY, marginBottom: "14px", display: "flex", gap: "12px", alignItems: "baseline" }}>
        <span style={{ color: INDIGO, fontWeight: 800 }}>{index}.</span>
        {section.heading}
      </h2>
      {section.blocks.map((block, i) => (
        <BlockView block={block} key={i} />
      ))}
    </div>
  );
}
