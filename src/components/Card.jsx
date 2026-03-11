import { useNavigate } from "react-router-dom";
import Avatar from "./Avatar";
import Badge from "./Badge";
import { PRODUCTS, PRODUCT_COLORS } from "../constants";
import { stripHtml } from "../utils";

export default function Card({ item, dark }) {
  const navigate = useNavigate();
  const d = dark;
  const productTag = item.tags && item.tags.find(t => PRODUCTS.includes(t));
  const pc = productTag ? (PRODUCT_COLORS[productTag] || "#00B369") : null;
  return (
    <div onClick={() => navigate(`/entregables/${item.id}`)} className={`rounded-2xl border p-6 cursor-pointer group flex flex-col ${d ? "bg-gray-900 border-gray-700 hover:border-green-400 hover:shadow-lg hover:shadow-black/30" : "bg-white border-gray-200 hover:shadow-md hover:border-green-400/40"}`}>
      <div className="flex items-start justify-between mb-4">
        <Badge label={item.type} typeColor={item.typeColor} dark={d} />
        {productTag && pc && (
          <span className={`text-sm rounded-lg px-2.5 py-1 border flex items-center gap-1.5 ${d ? "text-gray-300 bg-gray-800 border-gray-700" : "text-gray-600 bg-gray-50 border-gray-200"}`}>
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: pc }} />
            {productTag}
          </span>
        )}
      </div>
      <h3 className={`font-semibold text-lg leading-snug mb-3 ${d ? "text-gray-100 group-hover:text-green-600" : "text-gray-900 group-hover:text-green-700"}`}>{item.title}</h3>
      <p className={`text-base leading-relaxed mb-4 line-clamp-2 flex-1 ${d ? "text-gray-400" : "text-gray-500"}`}>{item.descripcion || stripHtml(item.objetivo)}</p>
      <div className="flex flex-wrap gap-2 mb-5">
        {item.tags.filter(tag => !PRODUCTS.includes(tag)).map(tag => <span key={tag} className={`text-sm rounded-lg px-2.5 py-1 border ${d ? "text-gray-400 bg-gray-800 border-gray-700" : "text-gray-500 bg-gray-50 border-gray-200"}`}>{tag}</span>)}
      </div>
      <div className={`flex items-center justify-between pt-4 border-t ${d ? "border-gray-800" : "border-gray-100"}`}>
        <div className="flex items-center gap-2">
          <span className={`text-sm ${d ? "text-gray-500" : "text-gray-400"}`}>Asignado a:</span>
          <div className="flex -space-x-2">{item.team.map((name, i) => <Avatar key={name} name={name} index={i} dark={d} />)}</div>
        </div>
        <span className={`text-sm ${d ? "text-gray-500" : "text-gray-400"}`}>{item.date}</span>
      </div>
    </div>
  );
}
