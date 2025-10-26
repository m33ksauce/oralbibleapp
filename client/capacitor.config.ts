import type { CapacitorConfig } from '@capacitor/cli';
import * as fs from 'fs';
import * as path from 'path';

// Load app configuration
const appConfigPath = path.join(__dirname, 'config', 'app-config.json');
const appConfig = JSON.parse(fs.readFileSync(appConfigPath, 'utf8'));

const config: CapacitorConfig = {
  appId: process.env.APP_ID || appConfig.app.id,
  appName: process.env.APP_NAME || appConfig.app.name,
  webDir: 'www/browser',
  android: {
    buildOptions: {
      releaseType: 'AAB',
      keystorePath: process.env.KEYSTORE_FILE || appConfig.build.keystore.file,
      keystorePassword: process.env.KEYSTORE_PASSWORD || appConfig.build.keystore.password,
      keystoreAlias: process.env.KEYSTORE_ALIAS || appConfig.build.keystore.alias,
      signingType: 'apksigner',
    }
  }
};

// Dynamically set environment variables for Gradle
process.env.KEYSTORE_FILE = config.android.buildOptions.keystorePath;
process.env.KEYSTORE_PASSWORD = config.android.buildOptions.keystorePassword;
process.env.KEYSTORE_ALIAS = config.android.buildOptions.keystoreAlias;

export default config;
