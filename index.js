#!/usr/bin/env node
console.log('Dockflow v1.0.7');
const fs = require('fs');
const {execSync} = require('child_process');
const yargs = require('yargs/yargs');
const {hideBin} = require('yargs/helpers');

// Read configurations
const dockerConfig = fs.existsSync('dockflow.json') ? JSON.parse(fs.readFileSync('dockflow.json', 'utf8')) : {};
const packageJson = fs.existsSync('package.json') ? JSON.parse(fs.readFileSync('package.json', 'utf8')) : {};

let dockerImage = dockerConfig.image || packageJson.name;
const registry = dockerConfig.registry;
let version = dockerConfig.version || packageJson.version || 'latest';
const dockerfile = dockerConfig.dockerfile || 'Dockerfile'; // Default to 'Dockerfile' if not specified in dockflow.json

if (!dockerImage) {
    console.error('Error: Image name must be specified in dockflow.json or package.json.');
    process.exit(1);
}

// Sanitize dockerImage name
dockerImage = sanitizeDockerImageName(dockerImage);

// Function to sanitize Docker image name
function sanitizeDockerImageName(imageName) {
    return imageName
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, '-')
        .replace(/^-+/, '') // Remove leading hyphens
        .replace(/-+/g, '-'); // Replace multiple sequential hyphens with a single one
}

// Function to check if Docker image version exists in the registry
function checkDockerImageVersionExists(image, version, registry) {
    try {
        execSync(`docker manifest inspect ${registry}/${image}:${version}`, {stdio: 'pipe'});
        return true;
    } catch {
        return false;
    }
}

// Function to get version from a file
function getVersionFromFile(filePath) {
    if (fs.existsSync(filePath)) {
        const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return fileContent.version;
    } else {
        console.error(`Error: Specified version file ${filePath} does not exist.`);
        process.exit(1);
    }
}

// Check if version starts with 'file:' and extract version from the specified file
if (version.startsWith('file:')) {
    const filePath = version.substring(5);
    version = getVersionFromFile(filePath);
}

// Function to execute shell commands
function runCommand(command) {
    try {
        console.log(`CMD : ${command}`)
        execSync(command, {stdio: 'inherit'});
    } catch (error) {
        console.error(`Execution failed: ${error}`);
        process.exit(1);
    }
}

// Parse command line arguments using yargs
const argv = yargs(hideBin(process.argv))
    .version(false) // Disable yargs' built-in version functionality
    .command('build', 'Build the docker image')
    .command('publish', 'Publish the docker image', {
        force: {
            description: 'Force the action even if the version exists',
            type: 'boolean',
            default: false
        },
        version: {
            description: 'Specify the version to publish',
            type: 'string'
        }
    })
    .demandCommand(1, 'You need at least one command before moving on')
    .help()
    .argv;

console.log("Executing dockflow in :" + process.cwd());

// Determine action based on command-line argument
switch (argv._[0]) {
    case 'build':
        const additionalArgs = argv._.slice(1).join(' '); // Join additional arguments
        runCommand(`docker build -f ${dockerfile} ${additionalArgs} --build-arg BUILD_VERSION=${version} -t ${dockerImage} -t ${dockerImage}:${version} -t ${dockerImage}:latest .`);
        break;

    case 'publish':
        if (!registry) {
            console.error('Error: Registry must be specified in dockflow.json for the publish task.');
            process.exit(1);
        }

        if (argv.version) {
            version = argv.version;
        }

        if (!argv.force && checkDockerImageVersionExists(dockerImage, version, registry)) {
            console.error(`Error: Version ${version} of ${dockerImage} already exists in ${registry}. Use --force to override.`);
            process.exit(1);
        }

        runCommand(`docker login`);
        runCommand(`docker build -f ${dockerfile} --build-arg BUILD_VERSION=${version} -t ${dockerImage}:${version} -t ${dockerImage}:latest -t ${registry}/${dockerImage}:${version} -t ${registry}/${dockerImage}:latest .`);
        runCommand(`docker push ${registry}/${dockerImage}:${version}`);
        runCommand(`docker push ${registry}/${dockerImage}:latest`);
        console.log(`Published ${registry}/${dockerImage}:${version} and latest`);
        break;

    default:
        console.log('Invalid usage. Please use "build" or "publish".');
        break;
}
