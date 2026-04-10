import { useState, useRef } from "react";
import { useClickOutside } from "../hooks/useClickOutside";

export default function DateInput({ value, onChange, dark: d }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const parsed = value ? new Date(value + "T12:00:00") : new Date();
  const [cursor, setCursor] = useState({ y: parsed.getFullYear(), m: parsed.getMonth() });
  const today = new Date();
  const DAYS = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];
  const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

  useClickOutside(ref, () => setOpen(false));

  const cells = () => {
    const first = new Date(cursor.y, cursor.m, 1).getDay();
    const days = new Date(cursor.y, cursor.m + 1, 0).getDate();
    const prevDays = new Date(cursor.y, cursor.m, 0).getDate();
    const grid = [];
    for (let i = first - 1; i >= 0; i--) grid.push({ day: prevDays - i, cur: false });
    for (let i = 1; i <= days; i++) grid.push({ day: i, cur: true });
    while (grid.length < 42) grid.push({ day: grid.length - days - first + 1, cur: false });
    return grid;
  };

  const isSelected = (day, cur) => {
    if (!value || !cur) return false;
    const s = new Date(value + "T12:00:00");
    return s.getFullYear() === cursor.y && s.getMonth() === cursor.m && s.getDate() === day;
  };

  const isToday = (day, cur) => cur && today.getFullYear() === cursor.y && today.getMonth() === cursor.m && today.getDate() === day;

  const select = (day, cur) => {
    let y = cursor.y, m = cursor.m;
    if (!cur) { if (day > 15) { m--; if (m < 0) { m = 11; y--; } } else { m++; if (m > 11) { m = 0; y++; } } }
    const d2 = String(day).padStart(2, "0"), m2 = String(m + 1).padStart(2, "0");
    onChange(`${y}-${m2}-${d2}`);
    setCursor({ y, m });
    setOpen(false);
  };

  const prev = () => setCursor(c => c.m === 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m: c.m - 1 });
  const next = () => setCursor(c => c.m === 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m: c.m + 1 });

  const display = value
    ? new Date(value + "T12:00:00").toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" }).replace(".", "")
    : "Seleccionar fecha";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors bg-surface text-secondary hover:bg-hover"
      >
        <svg className="w-4 h-4 flex-shrink-0 text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        <span className={value ? "" : "text-tertiary"}>{display}</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-72 rounded-2xl border shadow-xl p-4 bg-surface">
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prev} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors text-tertiary hover:bg-hover">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
            </button>
            <span className="text-sm font-semibold text-primary">{MONTHS[cursor.m]} {cursor.y}</span>
            <button type="button" onClick={next} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors text-tertiary hover:bg-hover">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>

          <div className="grid grid-cols-7 mb-1">
            {DAYS.map(day => (
              <div key={day} className="text-center text-sm font-medium py-1 text-tertiary">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-0.5">
            {cells().map((cell, i) => {
              const sel = isSelected(cell.day, cell.cur);
              const tod = isToday(cell.day, cell.cur);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => select(cell.day, cell.cur)}
                  className={`h-9 w-full flex items-center justify-center rounded-lg text-sm transition-colors ${sel ?"text-white font-semibold" :""} ${!sel && cell.cur ?"text-secondary hover:bg-active" :""} ${!cell.cur ?"text-muted hover:bg-hover" :""} ${tod && !sel ? (d ?"font-semibold text-green-400" :"font-semibold text-green-600") :""}`}
                  style={sel ? { backgroundColor: "#00B369" } : {}}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t flex justify-between items-center">
            <button
              type="button"
              onClick={() => { const n = new Date(); onChange(`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`); setCursor({ y: n.getFullYear(), m: n.getMonth() }); setOpen(false); }}
              className="text-sm font-medium text-tertiary hover:text-secondary"
            >
              Hoy
            </button>
            <button type="button" onClick={() => setOpen(false)} className="text-sm font-medium text-tertiary hover:text-secondary">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
