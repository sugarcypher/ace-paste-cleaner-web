#!/usr/bin/env bun

import { build } from 'bun';
import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';

// Clean dist directory
if (existsSync('dist')) {
  rmSync('dist', { recursive: true });
}

// Build CSS with Tailwind
console.log('Building CSS with Tailwind...');
execSync('bunx tailwindcss -i ./src/index.css -o ./dist/main.css --minify', { stdio: 'inherit' });

// Build JavaScript
console.log('Building JavaScript...');
await build({
  entrypoints: ['src/main.tsx'],
  outdir: 'dist',
  target: 'browser',
  minify: true,
  splitting: true,
  sourcemap: 'external',
});

// Copy HTML and assets
console.log('Copying assets...');
execSync('cp index.html dist/', { stdio: 'inherit' });
execSync('cp -r public/* dist/', { stdio: 'inherit' });
execSync('cp CNAME dist/', { stdio: 'inherit' });

// Update HTML to reference built JS file
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
