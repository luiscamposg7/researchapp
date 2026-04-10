import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { supabase } from "../supabase";
import { Button } from "../components/ui/button";
import { BadgeWithDot, Badge as UIBadge } from "../components/ui/badges";
import { Avatar as UIAvatar } from "../components/ui/avatar";
import Card from "../components/Card";
import ConfirmModal from "../components/ConfirmModal";
import ViewsModal from "../components/ViewsModal";
import PresentationCard from "../components/PresentationCard";
import PersonaDetailTabs from "../components/PersonaDetailTabs";
import { PERSONA_TYPES } from "../lib/constants";
import { toSlug, formatDate, sanitizeHtml, getBadgeColor } from "../lib/utils";

export default function DetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: slug } = useParams();
  const { dark: d, deliverables, handleDelete, isEditor, editors } = useApp();
  const fromLabel = location.state?.fromLabel || null;
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showViews, setShowViews] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [viewCount, setViewCount] = useState(null);
  const [copied, setCopied] = useState(false);
  const item = deliverables.find(x => toSlug(x.title) === slug);

  useEffect(() => {
    if (!item) return;
    supabase.from("research_views").select("*", { count: "exact", head: true })
      .eq("research_id", String(item.id))
      .then(({ count }) => setViewCount(count ?? 0));
  }, [item?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!item) return;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("research_views").upsert({
        research_id: String(item.id),
        user_id: user.id,
        user_name: user.user_metadata?.full_name || null,
        user_email: user.email,
        user_avatar: user.user_metadata?.avatar_url || null,
        viewed_at: new Date().toISOString(),
      }, { onConflict: "research_id,user_id" })
      .then(({ error }) => { if (error) console.error("[views upsert]", error); });
    });
  }, [item?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!item) return <div className="flex-1 flex items-center justify-center bg-page text-gray-500">Research no encontrado.</div>;
  const related = deliverables.filter(r => r.id !== item.id && r.tags[0] === item.tags[0] && r.status === "Publicado").slice(0, 3);

  const jiraDone = /done|closed|resolved|finaliz|complet/i.test(item.jiraStatus || "");
  const entryJiraColor = (item.jiraStatus === "FINALIZADO" || jiraDone)
    ? (d ? "text-green-400 border-green-700 bg-green-900/40" : "text-green-700 border-green-200 bg-green-50")
    : (d ? "text-blue-400 border-blue-700 bg-blue-900/40" : "text-blue-700 border-blue-200 bg-blue-50");
  const assigned = (item.team || []).find(n => editors.includes(n)) || null;

  return (
    <div className="flex-1 overflow-y-auto bg-page">
      {confirmDelete && (
        <ConfirmModal
          title="¿Eliminar research?"
          message={`"${item.title}" se eliminará permanentemente y no podrá recuperarse.`}
          confirmLabel="Sí, eliminar"
          danger
          onConfirm={() => {
            const product = item.tags?.[0];
            handleDelete(item.id);
            product ? navigate(`/producto/${toSlug(product)}`) : navigate("/research");
          }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
      {/* Top bar */}
      <div className="border-b px-4 py-3 md:px-8 md:py-4 sticky top-0 z-10 flex items-center justify-between bg-page border">
        <button onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/research")} className="flex items-center gap-2 text-sm font-semibold text-tertiary hover:text-primary transition-colors duration-150 cursor-pointer">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Volver</span>
        </button>
        <div className="flex gap-2">
          {isEditor && (
            <Button color="secondary" onClick={() => setShowViews(true)} className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              Ver vistas
              {viewCount !== null && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold" style={{ backgroundColor: "var(--color-text-secondary)", color: "var(--color-bg-surface)" }}>{viewCount}</span>
              )}
            </Button>
          )}
          {item.isCustom && isEditor && (
            <Button
              color="primary"
              onClick={() => navigate(`/editar-research/${toSlug(item.title)}`)}
              className="flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" /></svg>
              Editar
            </Button>
          )}
        </div>
      </div>
      {showViews && <ViewsModal researchId={item.id} onClose={() => setShowViews(false)} />}

      <div className="w-full mx-auto px-4 md:px-8 py-6 md:py-8 pb-16 md:pb-24" style={{maxWidth:"1600px"}}>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6 text-muted">
          <button onClick={() => navigate("/")} className="hover:underline hover:text-secondary">Inicio</button><span>/</span>
          <button onClick={() => navigate(`/producto/${toSlug(item.tags[0])}`)} className="hover:underline hover:text-secondary">{item.tags[0]}</button><span>/</span>
          <span className="text-secondary">{item.title}</span>
        </div>

        {/* Page title */}
        <div className="flex items-center gap-3 mb-1 flex-wrap">
          <span className="text-sm text-tertiary">{formatDate(item.date)}</span>
          <BadgeWithDot type="modern" color={item.status === "Publicado" ? "success" : "gray"} className="gap-1.5">
            {item.status === "Publicado" ? "Publicado" : "Borrador"}
          </BadgeWithDot>
        </div>
        <div className="flex items-center gap-3 mb-3 mt-3">
          <h1 className="text-3xl font-semibold text-primary">{item.title}</h1>
          <button
            onClick={() => { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            title="Copiar enlace"
            style={{ width: 38, height: 38 }}
            className={`flex items-center justify-center rounded-lg border flex-shrink-0 bg-surface hover:bg-hover transition-colors ${copied ? "text-green-500 border-green-300" : "text-tertiary hover:text-secondary"}`}
          >
            {copied
              ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
              : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
            }
          </button>
        </div>
        {item.type && <div className="mb-8"><UIBadge color={getBadgeColor(item.typeColor)}>{item.type}</UIBadge></div>}

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* LEFT */}
          <div className="w-full lg:w-80 lg:flex-shrink-0 space-y-5">
            {item.archivoUrl && <PresentationCard item={item} dark={d} />}
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold mb-1 text-muted">{(item.team && item.team.length > 1) ? "Asignados" : "Asignado"}</p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center -space-x-1.5">
                    {(item.team && item.team.length > 0)
                      ? item.team.map((name, i) => <UIAvatar key={i} name={name} index={i} size="xs" />)
                      : <UIAvatar name={null} index={0} size="xs" />}
                  </div>
                  <span className="text-sm text-secondary">
                    {(item.team && item.team.length > 0) ? item.team.join(", ") : "Sin asignar"}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold mb-0.5 text-muted">Metodología</p>
                <p className="text-sm text-secondary">{item.metodologia}</p>
              </div>
              {item.reunionUrl && (
                <div>
                  <p className="text-sm font-semibold mb-1 text-muted">Link de la reunión</p>
                  <a href={item.reunionUrl} target="_blank" rel="noreferrer"
                    className="text-sm font-semibold leading-snug inline-flex items-center gap-1.5 text-[var(--color-brand)] hover:text-[var(--color-brand-hover)]">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    Ver grabación
                  </a>
                </div>
              )}
              <div>
                <p className="text-sm font-semibold mb-1 text-muted">Link de Jira</p>
                <a
                  className={`text-sm font-semibold leading-snug block mb-1.5 break-words text-[var(--color-brand)] hover:text-[var(--color-brand-hover)] ${!item.jiraUrl &&"pointer-events-none"}`}
                  href={item.jiraUrl || "#"}
                  target={item.jiraUrl ? "_blank" : undefined}
                  rel="noreferrer"
                >
                  {item.jira || item.jiraUrl || "—"}
                </a>
                {item.jira && item.jiraStatus && <span className={`text-sm font-bold px-2 py-0.5 rounded border ${entryJiraColor}`}>{item.jiraStatus}</span>}
              </div>
              {item.isCustom && isEditor && (
                <div className="mt-6 pt-4 border-t">
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-red-500 hover:text-red-700 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Eliminar research
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex-1 min-w-0 space-y-6">
            {item.contenido ? (
              <div className="rich-content text-base leading-relaxed text-secondary pb-4" dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.contenido) }} />
            ) : (
              <>
                {item.objetivo && (
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-primary">Objetivo del research</h3>
                    <div className="rich-content text-base leading-relaxed text-secondary" dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.objetivo) }} />
                  </div>
                )}
                {item.usuario && (
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-primary">Usuario</h3>
                    <div className="rich-content text-base leading-relaxed text-secondary" dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.usuario) }} />
                  </div>
                )}
                {item.hallazgos && (
                  <div className="pb-4">
                    <h3 className="text-xl font-semibold mb-2 text-primary">Hallazgos y conclusiones</h3>
                    <div className="rich-content text-base leading-relaxed text-secondary" dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.hallazgos) }} />
                  </div>
                )}
              </>
            )}
            {PERSONA_TYPES.includes(item.type) && item.personas && item.personas.length > 0 && (
              <div className="space-y-4">
                <PersonaDetailTabs personas={item.personas} type={item.type} />
              </div>
            )}
            {item.imagenes && item.imagenes.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-3 text-primary">Imágenes adjuntas</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {item.imagenes.map((url, i) => (
                    <button key={i} onClick={() => setLightbox(i)} className="block rounded-xl overflow-hidden aspect-video group cursor-zoom-in">
                      <img src={url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                    </button>
                  ))}
                </div>
              </div>
            )}
            {lightbox !== null && item.imagenes && (
              <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setLightbox(null)}>
                <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
                {lightbox > 0 && (
                  <button onClick={e => { e.stopPropagation(); setLightbox(l => l - 1); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                  </button>
                )}
                {lightbox < item.imagenes.length - 1 && (
                  <button onClick={e => { e.stopPropagation(); setLightbox(l => l + 1); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                  </button>
                )}
                <img src={item.imagenes[lightbox]} alt="" className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={e => e.stopPropagation()} />
                {item.imagenes.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {item.imagenes.map((_, i) => (
                      <button key={i} onClick={e => { e.stopPropagation(); setLightbox(i); }}
                        className={`w-2 h-2 rounded-full transition-colors ${i === lightbox ?"bg-white" :"bg-white/30 hover:bg-white/60"}`} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16 pt-10 border-t">
            <h2 className="text-xl font-semibold mb-5 text-primary">Research relacionados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {related.map(r => (
                <Card key={r.id} item={r} fromLabel={item.title} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
