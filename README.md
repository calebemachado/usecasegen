# Development Scripts

This directory contains utility scripts to help with development tasks.

## Create Use Case Script

> ⚠️ **Note:** This package is highly opinionated and implements a very specific Clean Architecture pattern with TypeScript, Dependency Injection (using tsyringe), and a structured folder hierarchy. It's designed for developers who want to enforce a consistent architecture across their projects.

The `create-use-case.js` script automates the creation of new use cases following a strict clean architecture pattern with clear separation of concerns. It enforces a specific project structure and coding style based on established clean architecture principles.

## CI/CD and Publishing

This project uses GitHub Actions for continuous integration and deployment:

- **CI Workflow**: Runs tests, linting, and formatting checks on every push and pull request
- **NPM Publishing**: Automatically publishes to npm when a new GitHub release is created

To publish a new version to npm:
1. Update the version in `package.json`
2. Create a new GitHub release with a tag matching the version number
3. The publishing workflow will automatically run tests and publish to npm

### Architectural Approach

The architecture enforced by this script follows these key principles:

- **Domain-Driven Design**: Domains are central organizing structures
- **Use-Case Centric**: Business logic is encapsulated in use cases
- **Dependency Injection**: Using tsyringe for inversion of control
- **Clean Architecture Layers**: Domains, Application, Infrastructure, and Presenter
- **Interface Segregation**: Interfaces define contracts between layers
- **Separation of Concerns**: Each file has a single, well-defined responsibility

If you're looking for a more flexible or different architectural approach, this tool may not be suitable for your project.

### Basic Usage

```bash
./scripts/create-use-case.js [domain] [usecase-name] [api-name] [HTTP method]
```

The script will also interactively ask if you want to create a domain model if one doesn't already exist.

#### Preview and Confirmation

Before creating any files, the script will display a summary of all files that will be created or updated and ask for confirmation to proceed. This allows you to verify the changes before they are made.

#### Interactive Mode

The script now supports interactive mode! If any parameters are missing, the script will prompt for them:

```bash
# Run with no parameters for fully interactive mode
./scripts/create-use-case.js

# Or provide partial parameters and be prompted for the rest
./scripts/create-use-case.js users
```

#### Parameters

- `domain`: The domain area for the use case (e.g., users, products)
- `usecase-name`: The name of the use case in kebab-case (e.g., get-product)
- `api-name`: The name of the API client to use (e.g., products). If not provided, the domain name will be used by default.
- `HTTP method`: Optional. The HTTP method to use (GET, POST, PUT, PATCH, DELETE). Defaults to GET.

#### Dependencies

The script will check if the required dependency `tsyringe` is installed in your project. If not, it will:
1. Ask if you want to install it
2. If confirmed, install tsyringe and reflect-metadata
3. Create or update the necessary configuration files (tsconfig.json)
4. Set up environment variable files (.env, .env.example)

This ensures that all the necessary infrastructure for dependency injection is properly configured.

After providing these parameters, the script will check if a domain entity model exists and offer to create one if needed.

#### Command-line Options

- `--help` or `-h`: Display help information and exit

#### Example

```bash
./scripts/create-use-case.js products get-product products GET
```

This will generate all necessary files in the following directory structure:
```
src/
├── application/use-cases/          # Use case implementation
├── di/                             # Updated symbols and container
├── domains/<domain>/usecases/      # Interface definition
├── infrastructure/api/<api-name>/  # API client method
└── presenter/actions/              # Server action
```

For comprehensive documentation, including detailed explanations of each generated file, examples, best practices, and troubleshooting tips, see the [Use Case Generator Documentation](./DOCUMENTATION.md).

## Test Script

The `test-usecase-creation.js` script is provided to verify that the use case creation script works correctly.

### Usage

```bash
./scripts/test-usecase-creation.js
```

This script:

1. Creates a test use case in the `test` domain
2. Verifies all expected files are created
3. Checks that the symbols and container files are updated correctly
4. Cleans up the test files afterward

**Important:** After running the test, you should manually revert any changes to `src/di/symbols.ts` and `src/di/container.ts` as these files will be modified by the test. You can use Git to restore them:

```bash
git checkout -- src/di/symbols.ts src/di/container.ts
```
