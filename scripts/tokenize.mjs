import fs from 'fs';

const file = '/Users/luiscg/researchapp/src/App.jsx';
let code = fs.readFileSync(file, 'utf8');

// Map: [darkClass, lightClass] -> token
const classMap = [
  // backgrounds (dark first, light second)
  ['bg-gray-950', 'bg-gray-50',  'bg-page'],
  ['bg-gray-950', 'bg-white',    'bg-surface'],
  ['bg-gray-900', 'bg-white',    'bg-surface'],
  ['bg-gray-900', 'bg-gray-50',  'bg-surface'],
  ['bg-gray-800', 'bg-white',    'bg-surface'],
  ['bg-gray-800', 'bg-gray-50',  'bg-muted'],
  ['bg-gray-800', 'bg-gray-100', 'bg-muted'],
  ['bg-gray-800', 'bg-gray-200', 'bg-active'],
  ['bg-gray-700', 'bg-gray-100', 'bg-active'],
  ['bg-gray-700', 'bg-gray-200', 'bg-active'],
  // hover bg
  ['hover:bg-gray-800', 'hover:bg-gray-50',  'hover:bg-hover'],
  ['hover:bg-gray-800', 'hover:bg-gray-100', 'hover:bg-hover'],
  ['hover:bg-gray-700', 'hover:bg-gray-100', 'hover:bg-active'],
  // text (dark first, light second)
  ['text-gray-100', 'text-gray-900', 'text-primary'],
  ['text-gray-100', 'text-gray-800', 'text-primary'],
  ['text-gray-200', 'text-gray-800', 'text-primary'],
  ['text-gray-200', 'text-gray-900', 'text-primary'],
  ['text-gray-300', 'text-gray-700', 'text-secondary'],
  ['text-gray-300', 'text-gray-600', 'text-secondary'],
  ['text-gray-400', 'text-gray-500', 'text-tertiary'],
  ['text-gray-400', 'text-gray-600', 'text-tertiary'],
  ['text-gray-500', 'text-gray-400', 'text-muted'],
  ['text-gray-500', 'text-gray-500', 'text-tertiary'],
  ['text-gray-600', 'text-gray-400', 'text-muted'],
  // subtle/dim decorative elements
  ['text-gray-700', 'text-gray-300', 'text-muted'],
  ['text-gray-600', 'text-gray-300', 'text-muted'],
  // hover text
  ['hover:text-gray-300', 'hover:text-gray-700', 'hover:text-secondary'],
  ['hover:text-gray-200', 'hover:text-gray-800', 'hover:text-primary'],
  ['hover:text-gray-200', 'hover:text-gray-900', 'hover:text-primary'],
  ['hover:text-gray-200', 'hover:text-gray-700', 'hover:text-secondary'],
  ['hover:text-gray-400', 'hover:text-gray-600', 'hover:text-tertiary'],
  // group-hover text
  ['group-hover:text-gray-300', 'group-hover:text-gray-700', 'group-hover:text-secondary'],
  // borders
  ['border-gray-700', 'border-gray-200', 'border'],
  ['border-gray-700', 'border-gray-100', 'border'],
  ['border-gray-800', 'border-gray-200', 'border'],
  ['border-gray-800', 'border-gray-100', 'border-subtle'],
  ['border-gray-600', 'border-gray-300', 'border-strong'],
  // ring
  ['ring-gray-700', 'ring-gray-200', 'ring'],
  ['ring-gray-700', 'ring-gray-300', 'ring-strong'],
];

const lookup = new Map();
for (const [d, l, t] of classMap) {
  lookup.set(`${d}|${l}`, t);
}

function mapClass(darkCls, lightCls) {
  return lookup.get(`${darkCls}|${lightCls}`) || null;
}

function replaceTernary(darkStr, lightStr) {
  const darkClasses = darkStr.trim().split(/\s+/).filter(Boolean);
  const lightClasses = lightStr.trim().split(/\s+/).filter(Boolean);

  const tokens = [];
  const unmappedDark = [];
  const lightUsed = new Set();

  for (const dc of darkClasses) {
    let mapped = false;
    for (const lc of lightClasses) {
      if (lightUsed.has(lc)) continue;
      const token = mapClass(dc, lc);
      if (token) {
        tokens.push(token);
        lightUsed.add(lc);
        mapped = true;
        break;
      }
    }
    if (!mapped) unmappedDark.push(dc);
  }

  const unmappedLight = lightClasses.filter(lc => !lightUsed.has(lc));

  let result = tokens.join(' ');

  if (unmappedDark.length > 0 || unmappedLight.length > 0) {
    const remainDark = unmappedDark.join(' ');
    const remainLight = unmappedLight.join(' ');
    if (remainDark === remainLight && remainDark) {
      result = result ? `${result} ${remainDark}` : remainDark;
    } else if (remainDark && remainLight) {
      const ternary = `\${d ? "${remainDark}" : "${remainLight}"}`;
      result = result ? `${result} ${ternary}` : ternary;
    } else if (remainDark) {
      const ternary = `\${d ? "${remainDark}" : ""}`;
      result = result ? `${result} ${ternary}` : ternary;
    } else if (remainLight) {
      const ternary = `\${d ? "" : "${remainLight}"}`;
      result = result ? `${result} ${ternary}` : ternary;
    }
  }

  return result || null;
}

// Replace ${d ? "..." : "..."} patterns
const ternaryRegex = /\$\{d \? "([^"]*)" : "([^"]*)"\}/g;

let replaced = 0;
code = code.replace(ternaryRegex, (match, dark, light) => {
  const result = replaceTernary(dark, light);
  if (result !== null && result !== match) {
    replaced++;
    return result;
  }
  return match;
});

// Convert pure template literals (no ${...}) to plain strings
const backtickRegex = /className=\{`([^`]*)`\}/g;
let cleaned = 0;
code = code.replace(backtickRegex, (match, content) => {
  if (!content.includes('${')) {
    cleaned++;
    const trimmed = content.replace(/\s+/g, ' ').trim();
    return `className="${trimmed}"`;
  }
  return match;
});

fs.writeFileSync(file, code);
console.log(`Replaced ${replaced} ternaries, cleaned ${cleaned} template literals`);
const remaining = (code.match(/\$\{d \?/g) || []).length;
console.log(`Remaining \${d ? patterns: ${remaining}`);
