import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { Button } from "../../components/ui/button";
import Card from "../../components/Card";
import CloudinaryPickerModal from "../../components/CloudinaryPickerModal";
import Lightbox from "../../components/Lightbox";
import { PRODUCTS, PRODUCT_COLORS, PERSONA_TYPES } from "../../lib/constants";
import { toSlug, formatDate, loadAllProductCoverUrls, saveProductCoverRef } from "../../lib/utils";

export default function ProductPage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const product = PRODUCTS.find(p => toSlug(p) === slug) || slug;
  const { dark: d, deliverables, isEditor, setActiveFilter } = useApp();
  const [coverUrl, setCoverUrl] = useState(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  useEffect(() => {
    loadAllProductCoverUrls().then(urls => {
      setCoverUrl(urls[product] || null);
    });
  }, [product]);

  const handleCoverSelect = async (url) => {
    setShowCoverPicker(false);
    setCoverUrl(url);
    setCoverUploading(true);
    try {
      await saveProductCoverRef(product, url);
    } catch (err) {
      console.error("Error setting cover:", err?.message || err);
    } finally {
      setCoverUploading(false);
    }
  };

  const [ppLightbox, setPpLightbox] = useState(null); // { images, index }
  const openPpLightbox = (images, index) => setPpLightbox({ images, index });
  const closePpLightbox = () => setPpLightbox(null);

  const color = PRODUCT_COLORS[product] || "#00B369";

  const productDeliverables = useMemo(
    () => deliverables.filter(item => item.tags.includes(product)),
    [deliverables, product]
  );

  const personaByType = useMemo(() => {
    const latestPersona = (type) => {
      const sorted = productDeliverables
        .filter(i => i.type === type)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      return sorted.length ? [sorted[0]] : [];
    };
    return {
      "Buyer Persona": latestPersona("Buyer Persona"),
      "User Persona":  latestPersona("User Persona"),
    };
  }, [productDeliverables]);

  return (
    <>
    <div className="flex-1 overflow-y-auto">
      {showCoverPicker && (
        <CloudinaryPickerModal
          onClose={() => setShowCoverPicker(false)}
          onSelect={handleCoverSelect}
        />
      )}
      {/* Banner */}
      <div
        className="relative flex-shrink-0 group/cover"
        style={{ height: 200, backgroundColor: color, backgroundImage: coverUrl ? `url(${coverUrl})` : undefined, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        {isEditor && (
          <>
            <button
              onClick={() => !coverUploading && setShowCoverPicker(true)}
              className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-black/40 text-white opacity-0 group-hover/cover:opacity-100 transition-opacity hover:bg-black/60 disabled:cursor-not-allowed"
              disabled={coverUploading}
            >
              {coverUploading ? (
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              )}
              {coverUploading ? "Subiendo..." : "Cambiar portada"}
            </button>
          </>
        )}
      </div>

      {/* Nav bar */}
      <div className="border-b px-8 py-4 sticky top-0 z-10 flex items-center border bg-surface">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm font-semibold text-tertiary hover:text-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Volver al inicio
        </button>
      </div>

      <div className="w-full mx-auto px-4 md:px-8 py-6 md:py-8 pb-16" style={{ maxWidth: "1600px" }}>
        <h1 className="text-2xl md:text-3xl font-bold mb-1 text-primary">{product}</h1>
        <p className="text-sm mb-10 text-muted">{productDeliverables.length} entregable{productDeliverables.length !== 1 ? "s" : ""}</p>

        {/* Persona sections */}
        {PERSONA_TYPES.map(type => {
          const items = personaByType[type];
          return (
            <div key={type} className="mb-10 pb-10 border-b border-subtle">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-primary">{type}</h2>
                <Button
                  color="secondary"
                  onClick={() => { setActiveFilter({ type, product }); navigate("/research"); }}
                >
                  Ver todos
                </Button>
              </div>

              {items.length > 0 ? (
                <div className="space-y-6">
                  {items.map(inv => (
                    <div key={inv.id} className="rounded-2xl overflow-hidden border bg-surface">
                      <div className={`px-5 py-3 border-b flex items-center justify-between border ${d ?"bg-gray-800/50" :"bg-gray-50"}`}>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate text-primary">{inv.title}</p>
                          <p className="text-sm mt-0.5 text-muted">{formatDate(inv.date)} · {inv.personas?.length || 0} persona{(inv.personas?.length || 0) !== 1 ? "s" : ""}</p>
                        </div>
                        <button
                          onClick={() => navigate(`/research/${toSlug(inv.title)}`)}
                          className="flex-shrink-0 flex items-center gap-1 text-sm font-semibold ml-3 text-[var(--color-brand)] hover:text-[var(--color-brand-hover)]"
                        >
                          Ver research completo
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                      </div>
                      {inv.personas && inv.personas.length > 0 && (
                        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {inv.personas.map((p, i) => (
                            <div key={i} className="rounded-xl overflow-hidden border">
                              <div className="px-4 py-2.5 flex items-center gap-2" style={{ backgroundColor: type === "Buyer Persona" ? "#2563EB" : "#00B369" }}>
                                <p className="text-white/70 text-sm">{type}</p>
                                <span className="text-white/40 text-sm">·</span>
                                <p className="text-white text-sm font-bold">Persona {i + 1}</p>
                                {(p.images || []).length > 0 && <p className="ml-auto text-white/60 text-xs">{p.images.length} img.</p>}
                              </div>
                              {(p.images || []).length > 0 ? (
                                <button onClick={() => openPpLightbox(p.images, 0)} className="w-full block cursor-zoom-in">
                                  <img src={p.images[0]} alt="" className="w-full object-contain max-h-[600px] bg-muted" />
                                </button>
                              ) : (
                                <div className="h-28 bg-muted flex items-center justify-center">
                                  <p className="text-sm text-muted">Sin imágenes</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl p-10 flex flex-col items-center justify-center text-center border bg-surface">
                  <svg className="w-8 h-8 mb-3 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                  <p className="text-sm font-medium mb-1 text-tertiary">No hay research de {type} para {product}</p>
                  <p className="text-sm text-muted">Añade la primera para este producto</p>
                </div>
              )}
            </div>
          );
        })}

        {/* Research */}
        {(() => {
          const recentResearch = [...productDeliverables]
            .filter(i => i.status === "Publicado")
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3);
          return (
            <div className="mb-10">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-primary">Todos los research</h2>
                <Button color="secondary" onClick={() => navigate("/research")}>Ver todos</Button>
              </div>
              {recentResearch.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentResearch.map(item => <Card key={item.id} item={item} fromLabel={product} />)}
                </div>
              ) : (
                <p className="text-sm text-muted">Sin research publicados aún.</p>
              )}
            </div>
          );
        })()}

        {/* Otros productos */}
        <div className="pt-8 border-t">
          <h2 className="text-base font-semibold mb-4 text-tertiary">Otros productos</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {PRODUCTS.filter(p => p !== product).map(p => {
              const pc = PRODUCT_COLORS[p] || "#00B369";
              const all = deliverables.filter(i => i.tags.includes(p));
              return (
                <button key={p} onClick={() => navigate(`/producto/${toSlug(p)}`)}
                  className="text-left rounded-xl p-4 transition-all group bg-surface border hover:border-strong shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: pc }} />
                      <span className="font-semibold text-sm text-primary">{p}</span>
                    </div>
                    <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                  </div>
                  <p className="text-sm text-muted">{all.length} entregable{all.length !== 1 ? "s" : ""}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

    </div>

    {ppLightbox && (
      <Lightbox
        images={ppLightbox.images}
        index={ppLightbox.index}
        onClose={closePpLightbox}
        onNavigate={i => setPpLightbox(lb => ({ ...lb, index: i }))}
        showDownload
      />
    )}
    </>
  );
}
