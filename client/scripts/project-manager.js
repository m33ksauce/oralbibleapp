#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ProjectManager {
  constructor() {
    this.configDir = path.join(__dirname, '..', 'config');
    this.projectsDir = path.join(this.configDir, 'projects');
    this.contentDir = path.join(__dirname, '..', 'content');
    this.distDir = path.join(__dirname, '..', 'dist');
  }

  // Create a new project
  createProject(projectId, config) {
    console.log(`Creating project: ${projectId}`);
    
    // Create project config
    const configPath = path.join(this.projectsDir, `${projectId}.json`);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    // Create content directory
    const contentPath = path.join(this.contentDir, projectId);
    fs.mkdirSync(contentPath, { recursive: true });
    fs.mkdirSync(path.join(contentPath, 'audio'), { recursive: true });
    
    // Create basic metadata.json
    const metadataPath = path.join(contentPath, 'metadata.json');
    const basicMetadata = {
      "Version": "1.0.0",
      "Categories": [],
      "Audio": []
    };
    fs.writeFileSync(metadataPath, JSON.stringify(basicMetadata, null, 2));
    
    console.log(`Project ${projectId} created successfully`);
  }

  // List all projects
  listProjects() {
    if (!fs.existsSync(this.projectsDir)) {
      fs.mkdirSync(this.projectsDir, { recursive: true });
      return [];
    }
    
    const files = fs.readdirSync(this.projectsDir);
    return files
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace('.json', ''));
  }

  // Get project config
  getProjectConfig(projectId) {
    const configPath = path.join(this.projectsDir, `${projectId}.json`);
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    return null;
  }

  // Switch to project (for development)
  switchToProject(projectId) {
    const config = this.getProjectConfig(projectId);
    if (!config) {
      throw new Error(`Project ${projectId} not found`);
    }
    
    // Copy project config to active config
    const activeConfigPath = path.join(this.configDir, 'app-config.json');
    fs.writeFileSync(activeConfigPath, JSON.stringify(config, null, 2));
    
    // Copy project content to inject directory for media bundler
    const contentPath = path.join(this.contentDir, projectId);
    const injectPath = path.join(__dirname, '..', 'inject');
    
    if (fs.existsSync(contentPath)) {
      // Remove existing inject directory and copy new content
      if (fs.existsSync(injectPath)) {
        execSync(`rm -rf ${injectPath}`);
      }
      execSync(`cp -r ${contentPath} ${injectPath}`);
    }
    
    console.log(`Switched to project: ${projectId}`);
  }

  // Validate project has required content
  validateProject(projectId) {
    const contentPath = path.join(this.contentDir, projectId);
    const metadataPath = path.join(contentPath, 'metadata.json');
    const audioPath = path.join(contentPath, 'audio');
    
    if (!fs.existsSync(metadataPath)) {
      console.warn(`Project ${projectId} missing metadata.json`);
      return false;
    }
    
    if (!fs.existsSync(audioPath)) {
      console.warn(`Project ${projectId} missing audio directory`);
      return false;
    }
    
    return true;
  }

  // Get project content path
  getProjectContentPath(projectId) {
    return path.join(this.contentDir, projectId);
  }

  // Check if project exists
  projectExists(projectId) {
    const configPath = path.join(this.projectsDir, `${projectId}.json`);
    return fs.existsSync(configPath);
  }
}

module.exports = ProjectManager;
