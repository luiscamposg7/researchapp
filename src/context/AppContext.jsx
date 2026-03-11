import { createContext, useContext, useState, useEffect } from "react";
import { INITIAL_DELIVERABLES } from "../constants";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [dark, setDark] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);
  const [deliverables, setDeliverables] = useState(INITIAL_DELIVERABLES);
  const [activeFilter, setActiveFilter] = useState({ type: "Tipo de entregable", team: null });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    fetch("/api/deliverables")
      .then(r => r.json())
      .then(saved => {
        if (saved.length > 0) {
          const marked = saved.map(d => ({ ...d, isCustom: true }));
          setDeliverables(prev => {
            const existingIds = new Set(prev.map(d => d.id));
            const newItems = marked.filter(d => !existingIds.has(d.id));
            return newItems.length > 0 ? [...newItems, ...prev] : prev;
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleAdd = (item) => {
    setDeliverables(prev => prev.some(d => d.id === item.id) ? prev : [item, ...prev]);
    fetch("/api/deliverables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    }).catch(() => {});
  };

  const handleDelete = (id) => {
    setDeliverables(prev => prev.filter(d => d.id !== id));
    fetch(`/api/deliverables/${id}`, { method: "DELETE" }).catch(() => {});
  };

  return (
    <AppContext.Provider value={{ dark, setDark, deliverables, activeFilter, setActiveFilter, handleAdd, handleDelete }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
