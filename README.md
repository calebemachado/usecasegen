# Development Scripts

This directory contains utility scripts to help with development tasks.

## Create Use Case Script

The `create-use-case.js` script automates the creation of new use cases following the project's architecture pattern.

### Basic Usage

```bash
./scripts/create-use-case.js [domain] [usecase-name] [api-name] [HTTP method]
```

The script will also interactively ask if you want to create a domain model if one doesn't already exist.

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
- `api-name`: The name of the API client to use (e.g., products)
- `HTTP method`: Optional. The HTTP method to use (GET, POST, PUT, PATCH, DELETE). Defaults to GET.

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
