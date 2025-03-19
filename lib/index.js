/**
 * Use case generator library
 */
const { generateUsecase } = require('./generators/use-case-generator');
const {
  createUsecaseInterfaceFile,
  createUsecaseImplementationFile,
  createOrUpdateApiClientFile,
  createActionFile
} = require('./generators/file-generators');
const { convertKebabToPascal, convertKebabToCamel } = require('./utils/string-utils');
const { writeFileIfNotExists, ensureDirExists } = require('./utils/fs-utils');
const { checkTsyringeDependency, setupTsyringeConfiguration, createEnvironmentFiles } = require('./utils/dependency-utils');

module.exports = {
  // Main generator function
  generateUsecase,

  // File generators
  createUsecaseInterfaceFile,
  createUsecaseImplementationFile,
  createOrUpdateApiClientFile,
  createActionFile,

  // Utility functions
  convertKebabToPascal,
  convertKebabToCamel,
  writeFileIfNotExists,
  ensureDirExists,
  checkTsyringeDependency,
  setupTsyringeConfiguration,
  createEnvironmentFiles
};
