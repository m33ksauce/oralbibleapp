#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OUTER_REPO = path.join(__dirname, '../..');  // Go up from client/scripts to outer repo
const APP_CONFIG = path.join(OUTER_REPO, 'config', 'app-config.json');

console.log('Incrementing versionCode');

const config = JSON.parse(fs.readFileSync(APP_CONFIG, 'utf8'));
config.app.versionCode++;
fs.writeFileSync(APP_CONFIG, JSON.stringify(config, null, 2));
console.log('New versionCode:', config.app.versionCode);

// Update Android config
execSync('node scripts/update-android-config.js', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });

