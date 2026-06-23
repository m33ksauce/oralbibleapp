#!/usr/bin/env node

const assert = require('assert');
const path = require('path');
const { mapBaselineToBundleMetadata, resolveAudioPath, buildAudioIndex } = require('./generate-baseline-metadata');
const baseline = require('./fixtures/yetfa-baseline.json');

const audioDir = path.join(__dirname, '..', '..', 'oba-media', 'content', 'yetfa', 'audio');
if (!require('fs').existsSync(audioDir)) {
  console.log('⊘ generate-baseline-metadata tests skipped (oba-media content not present)');
  process.exit(0);
}

const metadata = mapBaselineToBundleMetadata(baseline, audioDir);

assert.strictEqual(metadata.Audio.length, 10);
assert.ok(metadata.Audio.every((a) => a.file.startsWith('audio/')));
assert.strictEqual(metadata.Audio[0].file, 'audio/Lukas/Lukas 1_1-4.mp3');
assert.ok(metadata.Baseline);

const index = buildAudioIndex(audioDir);
const byName = resolveAudioPath({ id: 'missing', file: 'Lukas 1:1-4' }, index);
assert.strictEqual(byName, 'audio/Lukas/Lukas 1_1-4.mp3');

console.log('✓ generate-baseline-metadata tests passed');
