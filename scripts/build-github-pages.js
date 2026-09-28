import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const rootDir = process.cwd();

console.log('[BuildGHPages] Step 1: Preparing source index.html for Vite compilation...');

// Ensure index.html points to /src/main.tsx for compilation
const devIndexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>JyotishVeda Kundli &amp; Panchang Engine</title>
    <meta name="description" content="Production Vedic astrology platform featuring high-precision Swiss Ephemeris Kundli, divisional vargas, Vimshottari dashas, dosha analysis, Ashtakoota compatibility, and swappable Prokerala Panchang integration." />
    <meta property="og:title" content="JyotishVeda Kundli &amp; Panchang Engine" />
    <meta property="og:description" content="Production Vedic astrology platform featuring high-precision Swiss Ephemeris Kundli, divisional vargas, Vimshottari dashas, dosha analysis, Ashtakoota compatibility, and swappable Prokerala Panchang integration." />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="icon" type="image/svg+xml" href="./favicon.svg" />
    <link rel="icon" href="./favicon.ico" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;

fs.writeFileSync(path.join(rootDir, 'index.html'), devIndexHtml, 'utf8');

console.log('[BuildGHPages] Step 2: Running TypeScript & Vite Build with relative base ./ ...');
execSync('tsc -b && vite build --base=./', { stdio: 'inherit' });

console.log('[BuildGHPages] Step 3: Generating static deploy artifacts for branch main (root and /docs)...');

const distDir = path.join(rootDir, 'dist');
const distAssets = path.join(distDir, 'assets');
const rootAssets = path.join(rootDir, 'assets');
const docsDir = path.join(rootDir, 'docs');
const docsAssets = path.join(docsDir, 'assets');

// Clean and copy assets to root ./assets and ./docs/assets
if (fs.existsSync(rootAssets)) fs.rmSync(rootAssets, { recursive: true, force: true });
if (fs.existsSync(docsAssets)) fs.rmSync(docsAssets, { recursive: true, force: true });

fs.mkdirSync(rootAssets, { recursive: true });
fs.mkdirSync(docsAssets, { recursive: true });

// Copy all assets
fs.cpSync(distAssets, rootAssets, { recursive: true });
fs.cpSync(distAssets, docsAssets, { recursive: true });

// Read compiled dist/index.html (already has relative paths ./assets/...)
let builtHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');

// Ensure favicon.ico and favicon.svg are referenced with relative path
if (!builtHtml.includes('favicon.ico')) {
  builtHtml = builtHtml.replace('</head>', '  <link rel="icon" href="./favicon.ico">\n  <link rel="icon" type="image/svg+xml" href="./favicon.svg">\n</head>');
}

// Write to root ./index.html and ./404.html (for GitHub Pages root deploy)
fs.writeFileSync(path.join(rootDir, 'index.html'), builtHtml, 'utf8');
fs.writeFileSync(path.join(rootDir, '404.html'), builtHtml, 'utf8');

// Write to ./docs/index.html and ./docs/404.html (in case user switches to /docs deploy)
fs.writeFileSync(path.join(docsDir, 'index.html'), builtHtml, 'utf8');
fs.writeFileSync(path.join(docsDir, '404.html'), builtHtml, 'utf8');

// Create .nojekyll in root and docs to prevent GitHub Pages from ignoring files
fs.writeFileSync(path.join(rootDir, '.nojekyll'), '', 'utf8');
fs.writeFileSync(path.join(docsDir, '.nojekyll'), '', 'utf8');

// Copy favicons to docs as well
if (fs.existsSync(path.join(rootDir, 'favicon.ico'))) {
  fs.copyFileSync(path.join(rootDir, 'favicon.ico'), path.join(docsDir, 'favicon.ico'));
}
if (fs.existsSync(path.join(rootDir, 'favicon.svg'))) {
  fs.copyFileSync(path.join(rootDir, 'favicon.svg'), path.join(docsDir, 'favicon.svg'));
}

console.log('[BuildGHPages] Success! Deployed ready-to-run bundle directly to root / and docs/ for GitHub Pages!');
