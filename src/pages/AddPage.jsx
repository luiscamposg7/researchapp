import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Button } from "../components/ui/button";
import RichEditor from "../components/RichEditor";
import CustomSelect from "../components/CustomSelect";
import DateInput from "../components/DateInput";
import AttachedImagesUploader from "../components/AttachedImagesUploader";
import PersonaImageUploader from "../components/PersonaImageUploader";
import { PRODUCTS, TYPES, PERSONA_TYPES, METODOLOGIAS, TYPE_COLORS, EMPTY_PERSONA } from "../lib/constants";
import { toSlug, getDriveId, uploadToCloudinary } from "../lib/utils";
import { useJiraUrl } from "../hooks/useJiraUrl";
import SectionTitle from "../components/SectionTitle";
import ConfirmModal from "../components/ConfirmModal";

export default function AddPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { dark: d, handleAdd, showToast, editors } = useApp();
  const prefill = location.state || {};
  const onClose = () => navigate(-1);
  const onSave = (item) => {
    handleAdd(item);
    showToast({ title: item.status === "Publicado" ? "Research publicado exitosamente" : "Borrador guardado", subtitle: "Puedes seguir editando desde esta misma pantalla." });
    navigate(`/editar-research/${toSlug(item.title)}`, { state: { item } });
  };
  const today = new Date().toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" }).replace(".", "");
  const [form, setForm] = useState(() => {
    const type = prefill.type || "";
    const tags = prefill.product ? [prefill.product] : [];
    const personas = PERSONA_TYPES.includes(type) ? [EMPTY_PERSONA()] : [];
    return {
      title: "", type, metodologia: "",
      jira: "", jiraUrl: "", jiraStatus: "EN CURSO",
      team: [], tags,
      descripcion: "",
      objetivo: "", usuario: "", hallazgos: "", contenido: "",
      status: "Borrador", archivo: "", archivoUrl: "", reunionUrl: "",
      date: new Date().toISOString().slice(0, 10),
      imagenes: [],
      personas,
    };
  });
  const [personaTab, setPersonaTab] = useState(0);
  const [personaImgUploading, setPersonaImgUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [confirmRemovePersona, setConfirmRemovePersona] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const { handleJiraUrl, jiraLoading, jiraError } = useJiraUrl(set);
  const setType = (t) => {
    if (PERSONA_TYPES.includes(t)) {
      setForm(f => ({ ...f, type: t, personas: [EMPTY_PERSONA()] }));
      setPersonaTab(0);
    } else {
      setForm(f => ({ ...f, type: t, personas: [] }));
    }
  };
  const setPersonaField = (idx, field, val) => setForm(f => {
    const personas = f.personas.map((p, i) => i === idx ? { ...p, [field]: val } : p);
    return { ...f, personas };
  });
  const addPersona = () => {
    const empty = EMPTY_PERSONA();
    setForm(f => ({ ...f, personas: [...f.personas, empty] }));
    setPersonaTab(form.personas.length);
  };
  const removePersona = (idx) => {
    setForm(f => ({ ...f, personas: f.personas.filter((_, i) => i !== idx) }));
    setPersonaTab(t => Math.max(0, t - (idx <= t ? 1 : 0)));
  };

  const handleSave = (status) => {
    if (saving) return;
    if (!form.title.trim() || !form.type || !form.tags.length) return;
    setSaving(true);
    onSave({
      ...form,
      status,
      id: Date.now(),
      isCustom: true,
      typeColor: TYPE_COLORS[form.type] || "amber",
      date: form.date ? new Date(form.date + "T12:00:00").toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" }).replace(".", "") : today,
      tags: form.tags.length ? form.tags : ["Sin producto"],
      team: form.team.length ? form.team : [],
      archivo: form.archivo.trim() || `${form.title}.pdf`,
    });
  };

  const inp = "w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-surface border text-primary placeholder-muted";
  const lbl = "block text-sm font-semibold mb-1 text-tertiary";

  return (
    <div className="flex-1 overflow-y-auto bg-page">

      {confirmRemovePersona !== null && (
        <ConfirmModal
          title="¿Eliminar persona?"
          message={`Se eliminará "Persona ${confirmRemovePersona + 1}" y todas sus imágenes.`}
          confirmLabel="Sí, eliminar"
          danger
          onConfirm={() => { removePersona(confirmRemovePersona); setConfirmRemovePersona(null); }}
          onCancel={() => setConfirmRemovePersona(null)}
        />
      )}

      {/* Modal de confirmación */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border p-6 shadow-xl bg-surface">
            <h3 className="text-base font-semibold mb-1 text-primary">¿Descartar cambios?</h3>
            <p className="text-sm mb-5 text-tertiary">Si vuelves ahora, perderás toda la información que has añadido.</p>
            <div className="flex gap-3 justify-end">
              <Button color="secondary" onClick={() => setShowLeaveModal(false)}>
                Cancelar
              </Button>
              <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700">
                Sí, descartar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="border-b px-4 py-3 md:px-8 md:py-4 sticky top-0 z-10 bg-page border-subtle flex items-center justify-between gap-4">
        <button
          onClick={() => {
            const hasData = form.title.trim() || form.descripcion.trim() || form.contenido.trim() || form.jiraUrl || form.archivoUrl;
            hasData ? setShowLeaveModal(true) : onClose();
          }}
          className="flex items-center gap-2 text-sm font-semibold text-tertiary hover:text-primary"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          Volver
        </button>
        <Button color="primary" onClick={() => handleSave("Publicado")} disabled={!form.title.trim() || !form.type || !form.tags.length || saving} className="disabled:opacity-40">Publicar</Button>
      </div>

      <div className="w-full mx-auto px-4 md:px-8 py-6 md:py-8" style={{ maxWidth: "1600px" }}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1 text-primary">Añadir research</h1>
          {form.title.trim() && (
            <div className="flex items-center gap-2 min-w-0">
              <p className="text-sm font-medium truncate min-w-0 text-tertiary">{window.location.origin}/research/{toSlug(form.title)}</p>
              <button type="button" title="Copiar enlace" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/research/${toSlug(form.title)}`)} style={{ width: 32, height: 32 }} className="flex items-center justify-center rounded-lg border flex-shrink-0 bg-surface text-tertiary hover:bg-hover hover:text-secondary">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
          {/* Columna principal */}
          <div className="md:col-span-3 space-y-4">

            <div className="space-y-3">
              <div>
                <label className={lbl}>Título <span className="text-green-500">*</span></label>
                <input
                  className="w-full px-3 py-2 text-xl font-semibold border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-surface text-primary placeholder-muted"
                  placeholder="Título del research..."
                  value={form.title}
                  onChange={e => set("title", e.target.value)}
                />
              </div>
              <div>
                <label className={lbl}>Descripción corta</label>
                <textarea
                  className={inp + " resize-none"}
                  placeholder="Lo que verán en la card al buscar este research..."
                  rows={2}
                  value={form.descripcion}
                  onChange={e => set("descripcion", e.target.value)}
                />
              </div>
            </div>

            {/* Contenido */}
            <div className="rounded-2xl border p-5 space-y-4 bg-surface">
              <SectionTitle>Contenido</SectionTitle>
              <RichEditor value={form.contenido} onChange={v => set("contenido", v)} placeholder="" />
            </div>

            {/* Referencias */}
            <div className="rounded-2xl border p-5 space-y-4 bg-surface">
              <SectionTitle>Referencias</SectionTitle>
              <div>
                <label className={lbl}>Link de la presentación</label>
                <input className={inp} type="url" placeholder="https://docs.google.com/presentation/... o figma.com/file/..."
                  value={form.archivoUrl} onChange={e => {
                    const url = e.target.value;
                    set("archivoUrl", url);
                    const id = getDriveId(url);
                    if (id) fetch(`/api/gdrive/${id}`).then(r => r.json()).then(data => { if (data.title) set("archivo", data.title); }).catch(() => {});
                  }} />
              </div>
              <div>
                <label className={lbl}>Link de la reunión</label>
                <input className={inp} type="url" placeholder="https://drive.google.com/file/d/... (MP4)"
                  value={form.reunionUrl || ""} onChange={e => set("reunionUrl", e.target.value)} />
              </div>
              <div>
                <label className={lbl}>Link de Jira</label>
                <div className="relative">
                  <input className={inp} type="url" placeholder="https://empresa.atlassian.net/browse/UX-0000"
                    value={form.jiraUrl} onChange={e => handleJiraUrl(e.target.value)} />
                  {jiraLoading && <div className="absolute right-3 top-1/2 -translate-y-1/2"><svg className="w-4 h-4 animate-spin text-green-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg></div>}
                </div>
                {jiraError && <p className="mt-1 text-sm text-amber-500">{jiraError}</p>}
                {form.jira && !jiraLoading && (
                  <div className="mt-2 rounded-lg p-3 bg-muted border-strong">
                    <p className="text-sm font-semibold leading-snug text-primary">{form.jira}</p>
                    {form.jiraStatus && (
                      <span className={`inline-block mt-1 text-sm font-bold px-2 py-0.5 rounded ${/done|closed|resolved|finaliz|complet/i.test(form.jiraStatus) ? (d ?"text-green-400 bg-green-900/40" :"text-green-700 bg-green-50") : (d ?"text-blue-400 bg-blue-900/40" :"text-blue-700 bg-blue-50")}`}>{form.jiraStatus}</span>
                    )}
                    <button type="button" onClick={() => { set("jira", ""); set("jiraStatus", ""); set("jiraUrl", ""); }} className="block mt-1.5 text-sm text-tertiary hover:text-secondary">Cambiar ticket</button>
                  </div>
                )}
              </div>
            </div>

            {/* Personas */}
            {PERSONA_TYPES.includes(form.type) && form.personas.length > 0 && (
              <div className="rounded-2xl border bg-surface">
                <div className="flex items-center justify-between px-5 pt-5 pb-4">
                  <SectionTitle>Buyer y User Personas</SectionTitle>
                  {form.personas.length < 3 && (
                    <Button type="button" size="xs" color="secondary" onClick={addPersona}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                      Añadir persona
                    </Button>
                  )}
                </div>
                <div className="flex border-b px-5">
                  {form.personas.map((_, i) => (
                    <div key={i} className="flex items-center">
                      <button type="button" onClick={() => setPersonaTab(i)} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${personaTab === i ? "border-green-500 text-green-600" : "border-transparent text-tertiary hover:text-primary"}`}>
                        Persona {i + 1}
                      </button>
                      {form.personas.length > 1 && (
                        <button type="button" onClick={() => setConfirmRemovePersona(i)} className="-ml-1 mb-px w-4 h-4 flex items-center justify-center text-sm text-muted hover:text-secondary">✕</button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="p-5">
                  <PersonaImageUploader
                    key={personaTab}
                    images={(form.personas[personaTab]?.images) || []}
                    uploading={personaImgUploading}
                    onChange={urls => setPersonaField(personaTab, "images", urls)}
                    onUpload={async (files) => {
                      setPersonaImgUploading(true);
                      try {
                        const url = await uploadToCloudinary(files[0]);
                        setPersonaField(personaTab, "images", [url]);
                      } catch (err) { showToast({ title: "Error al subir imagen", subtitle: err?.message }, "error"); }
                      setPersonaImgUploading(false);
                    }}
                  />
                </div>
              </div>
            )}

          </div>

          {/* Sidebar */}
          <div className="space-y-4">

            {/* Estado + Acciones */}
            <div className="rounded-2xl p-5 space-y-4 bg-surface border shadow-xs">
              <div className="flex items-center justify-between">
                <SectionTitle>Estado</SectionTitle>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-semibold ${form.status ==="Publicado" ? (d ?"bg-green-900/40 text-green-400" :"bg-green-50 text-green-700") : (d ?"bg-gray-800 text-gray-400" :"bg-gray-100 text-gray-500")}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${form.status ==="Publicado" ?"bg-green-500" :"bg-gray-400"}`} />
                  {form.status}
                </span>
              </div>
              <div>
                <label className={lbl}>Fecha de publicación</label>
                <DateInput value={form.date} onChange={v => set("date", v)} dark={d} />
              </div>
              <Button color="secondary" onClick={() => handleSave("Borrador")} disabled={!form.title.trim() || !form.type || !form.tags.length || saving} className="w-full disabled:opacity-40">Guardar</Button>
            </div>

            {/* Clasificación */}
            <div className="rounded-2xl p-5 space-y-4 bg-surface border shadow-xs">
              <SectionTitle>Clasificación</SectionTitle>
              <div>
                <label className={lbl}>Tipo de entregable <span className="text-green-500">*</span></label>
                <CustomSelect dark={d} fullWidth value={form.type} onChange={setType} options={[{value:"",label:"Seleccione"}, ...TYPES.slice(1).map(t => ({value:t,label:t}))]} />
              </div>
              <div>
                <label className={lbl}>Metodología</label>
                <CustomSelect dark={d} fullWidth value={form.metodologia || ""} onChange={v => set("metodologia", v)} options={[{value:"",label:"Seleccione"},{value:"Sin especificar",label:"Sin especificar"}, ...METODOLOGIAS.map(m => ({value:m,label:m}))]} />
              </div>
              <div>
                <label className={lbl}>Producto <span className="text-green-500">*</span></label>
                <CustomSelect dark={d} fullWidth value={form.tags[0] || ""} onChange={v => set("tags", v ? [v] : [])} options={[{value:"",label:"Seleccione"}, ...PRODUCTS.map(p => ({value:p,label:p}))]} />
              </div>
              <div>
                <label className={lbl}>Persona asignada</label>
                <CustomSelect dark={d} fullWidth value={form.team[0] || ""} onChange={v => set("team", v ? [v] : [])} options={[{value:"",label:"Seleccione"}, ...editors.map(n => ({value:n,label:n}))]} />
              </div>
            </div>

            {/* Imágenes adjuntas */}
            <div className="rounded-2xl border p-5 space-y-4 bg-surface shadow-xs">
              <SectionTitle>Imágenes adjuntas</SectionTitle>
              <AttachedImagesUploader
                images={form.imagenes || []}
                onChange={urls => set("imagenes", urls)}
                uploading={imageUploading}
                onUploadFile={async (file) => {
                  setImageUploading(true);
                  try {
                    const url = await uploadToCloudinary(file);
                    setForm(f => ({ ...f, imagenes: [...(f.imagenes || []), url] }));
                  } catch (err) { showToast({ title: "Error al subir imagen", subtitle: err?.message }, "error"); }
                  setImageUploading(false);
                }}
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
