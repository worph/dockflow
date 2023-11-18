#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

// Read configurations
const dockerConfig = fs.existsSync('dockflow.json') ? JSON.parse(fs.readFileSync('dockflow.json', 'utf8')) : {};
const packageJson = fs.existsSync('package.json') ? JSON.parse(fs.readFileSync('package.json', 'utf8')) : {};

const dockerImage = dockerConfig.image || packageJson.name;
const registry = dockerConfig.registry;//if the registry is not specified, it will be published on the public docker hub
let version = dockerConfig.version || packageJson.version || 'latest';

if(!dockerImage){
  console.error('Error: Image name must be specified in docker.json or package.json.');
  process.exit(1);
}

// Function to execute shell commands
function runCommand(command) {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Execution failed: ${error}`);
    process.exit(1);
  }
}

console.log("Executing dockflow in :"+process.cwd());

// Determine action based on command-line argument
const action = process.argv[2];

switch (action) {
  case 'build':
    runCommand(`docker build -t ${dockerImage} .`);
    break;

  case 'publish':
    if (!registry) {
      console.error('Error: Registry must be specified in docker.json for the publish task.');
      process.exit(1);
    }

    if(process.argv.length > 3) {
      version = process.argv[3] || version;
    }

    runCommand(`docker build -t ${dockerImage}:${version} .`);
    runCommand(`docker login`);
    runCommand(`docker tag ${dockerImage}:${version} ${registry}/${dockerImage}:${version}`);
    runCommand(`docker push ${registry}/${dockerImage}:${version}`);
    console.log(`Published ${registry}/${dockerImage}:${version}`);
    break;

  default:
    console.log('Invalid usage. Please use "build" or "publish".');
    break;
}
