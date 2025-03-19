/**
 * Use case generator for creating all necessary files for a use case
 */
const path = require('path');
const fs = require('fs');
const { convertKebabToPascal, convertKebabToCamel } = require('../utils/string-utils');
const { writeFileIfNotExists, ensureDirExists } = require('../utils/fs-utils');
const {
  createUsecaseInterfaceFile,
  createUsecaseImplementationFile,
  createOrUpdateApiClientFile,
  createActionFile
} = require('./file-generators');
const { checkTsyringeDependency } = require('../utils/dependency-utils');

/**
 * Registers the use case in the DI container symbols file
 *
 * @param {string} usecaseName - The use case name in kebab-case
 * @param {string} usecaseSymbol - The use case symbol to use in the DI container
 * @returns {boolean} True if the symbols file was updated, false otherwise
 */
function registerUsecaseInDI(usecaseName, usecaseSymbol) {
  const symbolsPath = path.resolve(process.cwd(), 'src/di/symbols.ts');

  if (!fs.existsSync(symbolsPath)) {
    // Create symbols file if it doesn't exist
    const content = `/**
 * Dependency Injection symbols
 */

export const BASE = {
  API_CLIENT: Symbol('API_CLIENT'),
}

export const API = {
  // API symbols will be registered here
}

export const USE_CASES = {
  ${usecaseSymbol}: Symbol('${usecaseSymbol}'),
}

export const REPOSITORIES = {
  // Repository symbols will be registered here
}
`;

    writeFileIfNotExists(
      symbolsPath,
      content,
      `✅ Created DI symbols file: ${symbolsPath}`,
      `⚠️ DI symbols file already exists at: ${symbolsPath}`
    );

    return true;
  } else {
    // Update symbols file
    let content = fs.readFileSync(symbolsPath, 'utf8');

    // Check if the symbol already exists
    if (content.includes(`${usecaseSymbol}:`)) {
      console.log('⚠️ Use case symbol already exists in DI symbols file');
      return false;
    }

    // Add the use case symbol
    if (content.includes('export const USE_CASES = {')) {
      // Add to existing USE_CASES object
      let updatedContent = content.replace(
        /export const USE_CASES = \{([\s\S]*?)\}/,
        (match, inside) => {
          // Check if there are already symbols defined
          if (inside.trim() === '') {
            return `export const USE_CASES = {\n  ${usecaseSymbol}: Symbol('${usecaseSymbol}'),\n}`;
          }

          // Add to existing symbols
          return `export const USE_CASES = {${inside}  ${usecaseSymbol}: Symbol('${usecaseSymbol}'),\n}`;
        }
      );

      fs.writeFileSync(symbolsPath, updatedContent);
      console.log(`✅ Added use case symbol to DI symbols file: ${symbolsPath}`);
      return true;
    } else {
      console.log(`⚠️ Could not find USE_CASES object in DI symbols file: ${symbolsPath}`);
      return false;
    }
  }
}

/**
 * Creates the container registration file for the use case.
 *
 * @param {string} usecaseName - The use case name in kebab-case
 * @param {string} usecasePascalCase - The use case name in PascalCase
 * @param {string} usecaseSymbol - The use case symbol
 * @returns {boolean} True if the file was created, false if it already existed
 */
