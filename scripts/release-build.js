#!/usr/bin/env node
/**
 * Multi-project release build via npm scripts (Capacitor + file-based media).
 * All paths are relative to repo root (directory containing package.json).
 *
 * Commands:
 *   bundle <key>     Generate metadata and copy media files for one translation
 *   prep <key>       Generate environment.prod.ts from app-config.json
 *   package <key>    Run Gradle bundleRelease and copy AAB to dist/<key>.prod.aab
 *   build <key>      bundle → prep → Angular build → cap sync → updateAndroid → package
 *   build-all        build for every translation key
 *   clean            Remove dist/media contents, environment.prod.ts, default AAB
 *   clean-all        clean + remove dist/
 *   set-version      Set version from VERSION/VERSION_CODE env (or git describe)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const OUTER_REPO = path.join(ROOT, '..');
const BM_OBA_MEDIA = path.join(OUTER_REPO, 'oba-media');
const DIST_MEDIA = path.join(ROOT, 'dist', 'media');
const ENV_DIR = path.join(ROOT, 'src', 'environments');
const ANDROID_DIR = path.join(OUTER_REPO, 'android');
const BUNDLE_DEFAULT = path.join(ANDROID_DIR, 'app', 'build', 'outputs', 'bundle', 'release', 'app-release.aab');

const TRANSLATION_KEYS = [
  'yetfa', 'papuan_malay', 'tangko', 'kimki', 'dou',
  'fayu', 'sikari', 'walak', 'abawiri', 'meyah',
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function run(cmd, opts = {}) {
  execSync(cmd, { stdio: 'inherit', cwd: opts.cwd || ROOT, ...opts });
}

/** Resolve key to folder name under oba-media (<key>/config/, <key>/content/). */
function resolveObaKey(key) {
  const base = path.join(BM_OBA_MEDIA, key, 'config');
  const alt = path.join(BM_OBA_MEDIA, key.replace(/_/g, '-'), 'config');
  if (fs.existsSync(base)) return key;
  if (fs.existsSync(alt)) return key.replace(/_/g, '-');
  return null;
}

/** Find content directory for a translation key in oba-media. */
function resolveContentDir(key) {
  if (!fs.existsSync(BM_OBA_MEDIA)) {
    console.error(`ERROR: oba-media not found at ${BM_OBA_MEDIA}`);
    process.exit(1);
  }
  const obaKey = resolveObaKey(key);
  if (!obaKey) {
    console.error(`ERROR: No config found for ${key} in ${BM_OBA_MEDIA}/${key}/config/`);
    process.exit(1);
  }
  const contentDir = path.join(BM_OBA_MEDIA, obaKey, 'content');
  if (!fs.existsSync(contentDir)) {
    console.error(`ERROR: Content directory not found: ${contentDir}`);
    process.exit(1);
  }
  return contentDir;
}

/**
 * Generate metadata from the key's content dir, then bundle media into dist/media/.
 * Uses generate-metadata.js and bundle-media.js with explicit paths.
 */
function bundle(key) {
  const contentDir = resolveContentDir(key);
  const audioDir = path.join(contentDir, 'audio');

  // Clean previous media to avoid cross-contamination between builds
  if (fs.existsSync(DIST_MEDIA)) {
    fs.rmSync(DIST_MEDIA, { recursive: true, force: true });
  }

  // Create a temporary staging directory for this key's metadata
  const stagingDir = path.join(ROOT, 'dist', 'staging', key);
  const metadataDir = path.join(stagingDir, 'metadata');
  const metadataFile = path.join(metadataDir, 'metadata.json');
  ensureDir(metadataDir);

  const authoredMetadata = [
    path.join(contentDir, 'metadata', 'metadata.json'),
    path.join(contentDir, 'metadata.json'),
  ].find((p) => fs.existsSync(p));

  if (authoredMetadata) {
    console.log(`Using authored metadata for ${key}...`);
    fs.copyFileSync(authoredMetadata, metadataFile);
  } else {
    console.log(`Generating metadata for ${key}...`);
    run(`node scripts/generate-metadata.js --audio "${audioDir}" --output "${metadataFile}"`);
  }

  // Bundle media: copy audio files + metadata into dist/media/
  // The bundle-media input dir needs metadata/metadata.json and audio files relative to it.
  // Create a symlink so the staging dir has the audio files accessible.
  const stagingAudioLink = path.join(stagingDir, 'audio');
  if (!fs.existsSync(stagingAudioLink)) {
    fs.symlinkSync(audioDir, stagingAudioLink, 'dir');
  }

  try {
    console.log(`Bundling media for ${key}...`);
    run(`node scripts/bundle-media.js --input "${stagingDir}" --output "${DIST_MEDIA}"`);
    console.log(`✓ Bundled ${key} → ${DIST_MEDIA}`);
  } finally {
    // Clean up staging even if bundling fails
    fs.rmSync(path.join(ROOT, 'dist', 'staging'), { recursive: true, force: true });
  }
}

