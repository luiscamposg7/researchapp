import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { Button } from "./ui/button";

export default function ViewsModal({ researchId, onClose }) {
  const [views, setViews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("research_views").select("user_name,user_email,user_avatar,viewed_at")
      .eq("research_id", String(researchId))
      .order("viewed_at", { ascending: false })
      .then(({ data, error }) => { if (error) console.error("[views select]", error); setViews(data || []); setLoading(false); });
  }, [researchId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="w-full max-w-md rounded-2xl shadow-2xl bg-surface border">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            <h2 className="text-lg font-bold text-primary">Vistas</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-tertiary hover:bg-hover">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="px-6 py-5">
          {loading ? (
            <div className="flex justify-center py-8"><div className="w-8 h-8 rounded-full border-4 border-gray-300 border-t-green-500 animate-spin" /></div>
          ) : views.length === 0 ? (
            <p className="text-sm text-center py-8 text-muted">Nadie ha visto este research aún.</p>
          ) : (
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {views.map((v, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-muted">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ backgroundColor: "#00B369" }}>
                    {(v.user_name || v.user_email || "?")[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate text-primary">{v.user_name || "—"}</p>
                    <p className="text-sm truncate text-tertiary">{v.user_email}</p>
                  </div>
                  <p className="text-sm flex-shrink-0 text-muted">
                    {new Date(v.viewed_at).toLocaleDateString("es-PE", { day: "numeric", month: "short" })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end px-6 py-4 border-t">
          <Button color="secondary" onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </div>
  );
}
