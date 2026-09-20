"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import CourseSuggestInput from "@/components/search/CourseSuggestInput";

// The overlay's show/hide is vendor JS toggling a `.show` class (see
// main.js's popupSarchBox), not React state — Header/SideMenu live in the
// root layout and persist across client-side navigations, so without this
// the overlay would still be showing on top of /courses afterward.
function closePopup() {
  document.querySelector(".popup-search-box")?.classList.remove("show");
}

export default function NavSearchForm() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    closePopup();
    router.push(trimmed ? `/courses?q=${encodeURIComponent(trimmed)}` : "/courses");
  }

  return (
    <form onSubmit={handleSubmit}>
      <CourseSuggestInput
        value={query}
        onChange={setQuery}
        placeholder="What are you looking for?"
        onNavigate={closePopup}
      />
      <button type="submit">
        <i className="fal fa-search"></i>
      </button>
    </form>
  );
}
