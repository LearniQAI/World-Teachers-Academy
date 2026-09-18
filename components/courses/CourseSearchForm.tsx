"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CourseSearchForm({ defaultQuery }: { defaultQuery: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/courses?q=${encodeURIComponent(trimmed)}` : "/courses");
  }

  return (
    <form
      className="search-form"
      onSubmit={handleSubmit}
      style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "40px" }}
    >
      <div className="form-group" style={{ position: "relative", flex: "1 1 320px", marginBottom: 0 }}>
        <i
          className="far fa-search"
          style={{
            position: "absolute",
            left: "20px",
            top: "50%",
            transform: "translateY(-50%)",
            right: "auto",
            pointerEvents: "none",
          }}
        ></i>
        <input
          type="text"
          className="form-control"
          placeholder="Search courses by name or topic..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ paddingLeft: "48px" }}
        />
      </div>
      <button className="th-btn" type="submit">
        SEARCH
      </button>
    </form>
  );
}
