import { useNavigate } from "react-router-dom";
import { Badge as UIBadge } from "./ui/badges";
import { Avatar as UIAvatar } from "./ui/avatar";
import { useApp } from "../context/AppContext";
import { PRODUCTS, PRODUCT_COLORS } from "../lib/constants";
import { toSlug, formatDate, stripHtml, getBadgeColor } from "../lib/utils";

export default function Card({ item, fromLabel }) {
  const navigate = useNavigate();
  const { editors } = useApp();
  const productTag = item.tags && item.tags.find(t => PRODUCTS.includes(t));
  const pc = productTag ? (PRODUCT_COLORS[productTag] || "#00B369") : null;

  return (
    <button onClick={() => navigate(`/research/${toSlug(item.title)}`, { state: { fromLabel } })} className="w-full text-left rounded-2xl p-6 cursor-pointer group flex flex-col bg-surface border hover:border-green-500 hover:shadow-md shadow-xs focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1 transition-all duration-150">
      <div className="flex items-start justify-between mb-4">
        <UIBadge color={getBadgeColor(item.typeColor)}>{item.type}</UIBadge>
        <span className="text-sm text-muted">{formatDate(item.date)}</span>
      </div>
      <h3 className="card-title font-semibold text-lg leading-snug mb-3 text-primary group-hover:text-green-600">{item.title}</h3>
      <p className="text-base leading-relaxed mb-4 line-clamp-2 flex-1 text-tertiary">{item.descripcion || stripHtml(item.objetivo)}</p>
      <div className="flex flex-wrap gap-2 mb-5">
        {item.tags.filter(tag => !PRODUCTS.includes(tag)).map(tag => <span key={tag} className="text-sm rounded-lg px-2.5 py-1 text-tertiary bg-muted border">{tag}</span>)}
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-subtle">
        {(() => { const validTeam = (item.team || []).filter(n => editors.includes(n)); return validTeam.length ? (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">{validTeam.map((name, i) => <UIAvatar key={name} name={name} index={i} />)}</div>
            <span className="text-sm text-tertiary">{validTeam[0]}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <UIAvatar name={null} />
            <span className="text-sm text-muted">Sin asignar</span>
          </div>
        ); })()}
        {productTag && pc && (
          <span className="text-sm rounded-lg px-2.5 py-1 flex items-center gap-1.5 text-secondary bg-muted border">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: pc }} />
            {productTag}
          </span>
        )}
      </div>
    </button>
  );
}
