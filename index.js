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
    console.log(`CMD : ${command}`)
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
    const additionalArgs = process.argv.slice(3).join(' '); // Join additional arguments
    runCommand(`docker build ${additionalArgs} -t ${dockerImage} -t ${dockerImage}:${version} -t ${dockerImage}:latest .`);
    break;

  case 'publish':
    if (!registry) {
      console.error('Error: Registry must be specified in docker.json for the publish task.');
      process.exit(1);
    }

    if(process.argv.length > 3) {
      version = process.argv[3] || version;
    }
    
    // Building and tagging for both version and latest
    runCommand(`docker login`);//login is executed first because it may ask for cred (but is used only for publish phase)
    runCommand(`docker build -t ${dockerImage}:${version} -t ${dockerImage}:latest -t ${registry}/${dockerImage}:${version} -t ${registry}/${dockerImage}:latest .`);

    // Pushing both tags
    runCommand(`docker push ${registry}/${dockerImage}:${version}`);
    runCommand(`docker push ${registry}/${dockerImage}:latest`);
    console.log(`Published ${registry}/${dockerImage}:${version} and latest`);
    break;

  default:
    console.log('Invalid usage. Please use "build" or "publish".');
    break;
}
