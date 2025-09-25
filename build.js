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

console.log('✅ Build complete!');
