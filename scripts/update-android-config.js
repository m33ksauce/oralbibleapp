#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load app configuration from outer repo
const OUTER_REPO = path.join(__dirname, '../..');  // Go up from client/scripts to outer repo
const appConfigPath = path.join(OUTER_REPO, 'config', 'app-config.json');
const appConfig = JSON.parse(fs.readFileSync(appConfigPath, 'utf8'));

// Path to Android build.gradle in outer repo
const buildGradlePath = path.join(OUTER_REPO, 'android', 'app', 'build.gradle');

if (!fs.existsSync(buildGradlePath)) {
  console.error('Android build.gradle not found at:', buildGradlePath);
  process.exit(1);
}

// Read current build.gradle
let buildGradle = fs.readFileSync(buildGradlePath, 'utf8');

// Update namespace and applicationId
buildGradle = buildGradle.replace(
  /namespace\s+"[^"]+"/,
  `namespace "${appConfig.app.id}"`
);

buildGradle = buildGradle.replace(
  /applicationId\s+"[^"]+"/,
  `applicationId "${appConfig.app.id}"`
);

// Update versionCode
buildGradle = buildGradle.replace(
  /versionCode\s+\d+/,
  `versionCode ${appConfig.app.versionCode}`
);

// Update versionName
buildGradle = buildGradle.replace(
  /versionName\s+"[^"]+"/,
  `versionName "${appConfig.app.version}"`
);

// Keystore path relative to android/app directory
// From android/app, we need to go up two levels to get to project root
const keystoreRelativePath = appConfig.build.keystore.file.startsWith('/')
  ? appConfig.build.keystore.file
  : `../../${appConfig.build.keystore.file}`;

// Update signing configs - the build.gradle already has the structure, just ensure it's correct
// The signing configs are already in the template, so we just need to make sure they're correct
if (buildGradle.includes('signingConfigs')) {
  // Update existing signing configs if they exist
  buildGradle = buildGradle.replace(
    /storeFile\s+file\([^)]+\)/g,
    (match) => {
      if (match.includes('System.getenv')) {
        return match; // Already using env var
      }
      return `storeFile file(System.getenv("KEYSTORE_FILE") ?: "${keystoreRelativePath}")`;
    }
  );
  
  // Update keyAlias if needed
  if (!buildGradle.includes('System.getenv("KEYSTORE_ALIAS")')) {
    buildGradle = buildGradle.replace(
      /keyAlias\s+[^,\n]+/,
      `keyAlias System.getenv("KEYSTORE_ALIAS") ?: "${appConfig.build.keystore.alias}"`
    );
  }
}

// Ensure release buildType uses signing config
if (buildGradle.includes('buildTypes') && buildGradle.includes('signingConfigs')) {
  const releaseBlock = buildGradle.match(/release\s*\{[^}]*\}/s);
  if (releaseBlock && !releaseBlock[0].includes('signingConfig')) {
    buildGradle = buildGradle.replace(
      /(release\s*\{)/,
      '$1\n            if (signingConfigs.release.storeFile != null) {\n                signingConfig signingConfigs.release\n            }'
    );
  }
}

// Write updated build.gradle
fs.writeFileSync(buildGradlePath, buildGradle);

// Update MainActivity.java package and directory structure
const javaSrcDir = path.join(OUTER_REPO, 'android', 'app', 'src', 'main', 'java');
const appId = appConfig.app.id;
const packagePath = appId.replace(/\./g, '/');
const newMainActivityDir = path.join(javaSrcDir, packagePath);
const newMainActivityPath = path.join(newMainActivityDir, 'MainActivity.java');

// Find existing MainActivity.java
let existingMainActivityPath = null;
if (fs.existsSync(javaSrcDir)) {
  const findMainActivity = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isFile() && entry.name === 'MainActivity.java') {
        return fullPath;
      }
      if (entry.isDirectory()) {
        const found = findMainActivity(fullPath);
        if (found) return found;
      }
    }
    return null;
  };
  existingMainActivityPath = findMainActivity(javaSrcDir);
}

if (existingMainActivityPath) {
  // Read existing MainActivity.java
  let mainActivityContent = fs.readFileSync(existingMainActivityPath, 'utf8');
  
  // Update package declaration
  mainActivityContent = mainActivityContent.replace(
    /^package\s+[^;]+;/m,
    `package ${appId};`
  );
  
  // Create new directory structure if needed
  if (!fs.existsSync(newMainActivityDir)) {
    fs.mkdirSync(newMainActivityDir, { recursive: true });
  }
  
  // Write to new location
  fs.writeFileSync(newMainActivityPath, mainActivityContent);
  
  // Remove old directory if it's different and empty
  if (existingMainActivityPath !== newMainActivityPath) {
    const oldDir = path.dirname(existingMainActivityPath);
    try {
      // Only remove if directory is empty
      const oldDirContents = fs.readdirSync(oldDir);
      if (oldDirContents.length === 0 || (oldDirContents.length === 1 && oldDirContents[0] === 'MainActivity.java')) {
        fs.rmSync(oldDir, { recursive: true, force: true });
        // Also clean up parent directories if empty
        let currentDir = path.dirname(oldDir);
        while (currentDir !== javaSrcDir) {
          try {
            const contents = fs.readdirSync(currentDir);
            if (contents.length === 0) {
              fs.rmSync(currentDir, { recursive: true, force: true });
              currentDir = path.dirname(currentDir);
            } else {
              break;
            }
          } catch (e) {
            break;
          }
        }
      }
    } catch (e) {
      // Ignore errors when cleaning up old directories
    }
  }
} else {
  // MainActivity.java doesn't exist, create it
  if (!fs.existsSync(newMainActivityDir)) {
    fs.mkdirSync(newMainActivityDir, { recursive: true });
  }
  const mainActivityContent = `package ${appId};

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {}
`;
  fs.writeFileSync(newMainActivityPath, mainActivityContent);
}

// Update strings.xml
const stringsXmlPath = path.join(OUTER_REPO, 'android', 'app', 'src', 'main', 'res', 'values', 'strings.xml');
if (fs.existsSync(stringsXmlPath)) {
  let stringsXml = fs.readFileSync(stringsXmlPath, 'utf8');
  
  // Update package_name
  stringsXml = stringsXml.replace(
    /<string name="package_name">[^<]+<\/string>/,
    `<string name="package_name">${appId}</string>`
  );
  
  // Update custom_url_scheme
  stringsXml = stringsXml.replace(
    /<string name="custom_url_scheme">[^<]+<\/string>/,
    `<string name="custom_url_scheme">${appId}</string>`
  );
  
  fs.writeFileSync(stringsXmlPath, stringsXml);
}

console.log('Android build.gradle updated successfully');
console.log(`  - App ID: ${appConfig.app.id}`);
console.log(`  - Version: ${appConfig.app.version}`);
console.log(`  - Version Code: ${appConfig.app.versionCode}`);
console.log(`  - MainActivity.java: ${newMainActivityPath}`);
console.log(`  - Package structure: ${packagePath}`);
