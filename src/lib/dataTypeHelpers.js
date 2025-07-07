// Data type helper functions for test cases
export const DATA_TYPES = {
  INPUT: ['string', 'number', 'array_number', 'array_string', 'matrix_number', 'matrix_string', 'boolean', 'object', 'multiple_params'],
  OUTPUT: ['string', 'number', 'array_number', 'array_string', 'matrix_number', 'matrix_string', 'boolean', 'object']
};

export const DATA_TYPE_LABELS = {
  string: 'String',
  number: 'Number',
  array_number: 'Array of Numbers',
  array_string: 'Array of Strings', 
  matrix_number: 'Matrix (2D Array) of Numbers',
  matrix_string: 'Matrix (2D Array) of Strings',
  boolean: 'Boolean',
  object: 'Object/Custom',
  multiple_params: 'Multiple Parameters'
};

export const DATA_TYPE_EXAMPLES = {
  string: '"hello world"',
  number: '42',
  array_number: '[1, 2, 3, 4]',
  array_string: '["a", "b", "c"]',
  matrix_number: '[[1, 2], [3, 4]]',
  matrix_string: '[["a", "b"], ["c", "d"]]',
  boolean: 'true',
  object: '{"key": "value"}',
  multiple_params: '5\n[1, 2, 3]\n"target"'
};

export const DATA_TYPE_DESCRIPTIONS = {
  string: 'A single string value enclosed in quotes',
  number: 'A single numeric value (integer or decimal)',
  array_number: 'An array containing numeric values',
  array_string: 'An array containing string values',
  matrix_number: 'A 2D array (matrix) of numeric values',
  matrix_string: 'A 2D array (matrix) of string values',
  boolean: 'A boolean value (true or false)',
  object: 'A JSON object or custom data structure',
  multiple_params: 'Multiple parameters on separate lines'
};

/**
 * Validates if the input string matches the expected data type
 */
export function validateDataType(value, dataType) {
  if (!value || !value.trim()) {
    return { isValid: false, error: 'Value cannot be empty' };
  }

  const trimmedValue = value.trim();

  try {
    switch (dataType) {
      case 'string':
        if (!trimmedValue.startsWith('"') || !trimmedValue.endsWith('"')) {
          return { isValid: false, error: 'String values must be enclosed in double quotes' };
        }
        return { isValid: true };

      case 'number':
        const num = parseFloat(trimmedValue);
        if (isNaN(num)) {
          return { isValid: false, error: 'Value must be a valid number' };
        }
        return { isValid: true };

      case 'boolean':
        if (trimmedValue !== 'true' && trimmedValue !== 'false') {
          return { isValid: false, error: 'Boolean values must be "true" or "false"' };
        }
        return { isValid: true };

      case 'array_number':
      case 'array_string':
        if (!trimmedValue.startsWith('[') || !trimmedValue.endsWith(']')) {
          return { isValid: false, error: 'Array values must be enclosed in square brackets' };
        }
        const array = JSON.parse(trimmedValue);
        if (!Array.isArray(array)) {
          return { isValid: false, error: 'Value must be a valid array' };
        }
        if (dataType === 'array_number') {
          const hasInvalidNumbers = array.some(item => typeof item !== 'number');
          if (hasInvalidNumbers) {
            return { isValid: false, error: 'All array elements must be numbers' };
          }
        } else if (dataType === 'array_string') {
          const hasInvalidStrings = array.some(item => typeof item !== 'string');
          if (hasInvalidStrings) {
            return { isValid: false, error: 'All array elements must be strings' };
          }
        }
        return { isValid: true };

      case 'matrix_number':
      case 'matrix_string':
        if (!trimmedValue.startsWith('[') || !trimmedValue.endsWith(']')) {
          return { isValid: false, error: 'Matrix values must be enclosed in square brackets' };
        }
        const matrix = JSON.parse(trimmedValue);
        if (!Array.isArray(matrix) || !matrix.every(row => Array.isArray(row))) {
          return { isValid: false, error: 'Value must be a valid 2D array (matrix)' };
        }
        if (dataType === 'matrix_number') {
          const hasInvalidNumbers = matrix.some(row => row.some(item => typeof item !== 'number'));
          if (hasInvalidNumbers) {
            return { isValid: false, error: 'All matrix elements must be numbers' };
          }
        } else if (dataType === 'matrix_string') {
          const hasInvalidStrings = matrix.some(row => row.some(item => typeof item !== 'string'));
          if (hasInvalidStrings) {
            return { isValid: false, error: 'All matrix elements must be strings' };
          }
        }
        return { isValid: true };

      case 'object':
        if (!trimmedValue.startsWith('{') || !trimmedValue.endsWith('}')) {
          return { isValid: false, error: 'Object values must be enclosed in curly braces' };
        }
        JSON.parse(trimmedValue); // This will throw if invalid JSON
        return { isValid: true };

      case 'multiple_params':
        // For multiple params, just check that it's not empty
        return { isValid: true };

      default:
        return { isValid: false, error: 'Unknown data type' };
    }
  } catch (error) {
    return { isValid: false, error: `Invalid JSON format: ${error.message}` };
  }
}

/**
 * Formats a value according to its data type for display
 */
export function formatValueForDisplay(value, dataType) {
  if (!value) return '';
  
  try {
    switch (dataType) {
      case 'string':
      case 'number':
      case 'boolean':
        return value;
      
      case 'array_number':
      case 'array_string':
      case 'matrix_number':
      case 'matrix_string':
      case 'object':
        // Pretty print JSON
        const parsed = JSON.parse(value);
        return JSON.stringify(parsed, null, 2);
      
      case 'multiple_params':
        return value;
      
      default:
        return value;
    }
  } catch (error) {
    return value; // Return original if parsing fails
  }
}

/**
 * Auto-detects the data type of a given value
 */
export function autoDetectDataType(value) {
  if (!value || !value.trim()) {
    return 'string';
  }

  const trimmedValue = value.trim();

  // Check for string
  if (trimmedValue.startsWith('"') && trimmedValue.endsWith('"')) {
    return 'string';
  }

  // Check for boolean
  if (trimmedValue === 'true' || trimmedValue === 'false') {
    return 'boolean';
  }

  // Check for number
  if (!isNaN(parseFloat(trimmedValue)) && isFinite(trimmedValue)) {
    return 'number';
  }

  // Check for arrays and objects
  try {
    const parsed = JSON.parse(trimmedValue);
    
    if (Array.isArray(parsed)) {
      if (parsed.length === 0) {
        return 'array_number'; // Default for empty array
      }
      
      // Check if it's a matrix (2D array)
      if (parsed.every(item => Array.isArray(item))) {
        // Check the type of elements in the first non-empty row
        const firstNonEmptyRow = parsed.find(row => row.length > 0);
        if (firstNonEmptyRow && typeof firstNonEmptyRow[0] === 'number') {
          return 'matrix_number';
        } else if (firstNonEmptyRow && typeof firstNonEmptyRow[0] === 'string') {
          return 'matrix_string';
        }
        return 'matrix_number'; // Default for empty matrix
      }
      
      // Check 1D array element types
      if (parsed.every(item => typeof item === 'number')) {
        return 'array_number';
      } else if (parsed.every(item => typeof item === 'string')) {
        return 'array_string';
      }
      
      return 'array_number'; // Default for mixed arrays
    } else if (typeof parsed === 'object' && parsed !== null) {
      return 'object';
    }
  } catch (error) {
    // If JSON parsing fails, check for multiple parameters
    if (trimmedValue.includes('\n')) {
      return 'multiple_params';
    }
  }

  // Default to string
  return 'string';
} 