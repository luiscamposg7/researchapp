import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { supabase } from "../supabase";
import { PRODUCTS, PRODUCT_COLORS, NAV } from "../lib/constants";
import { toSlug } from "../lib/utils";

export default function Sidebar({ onSettings, user, mobileOpen = false, onMobileClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { dark: dk, setDark, isSuperAdmin, roleLoaded } = useApp();
  const [pinned, setPinned] = useState(true);
  const [hovered, setHovered] = useState(false);
  const expanded = pinned || hovered || mobileOpen;

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setHovered(false);
    if (onMobileClose) onMobileClose();
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps
  /* eslint-enable react-hooks/set-state-in-effect */

  const s = {
    panel:   "bg-surface border",
    div:     "border-subtle",
    p1:      "text-primary",
    p2:      "text-tertiary",
    muted:   "text-muted",
    navOn:   dk ? "text-green-500" : "text-green-700",
    navOff:  "text-tertiary hover:bg-hover hover:text-primary transition-colors duration-150",
    tHover:  "hover:bg-hover",
    pinBtn:  "text-muted hover:text-secondary hover:bg-hover",
    helpBox: "bg-muted border",
  };

  const width = mobileOpen ? "100%" : (expanded ? 272 : 64);

  return (
    <aside
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`flex flex-col flex-shrink-0 border-r overflow-hidden ${s.panel} fixed inset-y-0 left-0 z-50 lg:static lg:z-auto ${mobileOpen ?"translate-x-0 shadow-2xl" :"-translate-x-full"} lg:translate-x-0`}
      style={{ width, transition: "transform 300ms ease, width 200ms ease" }}
    >
      <div className={`flex items-center border-b flex-shrink-0 min-h-[76px] ${s.div} ${expanded ?"px-4 py-4 justify-between" :"px-3 justify-center"}`}>
        {expanded ? (
          <>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{backgroundColor:"#00B369"}}>
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M11.9995 12.0001H12.0095M15.535 15.5357C10.8488 20.222 5.46685 22.438 3.51423 20.4854C1.56161 18.5328 3.77769 13.1509 8.46398 8.46461C13.1503 3.77832 18.5322 1.56224 20.4848 3.51486C22.4374 5.46748 20.2213 10.8494 15.535 15.5357ZM15.535 8.46443C20.2213 13.1507 22.4374 18.5326 20.4848 20.4852C18.5321 22.4379 13.1502 20.2218 8.46394 15.5355C3.77765 10.8492 1.56157 5.4673 3.51419 3.51468C5.46681 1.56206 10.8487 3.77814 15.535 8.46443ZM12.4995 12.0001C12.4995 12.2763 12.2757 12.5001 11.9995 12.5001C11.7234 12.5001 11.4995 12.2763 11.4995 12.0001C11.4995 11.724 11.7234 11.5001 11.9995 11.5001C12.2757 11.5001 12.4995 11.724 12.4995 12.0001Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="overflow-hidden">
                <p className={`text-base font-bold whitespace-nowrap truncate max-w-[150px] ${s.p1}`}>{user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuario"}</p>
                <p className={`text-sm whitespace-nowrap truncate max-w-[150px] ${s.p2}`}>{user?.email}</p>
              </div>
            </div>
            {mobileOpen ? (
              <button onClick={onMobileClose} className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${s.pinBtn}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            ) : (
              <button
                onClick={() => { const next = !pinned; setPinned(next); if (!next) setHovered(false); }}
                title={pinned ? "Colapsar sidebar" : "Expandir sidebar"}
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${pinned ? (dk ?"text-green-500" :"text-green-700") : s.pinBtn}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                  <path d="M7.5 2.5V17.5M6.5 2.5H13.5C14.9001 2.5 15.6002 2.5 16.135 2.77248C16.6054 3.01217 16.9878 3.39462 17.2275 3.86502C17.5 4.3998 17.5 5.09987 17.5 6.5V13.5C17.5 14.9001 17.5 15.6002 17.2275 16.135C16.9878 16.6054 16.6054 16.9878 16.135 17.2275C15.6002 17.5 14.9001 17.5 13.5 17.5H6.5C5.09987 17.5 4.3998 17.5 3.86502 17.2275C3.39462 16.9878 3.01217 16.6054 2.77248 16.135C2.5 15.6002 2.5 14.9001 2.5 13.5V6.5C2.5 5.09987 2.5 4.3998 2.77248 3.86502C3.01217 3.39462 3.39462 3.01217 3.86502 2.77248C4.3998 2.5 5.09987 2.5 6.5 2.5Z" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </>
        ) : (
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{backgroundColor:"#00B369"}}>
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M11.9995 12.0001H12.0095M15.535 15.5357C10.8488 20.222 5.46685 22.438 3.51423 20.4854C1.56161 18.5328 3.77769 13.1509 8.46398 8.46461C13.1503 3.77832 18.5322 1.56224 20.4848 3.51486C22.4374 5.46748 20.2213 10.8494 15.535 15.5357ZM15.535 8.46443C20.2213 13.1507 22.4374 18.5326 20.4848 20.4852C18.5321 22.4379 13.1502 20.2218 8.46394 15.5355C3.77765 10.8492 1.56157 5.4673 3.51419 3.51468C5.46681 1.56206 10.8487 3.77814 15.535 8.46443ZM12.4995 12.0001C12.4995 12.2763 12.2757 12.5001 11.9995 12.5001C11.7234 12.5001 11.4995 12.2763 11.4995 12.0001C11.4995 11.724 11.7234 11.5001 11.9995 11.5001C12.2757 11.5001 12.4995 11.724 12.4995 12.0001Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className={`flex-1 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden ${expanded ?"px-3" :"px-2"}`}>
        <button title={!expanded ? "Inicio" : undefined} onClick={() => navigate("/")}
          className={`w-full flex items-center rounded-lg font-medium ${expanded ?"gap-3 px-3 h-10" :"justify-center h-10"} ${location.pathname ==="/" ? s.navOn : s.navOff}`}>
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          {expanded && <span className="whitespace-nowrap">Inicio</span>}
        </button>

        {NAV.map(item => {
          const isActive = location.pathname.startsWith("/research");
          return (
          <button key={item.label} title={!expanded ? item.label : undefined}
            onClick={() => navigate("/research")}
            className={`w-full flex items-center rounded-lg font-medium ${expanded ?"gap-3 px-3 h-10" :"justify-center h-10"} ${isActive ? s.navOn : s.navOff}`}>
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} />
            </svg>
            {expanded && <span className="whitespace-nowrap overflow-hidden">{item.label}</span>}
          </button>);
        })}

        {/* Productos */}
        <div className={expanded ? "pt-5" : "pt-5"}>
          {expanded && <p className={`px-3 pb-2 text-sm font-semibold uppercase tracking-wider whitespace-nowrap ${s.muted}`}>Productos</p>}
          {PRODUCTS.map((product) => {
            const isActive = location.pathname === `/producto/${toSlug(product)}`;
            const pc = PRODUCT_COLORS[product] || "#00B369";
            const initials = product.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
            return (
              <button key={product} title={!expanded ? product : undefined}
                onClick={() => navigate(`/producto/${toSlug(product)}`)}
                className={`w-full flex items-center rounded-lg font-medium ${expanded ?"gap-3 px-3 h-10" :"justify-center h-10"} ${isActive ? s.navOn : s.navOff}`}>
                <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold" style={{ backgroundColor: pc + "28", color: pc }}>
                  {initials}
                </div>
                {expanded && <span className="whitespace-nowrap overflow-hidden">{product}</span>}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom */}
      <div className={`border-t flex-shrink-0 ${s.div} ${expanded ?"px-3 py-4 space-y-1" :"px-2 py-4 space-y-1"}`}>
        {roleLoaded && isSuperAdmin && (
          <button title={!expanded ? "Configuración" : undefined}
            onClick={() => onSettings()}
            className={`w-full flex items-center rounded-lg ${expanded ?"gap-3 px-3 h-10" :"justify-center h-10"} ${s.navOff}`}>
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3" strokeWidth={1.8}/></svg>
            {expanded && <span className="whitespace-nowrap">Configuración</span>}
          </button>
        )}

        <button title={!expanded ? (dk ? "Cambiar a modo claro" : "Cambiar a modo oscuro") : undefined}
          onClick={() => setDark(!dk)}
          className={`w-full flex items-center rounded-lg ${expanded ?"gap-3 px-3 h-10 justify-between" :"justify-center h-10"} ${s.navOff}`}>
          <div className={`flex items-center ${expanded ?"gap-3" :""}`}>
            {dk
              ? <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
              : <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3v1m0 16v1m8.66-9H21M3 12H2m15.36-6.36l-.71.71M7.05 16.95l-.71.71M18.36 18.36l-.71-.71M6.34 6.34l-.71-.71M17 12a5 5 0 11-10 0 5 5 0 0110 0z" /></svg>
            }
            {expanded && <span className="whitespace-nowrap">Modo oscuro</span>}
          </div>
          {expanded && (
            <div className={`w-8 h-4 rounded-full flex items-center px-0.5 flex-shrink-0 ${dk ?"justify-end" :"justify-start"}`} style={{backgroundColor: dk ? "#00B369" : "#e5e7eb"}}>
              <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
            </div>
          )}
        </button>

        <button title={!expanded ? "Cerrar sesión" : undefined}
          onClick={() => supabase.auth.signOut()}
          className={`w-full flex items-center rounded-lg ${expanded ?"gap-3 px-3 h-10" :"justify-center h-10"} ${s.navOff}`}>
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          {expanded && <span className="whitespace-nowrap">Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}