function registerUsecaseInContainer(usecaseName, usecasePascalCase, usecaseSymbol) {
  const containerPath = path.resolve(process.cwd(), 'src/di/container.ts');

  if (!fs.existsSync(containerPath)) {
    // Create container file if it doesn't exist
    checkTsyringeDependency();

    const content = `/**
 * Dependency Injection container
 */
import 'reflect-metadata';
import { container } from 'tsyringe';
import { USE_CASES, API, BASE } from './symbols';
import { ApiClient } from '@/infrastructure/utils/apiClient';
import { ${usecasePascalCase}Usecase } from '@/application/use-cases/${usecaseName}.usecase';

// Register base dependencies
container.register(BASE.API_CLIENT, { useClass: ApiClient });

// Register API clients
// TODO: Register API clients here

// Register use cases
container.register(USE_CASES.${usecaseSymbol}, { useClass: ${usecasePascalCase}Usecase });

export { container };
`;

    writeFileIfNotExists(
      containerPath,
      content,
      `✅ Created DI container file: ${containerPath}`,
      `⚠️ DI container file already exists at: ${containerPath}`
    );

    return true;
  } else {
    // Update container file
    let content = fs.readFileSync(containerPath, 'utf8');

    // Check if the use case is already registered
    if (content.includes(`${usecasePascalCase}Usecase`)) {
      console.log(`⚠️ Use case already registered in DI container: ${containerPath}`);
      return false;
    }

    // Add the use case import
    if (!content.includes(`import { ${usecasePascalCase}Usecase }`)) {
      content = content.replace(
        /import.*from.*\n(?!import)/,
        match => `${match}import { ${usecasePascalCase}Usecase } from '@/application/use-cases/${usecaseName}.usecase';\n`
      );
    }

    // Add the use case registration
    if (content.includes('// Register use cases')) {
      content = content.replace(
        /\/\/ Register use cases\n([\s\S]*?)(?=\n\n|$)/,
        match => `// Register use cases\n${match.includes('container.register(USE_CASES') ? '' : ''}container.register(USE_CASES.${usecaseSymbol}, { useClass: ${usecasePascalCase}Usecase });\n`
      );
    } else {
      content = content.replace(
        /export \{ container \};/,
        `// Register use cases\ncontainer.register(USE_CASES.${usecaseSymbol}, { useClass: ${usecasePascalCase}Usecase });\n\nexport { container };`
      );
    }

    fs.writeFileSync(containerPath, content);
    console.log(`✅ Updated DI container file: ${containerPath}`);
    return true;
  }
}

/**
 * Generates all files for a use case
 *
 * @param {Object} options - The options for generating the use case
 * @param {string} options.domain - The domain name
 * @param {string} options.usecaseName - The use case name in kebab-case
 * @param {string} options.apiName - The API name in kebab-case
 * @param {string} options.httpMethod - The HTTP method to use for the API (GET, POST, PUT, PATCH, DELETE)
 * @returns {Object} Object with the generation results
 */
function generateUsecase({ domain, usecaseName, apiName, httpMethod = 'GET' }) {
  console.log(`🔨 Generating use case: ${usecaseName} in domain ${domain}...`);

  // Convert names to proper formats
  const usecasePascalCase = convertKebabToPascal(usecaseName);
  const usecaseCamelCase = convertKebabToCamel(usecaseName);

  const apiPascalCase = convertKebabToPascal(apiName);

  // Create symbol for DI container
  const usecaseSymbol = usecaseName.toUpperCase().replace(/-/g, '_');
  const apiSymbol = apiName.toUpperCase().replace(/-/g, '_');

  // Ensure the directories exist
  ensureDirExists(path.resolve(process.cwd(), `src/domains/${domain}/usecases`));
  ensureDirExists(path.resolve(process.cwd(), 'src/application/use-cases'));
  ensureDirExists(path.resolve(process.cwd(), `src/infrastructure/api/${apiName}`));
  ensureDirExists(path.resolve(process.cwd(), 'src/presenter/actions'));

  // Create the base usecase interface if it doesn't exist
  const baseUsecasePath = path.resolve(process.cwd(), 'src/domains/_base/base.usecase.ts');
  if (!fs.existsSync(baseUsecasePath)) {
    ensureDirExists(path.resolve(process.cwd(), 'src/domains/_base'));

    const content = `/**
 * Base usecase interface that all usecases should implement
 */
export interface IBaseUsecase<TInput, TOutput> {
  execute(request: TInput): Promise<TOutput>;
}
`;

    fs.writeFileSync(baseUsecasePath, content);
    console.log(`✅ Created base usecase interface: ${baseUsecasePath}`);
  }

  // Generate all the required files
  const results = {
    interface: createUsecaseInterfaceFile(domain, usecaseName, usecasePascalCase),
    implementation: createUsecaseImplementationFile(domain, usecaseName, usecasePascalCase, apiPascalCase, apiSymbol),
    apiClient: createOrUpdateApiClientFile(domain, apiName, usecaseName, usecasePascalCase, httpMethod),
    action: createActionFile(usecaseCamelCase, usecasePascalCase, usecaseSymbol, domain, usecaseName),
    diSymbol: registerUsecaseInDI(usecaseName, usecaseSymbol),
    diContainer: registerUsecaseInContainer(usecaseName, usecasePascalCase, usecaseSymbol)
  };

  console.log(`✅ Use case generation completed for: ${usecaseName}`);

  return results;
}

module.exports = {
  generateUsecase,
  registerUsecaseInDI,
  registerUsecaseInContainer
};
