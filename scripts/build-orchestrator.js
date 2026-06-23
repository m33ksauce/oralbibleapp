#!/usr/bin/env node

const ProjectManager = require('./project-manager');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getKeystoreEnv(rootDir) {
  const appConfig = JSON.parse(fs.readFileSync(path.join(rootDir, 'config', 'app-config.json'), 'utf8'));
  const keystoreFile = appConfig.build.keystore.file;
  const keystorePath = path.isAbsolute(keystoreFile)
    ? keystoreFile
    : path.resolve(rootDir, keystoreFile);
  const rawPassword = appConfig.build.keystore.password;
  const password = rawPassword && rawPassword.includes('${')
    ? (process.env.KEYSTORE_PASSWORD || '')
    : rawPassword;
  return {
    ...process.env,
    KEYSTORE_FILE: fs.existsSync(keystorePath) ? keystorePath : keystoreFile,
    KEYSTORE_ALIAS: appConfig.build.keystore.alias,
    KEYSTORE_PASSWORD: password,
  };
}

class BuildOrchestrator {
  constructor() {
    this.projectManager = new ProjectManager();
    this.rootDir = path.join(__dirname, '..');
    this.distDir = path.join(this.rootDir, 'dist');
  }

  async buildAllProjects(options = {}) {
    const { parallel = false, concurrency = 3, filter = null } = options;
    const projects = this.projectManager.listProjects();

    if (filter) {
      const filteredProjects = projects.filter((p) => p.includes(filter));
      console.log(`Building filtered projects: ${filteredProjects.join(', ')}`);
      return this.buildProjects(filteredProjects, { parallel, concurrency });
    }

    console.log(`Building ${projects.length} projects...`);
    return this.buildProjects(projects, { parallel, concurrency });
  }

  async buildProjects(projectIds, options = {}) {
    const { parallel = false, concurrency = 3 } = options;

    if (parallel) {
      return this.buildProjectsParallel(projectIds, concurrency);
    }
    return this.buildProjectsSequential(projectIds);
  }

  async buildProjectsSequential(projectIds) {
    const results = [];

    for (const projectId of projectIds) {
      try {
        console.log(`\n=== Building ${projectId} ===`);
        const result = await this.buildProject(projectId);
        results.push({ projectId, status: 'success', result });
      } catch (error) {
        console.error(`Failed to build ${projectId}:`, error.message);
        results.push({ projectId, status: 'failed', error: error.message });
      }
    }

    return results;
  }

  async buildProjectsParallel(projectIds, concurrency = 3) {
    const results = [];

    for (let i = 0; i < projectIds.length; i += concurrency) {
      const batch = projectIds.slice(i, i + concurrency);
      console.log(`\n=== Building batch: ${batch.join(', ')} ===`);

      const batchPromises = batch.map((projectId) =>
        this.buildProject(projectId)
          .then((result) => ({ projectId, status: 'success', result }))
          .catch((error) => ({ projectId, status: 'failed', error: error.message }))
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  }

  async buildProject(projectId) {
    console.log(`Building project: ${projectId}`);

    if (!this.projectManager.validateProject(projectId)) {
      throw new Error(`Project ${projectId} validation failed`);
    }

    this.projectManager.switchToProject(projectId);

    try {
      console.log('Generating configuration files...');
      execSync('node scripts/generate-config.js', {
        cwd: this.rootDir,
        stdio: 'inherit',
      });

      console.log('Bundling media files...');
      const injectPath = path.join(this.rootDir, 'inject');
      const mediaOutputPath = path.join(this.rootDir, 'dist', 'media');
      if (fs.existsSync(mediaOutputPath)) {
        fs.rmSync(mediaOutputPath, { recursive: true, force: true });
      }
      fs.mkdirSync(mediaOutputPath, { recursive: true });
      execSync(`node scripts/bundle-media.js --input "${injectPath}" --output "${mediaOutputPath}"`, {
        cwd: this.rootDir,
        stdio: 'inherit',
      });

      console.log('Building Angular app...');
      execSync('ng build --configuration=production', {
        cwd: this.rootDir,
        stdio: 'inherit',
      });

      console.log('Running Capacitor sync...');
      execSync('npx cap sync android', {
        cwd: this.rootDir,
        stdio: 'inherit',
      });

      console.log('Updating Android configuration...');
      execSync('node scripts/update-android-config.js', {
        cwd: this.rootDir,
        stdio: 'inherit',
      });

      console.log('Building Android project...');
      execSync('./gradlew assembleRelease && ./gradlew bundleRelease', {
        cwd: path.join(this.rootDir, 'android'),
        stdio: 'inherit',
        env: getKeystoreEnv(this.rootDir),
      });

      const projectDistDir = path.join(this.distDir, projectId);
      fs.mkdirSync(projectDistDir, { recursive: true });

      const androidBundlePath = path.join(
        this.rootDir,
        'android',
        'app',
        'build',
        'outputs',
        'bundle',
        'release',
        'app-release.aab'
      );
      const projectOutput = path.join(projectDistDir, `${projectId}-release.aab`);

      if (fs.existsSync(androidBundlePath)) {
        fs.copyFileSync(androidBundlePath, projectOutput);
        console.log(`Build completed: ${projectOutput}`);
        return { outputFile: projectOutput };
      }

      throw new Error('Android build output not found');
    } catch (error) {
      console.error(`Build failed for ${projectId}:`, error.message);
      throw error;
    }
  }

  generateReport(results) {
    const successful = results.filter((r) => r.status === 'success');
    const failed = results.filter((r) => r.status === 'failed');

    console.log('\n=== Build Report ===');
    console.log(`Total projects: ${results.length}`);
    console.log(`Successful: ${successful.length}`);
    console.log(`Failed: ${failed.length}`);

    if (failed.length > 0) {
      console.log('\nFailed projects:');
      failed.forEach((f) => console.log(`  - ${f.projectId}: ${f.error}`));
    }

    return { successful, failed, total: results.length };
  }

  clean() {
    console.log('Cleaning build artifacts...');

    const pathsToClean = [
      path.join(this.rootDir, 'www'),
      path.join(this.rootDir, 'dist'),
      path.join(this.rootDir, 'android', 'app', 'build'),
    ];

    pathsToClean.forEach((cleanPath) => {
      if (fs.existsSync(cleanPath)) {
        execSync(`rm -rf ${cleanPath}`);
      }
    });

    console.log('Clean completed');
  }
}

module.exports = BuildOrchestrator;
