#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OUTER_REPO = path.join(__dirname, '../..');  // Go up from client/scripts to outer repo
const APP_CONFIG = path.join(OUTER_REPO, 'config', 'app-config.json');

console.log('Setting version from git');

try {
  const version = execSync('git describe --tags 2>/dev/null || echo ""', { encoding: 'utf8' }).trim();
  
  if (version) {
    const config = JSON.parse(fs.readFileSync(APP_CONFIG, 'utf8'));
    config.app.version = version;
    fs.writeFileSync(APP_CONFIG, JSON.stringify(config, null, 2));
    console.log('Version set to:', version);
    
    // Update Android config
    execSync('node scripts/update-android-config.js', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
  } else {
    console.log('No git tags found, skipping version update');
  }
} catch (e) {
  console.log('Could not update version (read-only):', e.message);
  process.exit(0);
}

