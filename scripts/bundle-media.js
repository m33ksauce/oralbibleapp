#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Paths
const OUTER_REPO = path.join(__dirname, '../..');
const INJECT_DIR = path.join(OUTER_REPO, 'inject');
const METADATA_FILE = path.join(INJECT_DIR, 'metadata', 'metadata.json');
const CLIENT_DIR = path.join(__dirname, '..');
const MEDIA_OUTPUT_DIR = path.join(CLIENT_DIR, 'dist', 'media');

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
function loadMetadata() {
  if (!fileExists(METADATA_FILE)) {
    console.error(`ERROR: metadata.json not found at ${METADATA_FILE}`);
    console.error('       Please create metadata.json or run: npm run generate-metadata');
    process.exit(1);
  }
  
  const metadataContent = fs.readFileSync(METADATA_FILE, 'utf8');
  return JSON.parse(metadataContent);
}

// Copy files from inject/ to dist/media/ based on metadata
function copyMediaFiles(metadata) {
  console.log('Copying media files based on metadata...');
  
  // Ensure output directory exists
  ensureDir(MEDIA_OUTPUT_DIR);
  
  // Copy metadata.json
  const destMetadata = path.join(MEDIA_OUTPUT_DIR, 'metadata.json');
  fs.copyFileSync(METADATA_FILE, destMetadata);
  console.log('  ✓ Copied metadata.json');
  
  // Copy only audio files listed in metadata
  if (!metadata.Audio || metadata.Audio.length === 0) {
    console.warn('  ⚠ No audio files listed in metadata');
    return;
  }
  
  const audioSource = path.join(INJECT_DIR);
  const audioDest = path.join(MEDIA_OUTPUT_DIR);
  
  let copiedCount = 0;
  let missingCount = 0;
  
  // Copy each audio file listed in metadata, preserving directory structure
  metadata.Audio.forEach((audio) => {
    const sourceFile = path.join(audioSource, audio.file);
    const destFile = path.join(audioDest, audio.file);
    
    if (fileExists(sourceFile)) {
      // Ensure destination directory exists
      const destDir = path.dirname(destFile);
      ensureDir(destDir);
      
      // Copy file
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
function bundleMedia() {
  console.log('Bundling media files...');
  
  // Load metadata (must exist)
  const metadata = loadMetadata();
  
  // Copy files to dist/media/ based on metadata
  copyMediaFiles(metadata);
  
  console.log('✓ Media bundle complete');
  console.log(`  Output: ${MEDIA_OUTPUT_DIR}`);
}

// Run if called directly
if (require.main === module) {
  bundleMedia();
}

module.exports = { bundleMedia };

