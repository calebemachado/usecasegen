#!/usr/bin/env node

/**
 * @fileoverview Script to generate boilerplate code for a new use case following
 * the project's clean architecture pattern.
 *
 * @description
 * This script automates the creation of all necessary files and updates relevant
 * configuration files when adding a new use case to the application. It follows
 * the project's architecture patterns and dependency injection approach.
 *
 * The script creates:
 * 1. Domain entity model (optional)
 * 2. Symbol entries in symbols.ts
 * 3. Interface definitions for the use case
 * 4. Use case implementation classes
 * 5. API client methods
 * 6. Container registrations for dependency injection
 * 7. Server actions for Next.js
 *
 * Note: This script uses CommonJS require() syntax deliberately since it's a Node.js
 * utility script that runs outside the TypeScript/ESM context of the main application.
 *
 * @example
 * ```bash
 * ./scripts/create-use-case.js products get-product products GET
 * ```
 */
const fs = require('fs');
const path = require('path');
const readline = require('readline');

/**
 * Creates and returns a readline interface for user input/output
 * @returns {readline.Interface} The readline interface
 */
function createPrompt() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

/**
 * Prompts the user for input with a question
 * @param {readline.Interface} rl - The readline interface
 * @param {string} question - The question to ask
 * @returns {Promise<string>} A promise that resolves with the user's input
 */
function prompt(rl, question) {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer);
    });
  });
}

/**
 * Validates that a parameter is not empty
 * @param {string} value - The value to validate
 * @param {string} paramName - The name of the parameter
 * @returns {boolean} True if the value is valid, false otherwise
 */
function validateParam(value, paramName) {
  if (!value || value.trim() === '') {
    console.log(`Error: ${paramName} cannot be empty`);
    return false;
  }
  return true;
}

/**
 * Validates HTTP method parameter
 * @param {string} method - The HTTP method to validate
 * @returns {boolean} True if the method is valid, false otherwise
 */
function validateHttpMethod(method) {
  const validMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
  const upperMethod = method.toUpperCase();

  if (!validMethods.includes(upperMethod)) {
    console.log(`Error: HTTP method must be one of: ${validMethods.join(', ')}`);
    return false;
  }
  return true;
}

/**
 * Validates yes/no response
 * @param {string} value - The value to validate
 * @returns {boolean|null} True if 'yes', false if 'no', null if invalid
 */
function validateYesNo(value) {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'y' || normalized === 'yes') {
    return true;
  } else if (normalized === 'n' || normalized === 'no') {
    return false;
  } else {
    console.log("Error: Please enter 'yes'/'y' or 'no'/'n'");
    return null;
  }
}

/**
 * Main script execution
 */
