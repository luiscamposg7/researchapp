export default function ProductCardSkeleton() {
  const b = "bg-active";
  return (
    <div className="rounded-xl overflow-hidden animate-pulse bg-surface border shadow-xs">
      <div className={`h-20 ${b}`} />
      <div className="p-5 space-y-3">
        <div className={`h-4 w-1/2 rounded-lg ${b}`} />
        <div className={`h-3 w-full rounded ${b}`} />
        <div className={`h-3 w-3/4 rounded ${b}`} />
        <div className={`h-3 w-2/3 rounded ${b}`} />
      </div>
    </div>
  );
}
