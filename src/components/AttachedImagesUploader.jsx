import { useState } from "react";
import { Button } from "./ui/button";
import CloudinaryPickerModal from "./CloudinaryPickerModal";

export default function AttachedImagesUploader({ images = [], onChange }) {
  const [showPicker, setShowPicker] = useState(false);

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