async function main() {
  // Display usage if requested with --help
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log('Usage: node create-use-case.js <domain> <usecase-name> <api-name> [HTTP method]');
    console.log('Example: node create-use-case.js products get-product products GET');
    console.log('\nIf parameters are missing, you will be prompted for them.');
    console.log('The script will also ask if you want to create a domain entity model.');
    process.exit(0);
  }

  let domain = process.argv[2];
  let usecaseName = process.argv[3];
  let apiName = process.argv[4];
  let httpMethod = process.argv[5];
  let createDomainModel = null;

  // Create a readline interface if we need to prompt for any parameters
  const promptNeeded = !domain || !usecaseName || !apiName || !httpMethod;
  let rl;

  if (promptNeeded) {
    rl = createPrompt();
    console.log('Interactive mode: You will be prompted for any missing parameters.\n');
  }

  // Prompt for missing parameters
  if (!domain) {
    if (!rl) rl = createPrompt();
    do {
      domain = await prompt(rl, 'Enter domain (e.g., users, products): ');
    } while (!validateParam(domain, 'Domain'));
  }

  if (!usecaseName) {
    if (!rl) rl = createPrompt();
    do {
      usecaseName = await prompt(rl, 'Enter use case name in kebab-case (e.g., get-product): ');
    } while (!validateParam(usecaseName, 'Use case name'));
  }

  if (!apiName) {
    if (!rl) rl = createPrompt();
    do {
      apiName = await prompt(rl, 'Enter API name (e.g., products): ');
    } while (!validateParam(apiName, 'API name'));
  }

  if (!httpMethod) {
    if (!rl) rl = createPrompt();
    do {
      httpMethod = await prompt(
        rl,
        'Enter HTTP method (GET, POST, PUT, PATCH, DELETE) [default: GET]: '
      );
      // Default to GET if empty
      if (!httpMethod || httpMethod.trim() === '') {
        httpMethod = 'GET';
        break;
      }
    } while (!validateHttpMethod(httpMethod));
  }

  // Ask if user wants to create a domain model
  if (!rl) rl = createPrompt();
  
  // Check if domain model already exists
  const domainModelPath = path.resolve(process.cwd(), `src/domains/${domain}/entities/${domain}.entity.ts`);
  const domainModelExists = fs.existsSync(domainModelPath);
  
  if (domainModelExists) {
    console.log(`Domain model already exists at: ${domainModelPath}`);
    createDomainModel = false;
  } else {
    do {
      const answer = await prompt(
        rl,
        `Would you like to create a domain model for '${domain}'? (yes/no): `
      );
      createDomainModel = validateYesNo(answer);
    } while (createDomainModel === null);
  }

  // Close the readline interface if it was created
  if (rl) {
    rl.close();
  }

  // Normalize HTTP method
  httpMethod = httpMethod.toUpperCase();

  // Confirm the parameters
  console.log('\nCreating use case with the following parameters:');
  console.log(`Domain: ${domain}`);
  console.log(`Use case name: ${usecaseName}`);
  console.log(`API name: ${apiName}`);
  console.log(`HTTP method: ${httpMethod}`);
  console.log(`Create domain model: ${createDomainModel ? 'Yes' : 'No'}`);
  console.log();

  // Format conversions for naming conventions
  const usecaseCamelCase = toCamelCase(usecaseName);
  const usecasePascalCase = toPascalCase(usecaseName);
  const usecaseConstCase = toConstCase(usecaseName);
  const usecaseSymbol = `${usecaseConstCase}_USE_CASE`;
  const apiSymbol = toConstCase(apiName);
  const apiPascalCase = toPascalCase(apiName);
  const domainPascalCase = toPascalCase(domain);

  // Create required directory structure
  ensureDirectoryExists(`src/domains/${domain}/entities`);
  ensureDirectoryExists(`src/domains/${domain}/usecases`);
  ensureDirectoryExists(`src/application/use-cases`);
  ensureDirectoryExists(`src/infrastructure/api/${apiName}`);
  ensureDirectoryExists(`src/presenter/actions`);

  // Create domain model if requested
  if (createDomainModel) {
    createDomainModelFile(domain, domainPascalCase);
  }

  // Execute the creation steps
  updateSymbolsFile(usecaseSymbol, apiSymbol);
  
  if (!createDomainModel) {
    console.log(
      `Note: You may need to create a model in src/domains/${domain}/entities/${domain}.entity.ts if it doesn't exist`
    );
  }
  
  createUsecaseInterfaceFile(domain, usecaseName, usecasePascalCase);
  createUsecaseImplementationFile(domain, usecaseName, usecasePascalCase, apiPascalCase, apiSymbol);
  createOrUpdateApiClientFile(domain, apiName, usecaseName, usecasePascalCase, httpMethod);
  updateContainerFile(usecasePascalCase, usecaseSymbol, apiPascalCase, apiSymbol);
  createActionFile(usecaseCamelCase, usecasePascalCase, usecaseSymbol);

  // Output completion message and next steps
  console.log('\n✅ Use case creation completed!');
  console.log('\nNext steps:');
  console.log(`1. Review and customize the generated files`);
  
  if (createDomainModel) {
    console.log(`2. Update the domain model in src/domains/${domain}/entities/${domain}.entity.ts`);
  }
  
  console.log(
    `${createDomainModel ? '3' : '2'}. Implement the API request in src/infrastructure/api/${apiName}/${apiName}.api.ts`
  );
  console.log(`${createDomainModel ? '4' : '3'}. Create necessary components or pages that will use the new action`);
}

