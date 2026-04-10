import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { Button } from "./ui/button";
import { version as APP_VERSION } from "../../package.json";

export default function SettingsModal({ onClose, dark }) {
  const d = dark;
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [pendingRoles, setPendingRoles] = useState({});
  const [rolesSaving, setRolesSaving] = useState({});

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="w-full max-w-xl rounded-2xl shadow-2xl bg-surface border">
        <div className="flex items-center justify-between px-6 py-4 border-b border-subtle">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            <h2 className="text-lg font-bold text-primary">Roles de usuario</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted">v{APP_VERSION}</span>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-tertiary hover:bg-hover">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-5">
          {usersLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-10 h-10 rounded-full border-4 border-gray-300 border-t-green-500 animate-spin" />
            </div>
          ) : (
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
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
