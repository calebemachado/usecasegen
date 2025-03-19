/**
 * File system utilities for the generator
 */
const fs = require('fs');
const path = require('path');

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
 * Writes content to a file if it doesn't already exist
 *
 * @param {string} filePath - Path to the file
 * @param {string} content - Content to write
 * @param {string} successMessage - Message to log on success
 * @param {string} existsMessage - Message to log if file exists
 * @returns {boolean} True if file was created, false if it already existed
 */
function writeFileIfNotExists(filePath, content, successMessage, existsMessage) {
  const absolutePath = path.resolve(process.cwd(), filePath);

  if (!fs.existsSync(absolutePath)) {
    fs.writeFileSync(absolutePath, content);
    console.log(successMessage || `✅ Created file: ${filePath}`);
    return true;
  } else {
    console.log(existsMessage || `⚠️ File already exists at: ${filePath}`);
    return false;
  }
}

/**
 * Displays a formatted summary of files that will be created or updated
 *
 * @param {Array<{path: string, description: string, willCreate: boolean}>} files - The files to display
 */
function displayFileSummary(files) {
  files.forEach(file => {
    const status = file.willCreate ? '➕ Create:' : '🔄 Update:';
    console.log(`${status.padEnd(10)} ${file.path.padEnd(60)} - ${file.description}`);
  });
}

module.exports = {
  ensureDirectoryExists,
  writeFileIfNotExists,
  displayFileSummary
};
