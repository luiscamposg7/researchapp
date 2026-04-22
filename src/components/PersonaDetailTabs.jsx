import { useState } from "react";
import Lightbox from "./Lightbox";

export default function PersonaDetailTabs({ personas, type, dark: d }) {
  const [lightbox, setLightbox] = useState(null); // { images, index }
  const isBuyer = type === "Buyer Persona" || type === "Buyer y User Persona";
  const bannerColor = isBuyer ? "#2563EB" : "#00B369";
  const sectionTitle = isBuyer ? "Buyer Personas" : "User Personas";

  // Flatten all images with their persona index for lightbox
  const allImages = personas.flatMap(p => p.images || []);

  return (
    <>
      <div className="rounded-2xl overflow-hidden border shadow-xs bg-surface">
        {/* Banner */}
        <div className="px-6 py-4 flex items-center gap-3" style={{ backgroundColor: bannerColor }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
            {isBuyer
              ? <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 20.25a8.25 8.25 0 0 1 10.5-7.93"/>
                  <circle cx="18.5" cy="17.5" r="3.5" fill="rgba(255,255,255,0.25)" strokeWidth={1.5}/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.5 15.75v.5m0 2.5v.5m-1.25-2.75c0-.69.56-1.25 1.25-1.25s1.25.56 1.25 1.25-.56 1.25-1.25 1.25-1.25.56-1.25 1.25.56 1.25 1.25 1.25 1.25-.56 1.25-1.25"/>
                </svg>
              : <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            }
          </div>
          <p className="text-white text-base font-bold">{sectionTitle}</p>
        </div>

        {/* Grid 2 por fila */}
        <div className={`p-5 grid gap-4 ${personas.length === 1 ? "grid-cols-1 max-w-xs" : personas.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
          {personas.map((p, i) => {
            const img = (p.images || [])[0];
            const globalIdx = allImages.indexOf(img);
            return (
              <div key={i} className="space-y-2">
                <p className="text-sm font-semibold text-tertiary">Persona {i + 1}</p>
                {img ? (
                  <button onClick={() => setLightbox({ images: allImages, index: globalIdx })}
                    className="relative w-full block rounded-xl overflow-hidden cursor-zoom-in border group" style={{ aspectRatio: "3/4" }}>
                    <img src={img} alt={`Persona ${i + 1}`} className="w-full h-full object-cover object-top" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      <div className={`w-10 h-10 flex items-center justify-center shadow-md ${d ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"}`} style={{ borderRadius: 12 }}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607zM10.5 7.5v6m3-3h-6"/></svg>
                      </div>
                    </div>
                  </button>
                ) : (
                  <div className="w-full rounded-xl border flex items-center justify-center text-muted text-sm" style={{ aspectRatio: "3/4" }}>
                    Sin imagen
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {lightbox && (
        <Lightbox
          images={lightbox.images}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
          onNavigate={i => setLightbox(lb => ({ ...lb, index: i }))}
          showDownload
        />
      )}
    </>
  );
}
