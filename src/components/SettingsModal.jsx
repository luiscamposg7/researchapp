import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { Button } from "./ui/button";
import { loadJiraConfig, saveJiraConfig } from "../lib/utils";
import { version as APP_VERSION } from "../../package.json";

export default function SettingsModal({ onClose, dark }) {
  const d = dark;
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [pendingRoles, setPendingRoles] = useState({});
  const [rolesSaving, setRolesSaving] = useState({});

  // Jira config
  const [jiraCfg, setJiraCfg] = useState({ baseUrl: "", email: "", token: "" });
  const [jiraSaved, setJiraSaved] = useState(false);
  const [jiraTestStatus, setJiraTestStatus] = useState(null); // null | 'loading' | 'ok' | 'error'
  const [jiraTestMsg, setJiraTestMsg] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      supabase.rpc("get_users_with_roles").then(({ data }) => {
        const list = (data || [])
          .filter(u => u.email?.endsWith("@prestamype.com"))
          .sort((a, b) => {
            if (a.user_id === user?.id) return -1;
            if (b.user_id === user?.id) return 1;
            return 0;
          });
        setUsers(list);
        setUsersLoading(false);
      });
    });

    // Load Jira config — migrate from localStorage if needed
    loadJiraConfig().then(cfg => {
      if (cfg.email || cfg.token || cfg.baseUrl) {
        setJiraCfg(cfg);
      } else {
        // One-time migration from localStorage (v1.0.1 stored there)
        try {
          const local = JSON.parse(localStorage.getItem("jiraConfig") || "{}");
          if (local.email || local.token) {
            setJiraCfg(local);
            saveJiraConfig(local).then(() => localStorage.removeItem("jiraConfig"));
          }
        } catch { /* ignore */ }
      }
    });
  }, []);

  const handleRoleChange = async (userId) => {
    const newRole = pendingRoles[userId];
    if (!newRole) return;
    setRolesSaving(s => ({ ...s, [userId]: true }));
    await supabase.rpc("set_user_role", { target_user_id: userId, new_role: newRole });
    setUsers(u => u.map(x => x.user_id === userId ? { ...x, role: newRole } : x));
    setPendingRoles(p => { const n = { ...p }; delete n[userId]; return n; });
    setRolesSaving(s => ({ ...s, [userId]: false }));
  };

  const handleJiraSave = async () => {
    await saveJiraConfig({
      baseUrl: (jiraCfg.baseUrl || "").trim().replace(/\/$/, ""),
      email:   (jiraCfg.email   || "").trim(),
      token:   (jiraCfg.token   || "").trim(),
    });
    setJiraSaved(true);
    setTimeout(() => setJiraSaved(false), 2000);
  };

  const handleJiraTest = async () => {
    if (!jiraCfg.baseUrl || !jiraCfg.email || !jiraCfg.token) {
      setJiraTestStatus("error"); setJiraTestMsg("Completa todos los campos primero."); return;
    }
    setJiraTestStatus("loading"); setJiraTestMsg("");
    try {
      const base = jiraCfg.baseUrl.replace(/\/$/, "");
      const auth = btoa(`${jiraCfg.email.trim()}:${jiraCfg.token.trim()}`);
      const res = await fetch("/api/jira/_test", { headers: { "x-jira-base": base, "x-jira-auth": auth } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.errorMessages?.[0] || data.message || data.error || `HTTP ${res.status}`);
      setJiraTestStatus("ok");
      setJiraTestMsg(`Conectado como ${data.displayName} (${data.emailAddress})`);
    } catch (e) {
      setJiraTestStatus("error"); setJiraTestMsg(e.message);
    }
  };

  const inp = "w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-surface border text-primary placeholder-muted";
  const lbl = "block text-sm font-semibold mb-1 text-tertiary";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="w-full max-w-xl rounded-2xl shadow-2xl bg-surface border overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-subtle sticky top-0 bg-surface">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3" strokeWidth={2}/></svg>
            <h2 className="text-lg font-bold text-primary">Configuración</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted">v{APP_VERSION}</span>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-tertiary hover:bg-hover">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        {/* Jira section */}
        <div className="px-6 py-5 border-b border-subtle">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 11.513H0a5.218 5.218 0 005.232 5.215h2.13v2.057A5.215 5.215 0 0012.575 24V12.518a1.005 1.005 0 00-1.004-1.005zm5.723-5.756H5.736a5.215 5.215 0 005.215 5.214h2.129v2.058a5.218 5.218 0 005.215 5.214V6.758a1.001 1.001 0 00-1.001-1.001zM23.013 0H11.459a5.215 5.215 0 005.215 5.215h2.129v2.057A5.215 5.215 0 0024 12.483V1.005A1.001 1.001 0 0023.013 0z"/></svg>
            <p className="text-sm font-bold text-primary">Conexión Jira</p>
          </div>
          <div className="space-y-3">
            <div>
              <label className={lbl}>URL base de Jira</label>
              <input className={inp} placeholder="https://empresa.atlassian.net" value={jiraCfg.baseUrl || ""} onChange={e => setJiraCfg(c => ({ ...c, baseUrl: e.target.value }))} />
            </div>
            <div>
              <label className={lbl}>Email</label>
              <input className={inp} type="email" placeholder="tu@empresa.com" value={jiraCfg.email || ""} onChange={e => setJiraCfg(c => ({ ...c, email: e.target.value }))} />
            </div>
            <div>
              <label className={lbl}>API Token</label>
              <input className={inp} type="password" placeholder="••••••••••••••••" value={jiraCfg.token || ""} onChange={e => setJiraCfg(c => ({ ...c, token: e.target.value }))} />
              <p className="mt-1 text-xs text-muted">Genera tu token en{" "}
                <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" rel="noreferrer" className="font-semibold underline text-[var(--color-brand)]">id.atlassian.com</a>
              </p>
            </div>
          </div>
          {jiraTestStatus && (
            <div className={`mt-3 px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
              jiraTestStatus === "loading" ? "bg-muted text-tertiary" :
              jiraTestStatus === "ok"      ? (d ? "bg-green-900/40 text-green-400" : "bg-green-50 text-green-700") :
                                             (d ? "bg-red-900/40 text-red-400"    : "bg-red-50 text-red-700")
            }`}>
              {jiraTestStatus === "loading" && <svg className="w-4 h-4 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>}
              <span>{jiraTestStatus === "loading" ? "Probando conexión..." : jiraTestMsg}</span>
            </div>
          )}
          <div className="flex gap-2 mt-4">
            <button onClick={handleJiraTest} className="px-3 py-1.5 text-sm font-semibold rounded-lg border text-secondary hover:bg-hover transition-colors">
              Probar conexión
            </button>
            <button onClick={handleJiraSave} className="px-3 py-1.5 text-sm font-semibold text-white rounded-lg transition-colors" style={{ backgroundColor: jiraSaved ? "#16a34a" : "#00B369" }}>
              {jiraSaved ? "✓ Guardado" : "Guardar"}
            </button>
          </div>
        </div>

        {/* Roles section */}
        <div className="px-6 py-5">
          <p className="text-sm font-bold mb-4 text-primary">Roles de usuario</p>
          {usersLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-10 h-10 rounded-full border-4 border-gray-300 border-t-green-500 animate-spin" />
            </div>
          ) : (
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {users.map(u => {
                const isSelf = u.role === "super_admin";
                const currentRole = pendingRoles[u.user_id] ?? u.role;
                const changed = pendingRoles[u.user_id] !== undefined && pendingRoles[u.user_id] !== u.role;
                return (
                  <div key={u.user_id} className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl border bg-muted">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ backgroundColor: "#00B369" }}>
                        {(u.full_name || u.email || "?")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold truncate text-primary">{u.full_name || "—"}</p>
                          {isSelf && <span className={`text-sm px-2 py-0.5 rounded-full font-semibold ${d ? "bg-green-900/50 text-green-400" : "bg-green-50 text-green-700"}`}>Tú</span>}
                        </div>
                        <p className="text-sm truncate text-tertiary">{u.email}</p>
                        {u.last_sign_in_at && (
                          <p className="text-sm text-muted">
                            Último acceso: {new Date(u.last_sign_in_at).toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        )}
                      </div>
                    </div>
                    {isSelf ? (
                      <span className="text-sm font-semibold px-3 py-1 rounded-lg bg-active text-tertiary">Super Admin</span>
                    ) : (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <select
                          value={currentRole ?? ""}
                          onChange={e => setPendingRoles(p => ({ ...p, [u.user_id]: e.target.value }))}
                          className="sel-arrow text-sm font-semibold px-2 py-1.5 rounded-lg border-strong focus:outline-none focus:ring-2 focus:ring-green-400 bg-active text-primary"
                        >
                          {!u.role && <option value="" disabled>Sin acceso</option>}
                          <option value="visitor">Visitante</option>
                          <option value="editor">Editor</option>
                        </select>
                        <button
                          onClick={() => handleRoleChange(u.user_id)}
                          disabled={!changed || rolesSaving[u.user_id]}
                          className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${changed ? "bg-green-500 text-white hover:bg-green-600" : "bg-muted text-tertiary cursor-not-allowed"}`}
                        >
                          {rolesSaving[u.user_id] ? "..." : "Cambiar"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end px-6 py-4 border-t border-subtle">
          <Button color="secondary" onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </div>
  );
}
