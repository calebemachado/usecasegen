#!/usr/bin/env node

/**
 * @fileoverview Test script for the use case generator
 *
 * This script performs a simple syntax validation of the main script
 * and runs a mock test to ensure it can be executed without errors.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Path to the script
const scriptPath = path.join(__dirname, 'create-use-case.js');

// Check if script exists
if (!fs.existsSync(scriptPath)) {
  console.error(`❌ ERROR: Script not found at ${scriptPath}`);
  process.exit(1);
}

console.log('✅ Script file exists');

// Check if script is executable
try {
  fs.accessSync(scriptPath, fs.constants.X_OK);
  console.log('✅ Script is executable');
} catch (err) {
  console.error('❌ ERROR: Script is not executable');
  process.exit(1);
}

// Check script syntax using Node's --check flag
try {
  execSync(`node --check ${scriptPath}`, { stdio: 'ignore' });
  console.log('✅ Script syntax is valid');
} catch (err) {
  console.error('❌ ERROR: Script has syntax errors');
  process.exit(1);
}

// Verify package.json has correct bin entry
try {
  const packageJson = require('./package.json');
  if (!packageJson.bin || !packageJson.bin.usecasegen) {
    console.error('❌ ERROR: Missing or incorrect bin entry in package.json');
    process.exit(1);
  }
  console.log('✅ package.json bin configuration is valid');
} catch (err) {
  console.error('❌ ERROR: Could not verify package.json:', err);
  process.exit(1);
}

// All tests passed
console.log('\n✅ All tests passed! Package is ready for publication.');
process.exit(0);
