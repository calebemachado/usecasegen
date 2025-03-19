# Use Case Generator Script Documentation

## Overview

The `create-use-case.js` script automates the creation of boilerplate code for implementing new use cases in the your project. This script follows the project's clean architecture pattern and dependency injection approach to ensure consistent implementation across the application.

## Features

- Creates all necessary files and updates configuration files for a new use case
- Creates domain entity model files when needed (optional)
- Uses domain name as default API name if not specified
- Detects and handles tsyringe dependency installation
- Sets up environment variables and project configuration automatically
- Follows the project's architecture patterns and naming conventions
- Supports different HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Auto-generates appropriate API endpoint implementations
- Updates dependency injection container registrations
- Creates server-side actions for Next.js
- Interactive prompting for missing parameters
- Displays a preview of files to be created or updated with confirmation

## Directory Structure

The script generates files in the following directory structure:

```
src/
├── application/
│   └── use-cases/
│       └── <usecase-name>.usecase.ts            # Implementation of the use case
│
├── di/
│   ├── symbols.ts                               # Updated with new use case symbols
│   └── container.ts                             # Updated with use case registration
│
├── domains/
│   └── <domain>/
│       ├── entities/                            # (Not created by script)
│       └── usecases/
│           └── <usecase-name>.usecase.interface.ts  # Interface definition
│
├── infrastructure/
│   └── api/
│       └── <api-name>/
│           └── <api-name>.api.ts                # API client implementation
│
└── presenter/
    └── actions/
        └── <usecaseCamelCase>.action.ts         # Server action
```

Each created file follows the clean architecture pattern, maintaining clear separation of concerns between interface definitions, business logic implementation, infrastructure code, and presentation layer.

## Usage

```bash
./scripts/create-use-case.js [domain] [usecase-name] [api-name] [HTTP method]
```

### Interactive Mode

If any of the required parameters are missing, the script will automatically enter interactive mode and prompt you for the missing values. This is useful for new users or when you can't remember the exact parameter order.

```bash
# Run with no parameters to use fully interactive mode
./scripts/create-use-case.js

# Or provide some parameters and be prompted for the rest
./scripts/create-use-case.js users
```

### Parameters

1. **domain**: The domain area for the use case (e.g., users, products)

   - This represents the business domain the use case belongs to
   - Used for organizing files in appropriate domain directories

2. **usecase-name**: The name of the use case in kebab-case (e.g., get-product)

   - Should clearly describe the operation being performed
   - Will be converted to appropriate case formats for different contexts

3. **api-name**: The name of the API client to use (e.g., products)

   - Represents the API service that will handle the requests
   - Used to properly organize API client code
   - **If not provided**, the domain name will be used by default

4. **HTTP method**: (Optional) The HTTP method to use (GET, POST, PUT, PATCH, DELETE)
   - Defaults to GET if not provided
   - Determines the API request implementation

### Command-line Options

- `--help` or `-h`: Display help information and exit

### Examples

Creating a use case with all parameters specified:

```bash
./scripts/create-use-case.js products get-product products GET
```

Creating a use case with interactive prompts for missing parameters:

```bash
./scripts/create-use-case.js users create-user
# Script will prompt for api-name and HTTP method
```

Running in fully interactive mode:

```bash
./scripts/create-use-case.js
# Script will prompt for all parameters
```

## Generated Files and Updates

The script generates or updates the following files:

### 1. Domain Entity Model (Optional)

Creates `src/domains/<domain>/entities/<domain>.entity.ts` if it doesn't exist and if requested:

- Defines the domain entity interface
- Creates a factory function for creating new entities
- Defines a repository interface for CRUD operations

Example:

```typescript
/**
 * Product entity representing the domain model.
 */
export interface Product {
  id: string;
  // TODO: Add more properties that describe this entity
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Factory function to create a new Product entity.
 *
 * @param {Partial<Product>} data - Initial data for the entity
 * @returns {Product} A new Product entity
 */
export function createProduct(data: Partial<Product> = {}): Product {
  return {
    id: data.id || crypto.randomUUID(),
    // TODO: Initialize other properties with default values or from data
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
    ...data,
  };
}

/**
 * Repository interface for Product entities.
 */
export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findAll(): Promise<Product[]>;
  create(entity: Product): Promise<Product>;
  update(entity: Product): Promise<Product>;
  delete(id: string): Promise<boolean>;
}
```

### 2. Symbol Entries

Updates `src/di/symbols.ts` to add symbols for dependency injection:

- Adds use case symbol (e.g., `GET_PRODUCT_USE_CASE`)
- Adds API symbol if it doesn't exist (e.g., `PRODUCTS`)

### 3. Interface Definition

Creates `src/domains/<domain>/usecases/<usecase-name>.usecase.interface.ts`:

- Defines input/output types for the use case
- Creates interface that extends the base use case interface

Example:

