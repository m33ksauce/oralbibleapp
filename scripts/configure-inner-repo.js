#!/usr/bin/env node
/**
 * Configure this repo as an “inner repo” for multi-variant builds.
 *
 * The outer repo calls this script with a variant JSON file and it generates:
 * - client/config.xml
 * - client/src/environments/environment.prod.ts
 * - client/src/environments/environment.ts (optional, but keeps local dev consistent)
 *
 * Usage:
 *   node scripts/configure-inner-repo.js --variant /path/to/variant.json --version 1.2.3
 *
 * Variant JSON (example):
 * {
 *   "variant": "yetfa",
 *   "translationKey": "yetfa",
 *   "appName": "Awa Ma",
 *   "appDescription": "OpenOralBible",
 *   "widgetId": "com.oralbibleapp.yetfa",
 *   "backend": {
 *     "baseUrl": "https://content.oralbible.app",
 *     "releaseEndpoint": "https://content.oralbible.app/api/v1/yetfa/release",
 *     "audioEndpoint": "https://content.oralbible.app/api/v1/yetfa/audio"
 *   }
 * }
 */

const fs = require('fs');
const path = require('path');

function die(msg) {
  process.stderr.write(String(msg).trimEnd() + '\n');
  process.exit(1);
}

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--variant') args.variant = argv[++i];
    else if (a === '--version') args.version = argv[++i];
    else if (a === '--dry-run') args.dryRun = true;
    else if (a === '--help' || a === '-h') args.help = true;
    else args._.push(a);
  }
  return args;
}

function readJson(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    die(`Failed to read JSON at ${filePath}: ${e && e.message ? e.message : e}`);
  }
}

function ensureDirForFile(filePath) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
}

function renderTemplate(template, vars) {
  return template.replace(/%([a-zA-Z0-9_-]+)%/g, (_, key) => {
    const k = String(key);
    if (!(k in vars)) {
      die(`Template placeholder %${k}% not provided`);
    }
    return String(vars[k]);
  });
}

function writeFile(filePath, contents, dryRun) {
  if (dryRun) {
    process.stdout.write(`[dry-run] would write ${filePath} (${Buffer.byteLength(contents, 'utf8')} bytes)\n`);
    return;
  }
  ensureDirForFile(filePath);
  fs.writeFileSync(filePath, contents, 'utf8');
}

function buildEndpoints(variant) {
  const translationKey = variant.translationKey;
  const backend = variant.backend || {};

  if (backend.releaseEndpoint && backend.audioEndpoint) {
    return {
      releaseEndpoint: backend.releaseEndpoint,
      audioEndpoint: backend.audioEndpoint,
    };
  }

  const baseUrl = backend.baseUrl || 'https://content.oralbible.app';
  if (!translationKey) die('variant.translationKey is required (used to build default endpoints)');

  return {
    releaseEndpoint: `${baseUrl.replace(/\/$/, '')}/api/v1/${translationKey}/release`,
    audioEndpoint: `${baseUrl.replace(/\/$/, '')}/api/v1/${translationKey}/audio`,
  };
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    process.stdout.write('Usage: node scripts/configure-inner-repo.js --variant <variant.json> [--version <x.y.z>] [--dry-run]\n');
    process.exit(0);
  }
  if (!args.variant) die('Missing required arg: --variant <path-to-variant.json>');

  const repoRoot = path.resolve(__dirname, '..');
  const variantPath = path.resolve(process.cwd(), args.variant);
  const variant = readJson(variantPath);

  const appName = variant.appName;
  const translationKey = variant.translationKey || variant.variant;
  const appDescription = variant.appDescription || '';

  if (!appName) die('variant.appName is required');
  if (!translationKey) die('variant.translationKey (or variant.variant) is required');

  const version = args.version || variant.version || process.env.APP_VERSION || '0.0.0';
  const widgetId = variant.widgetId || `com.oralbibleapp.${translationKey}`;

  const endpoints = buildEndpoints({ ...variant, translationKey });

  const templateVars = {
    'app-name': appName,
    'app-description': appDescription,
    'translation-key': translationKey,
    'version': version,
    'widget-id': widgetId,
    'release-endpoint': endpoints.releaseEndpoint,
    'audio-endpoint': endpoints.audioEndpoint,
  };

  const configXmlTemplatePath = path.join(repoRoot, 'injectables', 'config.xml');
  const envProdTemplatePath = path.join(repoRoot, 'injectables', 'environment.prod.ts');

  const configXmlTemplate = fs.readFileSync(configXmlTemplatePath, 'utf8');
  const envProdTemplate = fs.readFileSync(envProdTemplatePath, 'utf8');

  const renderedConfigXml = renderTemplate(configXmlTemplate, templateVars);
  const renderedEnvProd = renderTemplate(envProdTemplate, templateVars);

  // Keep dev env matching prod endpoints unless the outer repo chooses otherwise.
  const renderedEnvDev = renderedEnvProd.replace('production: true', 'production: false');

  writeFile(path.join(repoRoot, 'client', 'config.xml'), renderedConfigXml, args.dryRun);
  writeFile(path.join(repoRoot, 'client', 'src', 'environments', 'environment.prod.ts'), renderedEnvProd, args.dryRun);
  writeFile(path.join(repoRoot, 'client', 'src', 'environments', 'environment.ts'), renderedEnvDev, args.dryRun);

  process.stdout.write(`Configured inner repo using ${variantPath}\n`);
  process.stdout.write(`- widgetId: ${widgetId}\n`);
  process.stdout.write(`- appName: ${appName}\n`);
  process.stdout.write(`- version: ${version}\n`);
  process.stdout.write(`- releaseEndpoint: ${endpoints.releaseEndpoint}\n`);
  process.stdout.write(`- audioEndpoint: ${endpoints.audioEndpoint}\n`);
}

main();
