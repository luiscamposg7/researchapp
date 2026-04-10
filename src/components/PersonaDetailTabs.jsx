import { useState } from "react";
import Lightbox from "./Lightbox";

export default function PersonaDetailTabs({ personas, type }) {
  const [tab, setTab] = useState(0);
  const [lightbox, setLightbox] = useState(null); // { images, index }
  const p = personas[tab] || {};
  const isBuyer = type === "Buyer Persona" || type === "Buyer y User Persona";
  const bannerColor = isBuyer ? "#2563EB" : "#00B369";
  const sectionTitle = isBuyer ? "Buyer Personas" : "User Personas";

  const openLightbox = (images, index) => setLightbox({ images, index });
  const closeLightbox = () => setLightbox(null);

  return (
    <>
      <div className="rounded-2xl overflow-hidden border shadow-xs bg-surface">
        {/* Banner */}
        <div className="px-6 py-4 flex items-center gap-3" style={{ backgroundColor: bannerColor }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
            {isBuyer
              ? <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
              : <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            }
          </div>
          <p className="text-white text-base font-bold">{sectionTitle}</p>
        </div>
        {/* Tabs */}
        <div className="flex border-b">
          {personas.map((_, i) => (
            <button key={i} onClick={() => setTab(i)}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === i ? (isBuyer ? "border-blue-500 text-blue-600" : "border-green-500 text-green-600") : "border-transparent text-tertiary hover:text-primary"}`}>
              {isBuyer ? `B${i + 1}` : `U${i + 1}`}
            </button>
          ))}
        </div>
        {/* Imagen */}
        <div className="p-5">
          {(p.images || []).length > 0 ? (
            <div className="space-y-4">
              {(p.images || []).map((url, i) => (
                <button key={i} onClick={() => openLightbox(p.images, i)}
                  className="w-full block rounded-xl overflow-hidden cursor-zoom-in border">
                  <img src={url} alt={`Imagen ${i + 1}`} className="w-full" />
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-center py-8 text-muted">No hay imagen para esta persona.</p>
          )}
        </div>
      </div>

      {lightbox && (
        <Lightbox
          images={lightbox.images}
          index={lightbox.index}
          onClose={closeLightbox}
          onNavigate={i => setLightbox(lb => ({ ...lb, index: i }))}
          showDownload
        />
      )}
    </>
  );
}
