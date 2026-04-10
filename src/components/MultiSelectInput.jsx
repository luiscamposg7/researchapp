import { useState, useRef } from "react";
import { useClickOutside } from "../hooks/useClickOutside";

export default function MultiSelectInput({ value = [], onChange, options = [], placeholder = "Buscar..." }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const filtered = options.filter(o => !value.includes(o) && o.toLowerCase().includes(query.toLowerCase()));

  const add = (item) => { onChange([...value, item]); setQuery(""); inputRef.current?.focus(); };
  const remove = (item) => onChange(value.filter(v => v !== item));

  useClickOutside(containerRef, () => setOpen(false));

  return (
    <div ref={containerRef} className="relative">
      <div
        className={`flex flex-wrap items-center gap-1.5 min-h-[42px] w-full px-3 py-2 rounded-lg border bg-surface text-primary text-sm transition-shadow ${open ? "ring-2 ring-green-400 border-green-400" : "border"}`}
        onClick={() => { setOpen(true); inputRef.current?.focus(); }}
      >
        {value.map(item => (
          <span key={item} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-sm font-medium bg-muted text-secondary ring-1 ring-inset ring-border">
            {item}
            <button
              type="button"
              onMouseDown={e => { e.stopPropagation(); remove(item); }}
              className="text-muted hover:text-secondary ml-0.5"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          className="flex-1 min-w-[80px] bg-transparent outline-none placeholder-muted text-sm"
          placeholder={value.length === 0 ? placeholder : ""}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={e => {
            if (e.key === "Backspace" && query === "" && value.length > 0) remove(value[value.length - 1]);
            if (e.key === "Escape") setOpen(false);
            if (e.key === "Enter" && filtered.length > 0) { e.preventDefault(); add(filtered[0]); }
          }}
        />
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border bg-surface shadow-lg overflow-hidden">
          <ul className="max-h-48 overflow-y-auto py-1">
            {filtered.map(item => (
              <li key={item}>
                <button
                  type="button"
                  onMouseDown={e => { e.preventDefault(); add(item); }}
                  className="w-full text-left px-3 py-2 text-sm text-primary hover:bg-hover transition-colors"
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
