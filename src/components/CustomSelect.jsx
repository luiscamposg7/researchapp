import { useState, useRef, useEffect } from "react";

export default function CustomSelect({ value, onChange, options, dark, fullWidth }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find(o => o.value === value) || options[0];

  return (
    <div ref={ref} className="relative" style={fullWidth ? {} : { width: 180, flexShrink: 0 }}>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between text-sm font-normal rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-400 ${dark ?"bg-surface border text-primary" :"text-secondary"}`}
        style={!dark ? { height:"40px", borderRadius:"8px", border:"1px solid #D5D7DA", background:"#FFF", boxShadow:"0 1px 2px 0 rgba(10,13,18,0.05)", paddingLeft:"14px", paddingRight:"14px" } : { height:"40px", borderRadius:"8px", boxShadow:"0 1px 2px 0 rgba(10,13,18,0.05)", paddingLeft:"14px", paddingRight:"14px" }}
      >
        <span className={`truncate ${selected.value === "" ? "text-muted" : ""}`}>{selected.label}</span>
        <svg className={`w-4 h-4 flex-shrink-0 transition-transform ${open ?"rotate-180" :""} text-tertiary`} style={{marginLeft:"8px", marginRight:"4px"}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <ul
          className="absolute z-50 w-full mt-1 py-1 text-sm bg-surface border text-secondary"
          style={{ borderRadius:"8px", boxShadow:"0 1px 2px 0 rgba(10,13,18,0.05)", top:"100%", left:0 }}
        >
          {options.map(o => (
            <li
              key={o.value}
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`px-3.5 py-2 cursor-pointer ${o.value === "" ? "text-muted hover:bg-hover" : value === o.value ? (dark ?"bg-green-900/30 text-green-400" :"bg-green-50 text-green-700 font-medium") :"hover:bg-hover"}`}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
