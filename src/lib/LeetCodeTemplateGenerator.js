class LeetCodeTemplateGenerator {
  constructor() {
    this.supportedLanguages = ['javascript', 'python', 'java', 'cpp', 'c'];
  }

  generateTemplate(language, userCode, input, expectedOutput, inputType = null, outputType = null) {
    if (!this.supportedLanguages.includes(language)) {
      throw new Error(`Unsupported language: ${language}`);
    }

    // Use explicit input type if provided, otherwise auto-detect
    const templateInputType = inputType || this.detectInputType(input);
    
    const generator = this[`generate${this.capitalize(language)}Template`];
    if (!generator) {
      throw new Error(`Template generator not implemented for ${language}`);
    }

    return generator.call(this, userCode, input, expectedOutput, templateInputType, outputType);
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  detectInputType(input) {
    const lines = input.trim().split('\n');
    
    if (lines.length === 1) {
      const line = lines[0].trim();
      if (line.startsWith('[') && line.endsWith(']')) {
        return 'array';
      } else if (/^\d+$/.test(line)) {
        return 'number';
      } else if (line.startsWith('"') && line.endsWith('"')) {
        return 'string';
      }
    }
    
    return 'multiple_params';
  }

  parseInput(input, inputType) {
    const lines = input.trim().split('\n');
    return lines.map(line => line.trim());
  }

  generateJavaScriptTemplate(userCode, input, expectedOutput, inputType) {
    const params = this.parseInput(input, inputType);
    
    const parseParams = params.map((param, i) => {
      if (param.startsWith('[')) {
        return `const param${i + 1} = JSON.parse('${param}');`;
      }
      return `const param${i + 1} = ${/^\d+$/.test(param) ? param : `${param}`};`;
    }).join('\n');

    const functionCall = `const result = userFunction(${params.map((_, i) => `param${i + 1}`).join(', ')});`;

    return `
${userCode}

// Find user function
const userFunction = (() => {
  const exports = {};
  eval(userCode);
  return Object.values(exports).find(v => typeof v === 'function') || solution;
})();

try {
  ${parseParams}
  
  ${functionCall}
  
  // Format output
  console.log(JSON.stringify(result));
} catch (error) {
  console.error('ERROR:', error.message);
  process.exit(1);
}`;
  }

  generatePythonTemplate(userCode, input, expectedOutput, inputType) {
    const params = this.parseInput(input, inputType);
    
    const parseParams = params.map((param, i) => {
      if (param.startsWith('[')) {
        return `param${i + 1} = ${param}`;
      }
      return `param${i + 1} = ${/^\d+$/.test(param) ? param : param}`;
    }).join('\n');

    const functionCall = `result = user_function(${params.map((_, i) => `param${i + 1}`).join(', ')})`;

    return `
${userCode}

import json
import sys

# Find user function
user_function = None
for name in dir():
    obj = locals()[name]
    if callable(obj) and not name.startswith('_'):
        user_function = obj
        break

if not user_function:
    print('ERROR: No function found')
    sys.exit(1)

try:
    ${parseParams}
    
    ${functionCall}
    
    # Format output
    if isinstance(result, (list, dict)):
        print(json.dumps(result))
    else:
        print(result)
except Exception as error:
    print(f'ERROR: {str(error)}')
    sys.exit(1)`;
  }

  generateJavaTemplate(userCode, input, expectedOutput, inputType) {
    const params = this.parseInput(input, inputType);
    
    // Convert input parameters to Java types
    const parseParams = params.map((param, i) => {
      if (param.startsWith('[')) {
        return `String param${i + 1}String = "${param.replace(/"/g, '\\"')}";
        // Parse array using your preferred JSON library`;
      }
      return `String param${i + 1} = ${/^\d+$/.test(param) ? param : `"${param.replace(/"/g, '\\"')}"`};`;
    }).join('\n');

    return `
${userCode}

public class Main {
    public static void main(String[] args) {
        try {
            ${parseParams}
            
            // Call solution method
            Solution solution = new Solution();
            Object result = solution.solution(${params.map((_, i) => `param${i + 1}`).join(', ')});
            
            // Print result
            System.out.println(result);
        } catch (Exception e) {
            System.err.println("ERROR: " + e.getMessage());
            System.exit(1);
        }
    }
}`;
  }

  generateCppTemplate(userCode, input, expectedOutput, inputType) {
    const params = this.parseInput(input, inputType);
    
    const parseParams = params.map((param, i) => {
      if (param.startsWith('[')) {
        return `string param${i + 1}Str = "${param.replace(/"/g, '\\"')}";
        // Parse array using your preferred method`;
      }
      return `auto param${i + 1} = ${/^\d+$/.test(param) ? param : `"${param.replace(/"/g, '\\"')}"`};`;
    }).join('\n');

    return `
${userCode}

int main() {
    try {
        ${parseParams}
        
        Solution solution;
        auto result = solution.solution(${params.map((_, i) => `param${i + 1}`).join(', ')});
        
        // Print result
        cout << result << endl;
        return 0;
    } catch (exception& e) {
        cerr << "ERROR: " << e.what() << endl;
        return 1;
    }
}`;
  }

  generateCTemplate(userCode, input, expectedOutput, inputType) {
    const params = this.parseInput(input, inputType);
    
    const parseParams = params.map((param, i) => {
      if (param.startsWith('[')) {
        return `char param${i + 1}Str[] = "${param.replace(/"/g, '\\"')}";
        // Parse array using your preferred method`;
      }
      return `${/^\d+$/.test(param) ? 'int' : 'char*'} param${i + 1} = ${/^\d+$/.test(param) ? param : `"${param.replace(/"/g, '\\"')}"`};`;
    }).join('\n');

    return `
${userCode}

int main() {
    ${parseParams}
    
    // Call solution function
    solution(${params.map((_, i) => `param${i + 1}`).join(', ')});
    
    return 0;
}`;
  }
}

module.exports = LeetCodeTemplateGenerator; 