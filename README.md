# OpenOralBible Client

Ionic/Angular app for OpenOralBible: multi-translation audio Bible client with per-translation config and content.

## Dev environment

1. **Android SDK** (for device/emulator):
   ```bash
   brew install --cask android-sdk
   ```
2. **Node** (LTS), then:
   ```bash
   npm install
   ```
3. **Ionic CLI** (if not global): `npm install -g @ionic/cli`

## Running locally

```bash
npm start
# or with a specific project: PROJECT=yetfa npm run dev
```

## NPM scripts

### Development

| Script | Description |
|--------|-------------|
| `npm start` | Run dev server |
| `npm run start-emulator` | Run on Android device/emulator |
| `npm run build` | Angular production build |
| `npm run test` | Unit tests |
| `npm run lint` | Lint |

### Project (multi-project / config switching)

| Script | Description |
|--------|-------------|
| `npm run project:list` | List projects |
| `npm run project:switch -- <id>` | Switch active project |
| `npm run project:setup -- <id>` | Setup project and generate config |
| `npm run project:build -- <id>` | Build single project |
| `npm run project:build-all` | Build all projects |
| `npm run project:clean` | Clean project artifacts |

### Release build (per-translation AABs)

Uses `scripts/release-build.js` with Capacitor and file-based media. Translation keys: `yetfa`, `papuan_malay`, `tangko`, `bahasa_kimki`, `bahasa_dou`, `bahasa_fayu`, `bahasa_sikari`, `bahasa_walak`, `abawiri`, `meyah`.

| Script | Description |
|--------|-------------|
| *(oba-media)* | Build uses sibling repo `../oba-media` directly. Ensure `../oba-media/config/<key>/` and `../oba-media/content/<key>/` exist. |
| `npm run release:bundle -- <key>` | Generate metadata and copy media files for one translation |
| `npm run release:prep -- <key>` | Set `environment.prod.ts` for that key |
| `npm run release:package -- <key>` | Gradle bundleRelease, copy AAB to `dist/<key>.prod.aab` |
| `npm run release:build -- <key>` | Full release for one key: bundle → prep → Angular build → cap sync → package |
| `npm run release:build-all` | Release build for every translation key |
| `npm run release:clean` | Remove `dist/media/`, `environment.prod.ts`, default AAB |
| `npm run release:clean-all` | release:clean + remove `dist/` |
| `npm run release:set-version` | Set Android version from git describe (or `VERSION` / `VERSION_CODE` env) |

**Example: build a single translation (using sibling repo ../oba-media)**

```bash
npm run release:build -- yetfa
# → dist/yetfa.prod.aab
# (../oba-media must have config/yetfa/ and content/yetfa/)
```

### Config and tooling

| Script | Description |
|--------|-------------|
| `npm run generate-config` | Generate env and config from `config/app-config.json` |
| `npm run set-version` | Set app version from git tags; updates Android config |
| `npm run update-android` | Update Android app id/version from config |
| `npm run generate-metadata` | Generate metadata for media |
| `npm run clean` | Remove build artifacts (see `scripts/clean.js`) |

## Layout (concise)

- **config/** — `app-config.json` (active project); optional `config/projects/` for multi-project.
- **src/** — Angular app; `src/environments/environment.prod.<key>.ts` per translation for release.
- **inject/** — Local audio + metadata for dev/bundling.
- **scripts/** — Build and release scripts; `release-build.js` handles per-translation release builds.
- **dist/** — Release AABs: `dist/<key>.prod.aab`.

See **PROJECT_BUILD_SYSTEM.md** for the full multi-project design and **docs/** for architecture and build walkthroughs.
