# Multi-Project Build System

A scalable build system for managing hundreds of OpenOralBible client applications with different configurations and content.

## Architecture Overview

The build system is designed to be self-contained within the client repository and supports:

- **JSON-based configuration** for each project
- **Local content management** with audio files and metadata
- **Automated build orchestration** for single or multiple projects
- **Parallel build support** for efficient mass building
- **Environment variable support** for sensitive data

## Directory Structure

```
├── config/
│   ├── app-config.json              # Active project config (for development)
│   └── projects/                     # Project configurations
├── content/                          # Project-specific content
│   └── yetfa/
│       ├── audio/
│       └── metadata/metadata.json
├── scripts/
│   ├── cli.js
│   ├── project-manager.js
│   ├── build-orchestrator.js
│   ├── release-build.js
│   ├── bundle-media.js
│   └── generate-config.js
└── dist/
    ├── yetfa.prod.aab               # Release builds (release:build)
    └── yetfa/                       # Project CLI builds (project:build)
```

## Creating a New Project

### 1. Create Project Configuration

```bash
npm run project:create -- papuan-malay --id=com.oralbibleapp.papuanmalay --name="Papuan Malay" --description="OpenOralBible Client for Papuan Malay"
```

This creates:
- `config/projects/papuan-malay.json` - Project configuration
- `content/papuan-malay/` - Content directory with basic metadata.json

### 2. Add Project Content

Add your audio files and metadata:

```bash
# Add audio files
mkdir -p content/papuan-malay/audio
cp your-audio-files/* content/papuan-malay/audio/

# Update metadata.json with your navigation structure
# Edit content/papuan-malay/metadata/metadata.json
```

### 3. Setup Project for Development

```bash
npm run project:setup -- papuan-malay
```

This switches to the project and generates all necessary configuration files.

## Building Projects

### Build Single Project

```bash
npm run project:build -- yetfa
```

### Build All Projects

```bash
# Sequential build
npm run project:build-all

# Parallel build (faster for multiple projects)
npm run project:build-all -- --parallel --concurrency=3
```

### Build Specific Projects

```bash
# Build projects matching a pattern
npm run project:build-all -- --filter=papuan
```

## Development Workflow

### Switch to Project for Development

```bash
npm run project:switch -- yetfa
npm run start
```

Or use the combined command:

```bash
PROJECT=yetfa npm run dev
```

### List Available Projects

```bash
npm run project:list
```

### Clean Build Artifacts

```bash
npm run project:clean
```

## Configuration File Format

### Project Configuration (`config/projects/{project}.json`)

```json
{
  "app": {
    "id": "com.oralbibleapp.yetfa2",
    "name": "Awa Ma",
    "description": "The OpenOralBible Client for Yetfa Scripture",
    "version": "1.0.0",
    "versionCode": 107
  },
  "translation": {
    "key": "yetfa",
    "backend": {
      "releaseEndpoint": "https://content.oralbible.app/api/v1/yetfa/release",
      "audioEndpoint": "https://content.oralbible.app/api/v1/yetfa/audio"
    }
  },
  "features": {
    "dynamicContent": true,
    "bluetoothUpdate": false,
    "mediaCanCollapseWhenPlaying": true
  },
  "build": {
    "keystore": {
      "file": "crypto/release/oba-yetfa.keystore",
      "alias": "oba-yetfa",
      "password": "${KEYSTORE_PASSWORD}"
    }
  }
}
```

### Content Structure

Each project's content directory should contain:

```
content/{project}/
├── audio/
└── metadata/metadata.json
```

## Build Process

1. **Project Validation** - Check project exists and has required content
2. **Configuration Switch** - Copy project config to active config
3. **Config Generation** - Generate environment.prod.ts and capacitor.config.ts
4. **Media Bundling** - Copy audio files and metadata into dist/media/
5. **Angular Build** - Build the web application
6. **Capacitor Sync** - Sync web assets to Android project
7. **Android Build** - Compile and sign the Android AAB
8. **Output** - Copy AAB to dist/{project}-release.aab

## Environment Variables

The system supports environment variables for sensitive data:

- `KEYSTORE_PASSWORD` - Android keystore password
- `APP_ID` - Override app ID from config
- `APP_NAME` - Override app name from config
- `KEYSTORE_FILE` - Override keystore file path
- `KEYSTORE_ALIAS` - Override keystore alias

## CLI Commands

All commands are available through `node scripts/cli.js`:

```bash
# Create project
node scripts/cli.js create <project-id> [options]

# List projects
node scripts/cli.js list

# Switch project
node scripts/cli.js switch <project-id>

# Build project
node scripts/cli.js build <project-id>

# Build all projects
node scripts/cli.js build-all [options]

# Setup project
node scripts/cli.js setup <project-id>

# Clean artifacts
node scripts/cli.js clean
```

## Release Builds (oba-media)

For production AABs per translation key using the sibling `../oba-media` repo:

```bash
npm run release:build -- yetfa
npm run release:build-all    # builds keys available in oba-media
npm run release:bundle -- yetfa
npm run release:clean
```

## Troubleshooting

### Common Issues

1. **Project not found** - Ensure project exists in `config/projects/`
2. **Missing content** - Check that `content/{project}/` has `audio/` and `metadata/metadata.json`
3. **Build failures** - Check that all dependencies are installed (`npm install`)
4. **Android build issues** - Ensure Android SDK and Gradle are properly configured

### Debug Mode

Run individual build steps to debug:

```bash
# Generate config only
node scripts/generate-config.js

# Bundle media only
node scripts/bundle-media.js --input inject --output dist/media

# Build Angular only
ng build --configuration=production

# Sync Capacitor only
npx cap sync android
```

## Scaling to Hundreds of Projects

The system is designed to handle hundreds of projects efficiently:

- **Parallel builds** - Use `--parallel --concurrency=N` for faster builds
- **Batch processing** - Build projects in batches to manage resources
- **Incremental builds** - Only rebuild changed projects
- **Cloud deployment** - Deploy to cloud build services for massive scale

## Migration from Old System

If migrating from the old build system:

1. Copy existing project configs to `config/projects/`
2. Copy existing content to `content/{project}/`
3. Update any hardcoded paths in your build scripts
4. Test with a single project first
5. Gradually migrate all projects

