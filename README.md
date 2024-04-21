# DockFlow

## Overview
DockFlow is a Node.js script that streamlines Docker image operations, such as building, caching, and publishing. It's designed to simplify Docker image management, making it an invaluable tool for developers and DevOps engineers. DockFlow centralizes all necessary information for Docker image publication in a single `docker.json` file, with the option to use details directly from `package.json`.

## Features
- Builds Docker images without needing to specify the image name.
- Automatically tags images with the correct version.
- Simple and clear command-line arguments for ease of use.
- Facilitates easy publication of images to specified registries.

## Prerequisites
- Node.js installed on your machine.
- Access to a Docker environment.
- Properly formatted `docker.json` and/or `package.json` files in your project directory.

## `docker.json` Format

Ensure your docker.json file is properly configured. If certain parameters are not provided, the script defaults to values from package.json.

`dockflow.json` Format:
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

```css
npm i dockflow
```

## Usage
Navigate to your project directory and run DockFlow commands using Node.js. The script recognizes the following commands:

```arduino
npx dockflow build            // Build Docker image
npx dockflow publish          // Publish Docker image
```

## Building Docker Images
To build a Docker image:

```arduino
npx dockflow build
```

The image name is optional and defaults to the name specified in package.json.

## Publishing Docker Images
To publish a Docker image:

```arduino
npx dockflow publish
```

The script will use the registry and version details from docker.json, defaulting to package.json if not specified.

## tips
When using the dockerflow.json as a source for the image you can display the version of the image directy in the service log for tracability:
```javascript
console.log("Docker image version : "+(require('../dockerflow.json').version || "latest"));
```

For the build task you can add parameters and it will appends the image name (-t):
```arduino
npx dockflow build --no-cache --progress=plain
```