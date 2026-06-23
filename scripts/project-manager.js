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

  createProject(projectId, config) {
    console.log(`Creating project: ${projectId}`);

    const configPath = path.join(this.projectsDir, `${projectId}.json`);
    fs.mkdirSync(this.projectsDir, { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    const contentPath = path.join(this.contentDir, projectId);
    fs.mkdirSync(path.join(contentPath, 'audio'), { recursive: true });
    fs.mkdirSync(path.join(contentPath, 'metadata'), { recursive: true });

    const metadataPath = path.join(contentPath, 'metadata', 'metadata.json');
    const basicMetadata = {
      Version: '1.0.0',
      Categories: [],
      Audio: [],
    };
    fs.writeFileSync(metadataPath, JSON.stringify(basicMetadata, null, 2));

    console.log(`Project ${projectId} created successfully`);
  }

  listProjects() {
    if (!fs.existsSync(this.projectsDir)) {
      fs.mkdirSync(this.projectsDir, { recursive: true });
      return [];
    }

    return fs.readdirSync(this.projectsDir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace('.json', ''));
  }

  getProjectConfig(projectId) {
    const configPath = path.join(this.projectsDir, `${projectId}.json`);
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    return null;
  }

  switchToProject(projectId) {
    const config = this.getProjectConfig(projectId);
    if (!config) {
      throw new Error(`Project ${projectId} not found`);
    }

    const activeConfigPath = path.join(this.configDir, 'app-config.json');
    fs.writeFileSync(activeConfigPath, JSON.stringify(config, null, 2));

    const contentPath = path.join(this.contentDir, projectId);
    const injectPath = path.join(__dirname, '..', 'inject');

    if (fs.existsSync(contentPath)) {
      if (fs.existsSync(injectPath)) {
        execSync(`rm -rf ${injectPath}`);
      }
      execSync(`cp -r ${contentPath} ${injectPath}`);

      const flatMetadata = path.join(injectPath, 'metadata.json');
      const nestedMetadata = path.join(injectPath, 'metadata', 'metadata.json');
      if (fs.existsSync(flatMetadata) && !fs.existsSync(nestedMetadata)) {
        fs.mkdirSync(path.join(injectPath, 'metadata'), { recursive: true });
        fs.copyFileSync(flatMetadata, nestedMetadata);
      }
    }

    console.log(`Switched to project: ${projectId}`);
  }

  validateProject(projectId) {
    const contentPath = path.join(this.contentDir, projectId);
    const metadataPath = path.join(contentPath, 'metadata', 'metadata.json');
    const legacyMetadataPath = path.join(contentPath, 'metadata.json');
    const audioPath = path.join(contentPath, 'audio');

    if (!fs.existsSync(metadataPath) && !fs.existsSync(legacyMetadataPath)) {
      console.warn(`Project ${projectId} missing metadata.json`);
      return false;
    }

    if (!fs.existsSync(audioPath)) {
      console.warn(`Project ${projectId} missing audio directory`);
      return false;
    }

    return true;
  }

  getProjectContentPath(projectId) {
    return path.join(this.contentDir, projectId);
  }

  projectExists(projectId) {
    const configPath = path.join(this.projectsDir, `${projectId}.json`);
    return fs.existsSync(configPath);
  }
}

module.exports = ProjectManager;
