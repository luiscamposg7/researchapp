import { useApp } from "../context/AppContext";
import { Button } from "./ui/button";

export default function ConfirmModal({ title, message, confirmLabel = "Confirmar", danger = false, onConfirm, onCancel }) {
  const { dark: d } = useApp();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
      <div className="rounded-2xl shadow-2xl w-full max-w-sm bg-surface border">
        <div className="px-6 pt-6 pb-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${danger ? (d ?"bg-red-900/50" :"bg-red-100") : (d ?"bg-amber-900/50" :"bg-amber-100")}`}>
            <svg className={`w-5 h-5 ${danger ?"text-red-500" :"text-amber-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h3 className="text-base font-bold mb-1 text-primary">{title}</h3>
          <p className="text-sm text-tertiary">{message}</p>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <Button color="secondary" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
          <button onClick={onConfirm} className={`flex-1 px-4 py-2 text-sm font-semibold rounded-lg text-white ${danger ?"bg-red-500 hover:bg-red-600" :"bg-amber-500 hover:bg-amber-600"}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
