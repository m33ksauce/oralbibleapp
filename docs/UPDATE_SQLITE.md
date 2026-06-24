# Update SQLite Plugin for 16 KB Page Size Support

## Issue
The `@capacitor-community/sqlite` plugin version 7.0.0 uses SQLCipher 4.5.3 which may not fully support 16 KB page sizes required by Google Play Console for Android 15+.

## Solution
Update to version 7.0.1+ which includes SQLCipher 4.6.1 with 16 KB page size support.

## Steps to Update

1. **Update package.json** (already done):
   - Changed from `^7.0.0` to `^7.0.1`

2. **Install updated dependencies**:
   ```bash
   cd client/client
   npm install
   ```

3. **Sync Capacitor** (if needed):
   ```bash
   npx cap sync android
   ```

4. **Rebuild**:
   ```bash
   cd ../..
   npm run package
   ```

## What Was Changed

- `client/client/package.json`: Updated `@capacitor-community/sqlite` to `^7.0.1`
- `android/build.gradle`: Added subproject configuration to ensure all plugins (including SQLite) have 16 KB page size support

## Verification

After updating, verify the AAB builds successfully and check that the native libraries are properly aligned for 16 KB pages.
