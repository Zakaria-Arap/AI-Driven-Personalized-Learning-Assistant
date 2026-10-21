// Builds the standalone prototype: the real React screens + the in-browser mock server, as plain files that open by double-click.
import { build } from 'esbuild';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = process.argv[2] ? path.resolve(process.argv[2]) : path.join(here, 'dist');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, 'assets'), { recursive: true });

const swapClient = { name: 'swap-api-client', setup(b) {
  b.onResolve({ filter: /(^|\/)client\.js$/ }, (a) => !a.resolveDir.replace(/\\/g, '/').endsWith('src/api') ? undefined : ({ path: path.join(here, 'mockClient.js') }));
} };

await build({
  entryPoints: [path.join(here, 'main.jsx')], bundle: true, minify: true, format: 'iife', target: 'es2020',
  outfile: path.join(out, 'assets/app.js'), jsx: 'automatic', loader: { '.js': 'jsx', '.png': 'dataurl' },
  define: { 'process.env.NODE_ENV': '"production"' }, plugins: [swapClient], logLevel: 'warning',
  nodePaths: [path.join(here, '../node_modules')],
});
fs.writeFileSync(path.join(out, 'index.html'), `<!doctype html>
<html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="theme-color" content="#17463A" /><title>Somo - Design Prototype</title>
<link href="https://fonts.googleapis.com/css2?family=Gabarito:wght@500;700;800&family=Instrument+Sans:wght@400;500;600&family=DM+Mono&family=Inter:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="assets/app.css" /></head>
<body><div id="root"></div><script src="assets/app.js"></script></body></html>
`);
console.log('prototype built in', out);
