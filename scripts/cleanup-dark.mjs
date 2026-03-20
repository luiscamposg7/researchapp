import fs from 'fs';
const file = 'src/App.jsx';
let code = fs.readFileSync(file, 'utf8');
let count = 0;

function r(from, to) {
  const before = code;
  code = code.split(from).join(to);
  if (code !== before) count++;
}

// ─── s objects (SearchPage + Sidebar) ───────────────────────────────────────
r(`dk ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"`,  `"bg-surface border"`);
r(`dk ? "text-gray-100" : "text-gray-900"`,  `"text-primary"`);
r(`dk ? "text-gray-400" : "text-gray-500"`,  `"text-tertiary"`);
r(`dk ? "bg-gray-800" : "bg-gray-100"`,      `"bg-muted"`);
r(`dk ? "border-gray-800" : "border-gray-100"`, `"border-subtle"`);
r(`dk ? "text-gray-600" : "text-gray-400"`,  `"text-muted"`);
r(`dk ? "text-gray-400 hover:bg-gray-800 hover:text-gray-200" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"`,
  `"text-tertiary hover:bg-hover hover:text-primary"`);
r(`dk ? "hover:bg-gray-800" : "hover:bg-gray-50"`, `"hover:bg-hover"`);
r(`dk ? "text-gray-500 hover:text-gray-300 hover:bg-gray-800" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"`,
  `"text-muted hover:text-secondary hover:bg-hover"`);
r(`dk ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"`, `"bg-muted border"`);

// ─── Toast ───────────────────────────────────────────────────────────────────
r(`"bg-white border-gray-200 text-gray-800"`, `"bg-surface border text-primary"`);
r(`'bg-white border-gray-200 text-gray-800'`, `'bg-surface border text-primary'`);

// ─── Dual static border classes (artifact from merge) ────────────────────────
// These appear as static strings with both dark and light border class
r(` border-gray-700 border-gray-200`,  ` border`);
r(` border-gray-800 border-gray-200`,  ` border`);
r(` border-gray-800 border-gray-100`,  ` border-subtle`);
r(` border-gray-700 border-gray-100`,  ` border`);
r(` border-gray-700 text-gray-200`,    ` text-primary`);
r(` border-gray-300 text-gray-900`,    ` text-primary`);
// dual text color artifacts
r(` text-gray-200 placeholder-gray-500 border-gray-300 text-gray-900 placeholder-gray-400`,
  ` text-primary placeholder:text-muted`);
r(` border-gray-700 text-gray-200 placeholder-gray-500 border-gray-200 text-gray-900 placeholder-gray-400`,
  ` text-primary placeholder:text-muted`);
r(` border-gray-700 text-gray-100 placeholder-gray-500 border-gray-300 text-gray-900 placeholder-gray-400`,
  ` text-primary placeholder:text-muted`);

// ─── inp const ───────────────────────────────────────────────────────────────
// Clean up any remaining dual classes in inp-like strings
r(`bg-surface border-gray-700 text-gray-200 placeholder-gray-500 border-gray-300 text-gray-900 placeholder-gray-400`,
  `bg-surface text-primary placeholder:text-muted`);

// ─── Remaining inline dk ternaries (not covered by tokenize.mjs) ─────────────
r(`\${dk ? "bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"}`,
  `bg-surface text-primary placeholder:text-muted`);
r(`\${dk ? "bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"}`,
  `bg-surface text-primary placeholder:text-muted`);
r(`\${d ? "text-gray-300" : "text-gray-700"}`,  `text-secondary`);
r(`\${d ? "text-gray-400 hover:text-gray-200" : "border-transparent text-gray-500 hover:text-gray-800"}`,
  `text-tertiary hover:text-primary`);
r(`\${d ? "border-gray-600" : "border-gray-200"}`, `border`);

// ─── Copy link button artifacts ───────────────────────────────────────────────
r(` bg-surface border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-gray-200 border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700`,
  ` bg-surface text-tertiary hover:bg-hover hover:text-secondary`);

// ─── search kb hint button (active/inactive states) ──────────────────────────
// keep as-is for now, still uses d? (intentional)

fs.writeFileSync(file, code);
console.log(`Applied ${count} replacements`);
const remaining = (code.match(/\$\{d[k]? \?/g) || []).length;
console.log(`Remaining dk? patterns: ${remaining}`);
