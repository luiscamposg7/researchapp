import { useState } from "react";
import { Button } from "./ui/button";
import CloudinaryPickerModal from "./CloudinaryPickerModal";

export default function AttachedImagesUploader({ images = [], onChange, uploading, onUploadFile }) {
  const [dragging, setDragging] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const handleFiles = async (files) => {
    const arr = Array.from(files).filter(f => f.type.startsWith("image/"));
    for (const file of arr) await onUploadFile(file);
  };

  return (
    <>
      {showPicker && (
        <CloudinaryPickerModal
          onClose={() => setShowPicker(false)}
          onSelect={url => { if (!images.includes(url)) onChange([...images, url]); setShowPicker(false); }}
        />
      )}
      <div className="space-y-3">
        <Button type="button" color="secondary" size="sm" onClick={() => setShowPicker(true)} className="w-full flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
          Seleccionar de la librería
        </Button>
        {images.length === 0 && (
          <label
            className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-colors ${uploading ? "opacity-50 pointer-events-none" : dragging ? "border-green-400 bg-green-50/10" : "hover:border-green-400"}`}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
          >
            <svg className={`w-6 h-6 transition-colors ${dragging ? "text-green-500" : "text-muted"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <span className="text-sm font-medium text-tertiary">{uploading ? "Subiendo..." : dragging ? "Suelta aquí" : "Subir imágenes"}</span>
            <span className="text-xs text-muted">PNG, JPG, WebP · arrastra o haz clic</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
          </label>
        )}
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {images.map((url, i) => (
              <div key={i} className="relative group aspect-square rounded-lg overflow-hidden">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => onChange(images.filter((_, j) => j !== i))}
                  className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
