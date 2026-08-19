const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const ignored = new Set(['node_modules', 'coverage']);

function collect(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (ignored.has(entry.name)) return [];
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return collect(target);
    return entry.isFile() && entry.name.endsWith('.js') ? [target] : [];
  });
}

const files = collect(root);
for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  try {
    // Compile with the same wrapper arguments used by CommonJS modules without executing the file.
    // eslint-disable-next-line no-new-func
    new Function('require', 'module', 'exports', '__filename', '__dirname', source);
  } catch (error) {
    error.message = `${path.relative(root, file)}: ${error.message}`;
    throw error;
  }
}
console.log(`Syntax OK: ${files.length} JavaScript files`);
