import { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Button } from "../components/ui/button";
import RichEditor from "../components/RichEditor";
import CustomSelect from "../components/CustomSelect";
import DateInput from "../components/DateInput";
import AttachedImagesUploader from "../components/AttachedImagesUploader";
import PersonaImageUploader from "../components/PersonaImageUploader";
import { PRODUCTS, TYPES, PERSONA_TYPES, METODOLOGIAS, TYPE_COLORS, EMPTY_PERSONA } from "../lib/constants";
import { Spinner } from "../components/Spinner";
import { toSlug, getDriveId, uploadToCloudinary } from "../lib/utils";
import { useJiraUrl } from "../hooks/useJiraUrl";
import SectionTitle from "../components/SectionTitle";
import ConfirmModal from "../components/ConfirmModal";
import MultiSelectInput from "../components/MultiSelectInput";

export default function EditPage() {
  const location = useLocation();
  const { slug } = useParams();
  const { deliverables } = useApp();
  const item = deliverables.find(x => toSlug(x.title) === slug) || location.state?.item;

  if (!item) return <div className="flex-1 flex items-center justify-center bg-page text-gray-500">Research no encontrado.</div>;
  return <EditPageForm item={item} />;
}

function EditPageForm({ item }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { dark: d, handleUpdate, showToast, editors } = useApp();
  const fromLabel = location.state?.fromLabel || null;

  const [form, setForm] = useState(() => {
    const f = { contenido: "", ...item };
    // Migrate old personas[] → buyers
    if (!f.buyers) { f.buyers = f.personas?.length ? f.personas : (PERSONA_TYPES.includes(f.type) ? [EMPTY_PERSONA()] : []); }
    if (!f.users) { f.users = []; }
    return f;
  });
  const [buyerTab, setBuyerTab] = useState(0);
  const [userTab, setUserTab] = useState(0);
  const [buyerImgUploading, setBuyerImgUploading] = useState(false);
  const [userImgUploading, setUserImgUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(null); // { group, idx }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const { handleJiraUrl, jiraLoading, jiraError } = useJiraUrl(set);
  const setType = (t) => {
    if (PERSONA_TYPES.includes(t)) {
      setForm(f => ({ ...f, type: t, buyers: f.buyers?.length ? f.buyers : [EMPTY_PERSONA()], users: f.users || [] }));
      setBuyerTab(0); setUserTab(0);
    } else {
      setForm(f => ({ ...f, type: t, buyers: [], users: [] }));
    }
  };
  const setGroupField = (group, idx, field, val) => setForm(f => ({
    ...f, [group]: f[group].map((p, i) => i === idx ? { ...p, [field]: val } : p)
  }));
  const addBuyer = () => { setForm(f => ({ ...f, buyers: [...f.buyers, EMPTY_PERSONA()] })); setBuyerTab(form.buyers.length); };
  const addUser  = () => { setForm(f => ({ ...f, users:  [...f.users,  EMPTY_PERSONA()] })); setUserTab(form.users.length); };
  const removeFromGroup = (group, idx, tab, setTab) => {
    setForm(f => ({ ...f, [group]: f[group].filter((_, i) => i !== idx) }));
    setTab(t => Math.max(0, t - (idx <= t ? 1 : 0)));
  };

  const handleSave = (status) => {
    if (saving || !form.title.trim()) return;
    setSaving(true);
    const updated = { ...form, status, typeColor: TYPE_COLORS[form.type] || item.typeColor };
    handleUpdate(updated);
    showToast({ title: status === "Publicado" ? "Research publicado" : "Borrador guardado", subtitle: "Los cambios se han guardado correctamente." });
    navigate(`/research/${toSlug(form.title)}`, { replace: true });
  };

  const inp = "w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-surface border text-primary placeholder-muted";
  const lbl = "block text-sm font-semibold mb-1 text-tertiary";

  // Convert stored date string to YYYY-MM-DD for DateInput
  const toIsoDate = (str) => {
    if (!str) return new Date().toISOString().slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    const dt = new Date(str); return isNaN(dt) ? new Date().toISOString().slice(0, 10) : dt.toISOString().slice(0, 10);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-page">

      {confirmRemove !== null && (
        <ConfirmModal
          title="¿Eliminar persona?"
          message="Se eliminará esta persona y su imagen."
          confirmLabel="Sí, eliminar"
          danger
          onConfirm={() => { removeFromGroup(confirmRemove.group, confirmRemove.idx, confirmRemove.group === "buyers" ? buyerTab : userTab, confirmRemove.group === "buyers" ? setBuyerTab : setUserTab); setConfirmRemove(null); }}
          onCancel={() => setConfirmRemove(null)}
        />
      )}

      {/* Top bar */}
      <div className="border-b px-4 py-3 md:px-8 md:py-4 sticky top-0 z-10 bg-page border flex items-center justify-between gap-4">
        <button onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/research")} className="flex items-center gap-2 text-sm font-semibold text-tertiary hover:text-primary transition-colors duration-150 cursor-pointer">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          <span>Volver</span>
        </button>
      </div>

      <div className="w-full mx-auto px-4 md:px-8 py-6 md:py-8 pb-16" style={{ maxWidth: "1600px" }}>

        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-1 text-primary">Editar research</h1>
          <div className="flex items-center gap-1.5">
            <a href={`/research/${toSlug(item.title)}`} target="_blank" rel="noreferrer" className="text-base font-medium pr-2 truncate min-w-0 hover:opacity-80 transition-opacity" style={{ color: "#00B369" }}>{window.location.origin}/research/{toSlug(item.title)}</a>
            <button type="button" title="Copiar enlace" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/research/${toSlug(item.title)}`); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ height: 38 }} className={`flex items-center gap-1.5 px-2 rounded-lg border flex-shrink-0 bg-surface hover:bg-hover transition-colors text-sm font-medium ${copied ? "text-green-500 border-green-300" : "text-tertiary hover:text-secondary"}`}>
              {copied
                ? <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg><span>Copiado</span></>
                : <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg><span>Copiar enlace</span></>
              }
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
          {/* Columna principal */}
          <div className="md:col-span-3 space-y-4">

            <div className="space-y-3">
              <div>
                <label className={lbl}>Título <span className="text-green-500">*</span></label>
                <input className="w-full px-3 py-2 text-xl font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-surface border text-primary placeholder-gray-400" value={form.title} onChange={e => set("title", e.target.value)} placeholder="Título del research..." />
              </div>
              <div>
                <label className={lbl}>Descripción corta</label>
                <textarea className={inp + " resize-none"} rows={2} placeholder="Lo que verán en la card al buscar este research..." value={form.descripcion || ""} onChange={e => set("descripcion", e.target.value)} />
              </div>
            </div>

            {/* Contenido */}
            <div className="rounded-2xl p-5 space-y-4 bg-surface border shadow-xs">
              <SectionTitle>Contenido</SectionTitle>
              <RichEditor value={form.contenido} onChange={v => set("contenido", v)} placeholder="" />
            </div>

            {/* Referencias */}
            <div className="rounded-2xl p-5 space-y-4 bg-surface border shadow-xs">
              <SectionTitle>Referencias</SectionTitle>
              <div>
                <label className={lbl}>Link de la presentación</label>
                <input className={inp} type="url" placeholder="https://docs.google.com/presentation/... o figma.com/file/..." value={form.archivoUrl || ""} onChange={e => { const url = e.target.value; set("archivoUrl", url); const id2 = getDriveId(url); if (id2) fetch(`/api/gdrive/${id2}`).then(r => r.json()).then(data => { if (data.title) set("archivo", data.title); }).catch(() => {}); }} />
              </div>
              <div>
                <label className={lbl}>Link de la reunión</label>
                <input className={inp} type="url" placeholder="https://drive.google.com/file/d/... (MP4)" value={form.reunionUrl || ""} onChange={e => set("reunionUrl", e.target.value)} />
              </div>
              <div>
                <label className={lbl}>Link de Jira</label>
                <div className="relative">
                  <input className={inp} type="url" placeholder="https://empresa.atlassian.net/browse/UX-0000" value={form.jiraUrl || ""} onChange={e => handleJiraUrl(e.target.value)} />
                  {jiraLoading && <div className="absolute right-3 top-1/2 -translate-y-1/2"><Spinner size="sm" /></div>}
                </div>
                {jiraError && <p className="mt-1 text-sm text-amber-500">{jiraError}</p>}
                {form.jira && !jiraLoading && (
                  <div className="mt-2 rounded-lg p-3 bg-muted border">
                    <p className="text-sm font-semibold leading-snug text-primary">{form.jira}</p>
                    {form.jiraStatus && <span className={`inline-block mt-1 text-sm font-bold px-2 py-0.5 rounded ${/done|closed|resolved|finaliz|complet/i.test(form.jiraStatus) ? (d ?"text-green-400 bg-green-900/40" :"text-green-700 bg-green-50") : (d ?"text-blue-400 bg-blue-900/40" :"text-blue-700 bg-blue-50")}`}>{form.jiraStatus}</span>}
                    <button type="button" onClick={() => { set("jira", ""); set("jiraStatus", ""); set("jiraUrl", ""); }} className="block mt-1.5 text-sm text-muted hover:text-secondary">Cambiar ticket</button>
                  </div>
                )}
              </div>
            </div>

            {/* Personas */}
            {PERSONA_TYPES.includes(form.type) && (
              <div className="rounded-2xl border bg-surface overflow-hidden">
                <div className="px-5 pt-5 pb-4"><SectionTitle>Buyer y User Personas</SectionTitle></div>

                {/* Buyer group */}
                <div className="border-t">
                  <div className="flex items-center justify-between px-5 py-3">
                    <span className="text-sm font-semibold" style={{ color: "#2563EB" }}>Buyer Persona</span>
                    {form.buyers.length < 3 && (
                      <Button type="button" size="xs" color="secondary" onClick={addBuyer}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                        Añadir buyer
                      </Button>
                    )}
                  </div>
                  <div className="flex border-b px-5">
                    {form.buyers.map((_, i) => (
                      <div key={i} className="flex items-center">
                        <button type="button" onClick={() => setBuyerTab(i)} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${buyerTab === i ? "border-blue-500 text-blue-600" : "border-transparent text-tertiary hover:text-primary"}`}>
                          B{i + 1}
                        </button>
                        {form.buyers.length > 1 && (
                          <button type="button" onClick={() => setConfirmRemove({ group: "buyers", idx: i })} className="-ml-1 mb-px w-4 h-4 flex items-center justify-center text-sm text-muted hover:text-secondary">✕</button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="p-5">
                    <PersonaImageUploader
                      key={`buyer-${buyerTab}`}
                      images={form.buyers[buyerTab]?.images || []}
                      uploading={buyerImgUploading}
                      onChange={urls => setGroupField("buyers", buyerTab, "images", urls)}
                      onUpload={async (files) => {
                        setBuyerImgUploading(true);
                        try { const url = await uploadToCloudinary(files[0]); setGroupField("buyers", buyerTab, "images", [url]); }
                        catch (err) { showToast({ title: "Error al subir imagen", subtitle: err?.message }, "error"); }
                        setBuyerImgUploading(false);
                      }}
                    />
                  </div>
                </div>

                {/* User group */}
                <div className="border-t">
                  <div className="flex items-center justify-between px-5 py-3">
                    <span className="text-sm font-semibold" style={{ color: "#00B369" }}>User Persona</span>
                    {form.users.length < 3 && (
                      <Button type="button" size="xs" color="secondary" onClick={addUser}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                        Añadir user
                      </Button>
                    )}
                  </div>
                  {form.users.length > 0 && (
                    <>
                      <div className="flex border-b px-5">
                        {form.users.map((_, i) => (
                          <div key={i} className="flex items-center">
                            <button type="button" onClick={() => setUserTab(i)} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${userTab === i ? "border-green-500 text-green-600" : "border-transparent text-tertiary hover:text-primary"}`}>
                              U{i + 1}
                            </button>
                            <button type="button" onClick={() => setConfirmRemove({ group: "users", idx: i })} className="-ml-1 mb-px w-4 h-4 flex items-center justify-center text-sm text-muted hover:text-secondary">✕</button>
                          </div>
                        ))}
                      </div>
                      <div className="p-5">
                        <PersonaImageUploader
                          key={`user-${userTab}`}
                          images={form.users[userTab]?.images || []}
                          uploading={userImgUploading}
                          onChange={urls => setGroupField("users", userTab, "images", urls)}
                          onUpload={async (files) => {
                            setUserImgUploading(true);
                            try { const url = await uploadToCloudinary(files[0]); setGroupField("users", userTab, "images", [url]); }
                            catch (err) { showToast({ title: "Error al subir imagen", subtitle: err?.message }, "error"); }
                            setUserImgUploading(false);
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Sidebar */}
          <div className="space-y-4">

            {/* Publicación */}
            <div className="rounded-2xl p-5 space-y-4 bg-surface border shadow-xs">
              <div className="flex items-center justify-between">
                <SectionTitle>Publicación</SectionTitle>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-semibold ${form.status ==="Publicado" ? (d ?"bg-green-900/40 text-green-400" :"bg-green-50 text-green-700") : (d ?"bg-gray-800 text-gray-400" :"bg-gray-100 text-gray-500")}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${form.status ==="Publicado" ?"bg-green-500" :"bg-gray-400"}`} />
                  {form.status}
                </span>
              </div>
              <div>
                <label className={lbl}>Fecha de publicación</label>
                <DateInput value={toIsoDate(form.date)} onChange={v => set("date", v)} dark={d} />
              </div>
              <Button color="primary" onClick={() => handleSave(form.status === "Publicado" ? "Publicado" : "Publicado")} disabled={!form.title.trim() || saving} className="w-full disabled:opacity-40">
                {form.status === "Publicado" ? "Guardar cambios" : "Publicar ahora"}
              </Button>
            </div>

            {/* Clasificación */}
            <div className="rounded-2xl p-5 space-y-4 bg-surface border shadow-xs">
              <SectionTitle>Clasificación</SectionTitle>
              <div>
                <label className={lbl}>Tipo de entregable <span className="text-green-500">*</span></label>
                <CustomSelect dark={d} fullWidth value={form.type} onChange={setType} options={[{value:"",label:"Seleccione"}, ...TYPES.slice(1).map(t => ({value:t,label:t}))]} />
              </div>
              <div>
                <label className={lbl}>Producto <span className="text-green-500">*</span></label>
                <CustomSelect dark={d} fullWidth value={form.tags[0] || ""} onChange={v => set("tags", v ? [v] : [])} options={[{value:"",label:"Seleccione"}, ...PRODUCTS.map(p => ({value:p,label:p}))]} />
              </div>
              <div>
                <label className={lbl}>Metodología</label>
                <CustomSelect dark={d} fullWidth value={form.metodologia || ""} onChange={v => set("metodologia", v)} options={[{value:"",label:"Seleccione"},{value:"Sin especificar",label:"Sin especificar"}, ...METODOLOGIAS.map(m => ({value:m,label:m}))]} />
              </div>
              <div>
                <label className={lbl}>Personas asignadas <span className="text-green-500">*</span></label>
                <MultiSelectInput
                  value={form.team}
                  onChange={v => set("team", v)}
                  options={editors}
                  placeholder="Asignar persona..."
                />
              </div>
            </div>

            {/* Imágenes adjuntas */}
            <div className="rounded-2xl p-5 space-y-4 bg-surface border shadow-xs">
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
