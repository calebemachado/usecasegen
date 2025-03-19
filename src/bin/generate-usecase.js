#!/usr/bin/env node

/**
 * Command line script for generating use cases
 */
const { generateUsecase } = require('../lib/generators/use-case-generator');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const promptQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

const validateKebabCase = (input) => {
  return /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(input);
};

const validateHttpMethod = (input) => {
  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
  return methods.includes(input.toUpperCase());
};

async function promptForInput() {
  console.log('\n🚀 Use Case Generator\n');

  let domain;
  while (!domain || !validateKebabCase(domain)) {
    domain = await promptQuestion('Enter domain name (in kebab-case, e.g., "user-management"): ');
    if (!validateKebabCase(domain)) {
      console.log('❌ Invalid domain name! Must be in kebab-case (e.g., "user-management").');
    }
  }

  let usecaseName;
  while (!usecaseName || !validateKebabCase(usecaseName)) {
    usecaseName = await promptQuestion('Enter use case name (in kebab-case, e.g., "create-user"): ');
    if (!validateKebabCase(usecaseName)) {
      console.log('❌ Invalid use case name! Must be in kebab-case (e.g., "create-user").');
    }
  }

  let apiName;
  while (!apiName || !validateKebabCase(apiName)) {
    apiName = await promptQuestion('Enter API name (in kebab-case, e.g., "user-api"): ');
    if (!validateKebabCase(apiName)) {
      console.log('❌ Invalid API name! Must be in kebab-case (e.g., "user-api").');
    }
  }

  let httpMethod;
  while (!httpMethod || !validateHttpMethod(httpMethod)) {
    httpMethod = await promptQuestion('Enter HTTP method (GET, POST, PUT, PATCH, DELETE): ');
    if (!validateHttpMethod(httpMethod)) {
      console.log('❌ Invalid HTTP method! Must be one of: GET, POST, PUT, PATCH, DELETE.');
    }
  }

  console.log('\n📋 Summary:');
  console.log(`Domain: ${domain}`);
  console.log(`Use Case: ${usecaseName}`);
  console.log(`API: ${apiName}`);
  console.log(`HTTP Method: ${httpMethod.toUpperCase()}`);

  const confirm = await promptQuestion('\nGenerate files? (y/n): ');

  if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
    try {
      const results = generateUsecase({
        domain,
        usecaseName,
        apiName,
        httpMethod: httpMethod.toUpperCase()
      });

      console.log('\n✅ Files generated successfully!');
    } catch (error) {
      console.error('\n❌ Error generating files:', error.message);
    }
  } else {
    console.log('\n❌ Operation cancelled.');
  }

  rl.close();
}

// Handle CLI arguments
if (process.argv.length > 2) {
  const args = process.argv.slice(2);

  // Check for help command
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: generate-usecase [options]

Options:
  --domain, -d       Domain name in kebab-case (e.g., "user-management")
  --usecase, -u      Use case name in kebab-case (e.g., "create-user")
  --api, -a          API name in kebab-case (e.g., "user-api")
  --method, -m       HTTP method (GET, POST, PUT, PATCH, DELETE)
  --help, -h         Display this help message

Example:
  generate-usecase --domain user-management --usecase create-user --api user-api --method POST
`);
    process.exit(0);
  }

  // Parse args
  const options = {
    domain: args[args.indexOf('--domain') + 1] || args[args.indexOf('-d') + 1],
    usecaseName: args[args.indexOf('--usecase') + 1] || args[args.indexOf('-u') + 1],
    apiName: args[args.indexOf('--api') + 1] || args[args.indexOf('-a') + 1],
    httpMethod: args[args.indexOf('--method') + 1] || args[args.indexOf('-m') + 1]
  };

  // Validate args
  let isValid = true;

  if (!options.domain || !validateKebabCase(options.domain)) {
    console.log('❌ Invalid or missing domain name! Must be in kebab-case (e.g., "user-management").');
    isValid = false;
  }

  if (!options.usecaseName || !validateKebabCase(options.usecaseName)) {
    console.log('❌ Invalid or missing use case name! Must be in kebab-case (e.g., "create-user").');
    isValid = false;
  }

  if (!options.apiName || !validateKebabCase(options.apiName)) {
    console.log('❌ Invalid or missing API name! Must be in kebab-case (e.g., "user-api").');
    isValid = false;
  }

  if (!options.httpMethod || !validateHttpMethod(options.httpMethod)) {
    console.log('❌ Invalid or missing HTTP method! Must be one of: GET, POST, PUT, PATCH, DELETE.');
    isValid = false;
  }

  if (isValid) {
    try {
      console.log('\n📋 Generating files with these parameters:');
      console.log(`Domain: ${options.domain}`);
      console.log(`Use Case: ${options.usecaseName}`);
      console.log(`API: ${options.apiName}`);
      console.log(`HTTP Method: ${options.httpMethod.toUpperCase()}`);

      const results = generateUsecase({
        domain: options.domain,
        usecaseName: options.usecaseName,
        apiName: options.apiName,
        httpMethod: options.httpMethod.toUpperCase()
      });

      console.log('\n✅ Files generated successfully!');
      process.exit(0);
    } catch (error) {
      console.error('\n❌ Error generating files:', error.message);
      process.exit(1);
    }
  } else {
    console.log('\nRun with --help for usage information.');
    process.exit(1);
  }
} else {
  // Interactive mode
  promptForInput().catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
}
