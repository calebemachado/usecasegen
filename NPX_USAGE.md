# Running the Use Case Generator with npx

This guide explains how to use `npx` to run the use case generator script.

## Local Installation

### Method 1: Using npm link (Development Mode)

1. Navigate to the scripts directory:

   ```bash
   cd scripts
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a global link:

   ```bash
   npm link
   ```

4. Now you can run the script from anywhere using:
   ```bash
   npx usecasegen
   ```

### Method 2: Direct Execution

You can run the script directly without installing it:

```bash
npx ./scripts/create-use-case.js
```

## Global Installation (For Sharing)

If you want to share this tool with your team or the community:

1. Publish it to npm:

   ```bash
   cd scripts
   npm publish
   ```

2. Once published, anyone can run it using:
   ```bash
   npx usecasegen
   ```

## Usage with Parameters

You can provide parameters directly:

```bash
npx usecasegen [domain] [usecase-name] [api-name] [HTTP method]
```

Example:

```bash
npx usecasegen products get-product products GET
```

Or let the script prompt you for missing parameters:

```bash
npx usecasegen
```

## Help

To see the help information:

```bash
npx usecasegen --help
```

## Uninstalling

If you used the npm link method, you can unlink it:

```bash
npm unlink -g usecasegen
```