/** Generate environment.prod.ts from the current app-config.json. */
function prep(key) {
  console.log(`Generating environment.prod.ts for ${key}...`);
  run('node scripts/generate-config.js');
  console.log(`✓ Prep ${key}: environment.prod.ts`);
}

/** Angular production build + Capacitor sync. */
function buildAndSync() {
  console.log('Running Angular production build...');
  run('npm run build -- --configuration=production');
  console.log('Syncing Capacitor Android platform...');
  run('npx cap sync android');
}

/** Load per-language project.json into the shared app-config.json. */
function loadProjectConfig(key) {
  const obaKey = resolveObaKey(key);
  const projectConfig = path.join(BM_OBA_MEDIA, obaKey, 'config', 'project.json');
  const appConfigDest = path.join(OUTER_REPO, 'config', 'app-config.json');
  if (!fs.existsSync(projectConfig)) {
    console.error(`ERROR: project.json not found for ${key} at ${projectConfig}`);
    process.exit(1);
  }
  ensureDir(path.dirname(appConfigDest));
  fs.copyFileSync(projectConfig, appConfigDest);
  const config = JSON.parse(fs.readFileSync(appConfigDest, 'utf8'));
  console.log(`✓ Loaded config for ${key}: ${config.app.id}`);
}

function getKeystoreEnv() {
  const appConfigPath = path.join(OUTER_REPO, 'config', 'app-config.json');
  const appConfig = JSON.parse(fs.readFileSync(appConfigPath, 'utf8'));
  const keystoreFile = appConfig.build.keystore.file;
  const keystorePath = path.isAbsolute(keystoreFile)
    ? keystoreFile
    : path.resolve(ROOT, keystoreFile);
  const rawPassword = appConfig.build.keystore.password;
  const password = rawPassword && rawPassword.includes('${')
    ? (process.env.KEYSTORE_PASSWORD || '')
    : rawPassword;
  return {
    ...process.env,
    KEYSTORE_FILE: fs.existsSync(keystorePath) ? keystorePath : keystoreFile,
    KEYSTORE_ALIAS: appConfig.build.keystore.alias,
    KEYSTORE_PASSWORD: password,
  };
}

/** Update Android config (app id, version, etc.) */
function updateAndroid() {
  console.log('Updating Android configuration...');
  run('node scripts/update-android-config.js');
}

/** Run Gradle bundleRelease and copy AAB to dist/<key>.prod.aab */
function packageKey(key) {
  if (!fs.existsSync(ANDROID_DIR)) {
    console.error(`ERROR: ${ANDROID_DIR} not found. Run cap sync first.`);
    process.exit(1);
  }
  run('./gradlew assembleRelease && ./gradlew bundleRelease', { cwd: ANDROID_DIR, env: getKeystoreEnv() });
  const aabDest = path.join(ROOT, 'dist', `${key}.prod.aab`);
  ensureDir(path.join(ROOT, 'dist'));
  if (fs.existsSync(BUNDLE_DEFAULT)) {
    fs.copyFileSync(BUNDLE_DEFAULT, aabDest);
    console.log(`✓ Package ${key} → ${aabDest}`);
  } else {
    console.error(`ERROR: AAB not found at ${BUNDLE_DEFAULT}`);
    process.exit(1);
  }
}

