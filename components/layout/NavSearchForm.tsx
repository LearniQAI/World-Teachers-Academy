"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NavSearchForm() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    // The overlay's show/hide is vendor JS toggling a `.show` class (see
    // main.js's popupSarchBox), not React state — Header/SideMenu live in
    // the root layout and persist across client-side navigations, so without
    // this the overlay would still be showing on top of /courses afterward.
    document.querySelector(".popup-search-box")?.classList.remove("show");
    router.push(trimmed ? `/courses?q=${encodeURIComponent(trimmed)}` : "/courses");
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="What are you looking for?"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button type="submit">
        <i className="fal fa-search"></i>
      </button>
    </form>
  );
}
