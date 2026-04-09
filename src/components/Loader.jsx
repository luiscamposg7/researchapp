export default function Loader() {
  return (
    <div className="flex items-center justify-center py-24">
      <svg className="w-8 h-8 animate-spin" style={{ color: "#00B369" }} fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
    </div>
  );
}
