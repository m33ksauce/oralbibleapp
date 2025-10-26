#!/usr/bin/env node

const ProjectManager = require('./project-manager');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class BuildOrchestrator {
  constructor() {
    this.projectManager = new ProjectManager();
    this.rootDir = path.join(__dirname, '..');
    this.distDir = path.join(this.rootDir, 'dist');
  }

  // Build all projects
  async buildAllProjects(options = {}) {
    const { parallel = false, concurrency = 3, filter = null } = options;
    const projects = this.projectManager.listProjects();
    
    if (filter) {
      const filteredProjects = projects.filter(p => p.includes(filter));
      console.log(`Building filtered projects: ${filteredProjects.join(', ')}`);
      return this.buildProjects(filteredProjects, { parallel, concurrency });
    }
    
    console.log(`Building ${projects.length} projects...`);
    return this.buildProjects(projects, { parallel, concurrency });
  }

  // Build specific projects
  async buildProjects(projectIds, options = {}) {
    const { parallel = false, concurrency = 3 } = options;
    
    if (parallel) {
      return this.buildProjectsParallel(projectIds, concurrency);
    } else {
      return this.buildProjectsSequential(projectIds);
    }
  }

  // Build projects sequentially
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

  // Build projects in parallel
  async buildProjectsParallel(projectIds, concurrency = 3) {
    const results = [];
    
    for (let i = 0; i < projectIds.length; i += concurrency) {
      const batch = projectIds.slice(i, i + concurrency);
      console.log(`\n=== Building batch: ${batch.join(', ')} ===`);
      
      const batchPromises = batch.map(projectId => 
        this.buildProject(projectId).catch(error => ({ 
          projectId, 
          status: 'failed', 
          error: error.message 
        }))
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    
    return results;
  }

  // Build single project
  async buildProject(projectId) {
    console.log(`Building project: ${projectId}`);
    
    // Validate project
    if (!this.projectManager.validateProject(projectId)) {
      throw new Error(`Project ${projectId} validation failed`);
    }
    
    // Switch to project
    this.projectManager.switchToProject(projectId);
    
    try {
      // Generate configuration files
      console.log('Generating configuration files...');
      execSync('node scripts/generate-config.js', { 
        cwd: this.rootDir, 
        stdio: 'inherit' 
      });
      
      // Bundle media files
      console.log('Bundling media files...');
      const bundlerPath = path.join(this.rootDir, 'util', 'md-bundler');
      const injectPath = path.join(this.rootDir, 'inject');
      const mediaOutputPath = path.join(this.rootDir, 'dist', 'media');
      
      // Ensure media output directory exists
      fs.mkdirSync(mediaOutputPath, { recursive: true });
      
      // Run media bundler
      execSync(`npm run make -- ${injectPath} ${mediaOutputPath}`, {
        cwd: bundlerPath,
        stdio: 'inherit'
      });
      
      // Build Angular app
      console.log('Building Angular app...');
      execSync('ng build --configuration=production', {
        cwd: this.rootDir,
        stdio: 'inherit'
      });
      
      // Run Capacitor sync
      console.log('Running Capacitor sync...');
      execSync('npx cap sync android', {
        cwd: this.rootDir,
        stdio: 'inherit'
      });
      
      // Build Android project
      console.log('Building Android project...');
      execSync('./gradlew assembleRelease && ./gradlew bundleRelease', {
        cwd: path.join(this.rootDir, 'android'),
        stdio: 'inherit'
      });
      
      // Copy output to project-specific directory
      const projectDistDir = path.join(this.distDir, projectId);
      fs.mkdirSync(projectDistDir, { recursive: true });
      
      const androidBundlePath = path.join(this.rootDir, 'android', 'app', 'build', 'outputs', 'bundle', 'release', 'app-release.aab');
      const projectOutput = path.join(projectDistDir, `${projectId}-release.aab`);
      
      if (fs.existsSync(androidBundlePath)) {
        fs.copyFileSync(androidBundlePath, projectOutput);
        console.log(`Build completed: ${projectOutput}`);
        return { outputFile: projectOutput };
      } else {
        throw new Error('Android build output not found');
      }
      
    } catch (error) {
      console.error(`Build failed for ${projectId}:`, error.message);
      throw error;
    }
  }

  // Generate build report
  generateReport(results) {
    const successful = results.filter(r => r.status === 'success');
    const failed = results.filter(r => r.status === 'failed');
    
    console.log('\n=== Build Report ===');
    console.log(`Total projects: ${results.length}`);
    console.log(`Successful: ${successful.length}`);
    console.log(`Failed: ${failed.length}`);
    
    if (failed.length > 0) {
      console.log('\nFailed projects:');
      failed.forEach(f => console.log(`  - ${f.projectId}: ${f.error}`));
    }
    
    return { successful, failed, total: results.length };
  }

  // Clean build artifacts
  clean() {
    console.log('Cleaning build artifacts...');
    
    const pathsToClean = [
      path.join(this.rootDir, 'www'),
      path.join(this.rootDir, 'dist'),
      path.join(this.rootDir, 'inject'),
      path.join(this.rootDir, 'android', 'app', 'build')
    ];
    
    pathsToClean.forEach(cleanPath => {
      if (fs.existsSync(cleanPath)) {
        execSync(`rm -rf ${cleanPath}`);
      }
    });
    
    console.log('Clean completed');
  }
}

module.exports = BuildOrchestrator;
