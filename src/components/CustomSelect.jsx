import { useState, useRef, useEffect } from "react";

export default function CustomSelect({ value, onChange, options, dark }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find(o => o.value === value) || options[0];

  return (
    <div ref={ref} className="relative flex-shrink-0" style={{ width: 180 }}>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between pl-3.5 pr-3 text-sm font-medium rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-400 ${dark ? "bg-gray-800 border border-gray-700 text-gray-200" : "text-gray-700"}`}
        style={!dark ? { height:"40px", borderRadius:"8px", border:"1px solid #D5D7DA", background:"#FFF", boxShadow:"0 1px 2px 0 rgba(10,13,18,0.05)" } : { height:"40px", borderRadius:"8px", boxShadow:"0 1px 2px 0 rgba(10,13,18,0.05)" }}
      >
        <span className="truncate">{selected.label}</span>
        <svg className={`w-4 h-4 flex-shrink-0 ml-2 transition-transform ${open ? "rotate-180" : ""} ${dark ? "text-gray-400" : "text-gray-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <ul
          className={`absolute z-50 w-full mt-1 py-1 text-sm ${dark ? "bg-gray-800 border-gray-700 text-gray-200" : "text-gray-700 bg-white"}`}
          style={{ borderRadius:"8px", border:"1px solid #D5D7DA", boxShadow:"0 1px 2px 0 rgba(10,13,18,0.05)", top:"100%", left:0 }}
        >
          {options.map(o => (
            <li
              key={o.value}
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`px-3.5 py-2 cursor-pointer ${value === o.value
                ? (dark ? "bg-green-900/30 text-green-400" : "bg-green-50 text-green-700 font-medium")
                : (dark ? "hover:bg-gray-700" : "hover:bg-gray-50")
              }`}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
