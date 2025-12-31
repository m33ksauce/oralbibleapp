#!/usr/bin/env node

const ProjectManager = require('./project-manager');
const BuildOrchestrator = require('./build-orchestrator');

class CLI {
  constructor() {
    this.projectManager = new ProjectManager();
    this.buildOrchestrator = new BuildOrchestrator();
  }

  async run() {
    const args = process.argv.slice(2);
    const command = args[0];

    try {
      switch (command) {
        case 'create':
          await this.handleCreate(args);
          break;
        case 'list':
          this.handleList();
          break;
        case 'switch':
          await this.handleSwitch(args);
          break;
        case 'build':
          await this.handleBuild(args);
          break;
        case 'build-all':
          await this.handleBuildAll(args);
          break;
        case 'setup':
          await this.handleSetup(args);
          break;
        case 'clean':
          this.handleClean();
          break;
        default:
          this.showHelp();
      }
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  }

  async handleCreate(args) {
    const projectId = args[1];
    if (!projectId) {
      throw new Error('Project ID is required. Usage: create <project-id>');
    }

    // Parse additional arguments for project configuration
    const config = this.parseCreateArgs(args.slice(2));
    
    if (this.projectManager.projectExists(projectId)) {
      throw new Error(`Project ${projectId} already exists`);
    }

    this.projectManager.createProject(projectId, config);
  }

  parseCreateArgs(args) {
    const config = {
      app: {
        id: 'com.oralbibleapp.example',
        name: 'Example App',
        description: 'Example OpenOralBible Client',
        version: '1.0.0',
        versionCode: 1
      },
      translation: {
        key: 'example',
        backend: {
          releaseEndpoint: 'https://content.oralbible.app/api/v1/example/release',
          audioEndpoint: 'https://content.oralbible.app/api/v1/example/audio'
        }
      },
      features: {
        dynamicContent: true,
        bluetoothUpdate: false,
        mediaCanCollapseWhenPlaying: true
      },
      build: {
        keystore: {
          file: 'crypto/release/oba-yetfa.keystore',
          alias: 'oba-yetfa',
          password: '${KEYSTORE_PASSWORD}'
        }
      }
    };

    // Parse command line arguments
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg.startsWith('--id=')) {
        config.app.id = arg.split('=')[1];
      } else if (arg.startsWith('--name=')) {
        config.app.name = arg.split('=')[1];
      } else if (arg.startsWith('--description=')) {
        config.app.description = arg.split('=')[1];
      } else if (arg.startsWith('--key=')) {
        config.translation.key = arg.split('=')[1];
      }
    }

    return config;
  }

  handleList() {
    const projects = this.projectManager.listProjects();
    if (projects.length === 0) {
      console.log('No projects found');
    } else {
      console.log('Available projects:');
      projects.forEach(project => console.log(`  - ${project}`));
    }
  }

  async handleSwitch(args) {
    const projectId = args[1];
    if (!projectId) {
      throw new Error('Project ID is required. Usage: switch <project-id>');
    }

    this.projectManager.switchToProject(projectId);
  }

  async handleBuild(args) {
    const projectId = args[1];
    if (!projectId) {
      throw new Error('Project ID is required. Usage: build <project-id>');
    }

    const result = await this.buildOrchestrator.buildProject(projectId);
    console.log(`Build completed: ${result.outputFile}`);
  }

  async handleBuildAll(args) {
    const options = this.parseBuildAllArgs(args.slice(1));
    const results = await this.buildOrchestrator.buildAllProjects(options);
    this.buildOrchestrator.generateReport(results);
  }

  parseBuildAllArgs(args) {
    const options = { parallel: false, concurrency: 3, filter: null };

    for (const arg of args) {
      if (arg === '--parallel') {
        options.parallel = true;
      } else if (arg.startsWith('--concurrency=')) {
        options.concurrency = parseInt(arg.split('=')[1]);
      } else if (arg.startsWith('--filter=')) {
        options.filter = arg.split('=')[1];
      }
    }

    return options;
  }

  async handleSetup(args) {
    const projectId = args[1];
    if (!projectId) {
      throw new Error('Project ID is required. Usage: setup <project-id>');
    }

    // Switch to project and generate config
    this.projectManager.switchToProject(projectId);
    
    // Generate configuration files
    const { execSync } = require('child_process');
    execSync('node scripts/generate-config.js', { 
      cwd: require('path').join(__dirname, '..'), 
      stdio: 'inherit' 
    });
    
    console.log(`Project ${projectId} setup completed`);
  }

  handleClean() {
    this.buildOrchestrator.clean();
  }

  showHelp() {
    console.log(`
Multi-Project Build System CLI

Usage: node scripts/cli.js <command> [options]

Commands:
  create <project-id> [options]    Create a new project
    Options:
      --id=<app-id>                App ID (e.g., com.oralbibleapp.example)
      --name=<app-name>            App name
      --description=<description>  App description
      --key=<translation-key>      Translation key

  list                            List all available projects

  switch <project-id>             Switch to a project for development

  build <project-id>              Build a single project

  build-all [options]             Build all projects
    Options:
      --parallel                   Build projects in parallel
      --concurrency=<n>           Number of parallel builds (default: 3)
      --filter=<pattern>          Filter projects by name pattern

  setup <project-id>              Setup project (switch + generate config)

  clean                           Clean build artifacts

Examples:
  node scripts/cli.js create papuan-malay --id=com.oralbibleapp.papuanmalay --name="Papuan Malay"
  node scripts/cli.js switch yetfa
  node scripts/cli.js build yetfa
  node scripts/cli.js build-all --parallel --concurrency=5
`);
  }
}

// Run CLI if this file is executed directly
if (require.main === module) {
  const cli = new CLI();
  cli.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = CLI;

