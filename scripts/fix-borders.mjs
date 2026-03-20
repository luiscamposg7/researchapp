import fs from 'fs';
const file = 'src/App.jsx';
let code = fs.readFileSync(file, 'utf8');

// Restore broken border-b and border-t (script incorrectly stripped "border" prefix)
// Pattern: " -b " or " -t " that should be "border-b" or "border-t"
// Case 1: " -b border" → "border-b" (the trailing 'border' was original, -b was border-b)
code = code.replace(/ -b border(?!-)/g, ' border-b');
code = code.replace(/ -t border(?!-)/g, ' border-t');

// Case 2: " -b border-subtle" → "border-b border-subtle"
code = code.replace(/ -b (border-\w+)/g, ' border-b $1');
code = code.replace(/ -t (border-\w+)/g, ' border-t $1');

// Case 3: remaining " -b " or " -t " at end of string
code = code.replace(/ -b"/g, ' border-b"');
code = code.replace(/ -t"/g, ' border-t"');

// Also fix at start of className value
code = code.replace(/="-b /g, '="border-b ');
code = code.replace(/="-t /g, '="border-t ');

fs.writeFileSync(file, code);
const remaining = (code.match(/ -[bt][ "]/g) || []).length;
console.log(`Remaining broken: ${remaining}`);
