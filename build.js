#!/usr/bin/env bun

import { build } from 'bun';
import { execSync } from 'child_process';
import { existsSync, rmSync, readFileSync, writeFileSync } from 'fs';

// Clean dist directory
if (existsSync('dist')) {
  rmSync('dist', { recursive: true });
}

// Build CSS with Tailwind (prefer Node npx for best compatibility)
console.log('Building CSS with Tailwind...');
let cssBuilt = false;
// 1) Try postcss CLI with explicit plugins (most stable across runtimes)
try {
  execSync('bunx postcss ./src/index.css -o ./dist/main.css --no-map -u tailwindcss@3.4.17 autoprefixer', { stdio: 'inherit' });
  cssBuilt = true;
} catch {}
// 2) Try npx tailwindcss if Node/npm exists
if (!cssBuilt) {
  try {
    execSync('npx -y tailwindcss@3.4.17 -i ./src/index.css -o ./dist/main.css --minify', { stdio: 'inherit' });
    cssBuilt = true;
  } catch {}
}
// 3) Fallback to bunx tailwindcss
if (!cssBuilt) {
  console.warn('postcss and npx paths failed, falling back to bunx tailwindcss...');
  execSync('bunx tailwindcss@3.4.17 -i ./src/index.css -o ./dist/main.css --minify', { stdio: 'inherit' });
}

// Build JavaScript
console.log('Building JavaScript...');
await build({
  entrypoints: ['src/main.tsx'],
  outdir: 'dist',
  target: 'browser',
  minify: {
    whitespace: true,
    identifiers: true,
    syntax: true,
  },
  splitting: false, // Disable splitting to reduce complexity
  sourcemap: false, // Disable sourcemaps to reduce CodeQL noise
  format: 'esm',
  treeShaking: true, // Enable aggressive tree shaking
  drop: ['console', 'debugger'], // Remove console logs and debugger statements
  define: {
    'process.env.NODE_ENV': '"production"',
    'global': 'globalThis',
  },
  external: [], // Bundle everything to avoid external references
  bundle: true,
});

// Create production index.html that points to built assets
console.log('Generating production index.html...');
const rawHtml = readFileSync('index.html', 'utf8');
// Prefer relative URLs so it works on custom domains and subpaths
let prodHtml = rawHtml
  .replace('/src/main.tsx', './main.js')
  .replace('src="/src/main.tsx"', 'src="./main.js"')
  // ensure favicon and other asset hrefs are relative
  .replaceAll('href="/', 'href="./');
if (!/href="\.\/main\.css"/.test(prodHtml)) {
  prodHtml = prodHtml.replace('</head>', '    <link rel="stylesheet" href="./main.css">\n  </head>');
}
writeFileSync('dist/index.html', prodHtml, 'utf8');

// Copy static assets
console.log('Copying assets...');
execSync('cp -r public/* dist/', { stdio: 'inherit' });
execSync('cp CNAME dist/', { stdio: 'inherit' });

console.log('✅ Build complete!');
console.log('Updating HTML references...');
const fs = await import('fs');
const htmlPath = 'dist/index.html';
let htmlContent = fs.readFileSync(htmlPath, 'utf8');
htmlContent = htmlContent.replace(
  '<script type="module" src="/src/main.tsx"></script>',
  '<script type="module" src="/main.js"></script>'
);
fs.writeFileSync(htmlPath, htmlContent);

console.log('✅ Build complete!');
