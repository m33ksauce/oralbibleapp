const fs = require('fs');
const path = require('path');

const DEFAULT_BM_ROOT = path.join(__dirname, '..', '..', 'oba-media');

function keyVariants(key) {
  const variants = new Set([key]);
  variants.add(key.replace(/_/g, '-'));
  variants.add(key.replace(/-/g, '_'));
  return [...variants];
}

function resolveObaKey(bmRoot, key) {
  for (const variant of keyVariants(key)) {
    if (fs.existsSync(path.join(bmRoot, variant, 'config'))) return variant;
    if (fs.existsSync(path.join(bmRoot, 'config', variant))) return variant;
  }
  return null;
}

function resolveConfigDir(bmRoot, obaKey) {
  const perKey = path.join(bmRoot, obaKey, 'config');
  if (fs.existsSync(perKey)) return perKey;
  const nested = path.join(bmRoot, 'config', obaKey);
  if (fs.existsSync(nested)) return nested;
  return null;
}

function resolveContentDir(bmRoot, obaKey) {
  const perKey = path.join(bmRoot, obaKey, 'content');
  if (fs.existsSync(perKey)) return perKey;
  const nested = path.join(bmRoot, 'content', obaKey);
  if (fs.existsSync(nested)) return nested;
  return null;
}

function readAppId(configDir) {
  for (const file of ['project.json', 'app-config.json']) {
    const configPath = path.join(configDir, file);
    if (!fs.existsSync(configPath)) continue;
    const data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (data.app?.id) return data.app.id;
  }
  return null;
}

function resolveProjectConfigSource(bmRoot, key) {
  const obaKey = resolveObaKey(bmRoot, key);
  if (!obaKey) return null;
  const configDir = resolveConfigDir(bmRoot, obaKey);
  if (!configDir) return null;

  const projectConfig = path.join(configDir, 'project.json');
  if (fs.existsSync(projectConfig)) {
    return { obaKey, configDir, sourcePath: projectConfig };
  }
  const appConfig = path.join(configDir, 'app-config.json');
  if (fs.existsSync(appConfig)) {
    return { obaKey, configDir, sourcePath: appConfig };
  }
  return null;
}

module.exports = {
  DEFAULT_BM_ROOT,
  keyVariants,
  resolveObaKey,
  resolveConfigDir,
  resolveContentDir,
  readAppId,
  resolveProjectConfigSource,
};
