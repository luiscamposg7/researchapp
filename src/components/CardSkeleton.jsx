export default function CardSkeleton() {
  const b = "bg-active";
  return (
    <div className="rounded-xl p-5 animate-pulse bg-surface border shadow-xs">
      <div className="flex gap-3 mb-4">
        <div className={`h-6 w-24 rounded-full ${b}`} />
        <div className={`h-6 w-16 rounded-full ${b}`} />
      </div>
      <div className={`h-5 w-3/4 rounded-lg mb-3 ${b}`} />
      <div className={`h-3 w-full rounded mb-2 ${b}`} />
      <div className={`h-3 w-5/6 rounded mb-4 ${b}`} />
      <div className={`h-3 w-1/3 rounded ${b}`} />
    </div>
  );
}
