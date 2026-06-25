#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const OUTER_REPO = path.join(__dirname, '../..');
const CLIENT_DIR = path.join(__dirname, '..');
const appConfigPath = path.join(OUTER_REPO, 'config', 'app-config.json');
const appConfig = JSON.parse(fs.readFileSync(appConfigPath, 'utf8'));

function escapeTsString(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

const environmentTemplate = `export const environment = {
    appName: "${escapeTsString(appConfig.app.name)}",
    production: true,
    backend: {
      releaseEndpoint: "${escapeTsString(appConfig.translation.backend.releaseEndpoint)}",
      audioEndpoint: "${escapeTsString(appConfig.translation.backend.audioEndpoint)}",
    },
    features: {
      dynamicContent: ${appConfig.features.dynamicContent},
      bluetoothUpdate: ${appConfig.features.bluetoothUpdate},
      mediaCanCollapseWhenPlaying: ${appConfig.features.mediaCanCollapseWhenPlaying},
    }
  };`;

const envPath = path.join(CLIENT_DIR, 'src', 'environments', 'environment.prod.ts');
fs.writeFileSync(envPath, environmentTemplate);

console.log('Configuration files generated successfully');
