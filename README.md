# Use Case Generator

A utility for generating use case files following the clean architecture pattern with dependency injection.

## Installation

```bash
npm install usecasegen
```

Or globally:

```bash
npm install -g usecasegen
```

## Features

- Generates complete use case implementations with a single command
- Creates all necessary files following clean architecture principles:
  - Domain-level interface
  - Application-level implementation
  - Infrastructure-level API client
  - Server-side actions for Next.js
- Sets up dependency injection with tsyringe
- Follows a consistent pattern for all your use cases
- Supports all common HTTP methods (GET, POST, PUT, PATCH, DELETE)

## Usage

### Interactive Mode

Run the generator without arguments to use interactive mode:

```bash
npx generate-usecase
```

This will prompt you for:
- Domain name (in kebab-case, e.g., "user-management")
- Use case name (in kebab-case, e.g., "create-user")
- API name (in kebab-case, e.g., "user-api")
- HTTP method (GET, POST, PUT, PATCH, DELETE)

### Command Line Arguments

You can also run it with command line arguments:

```bash
npx generate-usecase --domain user-management --usecase create-user --api user-api --method POST
```

Or with shorthand arguments:

```bash
npx generate-usecase -d user-management -u create-user -a user-api -m POST
```

### Using in Code

You can also use the generator programmatically:

```javascript
const { generateUsecase } = require('usecasegen');

const results = generateUsecase({
  domain: 'user-management',
  usecaseName: 'create-user',
  apiName: 'user-api',
  httpMethod: 'POST'
});
```

## Generated Files

The generator creates the following files:

1. **Domain Interface**: 
   - `src/domains/{domain}/usecases/{usecase}.usecase.interface.ts`
   - Defines input and output types and the interface for the use case

2. **Application Implementation**:
   - `src/application/use-cases/{usecase}.usecase.ts`
   - Implements the use case logic with dependency injection

3. **API Client**:
   - `src/infrastructure/api/{api-name}/{api-name}.api.ts`
   - Implements the API client for making HTTP requests

4. **Server Action**:
   - `src/presenter/actions/{usecaseCamelCase}.action.ts`
   - Creates a server-side action for Next.js

5. **DI Container**:
   - Updates or creates `src/di/symbols.ts` to register the use case symbol
   - Updates or creates `src/di/container.ts` to register the use case in the DI container

## Requirements

- Node.js 14 or higher
- TypeScript (if using TypeScript files)
- tsyringe (automatically checked and installed if needed)

## License

MIT
