import type { CapacitorConfig } from '@capacitor/cli';
import * as path from 'path';

const config: CapacitorConfig = {
  appId: 'com.oralbibleapp.yetfa',
  appName: 'Awa Ma Oral Bible',
  webDir: 'www/browser',
  android: {
    buildOptions: {
      releaseType: 'AAB',
      keystorePath: process.env.KEYSTORE_FILE || path.resolve(__dirname, 'crypto/release/oba-yetfa.keystore'),
      keystorePassword: process.env.KEYSTORE_PASSWORD || 'H0w Sh@ll Th3y H3@r?',
      keystoreAlias: process.env.KEYSTORE_ALIAS || 'oba-yetfa',
      signingType: 'apksigner',
    }
  }
};

// Dynamically set environment variables for Gradle
process.env.KEYSTORE_FILE = config.android.buildOptions.keystorePath;
process.env.KEYSTORE_PASSWORD = config.android.buildOptions.keystorePassword;
process.env.KEYSTORE_ALIAS = config.android.buildOptions.keystoreAlias;

export default config;
