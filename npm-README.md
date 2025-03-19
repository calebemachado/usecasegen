# UseCaseGen

A powerful tool for generating Clean Architecture use case boilerplate code for TypeScript projects.

[![npm version](https://img.shields.io/npm/v/usecasegen.svg)](https://www.npmjs.com/package/usecasegen)
[![license](https://img.shields.io/npm/l/usecasegen.svg)](https://github.com/Clsax/usecasegen/blob/main/LICENSE)

## Features

✅ Automatically generates all files needed for a Clean Architecture use case  
✅ Creates domain models and entities  
✅ Handles dependency injection with tsyringe  
✅ Supports multiple HTTP methods  
✅ Creates server actions for Next.js  
✅ Interactive mode with prompts  
✅ Preview of files before creation

## Installation

You can use this tool without installation via npx:

```bash
npx usecasegen
```

Or install it globally:

```bash
npm install -g usecasegen
```

## Usage

### Interactive Mode

Run the tool without parameters to use interactive mode:

```bash
npx usecasegen
```

The tool will prompt you for all needed information.

### With Parameters

```bash
npx usecasegen [domain] [usecase-name] [api-name] [HTTP method]
```

Example:

```bash
npx usecasegen products get-product products GET
```

### Parameters

- `domain`: The domain area for the use case (e.g., users, products)
- `usecase-name`: The name of the use case in kebab-case (e.g., get-product)
- `api-name`: The name of the API client to use (defaults to domain name if not provided)
- `HTTP method`: Optional. The HTTP method to use (GET, POST, PUT, PATCH, DELETE). Defaults to GET.

## Requirements

- Node.js >= 14.0.0
- For dependency injection features: tsyringe and reflect-metadata (will be installed if not present)

## Documentation

For complete documentation, see the [full documentation](https://github.com/Clsax/usecasegen/blob/main/DOCUMENTATION.md).

## License

MIT
