import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Button } from "../components/ui/button";
import Card from "../components/Card";
import CardSkeleton from "../components/CardSkeleton";
import CustomSelect from "../components/CustomSelect";
import { PRODUCTS, TYPES } from "../lib/constants";

const PAGE_SIZE = 9;

export default function ListPage() {
  const navigate = useNavigate();
  const { dark, deliverables, loadingDeliverables, activeFilter, isEditor, editors } = useApp();
  const dk = dark;
  const [visible, setVisible] = useState(PAGE_SIZE);
  const sentinelRef = useRef(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterProduct, setFilterProduct] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Sync from sidebar activeFilter
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!activeFilter) return;
    if (activeFilter.type) setFilterType(activeFilter.type);
    if (activeFilter.product) setFilterProduct(activeFilter.product);
    if (activeFilter.search) setSearch(activeFilter.search);
  }, [activeFilter]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const activeTeam = activeFilter?.team || null;

  const filtered = useMemo(() => deliverables.filter(d => {
    const typeMatch = !filterType || d.type === filterType;
    const teamMatch = !activeTeam || d.team.includes(activeTeam);
    const productMatch = !filterProduct || d.tags.includes(filterProduct);
    const estadoMatch = !filterEstado || d.team.includes(filterEstado);
    const searchMatch = !search || d.title.toLowerCase().includes(search.toLowerCase());
    return typeMatch && teamMatch && productMatch && estadoMatch && searchMatch;
  }), [deliverables, filterType, activeTeam, filterProduct, filterEstado, search]);

  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setVisible(PAGE_SIZE); }, [search, filterType, filterProduct, filterEstado, activeFilter]);

  // Infinite scroll
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) setVisible(v => v + PAGE_SIZE);
    }, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore]);

  const s = {
    panel:    "bg-surface border",
    p1:       "text-primary",
    p2:       "text-tertiary",
    emptyBox: "bg-muted",
  };

  return (
    <main className="flex-1 overflow-y-auto">
      <div className={`border-b py-4 md:py-5 sticky top-0 z-10 ${s.panel}`}>
        <div className="w-full mx-auto px-4 md:px-8" style={{maxWidth:"1600px"}}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className={`text-xl md:text-2xl font-semibold ${s.p1}`}>Todos los research</h1>
              <p className={`text-sm md:text-base ${s.p2}`}>{filtered.length} research encontrados</p>
            </div>
            {isEditor && (
              <Button color="primary" onClick={() => navigate("/añadir-research")} className="flex items-center gap-2 md:px-4 md:py-2.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Añadir research</span>
                <span className="sm:hidden">Añadir</span>
              </Button>
            )}
          </div>
          {/* Desktop filters */}
          <div className="hidden lg:flex gap-3">
            <div className="relative w-2/5">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Buscar research..." value={search}
                onChange={e => setSearch(e.target.value)}
                className={`w-full pl-10 pr-4 text-sm rounded-lg border focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400 bg-surface text-primary placeholder:text-muted`}
                style={{height:"40px"}} />
            </div>
            <div className="flex items-center gap-3 flex-1">
              <div className="flex-1"><CustomSelect dark={dk} value={filterType} onChange={v => setFilterType(v)} options={[{value:"",label:"Tipo de entregable"}, ...TYPES.slice(1).map(f => ({ value: f, label: f }))]} fullWidth /></div>
              <div className="flex-1"><CustomSelect dark={dk} value={filterProduct} onChange={v => setFilterProduct(v)} options={[{ value: "", label: "Todos los productos" }, ...PRODUCTS.map(p => ({ value: p, label: p }))]} fullWidth /></div>
              <div className="flex-1"><CustomSelect dark={dk} value={filterEstado} onChange={v => setFilterEstado(v)} options={[{ value: "", label: "Persona asignada" }, ...editors.map(e => ({ value: e, label: e }))]} fullWidth /></div>
            </div>
          </div>

          {/* Mobile/tablet filters accordion */}
          <div className="flex lg:hidden flex-col gap-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" placeholder="Buscar research..." value={search}
                  onChange={e => setSearch(e.target.value)}
                  className={`w-full pl-10 pr-4 text-sm rounded-lg border focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400 bg-surface text-primary placeholder:text-muted`}
                  style={{height:"40px"}} />
              </div>
              <button
                onClick={() => setFiltersOpen(o => !o)}
                className={`flex items-center gap-1.5 px-3 text-sm font-semibold rounded-lg flex-shrink-0 ${filtersOpen ? (dk ?"bg-green-900/30 border border-green-700 text-green-400" :"bg-green-50 border border-green-300 text-green-700") :"bg-surface border text-secondary"}`}
                style={{height:"40px"}}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/></svg>
                Filtros
                <svg className={`w-3.5 h-3.5 transition-transform ${filtersOpen ?"rotate-180" :""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
              </button>
            </div>
            {filtersOpen && (
              <div className="flex flex-col gap-2 pt-1">
                <CustomSelect dark={dk} value={filterType} onChange={v => setFilterType(v)} options={[{value:"",label:"Tipo de entregable"}, ...TYPES.slice(1).map(f => ({ value: f, label: f }))]} fullWidth />
                <CustomSelect dark={dk} value={filterProduct} onChange={v => setFilterProduct(v)} options={[{ value: "", label: "Todos los productos" }, ...PRODUCTS.map(p => ({ value: p, label: p }))]} fullWidth />
                <CustomSelect dark={dk} value={filterEstado} onChange={v => setFilterEstado(v)} options={[{ value: "", label: "Persona asignada" }, ...editors.map(e => ({ value: e, label: e }))]} fullWidth />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-full mx-auto px-4 md:px-8 py-6 md:py-7" style={{maxWidth:"1600px"}}>
        {loadingDeliverables ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => <CardSkeleton key={i} dark={dk} />)}
          </div>
        ) : filtered.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {shown.map(item => <Card key={item.id} item={item} dark={dk} fromLabel="Todos los research" />)}
            </div>
            <div ref={sentinelRef} className="h-10 flex items-center justify-center mt-4">
              {hasMore && <div className="w-6 h-6 rounded-full border-2 border-gray-300 border-t-green-500 animate-spin" />}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${s.emptyBox}`}>
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className={`text-xl font-semibold mb-1 ${s.p1}`}>Sin resultados</p>
            <p className={`text-base ${s.p2}`}>No hay research que coincida.</p>
          </div>
        )}
      </div>
    </main>
  );
}
