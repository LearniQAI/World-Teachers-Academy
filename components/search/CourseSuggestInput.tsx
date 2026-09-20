"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { searchCourses, type CourseCatalogEntry } from "@/lib/courses-catalog";
import { getCourseBySlug } from "@/lib/mock-courses";

const MAX_SUGGESTIONS = 6;
const DEBOUNCE_MS = 200;
const BLUR_CLOSE_DELAY_MS = 150;

const INK_NAVY = "#0F172A";
const PAPER_DIM = "#6B7280";
const BORDER = "#E2E5EE";
const HIGHLIGHT_BG = "#EEF0FF";

// Only courses that have a real detail page get a direct link. The catalog's
// "Supply Chain Management" has no mock-courses entry, and the [slug] route
// would silently render the TEFL course for it — so send that one to the
// filtered catalog instead of a mislabeled page.
function courseHref(course: CourseCatalogEntry): string {
  return getCourseBySlug(course.slug)
    ? `/courses/${course.slug}`
    : `/courses?q=${encodeURIComponent(course.title)}`;
}

// Input + live suggestions dropdown. Renders a fragment, so the dropdown is
// positioned against the nearest positioned ancestor (the parent form in both
// places this is used). The parent still owns the query state and the
// Enter-with-no-highlight submit fallback (`/courses?q=`).
export default function CourseSuggestInput({
  value,
  onChange,
  placeholder,
  onNavigate,
  inputProps,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  // Called just before navigating to a chosen suggestion (e.g. to close the navbar popup).
  onNavigate?: () => void;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}) {
  const router = useRouter();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [open, setOpen] = useState(false);
  const [debounced, setDebounced] = useState("");
  const [highlight, setHighlight] = useState(-1);

  // Debounce so results aren't recomputed on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(value);
      setHighlight(-1);
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [value]);

  // Same matching as the /courses?q= filter — reuse it, don't fork it.
  const allMatches = useMemo(() => (debounced.trim() ? searchCourses(debounced) : []), [debounced]);
  const suggestions = allMatches.slice(0, MAX_SUGGESTIONS);
  const activeIndex = highlight < suggestions.length ? highlight : -1;

  const visible = open && value.trim() !== "" && debounced.trim() !== "";

  // Click outside closes the dropdown.
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (!inputRef.current?.contains(target) && !listRef.current?.contains(target)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  useEffect(() => () => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
  }, []);

  function go(course: CourseCatalogEntry) {
    setOpen(false);
    setHighlight(-1);
    onNavigate?.();
    router.push(courseHref(course));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const count = suggestions.length;
    if (e.key === "ArrowDown" && count > 0) {
      e.preventDefault();
      setOpen(true);
      setHighlight((activeIndex + 1) % count);
    } else if (e.key === "ArrowUp" && count > 0) {
      e.preventDefault();
      setOpen(true);
      setHighlight(activeIndex <= 0 ? count - 1 : activeIndex - 1);
    } else if (e.key === "Escape" && visible) {
      e.preventDefault();
      setOpen(false);
      setHighlight(-1);
    } else if (e.key === "Enter" && visible && activeIndex >= 0) {
      // A highlighted suggestion wins; otherwise the form's own submit handler runs.
      e.preventDefault();
      go(suggestions[activeIndex]);
    }
  }

  return (
    <>
      <input
        {...inputProps}
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        autoComplete="off"
        role="combobox"
        aria-expanded={visible}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={visible && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          if (blurTimer.current) clearTimeout(blurTimer.current);
          setOpen(true);
        }}
        // Delay so a click on a suggestion registers before the list unmounts.
        onBlur={() => {
          blurTimer.current = setTimeout(() => setOpen(false), BLUR_CLOSE_DELAY_MS);
        }}
        onKeyDown={handleKeyDown}
      />

      {visible && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            zIndex: 60,
            margin: 0,
            padding: "6px",
            listStyle: "none",
            textAlign: "left",
            background: "#fff",
            border: `1px solid ${BORDER}`,
            borderRadius: "14px",
            boxShadow: "0 12px 32px rgba(15, 23, 42, 0.14)",
          }}
        >
          {suggestions.length === 0 ? (
            <li role="option" aria-selected={false} style={{ padding: "14px 16px", color: PAPER_DIM, fontSize: "15px" }}>
              No matching courses
            </li>
          ) : (
            suggestions.map((course, i) => (
              <li key={course.slug} id={`${listId}-${i}`} role="option" aria-selected={i === activeIndex}>
                <a
                  href={courseHref(course)}
                  // Keep focus on the input so blur never beats the click.
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={(e) => {
                    e.preventDefault();
                    go(course);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "8px 10px",
                    borderRadius: "10px",
                    color: INK_NAVY,
                    fontWeight: 600,
                    fontSize: "15px",
                    background: i === activeIndex ? HIGHLIGHT_BG : "transparent",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={course.image}
                    alt=""
                    style={{ width: "44px", height: "44px", borderRadius: "8px", objectFit: "cover", flex: "0 0 44px" }}
                  />
                  <span>{course.title}</span>
                </a>
              </li>
            ))
          )}
          {allMatches.length > MAX_SUGGESTIONS && (
            <li style={{ padding: "8px 16px 6px", color: PAPER_DIM, fontSize: "13px" }}>
              Press Enter to see all {allMatches.length} results
            </li>
          )}
        </ul>
      )}
    </>
  );
}
