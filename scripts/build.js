#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths
const ROOT_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const CLIENT_DIR = ROOT_DIR;
const ANDROID_DIR = path.join(ROOT_DIR, 'android');
const BUNDLE_DIR = path.join(ANDROID_DIR, 'app', 'build', 'outputs', 'bundle', 'release');
const CONFIG_DIR = path.join(ROOT_DIR, 'config');
const SCRIPTS_DIR = path.join(__dirname);  // Current directory (client/scripts)
// No longer using md-bundler - using bundle-media.js instead

// Files
const BUNDLE_FILE_RELEASE = path.join(BUNDLE_DIR, 'app-release.aab');
const MAPPING_FILE = path.join(ANDROID_DIR, 'app', 'build', 'outputs', 'mapping', 'release', 'mapping.txt');
const NATIVE_DEBUG_SYMBOLS = path.join(ANDROID_DIR, 'app', 'build', 'outputs', 'native-debug-symbols', 'release', 'native-debug-symbols.zip');
const CONFIG_FILES = [
  path.join(CLIENT_DIR, 'config.xml'),
  path.join(CLIENT_DIR, 'src', 'environments', 'environment.prod.ts')
];
const MEDIA_BUNDLE = path.join(CLIENT_DIR, 'dist', 'media', 'metadata.json'); // Changed from bundle.obd
const INJECT_DIR = path.join(ROOT_DIR, 'inject');
const APP_CONFIG = path.join(CONFIG_DIR, 'app-config.json');

// Helper functions
function loadAppConfig() {
  return JSON.parse(fs.readFileSync(APP_CONFIG, 'utf8'));
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function fileExists(file) {
  return fs.existsSync(file);
}

function runCommand(command, options = {}) {
  const defaultOptions = {
    stdio: 'inherit',
    cwd: options.cwd || ROOT_DIR
  };
  execSync(command, { ...defaultOptions, ...options });
}

// Generate configuration files
function generateConfig() {
  console.log('Generating configuration files...');
  runCommand('node scripts/generate-config.js', { cwd: CLIENT_DIR });
}

// Update Android configuration
function updateAndroid() {
  console.log('Updating Android configuration...');
  runCommand('node scripts/update-android-config.js', { cwd: CLIENT_DIR });
}

// Bundle media files
function bundleMedia() {
  console.log('Bundling media files...');
  runCommand('node scripts/bundle-media.js', { cwd: CLIENT_DIR });
}

// Set version from git tags
function setVersion() {
  console.log('Setting version from git');
  try {
    const version = execSync('git describe --tags 2>/dev/null || echo ""', { encoding: 'utf8' }).trim();
    if (version) {
      const config = loadAppConfig();
      config.app.version = version;
      fs.writeFileSync(APP_CONFIG, JSON.stringify(config, null, 2));
      console.log('Version set to:', version);
      updateAndroid();
    } else {
      console.log('No git tags found, skipping version update');
    }
  } catch (e) {
    console.log('Could not update version (read-only):', e.message);
  }
}

// Setup: generate config, bundle media, update Android, set version
function setup() {
  console.log('Running setup...');
  generateConfig();
  bundleMedia();
  updateAndroid();
  setVersion();
  console.log('Setup complete');
}

// Build web app
function build() {
  console.log('Building web app...');
  setup();
  runCommand('npm run build -- --configuration=production', { cwd: CLIENT_DIR });
  console.log('Web app build complete');
}

// Get keystore configuration
function getKeystoreConfig() {
  const config = loadAppConfig();
  const keystoreFile = config.build.keystore.file;
  const keystorePath = path.isAbsolute(keystoreFile)
    ? keystoreFile
    : path.resolve(ROOT_DIR, keystoreFile);
  
  const rawPassword = config.build.keystore.password;
  const password = rawPassword && rawPassword.includes('${')
    ? (process.env.KEYSTORE_PASSWORD || '')
    : rawPassword;

  return {
    file: fs.existsSync(keystorePath) ? keystorePath : keystoreFile,
    alias: config.build.keystore.alias,
    password
  };
}

// Build Android release (assembleRelease)
function buildAndroidRelease() {
  console.log('Building Android release (mapping file will be generated)...');
  const keystore = getKeystoreConfig();
  
  const env = {
    ...process.env,
    KEYSTORE_FILE: keystore.file,
    KEYSTORE_ALIAS: keystore.alias,
    KEYSTORE_PASSWORD: keystore.password
  };
  
  runCommand('./gradlew assembleRelease', { cwd: ANDROID_DIR, env });
}

// Build Android bundle (bundleRelease)
function buildAndroidBundle() {
  console.log('Building Android release bundle (native debug symbols will be generated)...');
  const keystore = getKeystoreConfig();
  
  const env = {
    ...process.env,
    KEYSTORE_FILE: keystore.file,
    KEYSTORE_ALIAS: keystore.alias,
    KEYSTORE_PASSWORD: keystore.password
  };
  
  runCommand('./gradlew bundleRelease', { cwd: ANDROID_DIR, env });
}

// Package release artifacts
function packageRelease() {
  console.log('Packaging release artifacts...');
  
  // Validate required files exist
  if (!fileExists(BUNDLE_FILE_RELEASE)) {
    console.error(`ERROR: Bundle file not found: ${BUNDLE_FILE_RELEASE}`);
    process.exit(1);
  }
  
  if (!fileExists(MAPPING_FILE)) {
    console.error(`ERROR: Mapping file not found: ${MAPPING_FILE}`);
    console.error('       This file is required for Play Console deobfuscation.');
    process.exit(1);
  }
  
  if (!fileExists(NATIVE_DEBUG_SYMBOLS)) {
    console.error(`ERROR: Native debug symbols not found: ${NATIVE_DEBUG_SYMBOLS}`);
    console.error('       This file is required for Play Console crash analysis.');
    process.exit(1);
  }
  
  // Create dist directory
  ensureDir(DIST_DIR);
  
  // Get translation key
  const config = loadAppConfig();
  const translationKey = config.translation.key;
  
  // Copy files
  const aabDest = path.join(DIST_DIR, `${translationKey}-release.aab`);
  const mappingDest = path.join(DIST_DIR, `${translationKey}-mapping.txt`);
  const symbolsDest = path.join(DIST_DIR, `${translationKey}-native-debug-symbols.zip`);
  
  fs.copyFileSync(BUNDLE_FILE_RELEASE, aabDest);
  fs.copyFileSync(MAPPING_FILE, mappingDest);
  fs.copyFileSync(NATIVE_DEBUG_SYMBOLS, symbolsDest);
  
  console.log(`✓ AAB: ${aabDest}`);
  console.log(`✓ Mapping: ${mappingDest}`);
  console.log(`✓ Debug symbols: ${symbolsDest}`);
  console.log('');
  console.log('All release artifacts ready for Play Console upload');
}

// Main package function: build Android bundle and package artifacts
function package() {
  // Build mapping file first (assembleRelease)
  buildAndroidRelease();
  
  // Build bundle and debug symbols (bundleRelease)
  buildAndroidBundle();
  
  // Package all artifacts
  packageRelease();
}

// Main CLI
const command = process.argv[2];

switch (command) {
  case 'setup':
    setup();
    break;
  case 'build':
    build();
    break;
  case 'package':
    package();
    break;
  default:
    console.error(`Unknown command: ${command}`);
    console.error('Usage: node scripts/build.js [setup|build|package]');
    process.exit(1);
}

