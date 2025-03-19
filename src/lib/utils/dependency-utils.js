/**
 * Dependency management utilities
 */
const fs = require('fs');
const path = require('path');
const { ensureDirectoryExists } = require('./fs-utils');

/**
 * Checks if tsyringe dependency is installed
 *
 * @returns {boolean} True if tsyringe is installed, false otherwise
 */
function checkTsyringeDependency() {
  try {
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
      console.log('⚠️ package.json not found. Cannot check for tsyringe dependency.');
      return false;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Check if tsyringe is in dependencies or devDependencies
    return (
      (packageJson.dependencies && packageJson.dependencies.tsyringe) ||
      (packageJson.devDependencies && packageJson.devDependencies.tsyringe)
    );
  } catch (error) {
    console.error('Error checking for tsyringe dependency:', error);
    return false;
  }
}

/**
 * Sets up tsyringe configuration
 */
function setupTsyringeConfiguration() {
  // Check for tsconfig.json
  const tsconfigPath = path.resolve(process.cwd(), 'tsconfig.json');

  if (!fs.existsSync(tsconfigPath)) {
    console.log('⚠️ tsconfig.json not found. Creating a basic tsconfig.json for tsyringe support...');

    const tsconfig = {
      'compilerOptions': {
        'target': 'ES2020',
        'lib': ['ES2020', 'DOM'],
        'module': 'ESNext',
        'moduleResolution': 'node',
        'esModuleInterop': true,
        'experimentalDecorators': true,
        'emitDecoratorMetadata': true,
        'skipLibCheck': true,
        'strict': true,
        'noImplicitAny': false,
        'strictNullChecks': true,
        'resolveJsonModule': true,
        'isolatedModules': true,
        'jsx': 'react-jsx',
        'baseUrl': '.',
        'paths': {
          '@/*': ['src/*']
        }
      },
      'include': ['src/**/*'],
      'exclude': ['node_modules']
    };

    fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
    console.log('✅ Created tsconfig.json with decorator support');
  } else {
    // Update existing tsconfig.json if needed
    try {
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));

      let updated = false;

      if (!tsconfig.compilerOptions) {
        tsconfig.compilerOptions = {};
      }

      if (!tsconfig.compilerOptions.experimentalDecorators) {
        tsconfig.compilerOptions.experimentalDecorators = true;
        updated = true;
      }

      if (!tsconfig.compilerOptions.emitDecoratorMetadata) {
        tsconfig.compilerOptions.emitDecoratorMetadata = true;
        updated = true;
      }

      if (updated) {
        fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
        console.log('✅ Updated tsconfig.json with decorator support');
      }
    } catch (error) {
      console.error('Failed to update tsconfig.json:', error);
    }
  }

  // Create or update environment variables
  createEnvironmentFiles();
}

/**
 * Creates or updates environment variable files
 */
function createEnvironmentFiles() {
  // Create .env file if it doesn't exist
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, 'API_BASE_URL=http://localhost:3000\n');
    console.log('✅ Created .env file with API_BASE_URL');
  } else if (!fs.readFileSync(envPath, 'utf8').includes('API_BASE_URL')) {
    fs.appendFileSync(envPath, '\nAPI_BASE_URL=http://localhost:3000\n');
    console.log('✅ Updated .env file with API_BASE_URL');
  }

  // Create .env.example if it doesn't exist
  const envExamplePath = path.resolve(process.cwd(), '.env.example');
  if (!fs.existsSync(envExamplePath)) {
    fs.writeFileSync(envExamplePath, 'API_BASE_URL=http://localhost:3000\n');
    console.log('✅ Created .env.example file');
  }

  // Create next.config.js if it doesn't exist and seems to be a Next.js project
  const nextConfigPath = path.resolve(process.cwd(), 'next.config.js');
  const packageJsonPath = path.resolve(process.cwd(), 'package.json');

  if (!fs.existsSync(nextConfigPath) && fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      if (packageJson.dependencies && packageJson.dependencies.next) {
        const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    API_BASE_URL: process.env.API_BASE_URL,
  },
}

module.exports = nextConfig
`;
        fs.writeFileSync(nextConfigPath, nextConfig);
        console.log('✅ Created next.config.js with environment variables');
      }
    } catch (error) {
      console.error('Failed to check for Next.js or create next.config.js:', error);
    }
  }
}

module.exports = {
  checkTsyringeDependency,
  setupTsyringeConfiguration,
  createEnvironmentFiles
};
