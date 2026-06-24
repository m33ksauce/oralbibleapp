#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const minimist = require('minimist');

// Default paths (release-build.js passes explicit --input / --output)
const CLIENT_DIR = path.join(__dirname, '..');
const DEFAULT_OUTPUT_DIR = path.join(CLIENT_DIR, 'dist', 'media');

// Helper functions
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function fileExists(file) {
  return fs.existsSync(file);
}

// Load metadata.json - must exist
function loadMetadata(metadataFile) {
  if (!fileExists(metadataFile)) {
    console.error(`ERROR: metadata.json not found at ${metadataFile}`);
    console.error('       Please create metadata.json or run: npm run generate-metadata');
    process.exit(1);
  }

  const metadataContent = fs.readFileSync(metadataFile, 'utf8');
  return JSON.parse(metadataContent);
}

// Copy files from input dir to output dir based on metadata
function copyMediaFiles(metadata, inputDir, outputDir, metadataFile) {
  console.log('Copying media files based on metadata...');

  ensureDir(outputDir);

  // Copy metadata.json
  const destMetadata = path.join(outputDir, 'metadata.json');
  fs.copyFileSync(metadataFile, destMetadata);
  console.log('  ✓ Copied metadata.json');

  if (!metadata.Audio || metadata.Audio.length === 0) {
    console.warn('  ⚠ No audio files listed in metadata');
    return;
  }

  let copiedCount = 0;
  let missingCount = 0;

  metadata.Audio.forEach((audio) => {
    const sourceFile = path.join(inputDir, audio.file);
    const destFile = path.join(outputDir, audio.file);

    if (fileExists(sourceFile)) {
      const destDir = path.dirname(destFile);
      ensureDir(destDir);
      fs.copyFileSync(sourceFile, destFile);
      copiedCount++;
    } else {
      console.warn(`  ⚠ Audio file not found: ${audio.file}`);
      missingCount++;
    }
  });

  console.log(`  ✓ Copied ${copiedCount} audio files`);
  if (missingCount > 0) {
    console.warn(`  ⚠ ${missingCount} audio files from metadata were not found`);
  }
}

// Main function
function bundleMedia(inputDir, outputDir) {
  if (!inputDir) {
    throw new Error('bundleMedia requires inputDir');
  }
  const input = inputDir;
  const output = outputDir || DEFAULT_OUTPUT_DIR;
  const metadataFile = path.join(input, 'metadata', 'metadata.json');

  console.log('Bundling media files...');
  console.log(`  Input:  ${input}`);
  console.log(`  Output: ${output}`);

  const metadata = loadMetadata(metadataFile);
  copyMediaFiles(metadata, input, output, metadataFile);

  console.log('✓ Media bundle complete');
  console.log(`  Output: ${output}`);
}

// Run if called directly
if (require.main === module) {
  const args = minimist(process.argv.slice(2));
  if (!args.input) {
    console.error('ERROR: --input <dir> is required');
    console.error('Usage: node scripts/bundle-media.js --input <staging-dir> [--output <dist/media>]');
    process.exit(1);
  }
  bundleMedia(args.input, args.output || null);
}

module.exports = { bundleMedia };

