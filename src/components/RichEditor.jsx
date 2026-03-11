import { useState, useRef, useCallback } from "react";
import { sanitizeHtml } from "../utils";

export default function RichEditor({ onChange, placeholder, dark }) {
  const ref = useRef(null);
  const [active, setActive] = useState({});
  const [headingOpen, setHeadingOpen] = useState(false);

  const exec = useCallback((cmd, val) => {
    ref.current.focus();
    document.execCommand(cmd, false, val ?? null);
    ref.current.focus();
    updateActive();
  }, []);

  const updateActive = () => {
    setActive({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      ul: document.queryCommandState("insertUnorderedList"),
      ol: document.queryCommandState("insertOrderedList"),
    });
  };

  const handleInput = () => {
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
      className={`w-7 h-7 flex items-center justify-center rounded text-sm font-medium transition-colors ${
        active[cmd === "insertUnorderedList" ? "ul" : cmd === "insertOrderedList" ? "ol" : cmd]
          ? "bg-green-100 text-green-700"
          : dark ? "text-gray-400 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100"
      }`}>
      {label}
    </button>
  );

  const divider = <div className={`w-px h-4 mx-1 ${dark ? "bg-gray-600" : "bg-gray-300"}`} />;

  return (
    <div className={`rounded-lg focus-within:ring-2 focus-within:ring-green-400 ${dark ? "border border-gray-700 bg-gray-800" : "border border-gray-300 bg-white"}`}>
      <div className={`flex items-center gap-0.5 px-2 py-1 border-b rounded-t-lg ${dark ? "border-gray-700 bg-gray-850" : "border-gray-200 bg-gray-50"}`}>
        {btn("bold",   <strong>B</strong>, "Negrita")}
        {btn("italic", <em>I</em>,         "Cursiva")}
        {divider}
        {btn("insertUnorderedList",
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>,
          "Lista con viñetas")}
        {btn("insertOrderedList",
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h10M7 16h10M3 8h.01M3 12h.01M3 16h.01"/></svg>,
          "Lista numerada")}
        {divider}
        <div className="relative">
          <button type="button"
            onMouseDown={e => { e.preventDefault(); setHeadingOpen(o => !o); }}
            className={`h-7 px-2 flex items-center gap-1 rounded text-xs font-bold transition-colors ${dark ? "text-gray-400 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100"}`}>
            H
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
          </button>
          {headingOpen && (
            <>
              <div className="fixed inset-0 z-10" onMouseDown={() => setHeadingOpen(false)} />
              <div className={`absolute left-0 top-full mt-1 z-20 rounded-lg shadow-lg border overflow-hidden min-w-[110px] ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                <button type="button"
                  onMouseDown={e => { e.preventDefault(); exec("formatBlock", "<h3>"); setHeadingOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm font-bold transition-colors ${dark ? "text-gray-100 hover:bg-gray-700" : "text-gray-800 hover:bg-gray-50"}`}>
                  Título
                </button>
                <button type="button"
                  onMouseDown={e => { e.preventDefault(); exec("formatBlock", "<h4>"); setHeadingOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm font-semibold transition-colors ${dark ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-50"}`}>
                  Subtítulo
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
        className={`min-h-[88px] px-3 py-2 text-sm focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:pointer-events-none ${dark ? "text-gray-200 empty:before:text-gray-500" : "text-gray-900 empty:before:text-gray-400"}`}
      />
    </div>
  );
}
