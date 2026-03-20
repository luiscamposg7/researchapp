import fs from 'fs';
const file = 'src/App.jsx';
let code = fs.readFileSync(file, 'utf8');

// Deduplicate tokens in a class string
function dedup(cls) {
  const tokens = cls.split(/\s+/);
  const seen = new Set();
  return tokens.filter(t => {
    if (t === '') return false;
    if (seen.has(t)) return false;
    seen.add(t);
    return true;
  }).join(' ');
}

let count = 0;

// Match className="..." and className={`...`} (no interpolation)
code = code.replace(/className=(?:"([^"$]*)"|`([^`$]*)`|\{`([^`$]*)`\})/g, (match, q, bt, btb) => {
  const raw = q ?? bt ?? btb;
  const cleaned = dedup(raw);
  if (cleaned === raw) return match;
  count++;
  if (q !== undefined) return `className="${cleaned}"`;
  if (btb !== undefined) return `className={\`${cleaned}\`}`;
  return `className=\`${cleaned}\``;
});

// Fix "border-t border" separator -> just "border-t"
code = code.replace(/\bborder-t border(?!-)/g, 'border-t');

// Fix "border-2 border-dashed ... border" trailing border
code = code.replace(/\bborder-2 border-dashed ([^"]*?) border(?=["` ])/g, 'border-2 border-dashed $1');

fs.writeFileSync(file, code);
console.log(`Deduped ${count} classNames`);

// Verify
const remaining = (code.match(/ border border/g) || []).length;
console.log(`Remaining " border border" patterns: ${remaining}`);
