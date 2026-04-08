#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load app configuration from outer repo
const OUTER_REPO = path.join(__dirname, '../..');  // Go up from client/scripts to outer repo
const appConfigPath = path.join(OUTER_REPO, 'config', 'app-config.json');
const appConfig = JSON.parse(fs.readFileSync(appConfigPath, 'utf8'));

// Generate environment.prod.ts
const environmentTemplate = `export const environment = {
    appName: "${appConfig.app.name}",
    production: true,
    backend: {
      releaseEndpoint: "${appConfig.translation.backend.releaseEndpoint}",
      audioEndpoint: "${appConfig.translation.backend.audioEndpoint}",
    },
    features: {
      dynamicContent: ${appConfig.features.dynamicContent},
      bluetoothUpdate: ${appConfig.features.bluetoothUpdate},
      mediaCanCollapseWhenPlaying: ${appConfig.features.mediaCanCollapseWhenPlaying},
    }
  };`;

// Write environment file (in client/src/environments/)
const CLIENT_DIR = path.join(__dirname, '..');  // client/ (parent of scripts/, now IS the code)
const envPath = path.join(CLIENT_DIR, 'src', 'environments', 'environment.prod.ts');
fs.writeFileSync(envPath, environmentTemplate);

console.log('Configuration files generated successfully');

