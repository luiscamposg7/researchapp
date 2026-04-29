import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { useApp } from "../context/AppContext";
import Toast from "../components/Toast";
import SettingsModal from "../components/SettingsModal";
import Sidebar from "./Sidebar";
import MobileTopBar from "./MobileTopBar";
import EditorOnly from "./EditorOnly";
import HomePage from "../pages/HomePage";
import ListPage from "../pages/ListPage";
import DetailPage from "../pages/DetailPage";
import AddPage from "../pages/AddPage";
import EditPage from "../pages/EditPage";
import ProductPage from "../pages/ProductPage/index";

export default function Layout({ toast, user }) {
  const { dark } = useApp();
  const [showSettings, setShowSettings] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="min-h-screen bg-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Toast toast={toast} />
      <div className="flex h-screen overflow-hidden" style={{position:"relative", zIndex:1}}>
        {showSettings && <SettingsModal dark={dark} onClose={() => setShowSettings(false)} />}
        {mobileOpen && <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMobileOpen(false)} style={{ backgroundColor: "rgba(0,0,0,0.5)" }} />}
        <Sidebar onSettings={() => setShowSettings(true)} user={user} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <MobileTopBar onMenu={() => setMobileOpen(true)} dark={dark} />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/research" element={<ListPage />} />
            <Route path="/research/:id" element={<DetailPage />} />
            <Route path="/producto/:slug" element={<ProductPage />} />
            <Route path="/añadir-research" element={<EditorOnly><AddPage /></EditorOnly>} />
            <Route path="/editar-research/:slug" element={<EditorOnly><EditPage /></EditorOnly>} />
          </Routes>
        </div>
      </div>
      <style>{`
        .line-clamp-2 { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
      `}</style>
    </div>
  );
}
