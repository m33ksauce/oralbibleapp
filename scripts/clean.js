#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');

const filesToRemove = [
  'config.xml',
  'capacitor.config.ts',
  'src/environments/environment.prod.ts',
  'dist/media',
  'android/app/build/outputs/bundle/release/app-release.aab',
  'android/app/build/outputs/mapping/release/mapping.txt',
  'android/app/build/outputs/native-debug-symbols/release/native-debug-symbols.zip',
  'dist'
];

filesToRemove.forEach(file => {
  const fullPath = path.join(ROOT_DIR, file);
  try {
    if (fs.existsSync(fullPath)) {
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`Removed directory: ${file}`);
      } else {
        fs.unlinkSync(fullPath);
        console.log(`Removed file: ${file}`);
      }
    }
  } catch (e) {
    // Ignore errors (file might not exist or be locked)
  }
});

console.log('Clean complete');

