import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { downloadImage } from "../lib/utils";

export default function Lightbox({ images, index, onClose, onNavigate, showDownload = false }) {
  const [zoom, setZoom] = useState(1);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setZoom(1); }, [index]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && index < images.length - 1) onNavigate(index + 1);
      if (e.key === "ArrowLeft" && index > 0) onNavigate(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, images.length, onClose, onNavigate]);

  return createPortal(
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="absolute top-3 right-3 flex items-center gap-2 z-10" onClick={e => e.stopPropagation()}>
        <button onClick={e => { e.stopPropagation(); setZoom(z => Math.max(z - 0.5, 1)); }} disabled={zoom <= 1}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM7 10h6"/></svg>
        </button>
        <button onClick={e => { e.stopPropagation(); setZoom(z => Math.min(z + 0.5, 1.5)); }} disabled={zoom >= 1.5}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/></svg>
        </button>
        {showDownload && (
          <button onClick={e => { e.stopPropagation(); downloadImage(images[index], `persona-${index + 1}.jpg`); }}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors" title="Descargar">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          </button>
        )}
        <button onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <div className="w-full h-full overflow-auto" onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: zoom === 1 ? "center" : "flex-start", minHeight: "100%", padding: "16px 64px" }}>
          <img src={images[index]} alt=""
            style={{ maxWidth: zoom === 1 ? "100%" : "none", maxHeight: zoom === 1 ? "calc(100vh - 120px)" : "none", width: zoom === 1 ? "auto" : `${zoom * 100}%`, transition: "width 200ms ease, max-width 200ms ease, max-height 200ms ease" }}
            className="rounded-lg shadow-2xl object-contain" />
        </div>
      </div>

      {index > 0 && (
        <button onClick={e => { e.stopPropagation(); onNavigate(index - 1); }}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
        </button>
      )}
      {index < images.length - 1 && (
        <button onClick={e => { e.stopPropagation(); onNavigate(index + 1); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
        </button>
      )}
      {images.length > 1 && (
        <div className="flex justify-center gap-1.5 pb-4 flex-shrink-0" onClick={e => e.stopPropagation()}>
          {images.map((_, i) => (
            <button key={i} onClick={() => onNavigate(i)}
              className={`w-2 h-2 rounded-full transition-colors ${i === index ? "bg-white" : "bg-white/30 hover:bg-white/60"}`} />
          ))}
        </div>
      )}
    </div>,
    document.body
  );
}
