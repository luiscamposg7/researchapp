import { useState } from "react";
import { loadJiraConfig, saveJiraConfig } from "../utils";

export default function SettingsModal({ onClose, dark }) {
  const d = dark;
  const [cfg, setCfg] = useState(loadJiraConfig);
  const [saved, setSaved] = useState(false);
  const [testStatus, setTestStatus] = useState(null);
  const [testMsg, setTestMsg] = useState("");

  const handleSave = () => {
    saveJiraConfig({
      baseUrl: (cfg.baseUrl || "").trim().replace(/\/$/, ""),
      email:   (cfg.email   || "").trim(),
      token:   (cfg.token   || "").trim(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTest = async () => {
    if (!cfg.baseUrl || !cfg.email || !cfg.token) {
      setTestStatus("error"); setTestMsg("Completa todos los campos primero."); return;
    }
    setTestStatus("loading"); setTestMsg("");
    try {
      const base = cfg.baseUrl.replace(/\/$/, "");
      const auth = btoa(`${cfg.email.trim()}:${cfg.token.trim()}`);
      const res = await fetch("/api/jira/_test", {
        headers: { "x-jira-base": base, "x-jira-auth": auth },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.errorMessages?.[0] || data.message || data.error || data.detail || `HTTP ${res.status}`);
      setTestStatus("ok");
      setTestMsg(`Conectado como ${data.displayName} (${data.emailAddress})`);
    } catch (e) {
      setTestStatus("error"); setTestMsg(e.message);
    }
  };

  const inp = `w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 ${d ? "bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"}`;
  const lbl = `block text-xs font-semibold mb-1 ${d ? "text-gray-400" : "text-gray-600"}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className={`w-full max-w-md rounded-2xl shadow-2xl ${d ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200"}`}>
        <div className={`flex items-center justify-between px-6 py-4 border-b ${d ? "border-gray-800" : "border-gray-200"}`}>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3" strokeWidth={2}/></svg>
            <h2 className={`text-lg font-bold ${d ? "text-gray-100" : "text-gray-900"}`}>Configuración</h2>
          </div>
          <button onClick={onClose} className={`w-8 h-8 flex items-center justify-center rounded-lg ${d ? "text-gray-400 hover:bg-gray-800" : "text-gray-500 hover:bg-gray-100"}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <p className={`text-sm font-semibold mb-3 flex items-center gap-2 ${d ? "text-gray-200" : "text-gray-800"}`}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 11.513H0a5.218 5.218 0 005.232 5.215h2.13v2.057A5.215 5.215 0 0012.575 24V12.518a1.005 1.005 0 00-1.004-1.005zm5.723-5.756H5.736a5.215 5.215 0 005.215 5.214h2.129v2.058a5.218 5.218 0 005.215 5.214V6.758a1.001 1.001 0 00-1.001-1.001zM23.013 0H11.459a5.215 5.215 0 005.215 5.215h2.129v2.057A5.215 5.215 0 0024 12.483V1.005A1.001 1.001 0 0023.013 0z"/></svg>
              Conexión Jira
            </p>
            <div className="space-y-3">
              <div>
                <label className={lbl}>URL base de Jira</label>
                <input className={inp} placeholder="https://empresa.atlassian.net" value={cfg.baseUrl || ""} onChange={e => setCfg(c => ({ ...c, baseUrl: e.target.value }))} />
              </div>
              <div>
                <label className={lbl}>Email</label>
                <input className={inp} type="email" placeholder="tu@empresa.com" value={cfg.email || ""} onChange={e => setCfg(c => ({ ...c, email: e.target.value }))} />
              </div>
              <div>
                <label className={lbl}>API Token</label>
                <input className={inp} type="password" placeholder="••••••••••••••••" value={cfg.token || ""} onChange={e => setCfg(c => ({ ...c, token: e.target.value }))} />
                <p className={`mt-1 text-xs ${d ? "text-gray-500" : "text-gray-400"}`}>
                  Genera tu token en{" "}
                  <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" rel="noreferrer" className={`font-semibold underline ${d ? "text-green-400" : "text-green-600"}`}>
                    id.atlassian.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
        {testStatus && (
          <div className={`mx-6 mb-4 px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
            testStatus === "loading" ? (d ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500") :
            testStatus === "ok"      ? (d ? "bg-green-900/40 text-green-400" : "bg-green-50 text-green-700") :
                                       (d ? "bg-red-900/40 text-red-400"   : "bg-red-50 text-red-700")
          }`}>
            {testStatus === "loading" && <svg className="w-4 h-4 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>}
            {testStatus === "ok"      && <span>✓</span>}
            {testStatus === "error"   && <span>✗</span>}
            <span>{testStatus === "loading" ? "Probando conexión..." : testMsg}</span>
          </div>
        )}
        <div className={`flex justify-end gap-3 px-6 py-4 border-t ${d ? "border-gray-800" : "border-gray-200"}`}>
          <button onClick={handleTest} className={`px-4 py-2 text-sm font-medium rounded-lg border ${d ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}>
            Probar conexión
          </button>
          <button onClick={onClose} className={`px-4 py-2 text-sm font-medium rounded-lg border ${d ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}>
            Cancelar
          </button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold text-white rounded-lg min-w-[120px]" style={{ backgroundColor: "#00B369" }}>
            {saved ? "✓ Guardado" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
