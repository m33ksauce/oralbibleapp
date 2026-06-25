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
const {
  resolveObaKey,
  resolveContentDir: obaContentDir,
  resolveProjectConfigSource,
} = require('./oba-media-paths');

const ROOT = path.join(__dirname, '..');
const OUTER_REPO = path.join(ROOT, '..');
const BM_OBA_MEDIA = path.join(OUTER_REPO, 'oba-media');
const DIST_MEDIA = path.join(ROOT, 'dist', 'media');
const DEFAULT_BASELINE_URL = process.env.BASELINE_API_URL || 'https://content.oralbible.app';
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

function runCapture(cmd) {
  return execSync(cmd, { stdio: 'pipe', encoding: 'utf8', cwd: ROOT });
}

function isBaselineApiUnavailable(output) {
  return /GET .* failed: HTTP|ENOTFOUND|ECONNREFUSED|ETIMEDOUT|fetch failed/i.test(output);
}

/** Resolve key to folder name under oba-media. */
function resolveObaKeyForBuild(key) {
  return resolveObaKey(BM_OBA_MEDIA, key);
}

/** Find content directory for a translation key in oba-media. */
function resolveContentDir(key) {
  if (!fs.existsSync(BM_OBA_MEDIA)) {
    console.error(`ERROR: oba-media not found at ${BM_OBA_MEDIA}`);
    process.exit(1);
  }
  const obaKey = resolveObaKeyForBuild(key);
  if (!obaKey) {
    console.error(`ERROR: No config found for ${key} under ${BM_OBA_MEDIA}`);
    process.exit(1);
  }
  const contentDir = obaContentDir(BM_OBA_MEDIA, obaKey);
  if (!contentDir) {
    console.error(`ERROR: Content directory not found for ${key}`);
    process.exit(1);
  }
  return contentDir;
}

function warnBaselineCoverage(metadataFile) {
  if (!fs.existsSync(metadataFile)) return;
  const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf8'));
  const baseline = metadata.Baseline;
  if (!baseline) return;

  const { topLevelIncluded, topLevelTotal } = baseline;
  if (
    typeof topLevelIncluded === 'number'
    && typeof topLevelTotal === 'number'
    && topLevelIncluded < topLevelTotal
  ) {
    console.warn(
      `⚠ Baseline coverage gap for release bundle: ${topLevelIncluded}/${topLevelTotal} top-level categories included`,
    );
    if (baseline.excludedTopLevel?.length) {
      console.warn(`  Excluded: ${baseline.excludedTopLevel.join(', ')}`);
    }
  }
}

/**
 * Fetch published baseline metadata, map to local audio paths, bundle into dist/media/.
 */
function bundle(key) {
  const contentDir = resolveContentDir(key);
  const audioDir = path.join(contentDir, 'audio');

  if (fs.existsSync(DIST_MEDIA)) {
    fs.rmSync(DIST_MEDIA, { recursive: true, force: true });
  }

  const stagingDir = path.join(ROOT, 'dist', 'staging', key);
  const metadataDir = path.join(stagingDir, 'metadata');
  const metadataFile = path.join(metadataDir, 'metadata.json');
  ensureDir(metadataDir);

  const baselineFile = process.env.BASELINE_FILE || '';
  const baselineFileArg = baselineFile ? ` --baseline-file "${baselineFile}"` : '';
  const authoredMetadata = [
    path.join(contentDir, 'metadata', 'metadata.json'),
    path.join(contentDir, 'metadata.json'),
  ].find((p) => fs.existsSync(p));

  try {
    console.log(`Generating baseline metadata for ${key}...`);
    runCapture(
      `node scripts/generate-baseline-metadata.js --translation ${key} --audio "${audioDir}" --output "${metadataFile}" --base-url ${DEFAULT_BASELINE_URL}${baselineFileArg}`,
    );
    warnBaselineCoverage(metadataFile);
  } catch (e) {
    const output = `${e.stdout || ''}${e.stderr || ''}${e.message || ''}`;
    if (baselineFile || !isBaselineApiUnavailable(output)) {
      if (e.stdout) process.stdout.write(e.stdout);
      if (e.stderr) process.stderr.write(e.stderr);
      throw e;
    }
    if (authoredMetadata) {
      console.warn(`Baseline API unavailable; using authored metadata for ${key}...`);
      fs.copyFileSync(authoredMetadata, metadataFile);
    } else {
      console.warn(`Baseline API unavailable; generating full-tree metadata for ${key}...`);
      run(`node scripts/generate-metadata.js --audio "${audioDir}" --output "${metadataFile}"`);
    }
  }

  const stagingAudioLink = path.join(stagingDir, 'audio');
  if (!fs.existsSync(stagingAudioLink)) {
    fs.symlinkSync(audioDir, stagingAudioLink, 'dir');
  }

  try {
    console.log(`Bundling media for ${key}...`);
    run(`node scripts/bundle-media.js --input "${stagingDir}" --output "${DIST_MEDIA}"`);
    console.log(`✓ Bundled ${key} → ${DIST_MEDIA}`);
  } finally {
    fs.rmSync(path.join(ROOT, 'dist', 'staging'), { recursive: true, force: true });
  }
}

/** Generate environment.prod.ts from the current app-config.json. */
function prep(key) {
  loadProjectConfig(key);
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
  const resolved = resolveProjectConfigSource(BM_OBA_MEDIA, key);
  if (!resolved) {
    console.error(`ERROR: No project.json or app-config.json found for ${key} under ${BM_OBA_MEDIA}`);
    process.exit(1);
  }
  const appConfigDest = path.join(OUTER_REPO, 'config', 'app-config.json');
  ensureDir(path.dirname(appConfigDest));
  if (resolved.mergedConfig) {
    fs.writeFileSync(appConfigDest, JSON.stringify(resolved.mergedConfig, null, 2));
  } else {
    fs.copyFileSync(resolved.sourcePath, appConfigDest);
  }
  const config = JSON.parse(fs.readFileSync(appConfigDest, 'utf8'));
  console.log(`✓ Loaded config for ${key}: ${config.app?.id || '(no app.id)'}`);
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
    const obaKey = resolveObaKeyForBuild(key);
    if (!obaKey) return false;
    return Boolean(obaContentDir(BM_OBA_MEDIA, obaKey));
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
    loadProjectConfig(key);
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
