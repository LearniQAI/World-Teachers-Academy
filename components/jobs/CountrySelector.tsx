"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import CountryFlag from "@/components/layout/CountryFlag";

// Job Portal country selector: flag, country name and number of current
// openings. Built on the WAI-ARIA "select-only combobox with search" pattern:
// - the button announces the current choice and opens a panel;
// - inside, a search box filters the list; ↑/↓ move, Home/End jump,
//   Enter picks, Esc closes and returns focus to the button;
// - the list is a listbox with two groups: countries with openings, and
//   countries we have guides for but no openings right now (so they stay
//   discoverable and clearly marked).
// `variant="inline"` renders the list in the page flow (mobile filter sheet)
// instead of a floating panel.

export type CountryOption = { code: string; name: string; count: number };

type Props = {
  value: string; // ISO code or "all"
  onChange: (code: string) => void;
  withJobs: CountryOption[];
  withoutJobs: CountryOption[];
  totalJobs: number | null;
  variant?: "popover" | "inline";
};

type Item = CountryOption & { group: "all" | "jobs" | "none" };

export default function CountrySelector({ value, onChange, withJobs, withoutJobs, totalJobs, variant = "popover" }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const uid = useId().replace(/:/g, "");
  const listId = `cs-list-${uid}`;

  const allItem: Item = { code: "all", name: "All countries", count: totalJobs ?? 0, group: "all" };
  const items = useMemo<Item[]>(() => {
    const q = query.trim().toLowerCase();
    const match = (o: CountryOption) => !q || o.name.toLowerCase().includes(q) || o.code.toLowerCase() === q;
    return [
      ...(!q ? [allItem] : []),
      ...withJobs.filter(match).map((o) => ({ ...o, group: "jobs" as const })),
      ...withoutJobs.filter(match).map((o) => ({ ...o, group: "none" as const })),
    ];
    // allItem depends only on totalJobs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, withJobs, withoutJobs, totalJobs]);

  const selected =
    value === "all"
      ? allItem
      : [...withJobs, ...withoutJobs].find((o) => o.code === value) ?? { code: value, name: value, count: 0 };

  // Open: clear the search and highlight the current choice (done in the
  // event that opens the panel, not in an effect), then focus the search box.
  function openPanel() {
    const fullList = [allItem, ...withJobs, ...withoutJobs];
    const i = fullList.findIndex((it) => it.code === value);
    setQuery("");
    setActive(i >= 0 ? i : 0);
    setOpen(true);
  }
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Close on outside click.
  useEffect(() => {
    if (!open || variant === "inline") return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, variant]);

  // Keep the highlighted option in view.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function choose(code: string) {
    onChange(code);
    setOpen(false);
    buttonRef.current?.focus();
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(items.length - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (items[active]) choose(items[active].code);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
    } else if (e.key === "Tab" && variant === "popover") {
      setOpen(false);
    }
  }

  const countLabel = (o: Item | CountryOption) =>
    o.count === 0 ? "no openings right now" : `${o.count} opening${o.count === 1 ? "" : "s"}`;

  const renderOption = (it: Item) => {
    const i = items.indexOf(it);
    const isSelected = it.code === value;
    return (
      <li
        key={it.code}
        id={`${listId}-${it.code}`}
        role="option"
        aria-selected={isSelected}
        data-index={i}
        className={`cs-option${i === active ? " is-active" : ""}${isSelected ? " is-selected" : ""}${it.group === "none" ? " is-empty" : ""}`}
        onMouseMove={() => setActive(i)}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => choose(it.code)}
      >
        <span className="cs-option__flag">
          {it.group === "all" ? <i className="far fa-globe" aria-hidden="true"></i> : <CountryFlag code={it.code} height={14} decorative />}
        </span>
        <span className="cs-option__name">{it.name}</span>
        <span className="cs-option__count">{it.group === "none" ? "No openings" : it.count}</span>
        <span className="visually-hidden">, {countLabel(it)}</span>
      </li>
    );
  };

  const jobsItems = items.filter((it) => it.group === "jobs");
  const noneItems = items.filter((it) => it.group === "none");

  return (
    <div className={`cs cs--${variant}${open ? " is-open" : ""}`} ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className={`cs-button${value !== "all" ? " is-filtered" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? `${listId}-panel` : undefined}
        aria-label={`Country: ${selected.name}${value === "all" ? "" : `, ${countLabel(selected)}`}`}
        onClick={() => (open ? setOpen(false) : openPanel())}
        onKeyDown={(e) => {
          if ((e.key === "ArrowDown" || e.key === "ArrowUp") && !open) {
            e.preventDefault();
            openPanel();
          }
        }}
      >
        <span className="cs-option__flag" aria-hidden="true">
          {value === "all" ? <i className="far fa-globe"></i> : <CountryFlag code={value} height={14} decorative />}
        </span>
        <span className="cs-button__name">{selected.name}</span>
        {value !== "all" && selected.count > 0 && <span className="cs-option__count">{selected.count}</span>}
        <i className="far fa-chevron-down cs-button__chevron" aria-hidden="true"></i>
      </button>

      {open && (
        <div className="cs-panel" id={`${listId}-panel`}>
          <div className="cs-search">
            <i className="far fa-search" aria-hidden="true"></i>
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-label="Search countries"
              aria-autocomplete="list"
              aria-expanded="true"
              aria-controls={listId}
              aria-activedescendant={items[active] ? `${listId}-${items[active].code}` : undefined}
              placeholder="Search countries"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onKey}
            />
          </div>
          <ul className="cs-list" role="listbox" id={listId} aria-label="Countries" ref={listRef}>
            {items.filter((it) => it.group === "all").map(renderOption)}
            {jobsItems.length > 0 && (
              <li role="presentation" className="cs-group">
                <span className="cs-group__label" id={`${listId}-g1`}>Countries with openings</span>
                <ul role="group" aria-labelledby={`${listId}-g1`}>{jobsItems.map(renderOption)}</ul>
              </li>
            )}
            {noneItems.length > 0 && (
              <li role="presentation" className="cs-group">
                <span className="cs-group__label" id={`${listId}-g2`}>No openings right now</span>
                <ul role="group" aria-labelledby={`${listId}-g2`}>{noneItems.map(renderOption)}</ul>
              </li>
            )}
            {items.length === 0 && <li className="cs-none" role="presentation">No country matches “{query}”.</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
