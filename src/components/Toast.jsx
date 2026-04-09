import { useApp } from "../context/AppContext";

export default function Toast({ toast }) {
  const { dark: d } = useApp();
  if (!toast) return null;
  return (
    <div className="fixed top-5 right-5 z-[100]">
      <div className={`flex items-start gap-3 px-4 py-3.5 rounded-xl shadow-xl border max-w-sm ${"bg-surface border text-primary" }`} style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
        {toast.type === "success" ? (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${d ?"bg-green-900/60" :"bg-green-100"}`}>
            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
        ) : (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${d ?"bg-red-900/60" :"bg-red-100"}`}>
            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </div>
        )}
        <div>
          <p className="text-sm font-semibold">{toast.msg.title}</p>
          {toast.msg.subtitle && <p className="text-sm mt-0.5 text-tertiary">{toast.msg.subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
