/**
 * String utility functions for case conversions
 */

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

module.exports = {
  toCamelCase,
  toPascalCase,
  toConstCase
};
