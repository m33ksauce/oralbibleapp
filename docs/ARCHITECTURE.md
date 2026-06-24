# New Configurable Build Architecture

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           oba-yetfa-client (Project Root)                      │
│                                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐              │
│  │   config/       │    │   scripts/      │    │   inject/       │              │
│  │                 │    │                 │    │                 │              │
│  │ app-config.json │    │ generate-config │    │ audio/         │              │
│  │ build-config.json│   │ .js             │    │ metadata/      │              │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘              │
│           │                       │                       │                    │
│           │                       │                       │                    │
│           ▼                       ▼                       ▼                    │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                    Main Capacitor Project                                  ││
│  │                                                                           ││
│  │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        ││
│  │  │ capacitor.config│    │   package.json  │    │ scripts/build.js│        ││
│  │  │ .ts             │    │                 │    │                 │        ││
│  │  │                 │    │ - Dependencies  │    │ - Build orchest.│        ││
│  │  │ - Loads config  │    │ - npm scripts  │    │ - Media bundling│        ││
│  │  │ - Sets app ID   │    │ - Version mgmt  │    │ - Android build│        ││
│  │  └─────────────────┘    └─────────────────┘    └─────────────────┘        ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                    │                                          │
│                                    ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                        client/ (Git Submodule)                            ││
│  │                                                                           ││
│  │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        ││
│  │  │   client/       │    │   util/         │    │  injectables/   │        ││
│  │  │                 │    │                 │    │                 │        ││
│  │  │ - Angular app   │    │ - md-bundler    │    │ - Templates     │        ││
│  │  │ - Ionic UI      │    │ - Media tools   │    │ - Config files  │        ││
│  │  │ - Services      │    │                 │    │                 │        ││
│  │  │ - Components    │    │                 │    │                 │        ││
│  │  └─────────────────┘    └─────────────────┘    └─────────────────┘        ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                    │                                          │
│                                    ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                        Generated Output                                   ││
│  │                                                                           ││
│  │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        ││
│  │  │   android/      │    │   dist/         │    │  client/client/ │        ││
│  │  │                 │    │                 │    │  dist/          │        ││
│  │  │ - Android proj  │    │ - Release AAB   │    │                 │        ││
│  │  │ - Gradle build  │    │ - Package files │    │ - Built web app │        ││
│  │  │ - Signing       │    │                 │    │ - Media bundles │        ││
│  │  └─────────────────┘    └─────────────────┘    └─────────────────┘        ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Build Flow

```
1. Configuration Phase
   ┌─────────────────┐
   │ app-config.json │ ──┐
   └─────────────────┘   │
                         ▼
   ┌─────────────────────────────────┐
   │     generate-config.js           │
   │                                 │
   │ - Reads JSON config              │
   │ - Generates environment.prod.ts  │
   │ - Generates config.xml           │
   │ - Templates client files         │
   └─────────────────────────────────┘
                         │
                         ▼
   ┌─────────────────────────────────┐
   │     client/client/               │
   │                                 │
   │ - config.xml (generated)         │
   │ - environment.prod.ts (gen.)    │
   └─────────────────────────────────┘

2. Media Bundling Phase
   ┌─────────────────┐
   │ inject/         │ ──┐
   │ - audio/        │   │
   │ - metadata/     │   │
   └─────────────────┘   │
                         ▼
   ┌─────────────────────────────────┐
   │     md-bundler                   │
   │                                 │
   │ - Processes media files          │
   │ - Creates bundle.obd            │
   └─────────────────────────────────┘
                         │
                         ▼
   ┌─────────────────────────────────┐
   │ client/client/dist/media/       │
   │                                 │
   │ - bundle.obd (generated)        │
   └─────────────────────────────────┘

3. Web App Build Phase
   ┌─────────────────────────────────┐
   │     Angular Build               │
   │                                 │
   │ - Compiles TypeScript           │
   │ - Bundles assets                │
   │ - Includes media bundle         │
   └─────────────────────────────────┘
                         │
                         ▼
   ┌─────────────────────────────────┐
   │ client/client/www/browser/      │
   │                                 │
   │ - Built web application         │
   │ - Ready for Capacitor          │
   └─────────────────────────────────┘

4. Android Build Phase
   ┌─────────────────────────────────┐
   │     Capacitor Sync              │
   │                                 │
   │ - Copies web assets to Android  │
   │ - Updates native configs        │
   └─────────────────────────────────┘
                         │
                         ▼
   ┌─────────────────────────────────┐
   │     Gradle Build                │
   │                                 │
   │ - Compiles Android project      │
   │ - Signs with keystore           │
   │ - Creates AAB file             │
   └─────────────────────────────────┘
                         │
                         ▼
   ┌─────────────────────────────────┐
   │ dist/yetfa-release.aab           │
   │                                 │
   │ - Final release package         │
   └─────────────────────────────────┘
```

## Key Improvements Over Old Architecture

### Old Architecture Problems:
```
❌ Dual Capacitor Projects (confusing)
❌ String replacement with sed (fragile)
❌ Scattered configuration
❌ Complex build orchestration
❌ Hard to maintain and extend
```

### New Architecture Benefits:
```
✅ Single Capacitor Project (clean)
✅ JSON configuration (reliable)
✅ Centralized config management
✅ Clear build flow
✅ Easy to maintain and extend
✅ Reusable for new projects
```

## Configuration Hierarchy

```
Project Root Configuration
├── config/app-config.json          # Main app settings
│   ├── app.id, app.name            # App identity
│   ├── app.version, versionCode    # Version management
│   ├── translation.key             # Translation identifier
│   ├── backend.endpoints           # API endpoints
│   ├── features.*                  # Feature flags
│   └── build.keystore.*           # Signing configuration
│
├── config/build-config.json        # Build system settings
│   ├── build.outputDir             # Output directories
│   ├── media.bundleDir             # Media source
│   └── client.submodulePath        # Client location
│
└── scripts/generate-config.js      # Configuration generator
    ├── Reads JSON config
    ├── Generates environment.prod.ts
    ├── Generates config.xml
    └── Templates client files
```

## File Dependencies

```
package.json (npm scripts)
├── Depends on: config/app-config.json
├── Generates: client/client/config.xml
├── Generates: client/client/src/environments/environment.prod.ts
├── Calls: scripts/generate-config.js
├── Calls: client/util/md-bundler
└── Outputs: dist/yetfa-release.aab

capacitor.config.ts
├── Reads: config/app-config.json
├── Sets: process.env variables
└── Configures: Android build options

package.json
├── Defines: npm scripts
├── Manages: Dependencies
└── Orchestrates: Build process
```

This architecture provides a clean, maintainable, and scalable solution for your configurable build system!

