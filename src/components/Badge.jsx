export default function Badge({ label, typeColor, dark }) {
  const tm = {
    blue:   dark ? "bg-blue-900/60 text-blue-300 border border-blue-700"       : "bg-blue-50 text-blue-700 border border-blue-200",
    violet: dark ? "bg-teal-900/60 text-teal-300 border border-teal-700"       : "bg-teal-50 text-teal-700 border border-teal-200",
    amber:  dark ? "bg-amber-900/60 text-amber-300 border border-amber-700"    : "bg-amber-50 text-amber-700 border border-amber-200",
    green:  dark ? "bg-teal-900/60 text-teal-300 border border-teal-700"       : "bg-teal-50 text-teal-700 border border-teal-200",
  };
  const statusPill = {
    "Publicado": dark ? "bg-green-900/40 text-green-400 border-green-700" : "bg-green-50 text-green-600 border-green-300",
    "Borrador":  dark ? "bg-gray-800 text-gray-400 border-gray-600"       : "bg-gray-100 text-gray-500 border-gray-300",
  };
  if (!typeColor && statusPill[label]) {
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusPill[label]}`}>
        {label}
      </span>
    );
  }
  return <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${typeColor ? tm[typeColor] : ""}`}>{label}</span>;
}
