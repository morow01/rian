#!/usr/bin/env node
/**
 * build-www.js — Copy web assets into www/ for Capacitor.
 *
 * Rian is a single-file PWA (app.html) with a few static assets.
 * This script copies everything Capacitor needs into the www/ directory.
 *
 * Usage:  node scripts/build-www.js
 *         npm run build:www
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const WWW = path.join(ROOT, 'www');

// Ensure www/ exists
if (!fs.existsSync(WWW)) fs.mkdirSync(WWW, { recursive: true });

// Files to copy (source → destination filename)
const files = [
  // Main app — Capacitor expects index.html
  ['app.html', 'index.html'],
  // PWA assets
  ['sw.js', 'sw.js'],
  // Icons
  ['icon-192.png', 'icon-192.png'],
  ['icon-512.png', 'icon-512.png'],
  // Static data (finder, exchanges, codes)
  ['exchanges.json', 'exchanges.json'],
  ['towns.json', 'towns.json'],
  ['codes.json', 'codes.json'],
  ['cabinets.json', 'cabinets.json'],
];

let copied = 0;
let skipped = 0;

for (const [src, dest] of files) {
  const srcPath = path.join(ROOT, src);
  const destPath = path.join(WWW, dest);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    copied++;
  } else {
    console.warn(`  ⚠ Skipped (not found): ${src}`);
    skipped++;
  }
}

// Write www/manifest.json with Capacitor-friendly start_url
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf8'));
manifest.start_url = '/index.html';
fs.writeFileSync(path.join(WWW, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

console.log(`✓ Built www/ — ${copied} files copied${skipped ? `, ${skipped} skipped` : ''}`);
