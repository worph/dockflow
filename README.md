# DockFlow

## Overview
DockFlow is a Node.js script that streamlines Docker image operations, such as building, caching, and publishing. It's designed to simplify Docker image management, making it an invaluable tool for developers and DevOps engineers. DockFlow centralizes all necessary information for Docker image publication in a single `dockflow.json` file, with the option to use details directly from `package.json`.

## Features
- Builds Docker images without needing to specify the image name.
- Automatically tags images with the correct version.
- Simple and clear command-line arguments for ease of use.
- Facilitates easy publication of images to specified registries.
- Enables the passing of build-specific details such as version as an environment variable to the Docker container.

## Prerequisites
- Node.js installed on your machine.
- Access to a Docker environment.
- Properly formatted `dockflow.json` and/or `package.json` files in your project directory.

## `dockflow.json` Format

Ensure your `dockflow.json` file is properly configured. If certain parameters are not provided, the script defaults to values from `package.json`.

```json
{
  "image": "<optional: defaults to package.json name>",
  "registry": "<optional> will publish the image on the public docker hub if not specified",
  "version": "<optional: defaults to package.json version>",
  "dockerfile": "<optional: defaults to 'Dockerfile'>"
}
```

## Installation
Install DockFlow using npm:

```bash
npm install dockflow
```

## Usage
Navigate to your project directory and run DockFlow commands using Node.js. The script recognizes the following commands:

```bash
npx dockflow build            // Build Docker image
npx dockflow publish          // Publish Docker image
```

### Building Docker Images
To build a Docker image:

```bash
npx dockflow build
```

The image name is optional and defaults to the name specified in `package.json`. During the build, you can pass the version dynamically which will be available as an environment variable `BUILD_VERSION` inside the container:

```bash
docker build --build-arg BUILD_VERSION=$(require('../dockflow.json').version || 'latest') ...
```

To ensure the `BUILD_VERSION` environment variable is set inside your Docker container, your Dockerfile must include:

```Dockerfile
ARG BUILD_VERSION
ENV BUILD_VERSION=$BUILD_VERSION
```

### Publishing Docker Images
To publish a Docker image:

```bash
npx dockflow publish
```

The script will use the registry and version details from `dockflow.json`, defaulting to `package.json` if not specified.

### Additional Tips
When using the `dockflow.json` as a source for the image, you can display the version of the image directly in the service log for traceability:

```javascript
console.log("Docker image version: " + (require('../dockflow.json').version || "latest"));
```

For the build task, you can add parameters, and it will append the image name automatically:

```bash
npx dockflow build --no-cache --progress=plain
```

## to publish on npm
npm login
npm publish