```typescript
import type { IBaseUsecase } from '@/domains/_base/base.usecase';

export type GetProductInput = {
  // TODO: Define input properties for the use case
  id?: string;
};

export type GetProductOutput = {
  // TODO: Define output properties for the use case
  success: boolean;
  data?: any;
};

export interface IGetProductUsecase extends IBaseUsecase<GetProductInput, GetProductOutput> {}
```

### 4. Use Case Implementation

Creates `src/application/use-cases/<usecase-name>.usecase.ts`:

- Implements the use case interface
- Sets up constructor with dependency injection
- Delegates to appropriate API client method

Example:

```typescript
import { API } from '@/di/symbols';
import { inject, injectable } from 'tsyringe';
import { ProductsApi } from '@/infrastructure/api/products/products.api';
import {
  IGetProductUsecase,
  GetProductInput,
  GetProductOutput,
} from '@/domains/products/usecases/get-product.usecase.interface';

@injectable()
export class GetProductUsecase implements IGetProductUsecase {
  constructor(@inject(API.PRODUCTS) private readonly productsApi: ProductsApi) {}

  async execute(request: GetProductInput): Promise<GetProductOutput> {
    return this.productsApi.getProduct(request);
  }
}
```

### 5. API Client Method

Creates or updates `src/infrastructure/api/<api-name>/<api-name>.api.ts`:

- Creates a new API client file if it doesn't exist
- Adds a new method to existing API client
- Configures appropriate HTTP request based on specified method

Example for GET:

```typescript
async getProduct(request: GetProductInput): Promise<GetProductOutput> {
  return await this.apiClient.fetch<GetProductOutput>(`/api/v1/get/product${request.id ? `/${request.id}` : ''}`, {
    method: 'GET',
  });
}
```

### 6. Container Registration

Updates `src/di/container.ts`:

- Adds import statements for new classes
- Registers API client if not already registered
- Registers use case implementation

Example:

```typescript
import { GetProductUsecase } from '@/application/use-cases/get-product.usecase';
import { ProductsApi } from '@/infrastructure/api/products/products.api';

container.registerSingleton(API.PRODUCTS, ProductsApi);
container.registerSingleton(USE_CASES.GET_PRODUCT_USE_CASE, GetProductUsecase);
```

### 7. Server Action

Creates `src/presenter/actions/<usecaseCamelCase>.action.ts`:

- Creates a server action for Next.js
- Sets up container resolution and use case execution

Example:

```typescript
'use server';

import { USE_CASES } from '@/di/symbols';
import { container } from '@/di/container';
import {
  IGetProductUsecase,
  GetProductInput,
} from '@/domains/products/usecases/get-product.usecase.interface';

export async function getProduct(input: GetProductInput) {
  const getProductUsecase = container.resolve<IGetProductUsecase>(USE_CASES.GET_PRODUCT_USE_CASE);
  return await getProductUsecase.execute(input);
}
```

## After Script Execution

After running the script, you should:

1. Review all generated files and customize as needed
2. If a domain model was created, define the specific properties and methods for your domain entity
3. Define the specific input and output types for your use case
4. Implement any specific business logic in the use case
5. Customize the API request implementation if needed
6. Create necessary UI components that will use the new action

If you chose not to create a domain model when prompted but need one later, you can manually create an entity model in `src/domains/<domain>/entities/<domain>.entity.ts`.

## Implementation Notes

- **Interactive Prompting**: The script will prompt for any missing parameters with validation to ensure valid input.
- **Preview and Confirmation**: Before creating any files, the script shows a summary of all files that will be created or updated and requires confirmation from the user.
- **Dependency Management**: The script checks for required dependencies like tsyringe and offers to install them if missing.
- **Environment Configuration**: Automatically creates or updates environment variable files and project configuration.
- **Naming Conventions**: The script automatically converts between different naming conventions (camelCase, PascalCase, CONST_CASE) as appropriate.
- **HTTP Methods**: Different HTTP methods generate different API implementation templates.
- **Error Handling**: The script provides basic error handling for file operations.
- **Existing Files**: The script will not overwrite existing files but will notify you if a file already exists.

## Troubleshooting

If you encounter issues with the script:

1. **API Symbol Already Exists**: If you receive warnings about a symbol already existing, this is normal and the script will use the existing symbol.
2. **Interface Already Exists**: If the interface file already exists, the script will not overwrite it to prevent data loss.
3. **Manual Container Updates**: If you need to manually update the container, ensure you add both the import statement and the registration call.
4. **Interactive Mode Issues**: If the interactive prompts don't work correctly, make sure you're using a compatible terminal that supports readline input.

## Best Practices

1. **Use Descriptive Names**: Choose clear, descriptive names for your use cases that reflect their purpose.
2. **Maintain Separation of Concerns**: Keep business logic in the use case, and API implementation details in the API client.
3. **Define Proper Types**: Always define proper TypeScript types for inputs and outputs.
4. **Follow Clean Architecture**: Respect the project's architecture patterns for maintainability.
5. **Document New Use Cases**: Add appropriate documentation for new use cases to help other developers.