/** Full release build for one key. */
function build(key) {
  loadProjectConfig(key);
  bundle(key);
  prep(key);
  buildAndSync();
  updateAndroid();
  packageKey(key);
}

function listAvailableKeys() {
  if (!fs.existsSync(BM_OBA_MEDIA)) {
    return TRANSLATION_KEYS;
  }
  return TRANSLATION_KEYS.filter((key) => {
    const obaKey = resolveObaKey(key);
    if (!obaKey) return false;
    return fs.existsSync(path.join(BM_OBA_MEDIA, obaKey, 'content'));
  });
}

function buildAll() {
  const available = listAvailableKeys();
  const skipped = TRANSLATION_KEYS.filter((key) => !available.includes(key));
  if (skipped.length > 0) {
    console.warn(`Skipping keys without oba-media content: ${skipped.join(', ')}`);
  }
  if (available.length === 0) {
    console.error('ERROR: No translation keys with oba-media content found.');
    process.exit(1);
  }
  available.forEach((key) => {
    console.log(`\n--- Build ${key} ---`);
    build(key);
  });
}

function clean() {
  if (fs.existsSync(DIST_MEDIA)) {
    fs.rmSync(DIST_MEDIA, { recursive: true, force: true });
    console.log('Removed:', DIST_MEDIA);
  }
  const envProd = path.join(ENV_DIR, 'environment.prod.ts');
  if (fs.existsSync(envProd)) {
    fs.unlinkSync(envProd);
    console.log('Removed:', envProd);
  }
  if (fs.existsSync(BUNDLE_DEFAULT)) {
    fs.unlinkSync(BUNDLE_DEFAULT);
    console.log('Removed:', BUNDLE_DEFAULT);
  }
  console.log('Clean complete.');
}

function cleanAll() {
  clean();
  const distDir = path.join(ROOT, 'dist');
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true });
    console.log('Removed:', distDir);
  }
  console.log('Clean-all complete.');
}

function setVersion() {
  const version = process.env.VERSION || execSync('git describe --tags 2>/dev/null || echo ""', { encoding: 'utf8', cwd: ROOT }).trim();
  const versionCode = process.env.VERSION_CODE;
  if (!version && !versionCode) {
    console.log('No VERSION or VERSION_CODE set and no git tags; skipping.');
    return;
  }
  const buildGradle = path.join(ANDROID_DIR, 'app', 'build.gradle');
  if (!fs.existsSync(buildGradle)) {
    console.error('Android build.gradle not found. Run cap sync first.');
    process.exit(1);
  }
  let content = fs.readFileSync(buildGradle, 'utf8');
  if (versionCode) content = content.replace(/versionCode\s+\d+/, `versionCode ${versionCode}`);
  if (version) content = content.replace(/versionName\s+"[^"]*"/, `versionName "${String(version).replace(/"/g, '\\"')}"`);
  fs.writeFileSync(buildGradle, content);
  console.log('Version set:', { version, versionCode });
}

// CLI
const [cmd, key] = process.argv.slice(2);
switch (cmd) {
  case 'bundle':
    if (!key) { console.error('Usage: node release-build.js bundle <key>'); process.exit(1); }
    bundle(key);
    break;
  case 'prep':
    if (!key) { console.error('Usage: node release-build.js prep <key>'); process.exit(1); }
    prep(key);
    break;
  case 'package':
    if (!key) { console.error('Usage: node release-build.js package <key>'); process.exit(1); }
    packageKey(key);
    break;
  case 'build':
    if (!key) { console.error('Usage: node release-build.js build <key>'); process.exit(1); }
    build(key);
    break;
  case 'build-all':
    buildAll();
    break;
  case 'clean':
    clean();
    break;
  case 'clean-all':
    cleanAll();
    break;
  case 'set-version':
    setVersion();
    break;
  default:
    console.error('Usage: node release-build.js <bundle|prep|package|build|build-all|clean|clean-all|set-version> [key]');
    process.exit(1);
}
