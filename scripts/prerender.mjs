// prerender.mjs — runs after `vite build`.
// Serves dist/, opens every route in headless Chromium, and saves the
// rendered HTML as dist/<route>/index.html. GitHub Pages then answers each
// page with a real 200 response and readable content, instead of an empty
// <div id="root"> behind a 404 redirect. React re-renders over it on load.
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { chromium } from 'playwright';

const DIST = new URL('../dist/', import.meta.url).pathname;
const ROUTES = ['/', '/media', '/projects', '/research', '/people', '/participate', '/contact', '/cv'];
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.json': 'application/json', '.woff2': 'font/woff2' };

const shell = await readFile(join(DIST, 'index.html'), 'utf8');
const server = createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  try {
    const file = join(DIST, path);
    if ((await stat(file)).isFile()) {
      res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
      return res.end(await readFile(file));
    }
  } catch {}
  res.writeHead(200, { 'content-type': 'text/html' });
  res.end(shell); // SPA fallback
});
await new Promise((r) => server.listen(4319, r));

const browser = await chromium.launch();
const page = await browser.newPage();
let failed = 0;
for (const route of ROUTES) {
  try {
    await page.goto(`http://localhost:4319${route}`, { waitUntil: 'networkidle', timeout: 30000 });
  } catch {
    await page.waitForTimeout(3000); // embeds can keep the network busy; take what rendered
  }
  const text = await page.evaluate(() => document.getElementById('root')?.innerText.trim().length ?? 0);
  if (text < 100) { console.error(`prerender: ${route} rendered almost nothing; skipped`); failed++; continue; }
  // Drop iframes (game embeds, video players) from the static copy; React restores them on load.
  const html = '<!DOCTYPE html>\n' + (await page.evaluate(() => {
    const doc = document.documentElement.cloneNode(true);
    doc.querySelectorAll('#root iframe').forEach((f) => f.remove());
    return doc.outerHTML;
  }));
  const outDir = route === '/' ? DIST : join(DIST, route);
  await mkdir(outDir, { recursive: true });
  await writeFile(join(outDir, 'index.html'), html);
  console.log(`prerender: ${route} (${text} chars)`);
}
await browser.close();
server.close();
if (failed) process.exitCode = 1;
