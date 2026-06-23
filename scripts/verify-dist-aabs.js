#!/usr/bin/env node
/**
 * Compare each client/dist/<key>.prod.aab against bundled baseline metadata
 * and sanity-check bundled JS for API paths + stray language keys.
 *
 * Usage: node scripts/verify-dist-aabs.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const OUTER = path.join(ROOT, '..');
const BM = path.join(OUTER, 'oba-media');
const DIST = path.join(ROOT, 'dist');
const DEFAULT_TOLERANCE_BYTES = 512 * 1024; // 512 KiB

const AUDIO_EXT = /\.(mp3|wav|ogg|m4a)$/i;

function die(msg) {
  console.error(msg);
  process.exit(1);
}

function resolveObaKey(key) {
  const base = path.join(BM, key, 'config');
  const alt = path.join(BM, key.replace(/_/g, '-'), 'config');
  if (fs.existsSync(base)) return key;
  if (fs.existsSync(alt)) return key.replace(/_/g, '-');
  return null;
}

function readAabMetadata(aabPath) {
  try {
    const raw = execSync(
      `unzip -p ${JSON.stringify(aabPath)} base/assets/public/media/metadata.json`,
      { encoding: 'utf8' },
    );
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Paths relative to bundled `public/media/` root from baseline/release metadata. */
function expectedMediaPathsFromMetadata(metadata) {
  const out = new Set(['metadata.json']);
  for (const entry of metadata?.Audio ?? []) {
    out.add(String(entry.file).replace(/\\/g, '/'));
  }
  return { set: out };
}

/** Legacy fallback: full oba-media content/audio tree. */
function expectedMediaPathsFullTree(obaKey) {
  const audioRoot = path.join(BM, obaKey, 'content', 'audio');
  if (!fs.existsSync(audioRoot)) {
    return { error: `Missing audio directory: ${audioRoot}` };
  }
  const out = new Set(['metadata.json']);
  const walk = (dir, relFromAudio) => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const rel = relFromAudio ? path.posix.join(relFromAudio, ent.name) : ent.name;
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        walk(full, rel);
      } else if (AUDIO_EXT.test(ent.name)) {
        out.add(path.posix.join('audio', rel));
      }
    }
  };
  walk(audioRoot, '');
  return { set: out };
}

function listAabMediaPaths(aabPath) {
  const prefix = 'base/assets/public/media/';
  const out = new Set();
  const sizes = new Map();
  let listing;
  try {
    listing = execSync(`unzip -Z1 ${JSON.stringify(aabPath)}`, {
      encoding: 'utf8',
      maxBuffer: 1024 * 1024 * 512,
    });
  } catch (e) {
    return { error: `unzip -Z1 failed: ${e.message}` };
  }
  for (const line of listing.split('\n')) {
    const n = line.trim();
    if (!n.startsWith(prefix)) continue;
    const rel = n.slice(prefix.length);
    if (!rel || rel.endsWith('/')) continue;
    out.add(rel.replace(/\\/g, '/'));
  }

  try {
    const verbose = execSync(`unzip -l ${JSON.stringify(aabPath)}`, {
      encoding: 'utf8',
      maxBuffer: 1024 * 1024 * 512,
    });
    for (const line of verbose.split('\n')) {
      const m = line.trim().match(/^(\d+)\s+\d{2}-\d{2}-\d{2}\s+\d{2}:\d{2}\s+(.+)$/);
      if (!m) continue;
      const entry = m[2].trim();
      if (!entry.startsWith(prefix)) continue;
      const rel = entry.slice(prefix.length).replace(/\\/g, '/');
      sizes.set(rel, Number(m[1]));
    }
  } catch {
    // Size checks are best-effort.
  }

  return { set: out, sizes };
}

function verifyBaselineBudget(metadata, got) {
  const warnings = [];
  const errors = [];
  const baseline = metadata?.Baseline;
  if (!baseline) {
    return { warnings, errors };
  }

  const { maxBytes, topLevelIncluded, topLevelTotal, totalBytes: baselineBytes } = baseline;
  let audioBytes = 0;
  for (const rel of got.set) {
    if (rel.startsWith('audio/')) {
      audioBytes += got.sizes.get(rel) ?? 0;
    }
  }

  if (typeof maxBytes === 'number' && audioBytes > maxBytes + DEFAULT_TOLERANCE_BYTES) {
    errors.push(
      `Bundled audio size ${audioBytes} exceeds baseline maxBytes ${maxBytes} (+${DEFAULT_TOLERANCE_BYTES} tolerance)`,
    );
  }

  if (
    typeof baselineBytes === 'number'
    && audioBytes > 0
    && Math.abs(audioBytes - baselineBytes) > DEFAULT_TOLERANCE_BYTES
  ) {
    warnings.push(
      `Bundled audio size ${audioBytes} differs from baseline totalBytes ${baselineBytes}`,
    );
  }

  if (
    typeof topLevelIncluded === 'number'
    && typeof topLevelTotal === 'number'
    && topLevelIncluded < topLevelTotal
  ) {
    warnings.push(
      `Baseline coverage gap: topLevelIncluded ${topLevelIncluded} < topLevelTotal ${topLevelTotal}`,
    );
  }

  return { warnings, errors, audioBytes };
}

