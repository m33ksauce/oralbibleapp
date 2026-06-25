#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const crypto = require('crypto');
const minimist = require('minimist');
const { generateUUID, parseFileName } = require('./generate-metadata');

const REPO_ROOT = path.join(__dirname, '..');
const DEFAULT_BASE_URL = 'https://content.oralbible.app';

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client
      .get(url, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error(`GET ${url} failed: HTTP ${res.statusCode}`));
            return;
          }
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(new Error(`GET ${url} returned invalid JSON: ${e.message}`));
          }
        });
      })
      .on('error', reject);
  });
}

/** Build { byId, byIdNoDashes, byDisplayName } → relative path under staging root. */
function buildAudioIndex(audioDir, contentDir = null) {
  const byId = new Map();
  const byIdNoDashes = new Map();
  const byDisplayName = new Map();

  function addEntry(id, filePath, displayName) {
    if (id) {
      byId.set(id, filePath);
      byIdNoDashes.set(String(id).replace(/-/g, ''), filePath);
    }
    if (displayName && !byDisplayName.has(displayName)) {
      byDisplayName.set(displayName, filePath);
    }
  }

  const authoredMetadataPaths = contentDir
    ? [
      path.join(contentDir, 'metadata.json'),
      path.join(contentDir, 'metadata', 'metadata.json'),
    ]
    : [];

  for (const metadataPath of authoredMetadataPaths) {
    if (!fs.existsSync(metadataPath)) continue;
    const authored = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    for (const entry of authored.Audio ?? []) {
      addEntry(entry.id, entry.file, path.basename(entry.file, path.extname(entry.file)).replace(/_/g, ':'));
    }
  }

  function walk(dir, basePath = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.join(basePath, entry.name).replace(/\\/g, '/');

      if (entry.isDirectory()) {
        walk(fullPath, relativePath);
      } else if (entry.isFile() && /\.(mp3|wav|ogg|m4a)$/i.test(entry.name)) {
        const filePath = `audio/${relativePath}`;
        const pathId = generateUUID(filePath);
        const displayName = parseFileName(entry.name);
        const contentId = crypto.createHash('md5').update(fs.readFileSync(fullPath)).digest('hex');
        addEntry(pathId, filePath, displayName);
        addEntry(contentId, filePath, displayName);
      }
    }
  }

  if (!fs.existsSync(audioDir)) {
    throw new Error(`Audio directory not found: ${audioDir}`);
  }

  walk(audioDir);
  return { byId, byIdNoDashes, byDisplayName };
}

function resolveAudioPath(audioEntry, index) {
  const { id, file: displayName } = audioEntry;
  return (
    index.byId.get(id)
    || index.byIdNoDashes.get(String(id).replace(/-/g, ''))
    || index.byDisplayName.get(displayName)
  );
}

/**
 * Map baseline API Audio[] (display names) to bundle paths using a local audio index.
 * Returns release-shaped metadata for bundle-media.js.
 */
function mapBaselineToBundleMetadata(baseline, audioDir, contentDir = null) {
  if (!baseline?.Audio?.length) {
    throw new Error('Baseline response has no Audio entries');
  }

  const index = buildAudioIndex(audioDir, contentDir);
  const missing = [];
  const audio = baseline.Audio.map((entry) => {
    const filePath = resolveAudioPath(entry, index);
    if (!filePath) {
      missing.push(entry);
      return null;
    }
    return { id: entry.id, file: filePath };
  }).filter(Boolean);

  if (missing.length > 0) {
    const sample = missing.slice(0, 5).map((a) => `${a.id} (${a.file})`).join(', ');
    throw new Error(
      `Could not resolve ${missing.length} baseline audio file(s) locally. Sample: ${sample}`,
    );
  }

  return {
    Version: baseline.Version,
    Categories: baseline.Categories,
    Audio: audio,
    Baseline: baseline.Baseline,
  };
}

async function fetchBaseline(translation, baseUrl, baselineFile) {
  if (baselineFile) {
    console.log(`Loading baseline from file: ${baselineFile}`);
    return JSON.parse(fs.readFileSync(baselineFile, 'utf8'));
  }

  const url = `${baseUrl.replace(/\/$/, '')}/api/v1/${translation}/baseline/latest`;
  console.log(`Fetching baseline: ${url}`);
  return fetchJson(url);
}

async function run(options) {
  const {
    translation,
    audioDir,
    outputFile,
    baseUrl = DEFAULT_BASE_URL,
    baselineFile = null,
  } = options;

  if (!translation) {
    throw new Error('--translation is required');
  }
  if (!audioDir) {
    throw new Error('--audio is required');
  }
  if (!outputFile) {
    throw new Error('--output is required');
  }

  const baseline = await fetchBaseline(translation, baseUrl, baselineFile);
  const contentDir = path.dirname(audioDir);
  const metadata = mapBaselineToBundleMetadata(baseline, audioDir, contentDir);

  ensureDir(path.dirname(outputFile));
  fs.writeFileSync(outputFile, JSON.stringify(metadata, null, 2));

  console.log(`✓ Baseline metadata written: ${outputFile}`);
  console.log(`  - Version: ${metadata.Version}`);
  console.log(`  - Categories: ${metadata.Categories.length}`);
  console.log(`  - Audio files: ${metadata.Audio.length}`);
  if (metadata.Baseline) {
    const b = metadata.Baseline;
    console.log(`  - Baseline bytes: ${b.totalBytes} / ${b.maxBytes}`);
    console.log(`  - Top-level coverage: ${b.topLevelIncluded} / ${b.topLevelTotal}`);
  }
}

if (require.main === module) {
  const args = minimist(process.argv.slice(2));
  const translation = args.translation || args.t;
  const audioDir = args.audio;
  const outputFile = args.output;
  const baseUrl = args['base-url'] || args.baseUrl || DEFAULT_BASE_URL;
  const baselineFile = args['baseline-file'] || args.baselineFile || null;

  run({ translation, audioDir, outputFile, baseUrl, baselineFile }).catch((err) => {
    console.error(`ERROR: ${err.message}`);
    process.exit(1);
  });
}

module.exports = {
  buildAudioIndex,
  mapBaselineToBundleMetadata,
  resolveAudioPath,
  run,
};
