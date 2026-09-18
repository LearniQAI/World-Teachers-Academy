"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HeroSearchForm() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/courses?q=${encodeURIComponent(trimmed)}` : "/courses");
  }

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <i className="far fa-search"></i>
        <input
          type="text"
          placeholder="Search TEFL, TESOL, Classroom Management..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <button className="th-btn" type="submit">
        FIND A COURSE
        <svg className="ms-2" width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.5264 0C7.5264 0.6962 8.21633 1.738 8.9138 2.61293C9.81193 3.7394 10.8838 4.72347 12.1137 5.4748C13.0351 6.0374 14.154 6.57747 15.0528 6.57747M7.5264 13.1712C7.5264 12.475 8.21633 11.4332 8.9138 10.5583C9.81193 9.43187 10.8838 8.44773 12.1137 7.6964C13.0351 7.1338 14.154 6.59373 15.0528 6.59373M15.0528 6.5856H0" stroke="currentColor" strokeWidth="1.5"></path>
        </svg>
      </button>
    </form>
  );
}
