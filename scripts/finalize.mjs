import fs from 'fs';
const file = 'src/App.jsx';
let code = fs.readFileSync(file, 'utf8');

// Remaining gray hover patterns
code = code
  .replace(/\$\{d \? "hover:text-gray-300" : "hover:text-gray-600"\}/g, 'hover:text-secondary')
  .replace(/\$\{d \? "hover:text-gray-200" : "hover:text-gray-800"\}/g, 'hover:text-primary')
  // group-hover green — normalize to single class (dark-mode handles it via CSS vars)
  .replace(/\$\{d \? "group-hover:text-green-600" : "group-hover:text-green-700"\}/g, 'group-hover:text-green-600')
  // brand green text with hover — replace with CSS var references
  .replace(/\$\{d \? "text-green-400 hover:text-green-300" : "text-green-600 hover:text-green-700"\}/g,
    'text-[var(--color-brand)] hover:text-[var(--color-brand-hover)]')
  // Drive file link: partial tokenization
  .replace(/\$\{d \? "border-gray-600 text-green-400 hover:bg-gray-700" : "border-gray-200 text-green-600 hover:bg-gray-50"\}/g,
    `border-strong hover:bg-hover \${d ? "text-green-400" : "text-green-600"}`);

// Clean pure-template classNames
code = code.replace(/className=\{`([^`]*)`\}/g, (match, content) => {
  if (!content.includes('${')) {
    const trimmed = content.replace(/\s+/g, ' ').trim();
    return `className="${trimmed}"`;
  }
  return match;
});

fs.writeFileSync(file, code);
const remaining = (code.match(/\$\{d \?/g) || []).length;
console.log('Remaining d? patterns:', remaining);
