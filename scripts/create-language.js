#!/usr/bin/env node
/**
 * Scaffold oba-media/<key>/config/project.json and wire content/audio from a media path.
 *
 * Usage:
 *   node scripts/create-language.js <key> <path-to-media>
 *   node scripts/create-language.js --key=<key> --media=<path-to-media> [--name=...] [--app-id=...]
 *
 * Options:
 *   --symlink   Link content/audio to the media dir instead of copying (saves disk).
 *   --force     Overwrite existing project.json / replace audio dir if present.
 */

const fs = require('fs');
const path = require('path');
const minimist = require('minimist');

const ROOT = path.join(__dirname, '..');
const OUTER_REPO = path.join(ROOT, '..');
const BM_OBA_MEDIA = path.join(OUTER_REPO, 'oba-media');

function die(msg) {
  console.error(msg);
  process.exit(1);
}

function titleFromKey(key) {
  return key
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function appIdFromKey(key) {
  return `com.oralbibleapp.${key.replace(/_/g, '')}`;
}

function keystoreSlugFromKey(key) {
  return `oba-${key.replace(/_/g, '-')}`;
}

function validateKey(key) {
  if (!key || !/^[a-z][a-z0-9_]*$/.test(key)) {
    die(
      'ERROR: <key> must be snake_case: start with a letter, then lowercase letters, digits, underscores only.'
    );
  }
}

function buildProjectJson(key, opts) {
  const displayName = opts.name || titleFromKey(key);
  const appId = opts.appId || appIdFromKey(key);
  const ks = keystoreSlugFromKey(key);
  return {
    app: {
      id: appId,
      name: displayName,
      description: `The OpenOralBible Client for ${displayName} Scripture`,
      version: opts.version || '1.0.0',
      versionCode: opts.versionCode != null ? Number(opts.versionCode) : 1,
    },
    translation: {
      key,
      backend: {
        releaseEndpoint: `https://content.oralbible.app/api/v1/${key}/release`,
        audioEndpoint: `https://content.oralbible.app/api/v1/${key}/audio`,
      },
    },
    features: {
      dynamicContent: true,
      bluetoothUpdate: false,
      mediaCanCollapseWhenPlaying: true,
    },
    build: {
      keystore: {
        file: `../crypto/release/${ks}.keystore`,
        alias: ks,
        password: '${KEYSTORE_PASSWORD}',
      },
    },
  };
}

function main() {
  const argv = minimist(process.argv.slice(2), {
    string: ['key', 'media', 'name', 'app-id', 'version', 'version-code'],
    boolean: ['symlink', 'force', 'help'],
    alias: { h: 'help', m: 'media', k: 'key' },
  });

  if (argv.help || argv._.includes('help')) {
    console.log(`Usage:
  node scripts/create-language.js <key> <path-to-media>
  node scripts/create-language.js --key=<key> --media=<path> [--name=...] [--app-id=...] [--version=1.0.0] [--version-code=1]

Options:
  --symlink       Symlink oba-media/<key>/content/audio → <path-to-media> (absolute link target)
  --force         Replace existing project.json / clear and redo content/audio
`);
    process.exit(0);
  }

  const key = argv.key || argv._[0];
  const mediaArg = argv.media || argv._[1];

  if (!key || !mediaArg) {
    die('Usage: node scripts/create-language.js <key> <path-to-media>\n       node scripts/create-language.js --key=<key> --media=<path>');
  }

  validateKey(key);

  const mediaPath = path.resolve(mediaArg);
  if (!fs.existsSync(mediaPath)) {
    die(`ERROR: Media path does not exist: ${mediaPath}`);
  }
  const stat = fs.statSync(mediaPath);
  if (!stat.isDirectory()) {
    die(`ERROR: Media path must be a directory: ${mediaPath}`);
  }

  if (!fs.existsSync(BM_OBA_MEDIA)) {
    die(`ERROR: oba-media directory not found at ${BM_OBA_MEDIA}`);
  }

  const langRoot = path.join(BM_OBA_MEDIA, key);
  const configDir = path.join(langRoot, 'config');
  const contentDir = path.join(langRoot, 'content');
  const audioDir = path.join(contentDir, 'audio');
  const projectJson = path.join(configDir, 'project.json');

  if (fs.existsSync(langRoot) && !argv.force) {
    die(`ERROR: Already exists: ${langRoot}\n       Use --force to update project.json and audio wiring.`);
  }

  if (argv.force && fs.existsSync(audioDir)) {
    try {
      const lstat = fs.lstatSync(audioDir);
      if (lstat.isSymbolicLink()) {
        fs.unlinkSync(audioDir);
      } else {
        fs.rmSync(audioDir, { recursive: true, force: true });
      }
    } catch (e) {
      die(`ERROR: Could not remove ${audioDir}: ${e.message}`);
    }
  }

  fs.mkdirSync(configDir, { recursive: true });
  fs.mkdirSync(contentDir, { recursive: true });

  const opts = {
    name: argv.name,
    appId: argv['app-id'],
    version: argv.version,
    versionCode: argv['version-code'],
  };

  const project = buildProjectJson(key, opts);
  fs.writeFileSync(projectJson, JSON.stringify(project, null, 2) + '\n', 'utf8');
  console.log('Wrote', projectJson);

  if (argv.symlink) {
    fs.symlinkSync(mediaPath, audioDir, 'dir');
    console.log('Linked', audioDir, '->', mediaPath);
  } else {
    fs.mkdirSync(audioDir, { recursive: true });
    fs.cpSync(mediaPath, audioDir, { recursive: true });
    console.log('Copied media into', audioDir);
  }

  console.log('\nDone. Next steps:');
  console.log(`  - Add keystore: ${project.build.keystore.file} (relative to android/app; repo layout uses ../crypto/... from repo root).`);
  console.log(`  - Optional: add '${key}' to TRANSLATION_KEYS in scripts/release-build.js for release:build-all.`);
  console.log(`  - Build: npm run release:build -- ${key}   (from repo root, parent of client/)`);
}

main();
