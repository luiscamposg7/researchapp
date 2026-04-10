import { useState, useRef, useCallback, useEffect } from "react";
import { sanitizeHtml } from "../lib/utils";

const HEADING_LABELS = { p: "Párrafo", h1: "Título 1", h2: "Título 2", h3: "Título 3", h4: "Título 4", h5: "Título 5", h6: "Título 6" };

export default function RichEditor({ onChange, placeholder, value }) {
  const ref = useRef(null);
  const [active, setActive] = useState({});
  const [headingOpen, setHeadingOpen] = useState(false);
  const [headingLabel, setHeadingLabel] = useState("Tamaño");

  useEffect(() => {
    document.execCommand("defaultParagraphSeparator", false, "p");
    if (ref.current) {
      ref.current.innerHTML = value || "<p><br></p>";
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateActive = useCallback(() => {
    setActive({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      ul: document.queryCommandState("insertUnorderedList"),
      ol: document.queryCommandState("insertOrderedList"),
      justifyLeft: document.queryCommandState("justifyLeft"),
      justifyCenter: document.queryCommandState("justifyCenter"),
      justifyRight: document.queryCommandState("justifyRight"),
      justifyFull: document.queryCommandState("justifyFull"),
    });
    const sel = window.getSelection();
    if (sel && sel.rangeCount) {
      let node = sel.getRangeAt(0).startContainer;
      while (node && node !== ref.current) {
        const tag = node.nodeName?.toLowerCase();
        if (HEADING_LABELS[tag]) { setHeadingLabel(HEADING_LABELS[tag]); return; }
        node = node.parentElement;
      }
    }
    setHeadingLabel("Tamaño");
  }, []);

  const exec = useCallback((cmd, val) => {
    ref.current.focus();
    document.execCommand(cmd, false, val ?? null);
    setTimeout(updateActive, 0);
  }, [updateActive]);

  const handleInput = () => {
    // Auto-convert "- " at start of a line to a bullet list
    const sel = window.getSelection();
    if (sel && sel.rangeCount) {
      const node = sel.getRangeAt(0).startContainer;
      if (node.nodeType === Node.TEXT_NODE && node.textContent === "- ") {
        node.textContent = "";
        document.execCommand("insertUnorderedList");
      }
    }
    const html = ref.current.innerHTML;
    onChange(html === "<p><br></p>" ? "" : html);
    updateActive();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const html = e.clipboardData.getData("text/html");
    const text = e.clipboardData.getData("text/plain");
    const clean = html ? sanitizeHtml(html) : text.replace(/\n/g, "<br>");
    document.execCommand("insertHTML", false, clean);
    onChange(ref.current.innerHTML);
  };

  const btn = (cmd, label, title) => (
    <button type="button" title={title}
      onMouseDown={e => { e.preventDefault(); exec(cmd); }}
      className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors ${active[cmd === "insertUnorderedList" ? "ul" : cmd === "insertOrderedList" ? "ol" : cmd] ? "bg-green-100 text-green-700" : "text-tertiary hover:bg-active"}`}>
      {label}
    </button>
  );

  const divider = <div className="w-px h-4 mx-1 bg-strong" />;

  return (
    <div className="rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-green-400 border bg-surface">
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b bg-muted flex-wrap">
        {btn("bold",      <strong>B</strong>,                   "Negrita")}
        {btn("italic",    <em>I</em>,                           "Cursiva")}
        {btn("underline", <span className="underline">U</span>, "Subrayado")}
        {divider}
        <div className="relative">
          <button type="button"
            onMouseDown={e => { e.preventDefault(); setHeadingOpen(o => !o); }}
            className="h-7 px-2 flex items-center gap-1.5 rounded border border-[var(--color-border)] text-xs font-medium transition-colors text-tertiary hover:bg-active bg-surface">
            <span className="font-bold text-sm leading-none">Aа</span>
            <span>{headingLabel}</span>
            <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
          </button>
          {headingOpen && (
            <>
              <div className="fixed inset-0 z-10" onMouseDown={() => setHeadingOpen(false)} />
              <div className="absolute left-0 top-full mt-1 z-20 rounded-lg shadow-lg border overflow-hidden min-w-[130px] bg-surface">
                <button type="button"
                  onMouseDown={e => { e.preventDefault(); exec("formatBlock", "<p>"); setHeadingOpen(false); }}
                  className="w-full text-left px-3 py-1.5 text-sm transition-colors text-secondary hover:bg-active">
                  Párrafo
                </button>
                <div className="border-t" />
                {[["h1","text-2xl font-semibold","Título 1"],["h2","text-xl font-semibold","Título 2"],["h3","text-lg font-semibold","Título 3"],["h4","text-base font-semibold","Título 4"],["h5","text-sm font-medium","Título 5"],["h6","text-xs font-medium text-muted","Título 6"]].map(([tag, cls, name]) => (
                  <button key={tag} type="button"
                    onMouseDown={e => { e.preventDefault(); exec("formatBlock", `<${tag}>`); setHeadingOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 transition-colors hover:bg-active text-primary whitespace-nowrap ${cls}`}>
                    {name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        {divider}
        {btn("justifyLeft",
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h10M4 14h16M4 18h10"/></svg>,
          "Alinear izquierda")}
        {btn("justifyCenter",
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 10h10M4 14h16M7 18h10"/></svg>,
          "Centrar")}
        {btn("justifyRight",
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 10h10M4 14h16M10 18h10"/></svg>,
          "Alinear derecha")}
        {btn("justifyFull",
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>,
          "Justificar")}
        {divider}
        {btn("insertUnorderedList",
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/>
            <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/>
            <circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/>
            <path strokeLinecap="round" d="M8 6h13M8 12h13M8 18h13"/>
          </svg>,
          "Lista con viñetas")}
        {btn("insertOrderedList",
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" d="M9 6h12M9 12h12M9 18h12"/>
            <text x="1" y="8" fontSize="6" fontWeight="700" fill="currentColor" stroke="none" fontFamily="sans-serif">1.</text>
            <text x="1" y="14" fontSize="6" fontWeight="700" fill="currentColor" stroke="none" fontFamily="sans-serif">2.</text>
            <text x="1" y="20" fontSize="6" fontWeight="700" fill="currentColor" stroke="none" fontFamily="sans-serif">3.</text>
          </svg>,
          "Lista numerada")}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        onKeyUp={updateActive}
        onMouseUp={updateActive}
        onFocus={updateActive}
        data-placeholder={placeholder}
        className="min-h-[320px] px-4 py-3 text-base focus:outline-none text-primary"
        style={{ lineHeight: "1.6" }}
      />
    </div>
  );
}
