/**
 * Prompt utilities for interactive CLI
 */
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
    console.log('Error: Please enter \'yes\'/\'y\' or \'no\'/\'n\'');
    return null;
  }
}

module.exports = {
  createPrompt,
  prompt,
  validateParam,
  validateHttpMethod,
  validateYesNo
};
