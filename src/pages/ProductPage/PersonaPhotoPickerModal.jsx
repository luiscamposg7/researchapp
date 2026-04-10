import { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import { Button } from "../../components/ui/button";
import ConfirmModal from "../../components/ConfirmModal";
import { Spinner } from "../../components/Spinner";

export default function PersonaPhotoPickerModal({ onSelect, onUpload, onClose }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmTarget, setConfirmTarget] = useState(null);

  useEffect(() => {
    supabase.storage.from("profile-pic-users").list("", { limit: 200 }).then(({ data }) => {
      setFiles((data || []).filter(f => !f.name.startsWith(".")));
      setLoading(false);
    });
  }, []);

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-[480px] max-h-[80vh] rounded-2xl flex flex-col shadow-2xl bg-surface border">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-semibold text-base text-primary">Elegir foto de perfil</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-hover text-tertiary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="px-6 py-3 border-b">
          <Button color="secondary" onClick={onUpload} className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
            Subir nueva foto
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center py-8"><Spinner size="lg" /></div>
          ) : files.length === 0 ? (
            <p className="text-sm text-center py-8 text-muted">No hay fotos subidas aún.</p>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {files.map(f => {
                const { data } = supabase.storage.from("profile-pic-users").getPublicUrl(f.name);
                const url = data?.publicUrl;
                return (
                  <div key={f.name} className="relative group">
                    <button onClick={() => onSelect(url)} className="w-full rounded-full overflow-hidden transition-all hover:border-green-500 aspect-square border">
                      <img src={url} alt={f.name} className="w-full h-full object-cover" />
                    </button>
                    <button onClick={() => setConfirmTarget(f)}
                      className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 flex-shrink-0 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
    {confirmTarget && (
      <ConfirmModal
        title="Eliminar foto"
        message="¿Estás seguro de que quieres eliminar esta foto? Esta acción no se puede deshacer."
        confirmLabel="Sí, eliminar"
        danger
        onConfirm={async () => {
          const target = confirmTarget;
          setConfirmTarget(null);
          await supabase.storage.from("profile-pic-users").remove([target.name]);
          setFiles(fs => fs.filter(x => x.name !== target.name));
        }}
        onCancel={() => setConfirmTarget(null)}
      />
    )}
    </>
  );
}
