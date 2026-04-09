import { useState } from "react";
import { loadJiraConfig } from "../lib/utils";

export function useJiraUrl(setField) {
  const [jiraLoading, setJiraLoading] = useState(false);
  const [jiraError, setJiraError] = useState("");

  const handleJiraUrl = async (url) => {
    setField("jiraUrl", url);
    setJiraError("");
    const match = url.match(/\/browse\/([A-Z]+-\d+)/i);
    if (!match) return;
    const key = match[1].toUpperCase();
    setField("jira", key);
    const cfg = await loadJiraConfig();
    if (!cfg.email || !cfg.token) {
      setJiraError("Configura tus credenciales en Configuración del menú.");
      return;
    }
    const base = (cfg.baseUrl || url.split("/browse/")[0]).replace(/\/$/, "");
    setJiraLoading(true);
    try {
      const auth = btoa(`${cfg.email.trim()}:${cfg.token.trim()}`);
      const res = await fetch(`/api/jira/${key}`, { headers: { "x-jira-base": base, "x-jira-auth": auth } });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.errorMessages?.[0] || data.error || `HTTP ${res.status}`);
      setField("jira", `${key}: ${data.fields.summary}`);
      setField("jiraStatus", data.fields.status?.name?.toUpperCase() || "EN CURSO");
      setJiraError("");
    } catch (e) {
      setJiraError(`No se pudo obtener el ticket (${e.message}).`);
    } finally {
      setJiraLoading(false);
    }
  };

  return { handleJiraUrl, jiraLoading, jiraError };
}
