const sizes = {
  xs: "w-3 h-3 border-[1.5px]",
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-2",
  lg: "w-8 h-8 border-[3px]",
};

export function Spinner({ size = "md", className = "" }) {
  return (
    <div
      className={`rounded-full border-[var(--color-border-strong)] border-t-[var(--color-brand)] animate-spin flex-shrink-0 ${sizes[size]}${className ? ` ${className}` : ""}`}
    />
  );
}
