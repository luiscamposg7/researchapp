import { PRODUCT_COLORS } from "../lib/constants";

export default function ProductCard({ product: p, deliverables, coverUrl, onClick, dark: d }) {
  const pc = PRODUCT_COLORS[p] || "#00B369";
  const all = deliverables.filter(i => i.tags.includes(p));
  const research = all.filter(i => i.type === "Research").length;
  const usabilidad = all.filter(i => i.type === "Pruebas de usabilidad").length;
  return (
    <button onClick={onClick}
      className="text-left rounded-xl overflow-hidden transition-all group bg-surface border hover:border-green-500 hover:shadow-md shadow-xs">
      <div className="h-20 w-full flex-shrink-0" style={{ backgroundColor: pc, backgroundImage: coverUrl ? `url(${coverUrl})` : undefined, backgroundSize: "cover", backgroundPosition: "center" }} />
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <span className="font-semibold text-base text-primary">{p}</span>
          </div>
          <svg className="hidden lg:block w-4 h-4 transition-transform group-hover:translate-x-0.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </div>
        <div className="text-sm space-y-1.5 text-muted">
          <div className="flex justify-between"><span>Research</span><span className="font-semibold text-secondary">{research}</span></div>
          <div className="flex justify-between"><span>Pruebas de usabilidad</span><span className="font-semibold text-secondary">{usabilidad}</span></div>
          <div className="flex justify-between pt-1.5 border-t border-subtle">
            <span>Total</span><span className="font-bold" style={{ color: "#00B369" }}>{all.length}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
