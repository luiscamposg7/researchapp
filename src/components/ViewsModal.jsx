import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { Button } from "./ui/button";
import { Spinner } from "./Spinner";

export default function ViewsModal({ researchId, onClose, getElapsed }) {
  const [views, setViews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [liveTime, setLiveTime] = useState(0);

  const formatTime = (s) => {
    if (!s) return "—";
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60), sec = s % 60;
    return sec > 0 ? `${m}m ${sec}s` : `${m}m`;
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id);
    });
  }, []);

  useEffect(() => {
    supabase.from("research_views").select("user_id,user_name,user_email,user_avatar,first_viewed_at,max_reading_time")
      .eq("research_id", String(researchId))
      .order("max_reading_time", { ascending: false })
      .then(({ data, error }) => { if (error) console.error("[views select]", error); setViews(data || []); setLoading(false); });
  }, [researchId]);

  // Live counter for current user
  useEffect(() => {
    if (!getElapsed?.current) return;
    setLiveTime(getElapsed.current());
    const interval = setInterval(() => {
      setLiveTime(getElapsed.current?.() ?? 0);
    }, 1000);
    return () => clearInterval(interval);
  }, [getElapsed]);

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
            <div className="flex justify-center py-8"><Spinner size="lg" /></div>
          ) : views.length === 0 ? (
            <p className="text-sm text-center py-8 text-muted">Nadie ha visto este research aún.</p>
          ) : (
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {views.map((v, i) => {
                const isMe = v.user_id === currentUserId;
                const time = isMe ? Math.max(liveTime, v.max_reading_time || 0) : v.max_reading_time;
                return (
                  <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${isMe ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800" : "bg-muted"}`}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ backgroundColor: "#00B369" }}>
                      {(v.user_name || v.user_email || "?")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate text-primary">{v.user_name || "—"}</p>
                      <p className="text-xs truncate text-tertiary">{v.user_email}</p>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0 gap-0.5">
                      <p className="text-xs text-muted">
                        {v.first_viewed_at ? new Date(v.first_viewed_at).toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" }).replace(/\./g, "") : "—"}
                      </p>
                      <p className="text-xs font-medium text-secondary flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2M12 2a10 10 0 100 20A10 10 0 0012 2z"/></svg>
                        {formatTime(time)}
                        {isMe && liveTime > 0 && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
                      </p>
                    </div>
                  </div>
                );
              })}
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