/** One zipgrep pass: extract api/v1/<lang>/(release|audio) occurrences from bundled assets. */
function extractApiPaths(aabPath) {
  let text = '';
  try {
    text = execSync(
      `zipgrep "api/v1/" ${JSON.stringify(aabPath)} ${JSON.stringify('base/assets/public/*.js')}`,
      {
        encoding: 'utf8',
        maxBuffer: 256 * 1024 * 1024,
      },
    );
  } catch (e) {
    if (e.status === 1) {
      return { pairs: new Set(), langs: new Set() };
    }
    throw e;
  }
  const pairs = new Set();
  const langs = new Set();
  const re = /api\/v1\/([a-z_]+)\/(release|audio)/g;
  let m;
  while ((m = re.exec(text))) {
    pairs.add(`${m[1]}/${m[2]}`);
    langs.add(m[1]);
  }
  return { pairs, langs };
}

function main() {
  if (!fs.existsSync(DIST)) die(`ERROR: dist not found: ${DIST}`);
  const aabs = fs.readdirSync(DIST).filter((f) => f.endsWith('.prod.aab'));
  if (aabs.length === 0) die(`ERROR: no *.prod.aab in ${DIST}`);

  let failed = false;

  for (const file of aabs.sort()) {
    const key = path.basename(file, '.prod.aab');
    const aab = path.join(DIST, file);
    console.log(`\n=== ${key} ===`);

    const obaKey = resolveObaKey(key);
    if (!obaKey) {
      console.error(`ERROR: unknown oba-media key for ${key}`);
      failed = true;
      continue;
    }

    const metadata = readAabMetadata(aab);
    const exp = metadata?.Audio?.length
      ? expectedMediaPathsFromMetadata(metadata)
      : expectedMediaPathsFullTree(obaKey);
    if (exp.error) {
      console.error(`ERROR: ${exp.error}`);
      failed = true;
      continue;
    }

    const got = listAabMediaPaths(aab);
    if (got.error) {
      console.error(`ERROR: ${got.error}`);
      failed = true;
      continue;
    }

    const missing = [...exp.set].filter((p) => !got.set.has(p)).sort();
    const extra = [...got.set].filter((p) => !exp.set.has(p)).sort();

    console.log(`media: expected ${exp.set.size} files, bundle has ${got.set.size}`);
    if (missing.length) {
      console.error(`ERROR: missing in AAB (${missing.length}):`);
      missing.slice(0, 20).forEach((p) => console.error(`  - ${p}`));
      if (missing.length > 20) console.error(`  ... +${missing.length - 20} more`);
      failed = true;
    }
    if (extra.length) {
      console.error(`ERROR: extra in AAB (${extra.length}):`);
      extra.slice(0, 20).forEach((p) => console.error(`  + ${p}`));
      if (extra.length > 20) console.error(`  ... +${extra.length - 20} more`);
      failed = true;
    }
    if (!missing.length && !extra.length) {
      const source = metadata?.Audio?.length ? 'baseline metadata.json' : 'oba-media content/audio';
      console.log(`media: OK (paths under base/assets/public/media/ match ${source})`);
    }

    if (metadata) {
      const budget = verifyBaselineBudget(metadata, got);
      for (const warning of budget.warnings) console.warn(`  ⚠ ${warning}`);
      for (const error of budget.errors) {
        console.error(`ERROR: ${error}`);
        failed = true;
      }
      if (budget.audioBytes) {
        console.log(`baseline: ${budget.audioBytes} audio bytes in AAB`);
      }
    }

    const { pairs, langs } = extractApiPaths(aab);
    const hasRel = pairs.has(`${key}/release`);
    const hasAud = pairs.has(`${key}/audio`);
    if (!hasRel || !hasAud) {
      console.error(`ERROR: JS missing expected API paths for ${key}`);
      console.error(`  has release: ${hasRel}  has audio: ${hasAud}`);
      console.error(`  found pairs: ${[...pairs].sort().join(', ') || '(none)'}`);
      failed = true;
    } else {
      console.log(`config: OK (api/v1/${key}/release + api/v1/${key}/audio in bundle)`);
    }

    const wrongLangs = [...langs].filter((k) => k !== key);
    if (wrongLangs.length) {
      console.error(`ERROR: stray API language slug(s) in bundle: ${wrongLangs.sort().join(', ')}`);
      failed = true;
    }

    const cap = JSON.parse(
      execSync(`unzip -p ${JSON.stringify(aab)} base/assets/capacitor.config.json`, { encoding: 'utf8' }),
    );
    const wantId = JSON.parse(
      fs.readFileSync(path.join(BM, obaKey, 'config', 'project.json'), 'utf8'),
    ).app.id;
    if (cap.appId !== wantId) {
      console.error(`ERROR: capacitor appId mismatch: got ${cap.appId}, want ${wantId}`);
      failed = true;
    } else {
      console.log(`capacitor: OK appId=${cap.appId}`);
    }
  }

  if (failed) {
    console.error('\nverify-dist-aabs: FAILED');
    process.exit(1);
  }
  console.log('\nverify-dist-aabs: OK');
}

main();
