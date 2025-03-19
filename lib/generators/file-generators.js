/**
 * File generators for creating use case files
 */
const fs = require('fs');
const path = require('path');
const { writeFileIfNotExists } = require('../utils/fs-utils');

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
 * Creates the interface file for the use case.
 *
 * @param {string} domain - The domain name
 * @param {string} usecaseName - The use case name in kebab-case
 * @param {string} usecasePascalCase - The use case name in PascalCase
 * @returns {boolean} True if the file was created, false if it already existed
 */
function createUsecaseInterfaceFile(domain, usecaseName, usecasePascalCase) {
  const interfacePath = path.resolve(
    process.cwd(),
    `src/domains/${domain}/usecases/${usecaseName}.usecase.interface.ts`
  );

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

  return writeFileIfNotExists(
    interfacePath,
    content,
    `✅ Created interface file: ${interfacePath}`,
    `⚠️ Interface file already exists at: ${interfacePath}`
  );
}

/**
 * Creates the implementation file for the use case.
 *
 * @param {string} domain - The domain name
 * @param {string} usecaseName - The use case name in kebab-case
 * @param {string} usecasePascalCase - The use case name in PascalCase
 * @param {string} apiPascalCase - The API name in PascalCase
 * @param {string} apiSymbol - The API symbol
 * @returns {boolean} True if the file was created, false if it already existed
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

  // Get the API name in kebab-case from the API PascalCase
  const apiName = apiPascalCase.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

  const content = `import { API } from "@/di/symbols"
import { inject, injectable } from "tsyringe"
import { ${apiPascalCase}Api } from "@/infrastructure/api/${apiName}/${apiName}.api"
import { I${usecasePascalCase}Usecase, ${usecasePascalCase}Input, ${usecasePascalCase}Output } from "@/domains/${domain}/usecases/${usecaseName}.usecase.interface"

@injectable()
export class ${usecasePascalCase}Usecase implements I${usecasePascalCase}Usecase {
  constructor(@inject(API.${apiSymbol}) private readonly ${apiName.split('-').map((word, index) =>
  index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
).join('')}Api: ${apiPascalCase}Api) {}

  async execute(request: ${usecasePascalCase}Input): Promise<${usecasePascalCase}Output> {
    return this.${apiName.split('-').map((word, index) =>
    index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
  ).join('')}Api.${usecaseName.split('-').map((word, index) =>
  index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
).join('')}(request)
  }
}
`;

  return writeFileIfNotExists(
    implementationPath,
    content,
    `✅ Created implementation file: ${implementationPath}`,
    `⚠️ Implementation file already exists at: ${implementationPath}`
  );
}

/**
 * Creates or updates the API client file to include the new method.
 *
 * @param {string} domain - The domain name
 * @param {string} apiName - The API name
 * @param {string} usecaseName - The use case name in kebab-case
 * @param {string} usecasePascalCase - The use case name in PascalCase
 * @param {string} httpMethod - The HTTP method to use
 * @returns {boolean} True if the file was created or updated, false otherwise
 */
function createOrUpdateApiClientFile(domain, apiName, usecaseName, usecasePascalCase, httpMethod) {
  const apiClientPath = path.resolve(
    process.cwd(),
    `src/infrastructure/api/${apiName}/${apiName}.api.ts`
  );

  if (!fs.existsSync(apiClientPath)) {
    // Create new API client file
    const apiPascalCase = apiName.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');

    const content = `import { BASE } from '@/di/symbols'
import { inject, injectable } from 'tsyringe'
import { ApiClient } from '@/infrastructure/utils/apiClient'

import type { ${usecasePascalCase}Input, ${usecasePascalCase}Output } from '@/domains/${domain}/usecases/${usecaseName}.usecase.interface'

@injectable()
export class ${apiPascalCase}Api {
  constructor(@inject(BASE.API_CLIENT) private readonly apiClient: ApiClient) {}

  async ${usecaseName.split('-').map((word, index) =>
    index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
  ).join('')}(request: ${usecasePascalCase}Input): Promise<${usecasePascalCase}Output> {
    ${generateApiMethodBody(usecaseName, usecasePascalCase, httpMethod)}
  }
}
`;

    fs.writeFileSync(apiClientPath, content);
    console.log(`✅ Created API client file: ${apiClientPath}`);
    return true;
  } else {
    // Update existing API client file
    let content = fs.readFileSync(apiClientPath, 'utf8');
    const usecaseCamelCase = usecaseName.split('-').map((word, index) =>
      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
    ).join('');

    // Check if the method already exists
    if (!content.includes(`async ${usecaseCamelCase}`)) {
      // Add import for the new use case types
      if (!content.includes(`${usecasePascalCase}Input`)) {
        const importStatement = `import type { ${usecasePascalCase}Input, ${usecasePascalCase}Output } from '@/domains/${domain}/usecases/${usecaseName}.usecase.interface'`;
        content = content.replace(/import.*from.*\n/, match => match + importStatement + '\n');
      }

      // Add the new method
      const methodContent = `\n  async ${usecaseCamelCase}(request: ${usecasePascalCase}Input): Promise<${usecasePascalCase}Output> {
    ${generateApiMethodBody(usecaseName, usecasePascalCase, httpMethod)}
  }\n}`;

      content = content.replace(/}$/, methodContent);

      fs.writeFileSync(apiClientPath, content);
      console.log(`✅ Updated API client file with new method: ${apiClientPath}`);
      return true;
    } else {
      console.log(`⚠️ Method already exists in API client: ${apiClientPath}`);
      return false;
    }
  }
}

/**
 * Creates the action file for server-side actions.
 *
 * @param {string} usecaseCamelCase - The use case name in camelCase
 * @param {string} usecasePascalCase - The use case name in PascalCase
 * @param {string} usecaseSymbol - The use case symbol
 * @param {string} domain - The domain name
 * @param {string} usecaseName - The use case name in kebab-case
 * @returns {boolean} True if the file was created, false if it already existed
 */
function createActionFile(usecaseCamelCase, usecasePascalCase, usecaseSymbol, domain, usecaseName) {
  const actionPath = path.resolve(
    process.cwd(),
    `src/presenter/actions/${usecaseCamelCase}.action.ts`
  );

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

  return writeFileIfNotExists(
    actionPath,
    content,
    `✅ Created action file: ${actionPath}`,
    `⚠️ Action file already exists at: ${actionPath}`
  );
}

module.exports = {
  generateApiMethodBody,
  createUsecaseInterfaceFile,
  createUsecaseImplementationFile,
  createOrUpdateApiClientFile,
  createActionFile
};
