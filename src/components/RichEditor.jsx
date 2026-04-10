import { useState, useRef, useCallback, useEffect } from "react";
import { sanitizeHtml } from "../lib/utils";

export default function RichEditor({ onChange, placeholder, value }) {
  const ref = useRef(null);
  const [active, setActive] = useState({});
  const [headingOpen, setHeadingOpen] = useState(false);

  useEffect(() => {
    if (ref.current && value) ref.current.innerHTML = value;
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
  }, []);

  const exec = useCallback((cmd, val) => {
    ref.current.focus();
    document.execCommand(cmd, false, val ?? null);
    ref.current.focus();
    updateActive();
  }, [updateActive]);

  const handleInput = () => {
    // Auto-convert "- " at start of a line to a bullet list
    const sel = window.getSelection();
    if (sel && sel.rangeCount) {
      const range = sel.getRangeAt(0);
      const node = range.startContainer;
      if (node.nodeType === Node.TEXT_NODE && node.textContent === '- ') {
        node.textContent = '';
        document.execCommand('insertUnorderedList');
      }
    }
    onChange(ref.current.innerHTML);
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
      className={`w-7 h-7 flex items-center justify-center rounded text-sm font-medium transition-colors ${ active[cmd ==="insertUnorderedList" ?"ul" : cmd ==="insertOrderedList" ?"ol" : cmd] ?"bg-green-100 text-green-700" :"text-tertiary hover:bg-active" }`}>
      {label}
    </button>
  );

  const divider = <div className="w-px h-4 mx-1 bg-strong" />;

  return (
    <div className="rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-green-400 border bg-surface">
      <div className="flex items-center gap-0.5 px-2 py-1 border-b bg-muted">
        {btn("bold",      <strong>B</strong>,                   "Negrita")}
        {btn("italic",    <em>I</em>,                           "Cursiva")}
        {btn("underline", <span className="underline">U</span>, "Subrayado")}
        {divider}
        {btn("insertUnorderedList",
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>,
          "Lista con viñetas")}
        {btn("insertOrderedList",
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h10M7 16h10M3 8h.01M3 12h.01M3 16h.01"/></svg>,
          "Lista numerada")}
        {divider}
        {btn("justifyLeft",
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h10M4 14h16M4 18h10"/></svg>,
          "Alinear izquierda")}
        {btn("justifyCenter",
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 10h10M4 14h16M7 18h10"/></svg>,
          "Centrar")}
        {btn("justifyRight",
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 10h10M4 14h16M10 18h10"/></svg>,
          "Alinear derecha")}
        {btn("justifyFull",
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>,
          "Justificar")}
        {divider}
        <div className="relative">
          <button type="button"
            onMouseDown={e => { e.preventDefault(); setHeadingOpen(o => !o); }}
            className="h-7 px-2 flex items-center gap-1 rounded text-sm font-bold transition-colors text-tertiary hover:bg-active">
            H
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
          </button>
          {headingOpen && (
            <>
              <div className="fixed inset-0 z-10" onMouseDown={() => setHeadingOpen(false)} />
              <div className="absolute left-0 top-full mt-1 z-20 rounded-lg shadow-lg border overflow-hidden min-w-[120px] bg-surface">
                {[["h1","text-2xl font-semibold","Encabezado 1"],["h2","text-xl font-semibold","Encabezado 2"],["h3","text-lg font-semibold","Encabezado 3"],["h4","text-base font-semibold","Encabezado 4"],["h5","text-sm font-medium","Encabezado 5"],["h6","text-xs font-medium text-muted","Encabezado 6"]].map(([tag, cls, name]) => (
                  <button key={tag} type="button"
                    onMouseDown={e => { e.preventDefault(); exec("formatBlock", `<${tag}>`); setHeadingOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 transition-colors hover:bg-active text-primary whitespace-nowrap ${cls}`}>
                    {name}
                  </button>
                ))}
                <div className="border-t" />
                <button type="button"
                  onMouseDown={e => { e.preventDefault(); exec("formatBlock", "<p>"); setHeadingOpen(false); }}
                  className="w-full text-left px-3 py-1.5 text-sm transition-colors text-secondary hover:bg-active">
                  Párrafo
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        onKeyUp={updateActive}
        onMouseUp={updateActive}
        data-placeholder={placeholder}
        className="min-h-[320px] px-3 py-2 text-sm focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:pointer-events-none text-primary empty:before:text-muted"
      />
    </div>
  );
}