// Start the script
main().catch(error => {
  console.error('An error occurred:', error);
  process.exit(1);
});

/**
 * Converts a kebab-case string to camelCase.
 *
 * @param {string} str - The kebab-case string to convert
 * @returns {string} The converted camelCase string
 *
 * @example
 * // Returns "getProduct"
 * toCamelCase("get-product")
 */
function toCamelCase(str) {
  return str
    .split('-')
    .map((word, index) => {
      if (index === 0) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('');
}

/**
 * Converts a kebab-case string to PascalCase.
 *
 * @param {string} str - The kebab-case string to convert
 * @returns {string} The converted PascalCase string
 *
 * @example
 * // Returns "GetProduct"
 * toPascalCase("get-product")
 */
function toPascalCase(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

/**
 * Converts a kebab-case string to CONST_CASE.
 *
 * @param {string} str - The kebab-case string to convert
 * @returns {string} The converted CONST_CASE string
 *
 * @example
 * // Returns "GET_PRODUCT"
 * toConstCase("get-product")
 */
function toConstCase(str) {
  return str.toUpperCase().replace(/-/g, '_');
}

/**
 * Ensures that a directory exists, creating it if necessary.
 *
 * @param {string} dirPath - The relative path of the directory
 */
function ensureDirectoryExists(dirPath) {
  const absolutePath = path.resolve(process.cwd(), dirPath);

  if (!fs.existsSync(absolutePath)) {
    fs.mkdirSync(absolutePath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

/**
 * Updates the symbols.ts file to add the new use case and API symbols.
 *
 * @param {string} usecaseSymbol - The use case symbol to add
 * @param {string} apiSymbol - The API symbol to add
 */
function updateSymbolsFile(usecaseSymbol, apiSymbol) {
  const symbolsPath = path.resolve(process.cwd(), 'src/di/symbols.ts');

  try {
    let content = fs.readFileSync(symbolsPath, 'utf8');

    if (!content.includes(`${apiSymbol}: Symbol('${apiSymbol}')`)) {
      content = content.replace(
        /export const API = {([^}]*)};/s,
        `export const API = {$1  ${apiSymbol}: Symbol('${apiSymbol}'),\n};`
      );
    }

    if (!content.includes(`${usecaseSymbol}: Symbol('${usecaseSymbol}')`)) {
      content = content.replace(
        /export const USE_CASES = {([^}]*)};/s,
        `export const USE_CASES = {$1  ${usecaseSymbol}: Symbol('${usecaseSymbol}'),\n};`
      );
    }

    fs.writeFileSync(symbolsPath, content);
    console.log('✅ Updated symbols.ts');
  } catch (error) {
    console.error('Failed to update symbols.ts:', error);
  }
}

/**
 * Creates the interface file for the use case.
 *
 * @param {string} domain - The domain name
 * @param {string} usecaseName - The use case name in kebab-case
 * @param {string} usecasePascalCase - The use case name in PascalCase
 */
function createUsecaseInterfaceFile(domain, usecaseName, usecasePascalCase) {
  const interfacePath = path.resolve(
    process.cwd(),
    `src/domains/${domain}/usecases/${usecaseName}.usecase.interface.ts`
  );

  if (!fs.existsSync(interfacePath)) {
    const content = `import type { IBaseUsecase } from "@/domains/_base/base.usecase"

export type ${usecasePascalCase}Input = {
  // TODO: Define input properties for the use case
  id?: string;
}

export type ${usecasePascalCase}Output = {
  // TODO: Define output properties for the use case
  success: boolean;
  data?: any;
}

export interface I${usecasePascalCase}Usecase extends IBaseUsecase<${usecasePascalCase}Input, ${usecasePascalCase}Output> {}
`;

    fs.writeFileSync(interfacePath, content);
    console.log(`✅ Created interface file: ${interfacePath}`);
  } else {
    console.log(`⚠️ Interface file already exists at: ${interfacePath}`);
  }
}

/**
 * Creates the implementation file for the use case.
 *
 * @param {string} domain - The domain name
 * @param {string} usecaseName - The use case name in kebab-case
 * @param {string} usecasePascalCase - The use case name in PascalCase
 * @param {string} apiPascalCase - The API name in PascalCase
 * @param {string} apiSymbol - The API symbol
 */
function createUsecaseImplementationFile(
  domain,
  usecaseName,
  usecasePascalCase,
  apiPascalCase,
  apiSymbol
) {
  const implementationPath = path.resolve(
    process.cwd(),
    `src/application/use-cases/${usecaseName}.usecase.ts`
  );

  if (!fs.existsSync(implementationPath)) {
    const content = `import { API } from "@/di/symbols"
import { inject, injectable } from "tsyringe"
import { ${apiPascalCase}Api } from "@/infrastructure/api/${apiName}/${apiName}.api"
import { I${usecasePascalCase}Usecase, ${usecasePascalCase}Input, ${usecasePascalCase}Output } from "@/domains/${domain}/usecases/${usecaseName}.usecase.interface"

@injectable()
export class ${usecasePascalCase}Usecase implements I${usecasePascalCase}Usecase {
  constructor(@inject(API.${apiSymbol}) private readonly ${toCamelCase(
      apiName
    )}Api: ${apiPascalCase}Api) {}

  async execute(request: ${usecasePascalCase}Input): Promise<${usecasePascalCase}Output> {
    return this.${toCamelCase(apiName)}Api.${toCamelCase(usecaseName)}(request)
  }
}
`;

    fs.writeFileSync(implementationPath, content);
    console.log(`✅ Created implementation file: ${implementationPath}`);
  } else {
    console.log(`⚠️ Implementation file already exists at: ${implementationPath}`);
  }
}

/**
 * Creates or updates the API client file to include the new method.
 *
 * @param {string} domain - The domain name
 * @param {string} apiName - The API name
 * @param {string} usecaseName - The use case name in kebab-case
 * @param {string} usecasePascalCase - The use case name in PascalCase
 * @param {string} httpMethod - The HTTP method to use
 */
function createOrUpdateApiClientFile(domain, apiName, usecaseName, usecasePascalCase, httpMethod) {
  const apiClientPath = path.resolve(
    process.cwd(),
    `src/infrastructure/api/${apiName}/${apiName}.api.ts`
  );

  if (!fs.existsSync(apiClientPath)) {
    // Create new API client file
    const content = `import { BASE } from '@/di/symbols'
import { inject, injectable } from 'tsyringe'
import { ApiClient } from '@/infrastructure/utils/apiClient'

import type { ${usecasePascalCase}Input, ${usecasePascalCase}Output } from '@/domains/${domain}/usecases/${usecaseName}.usecase.interface'

@injectable()
export class ${toPascalCase(apiName)}Api {
  constructor(@inject(BASE.API_CLIENT) private readonly apiClient: ApiClient) {}

  async ${toCamelCase(
    usecaseName
  )}(request: ${usecasePascalCase}Input): Promise<${usecasePascalCase}Output> {
    ${generateApiMethodBody(usecaseName, usecasePascalCase, httpMethod)}
  }
}
`;

    fs.writeFileSync(apiClientPath, content);
    console.log(`✅ Created API client file: ${apiClientPath}`);
  } else {
    // Update existing API client file
    let content = fs.readFileSync(apiClientPath, 'utf8');

    // Check if the method already exists
    if (!content.includes(`async ${toCamelCase(usecaseName)}`)) {
      // Add import for the new use case types
      if (!content.includes(`${usecasePascalCase}Input`)) {
        const importStatement = `import type { ${usecasePascalCase}Input, ${usecasePascalCase}Output } from '@/domains/${domain}/usecases/${usecaseName}.usecase.interface'`;
        content = content.replace(/import.*from.*\n/, match => match + importStatement + '\n');
      }

      // Add the new method
      const methodContent = `\n  async ${toCamelCase(
        usecaseName
      )}(request: ${usecasePascalCase}Input): Promise<${usecasePascalCase}Output> {
    ${generateApiMethodBody(usecaseName, usecasePascalCase, httpMethod)}
  }\n}`;

      content = content.replace(/}$/, methodContent);

      fs.writeFileSync(apiClientPath, content);
      console.log(`✅ Updated API client file with new method: ${apiClientPath}`);
    } else {
      console.log(`⚠️ Method already exists in API client: ${apiClientPath}`);
    }
  }
}

/**
 * Generates the API method body based on the HTTP method.
 *
 * @param {string} usecaseName - The use case name in kebab-case
 * @param {string} usecasePascalCase - The use case name in PascalCase
 * @param {string} httpMethod - The HTTP method to use
 * @returns {string} The generated method body
 */
function generateApiMethodBody(usecaseName, usecasePascalCase, httpMethod) {
  const endpoint = `/api/v1/${usecaseName.replace(/-/g, '/')}`;

  switch (httpMethod.toUpperCase()) {
    case 'GET':
      return `return await this.apiClient.fetch<${usecasePascalCase}Output>(\`${endpoint}\${request.id ? \`/\${request.id}\` : ''}\`, {
      method: 'GET',
    });`;

    case 'POST':
      return `return await this.apiClient.fetch<${usecasePascalCase}Output>('${endpoint}', {
      method: 'POST',
      body: JSON.stringify(request),
    });`;

    case 'PUT':
      return `return await this.apiClient.fetch<${usecasePascalCase}Output>(\`${endpoint}/\${request.id}\`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });`;

    case 'PATCH':
      return `return await this.apiClient.fetch<${usecasePascalCase}Output>(\`${endpoint}/\${request.id}\`, {
      method: 'PATCH',
      body: JSON.stringify(request),
    });`;

    case 'DELETE':
      return `return await this.apiClient.fetch<${usecasePascalCase}Output>(\`${endpoint}/\${request.id}\`, {
      method: 'DELETE',
    });`;

    default:
      return `// TODO: Implement the API method for ${httpMethod}
    throw new Error('Not implemented');`;
  }
}

/**
 * Updates the container.ts file to register the new use case and API.
 *
 * @param {string} usecasePascalCase - The use case name in PascalCase
 * @param {string} usecaseSymbol - The use case symbol
 * @param {string} apiPascalCase - The API name in PascalCase
 * @param {string} apiSymbol - The API symbol
 */
function updateContainerFile(usecasePascalCase, usecaseSymbol, apiPascalCase, apiSymbol) {
  const containerPath = path.resolve(process.cwd(), 'src/di/container.ts');

  try {
    let content = fs.readFileSync(containerPath, 'utf8');

    // Add import statements if they don't exist
    const usecaseImport = `import { ${usecasePascalCase}Usecase } from '@/application/use-cases/${usecaseName}.usecase';`;
    const apiImport = `import { ${apiPascalCase}Api } from '@/infrastructure/api/${apiName}/${apiName}.api';`;

    if (!content.includes(usecasePascalCase)) {
      const importSection = content.match(/import.*from.*\n/g);
      const lastImport = importSection[importSection.length - 1];
      content = content.replace(lastImport, lastImport + usecaseImport + '\n');
    }

    if (!content.includes(apiPascalCase) && !content.includes(`${apiPascalCase}Api`)) {
      const importSection = content.match(/import.*from.*\n/g);
      const lastImport = importSection[importSection.length - 1];
      content = content.replace(lastImport, lastImport + apiImport + '\n');
    }

    // Add registrations if they don't exist
    const apiRegistration = `container.registerSingleton(API.${apiSymbol}, ${apiPascalCase}Api);`;
    const usecaseRegistration = `container.registerSingleton(USE_CASES.${usecaseSymbol}, ${usecasePascalCase}Usecase);`;

    if (!content.includes(`API.${apiSymbol}`)) {
      content = content.replace(
        /export \{ container \};/,
        apiRegistration + '\n' + usecaseRegistration + '\n\nexport { container };'
      );
    } else if (!content.includes(`USE_CASES.${usecaseSymbol}`)) {
      content = content.replace(
        /export \{ container \};/,
        usecaseRegistration + '\n\nexport { container };'
      );
    }

    fs.writeFileSync(containerPath, content);
    console.log('✅ Updated container.ts');
  } catch (error) {
    console.error('Failed to update container.ts:', error);
  }
}

/**
 * Creates the action file for server-side actions.
 *
 * @param {string} usecaseCamelCase - The use case name in camelCase
 * @param {string} usecasePascalCase - The use case name in PascalCase
 * @param {string} usecaseSymbol - The use case symbol
 */
function createActionFile(usecaseCamelCase, usecasePascalCase, usecaseSymbol) {
  const actionPath = path.resolve(
    process.cwd(),
    `src/presenter/actions/${usecaseCamelCase}.action.ts`
  );

  if (!fs.existsSync(actionPath)) {
    const content = `'use server'

import { USE_CASES } from "@/di/symbols"
import { container } from "@/di/container"
import { I${usecasePascalCase}Usecase, ${usecasePascalCase}Input } from "@/domains/${domain}/usecases/${usecaseName}.usecase.interface"

export async function ${usecaseCamelCase}(
  input: ${usecasePascalCase}Input
) {
  const ${usecaseCamelCase}Usecase = container.resolve<I${usecasePascalCase}Usecase>(USE_CASES.${usecaseSymbol})
  return await ${usecaseCamelCase}Usecase.execute(input)
}
`;

    fs.writeFileSync(actionPath, content);
    console.log(`✅ Created action file: ${actionPath}`);
  } else {
    console.log(`⚠️ Action file already exists at: ${actionPath}`);
  }
}

/**
 * Creates a domain entity model file.
 *
 * @param {string} domain - The domain name in kebab-case
 * @param {string} domainPascalCase - The domain name in PascalCase
 */
function createDomainModelFile(domain, domainPascalCase) {
  const modelPath = path.resolve(
    process.cwd(),
    `src/domains/${domain}/entities/${domain}.entity.ts`
  );

  if (!fs.existsSync(modelPath)) {
    const content = `/**
 * ${domainPascalCase} entity representing the domain model.
 */
export interface ${domainPascalCase} {
  id: string;
  // TODO: Add more properties that describe this entity
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Factory function to create a new ${domainPascalCase} entity.
 * 
 * @param {Partial<${domainPascalCase}>} data - Initial data for the entity
 * @returns {${domainPascalCase}} A new ${domainPascalCase} entity
 */
export function create${domainPascalCase}(data: Partial<${domainPascalCase}> = {}): ${domainPascalCase} {
  return {
    id: data.id || crypto.randomUUID(),
    // TODO: Initialize other properties with default values or from data
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
    ...data,
  };
}

/**
 * Repository interface for ${domainPascalCase} entities.
 */
export interface I${domainPascalCase}Repository {
  findById(id: string): Promise<${domainPascalCase} | null>;
  findAll(): Promise<${domainPascalCase}[]>;
  create(entity: ${domainPascalCase}): Promise<${domainPascalCase}>;
  update(entity: ${domainPascalCase}): Promise<${domainPascalCase}>;
  delete(id: string): Promise<boolean>;
}
`;

    fs.writeFileSync(modelPath, content);
    console.log(`✅ Created domain model file: ${modelPath}`);
  } else {
    console.log(`⚠️ Domain model file already exists at: ${modelPath}`);
  }
}
