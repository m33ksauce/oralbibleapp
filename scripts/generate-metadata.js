#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

// Generate deterministic UUID from file path
function generateUUID(filePath) {
  const hash = crypto.createHash('md5').update(filePath).digest('hex');
  return [
    hash.substring(0, 8),
    hash.substring(8, 12),
    hash.substring(12, 16),
    hash.substring(16, 20),
    hash.substring(20, 32)
  ].join('-');
}

// Parse filename to extract display name
// e.g., "Lukas 1_1-4.mp3" -> "Lukas 1:1-4"
function parseFileName(filename) {
  const nameWithoutExt = path.basename(filename, path.extname(filename));
  // Replace underscores with colons for verse ranges
  return nameWithoutExt.replace(/_/g, ':');
}

// Recursively scan directory for audio files
function scanAudioDirectory(dir, basePath = '') {
  const items = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(basePath, entry.name).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      // Recursively scan subdirectories
      const children = scanAudioDirectory(fullPath, relativePath);
      if (children.length > 0) {
        items.push({
          type: 1,
          name: entry.name,
          children: children
        });
      }
    } else if (entry.isFile() && /\.(mp3|wav|ogg|m4a)$/i.test(entry.name)) {
      // Audio file found
      const audioId = generateUUID(relativePath);
      const displayName = parseFileName(entry.name);
      
      items.push({
        type: 2,
        name: displayName,
        audioTargetId: audioId
      });
    }
  }

  return items;
}

// Generate metadata from directory structure
function generateMetadata(audioDir, version = '0.0.0') {
  console.log('Scanning audio directory:', audioDir);

  if (!fs.existsSync(audioDir)) {
    console.error(`Audio directory not found: ${audioDir}`);
    process.exit(1);
  }

  // Scan directory structure
  const categories = scanAudioDirectory(audioDir, 'audio');
  
  // Build audio array from all files
  const audioFiles = [];
  function collectAudioFiles(dir, basePath = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.join(basePath, entry.name).replace(/\\/g, '/');

      if (entry.isDirectory()) {
        collectAudioFiles(fullPath, relativePath);
      } else if (entry.isFile() && /\.(mp3|wav|ogg|m4a)$/i.test(entry.name)) {
        const audioId = generateUUID(relativePath);
        audioFiles.push({
          id: audioId,
          file: relativePath
        });
      }
    }
  }

  collectAudioFiles(audioDir, 'audio');

  return {
    Version: version,
    Categories: categories,
    Audio: audioFiles
  };
}

// Main function
const OUTER_REPO = path.join(__dirname, '../..');
const INJECT_DIR = path.join(OUTER_REPO, 'inject');
const AUDIO_DIR = path.join(INJECT_DIR, 'audio');
const METADATA_DIR = path.join(INJECT_DIR, 'metadata');
const METADATA_FILE = path.join(METADATA_DIR, 'metadata.json');

// Get version from git or use default
let version = '0.0.0';
try {
  const gitVersion = execSync('git describe --tags 2>/dev/null || echo ""', { 
    encoding: 'utf8',
    cwd: OUTER_REPO 
  }).trim();
  if (gitVersion) {
    version = gitVersion;
  }
} catch (e) {
  // Use default version
}

console.log('Generating metadata from directory structure...');
const metadata = generateMetadata(AUDIO_DIR, version);

// Ensure metadata directory exists
if (!fs.existsSync(METADATA_DIR)) {
  fs.mkdirSync(METADATA_DIR, { recursive: true });
}

// Write metadata.json
fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2));

console.log(`✓ Metadata generated: ${METADATA_FILE}`);
console.log(`  - Version: ${metadata.Version}`);
console.log(`  - Categories: ${metadata.Categories.length}`);
console.log(`  - Audio files: ${metadata.Audio.length}`);

