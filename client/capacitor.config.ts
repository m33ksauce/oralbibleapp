import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: process.env.APP_ID || 'com.oralbibleapp.yetfa2',
  appName: process.env.APP_NAME || 'Awa Ma Oral Bible',
  webDir: 'www/browser',
  android: {
    buildOptions: {
      releaseType: 'AAB',
      keystorePath: process.env.KEYSTORE_FILE,
      keystorePassword: process.env.KEYSTORE_PASSWORD,
      keystoreAlias: process.env.KEYSTORE_ALIAS,
      signingType: 'apksigner',
    }
  }
};

// Dynamically set environment variables for Gradle
process.env.KEYSTORE_FILE = config.android.buildOptions.keystorePath;
process.env.KEYSTORE_PASSWORD = config.android.buildOptions.keystorePassword;
process.env.KEYSTORE_ALIAS = config.android.buildOptions.keystoreAlias;

export default config;
