import { NextResponse } from 'next/server';
import LeetCodeTemplateGenerator from '../../../lib/LeetCodeTemplateGenerator';

// Judge0 CE API configuration based on official documentation
const createExecutionConfig = () => {
  return {
    judge0: {
      endpoint: process.env.JUDGE0_ENDPOINT || 'https://judge0-ce.p.rapidapi.com',
      apiKey: process.env.JUDGE0_API_KEY || process.env.RAPIDAPI_KEY,
      host: process.env.JUDGE0_HOST || 'judge0-ce.p.rapidapi.com',
      timeout: parseInt(process.env.JUDGE0_TIMEOUT) || 30000,
      pollInterval: parseInt(process.env.JUDGE0_POLL_INTERVAL) || 1000,
      maxAttempts: parseInt(process.env.JUDGE0_MAX_ATTEMPTS) || 30,
      // Judge0 execution limits
      defaultLimits: {
        cpu_time_limit: parseFloat(process.env.CPU_TIME_LIMIT) || 2.0,
        memory_limit: parseInt(process.env.MEMORY_LIMIT) || 128000, // KB
        wall_time_limit: parseFloat(process.env.WALL_TIME_LIMIT) || 5.0,
        stack_limit: parseInt(process.env.STACK_LIMIT) || 64000 // KB
      }
    },
    
    // Official Judge0 CE language IDs from documentation
    languages: {
      javascript: { id: 63, extension: 'js', compiler: 'Node.js 12.14.0' },
      python: { id: 71, extension: 'py', compiler: 'Python 3.8.1' },
      java: { id: 62, extension: 'java', compiler: 'OpenJDK 13.0.1' },
      cpp: { id: 54, extension: 'cpp', compiler: 'GCC 9.2.0' },
      c: { id: 50, extension: 'c', compiler: 'GCC 9.2.0' },
      // Additional languages supported by Judge0 CE
      csharp: { id: 51, extension: 'cs', compiler: 'C# (Mono 6.6.0.161)' },
      go: { id: 60, extension: 'go', compiler: 'Go 1.13.5' },
      kotlin: { id: 78, extension: 'kt', compiler: 'Kotlin 1.3.70' },
      php: { id: 68, extension: 'php', compiler: 'PHP 7.4.1' },
      ruby: { id: 72, extension: 'rb', compiler: 'Ruby 2.7.0' },
      rust: { id: 73, extension: 'rs', compiler: 'Rust 1.40.0' },
      swift: { id: 83, extension: 'swift', compiler: 'Swift 5.2.3' },
      typescript: { id: 74, extension: 'ts', compiler: 'TypeScript 3.7.4' }
    },
    
    enableFallback: process.env.ENABLE_FALLBACK !== 'false'
  };
};

// LeetCode-style template generator
class LeetCodeTemplateGenerator {
  constructor() {}
  
  // Generate template with optional explicit data type or auto-detection
  generateTemplate(language, userCode, input, expectedOutput, inputType = null, outputType = null) {
    // Use explicit input type if provided, otherwise auto-detect
    let templateInputType;
    if (inputType) {
      // Map our explicit data types to internal template types
      templateInputType = this.mapDataTypeToTemplateType(inputType);
    } else {
      // Auto-detect from input content
      templateInputType = this.detectInputType(input);
    }
    
    switch (language) {
      case 'javascript':
        return this.generateJavaScriptTemplate(userCode, input, expectedOutput, templateInputType, outputType);
      case 'python':
        return this.generatePythonTemplate(userCode, input, expectedOutput, templateInputType, outputType);
      case 'java':
        return this.generateJavaTemplate(userCode, input, expectedOutput, templateInputType, outputType);
      case 'cpp':
        return this.generateCppTemplate(userCode, input, expectedOutput, templateInputType, outputType);
      case 'c':
        return this.generateCTemplate(userCode, input, expectedOutput, templateInputType, outputType);
      default:
        return userCode;
    }
  }
  
  detectInputType(input) {
    const lines = input.trim().split('\n');
    
    if (lines.length === 1) {
      const line = lines[0].trim();
      if (line.startsWith('[') && line.endsWith(']')) {
        return 'single_array';
      } else if (/^\d+$/.test(line)) {
        return 'single_number';
      } else if (line.startsWith('"') && line.endsWith('"')) {
        return 'single_string';
      }
    } else if (lines.length === 2) {
      return 'array_and_param';
    }
    
    return 'multi_param';
  }

  // Map our explicit data types to internal template types
  mapDataTypeToTemplateType(dataType) {
    const mapping = {
      'string': 'single_string',
      'number': 'single_number',
      'array_number': 'single_array',
      'array_string': 'single_array',
      'matrix_number': 'single_array',
      'matrix_string': 'single_array', 
      'boolean': 'single_number', // Treat boolean as single value
      'object': 'single_string', // JSON object as string
      'multiple_params': 'multi_param'
    };
    
    return mapping[dataType] || 'multi_param';
  }
  
  parseInput(input, inputType) {
    const lines = input.trim().split('\n');
    
    switch (inputType) {
      case 'single_array':
        return [lines[0]];
      case 'single_number':
        return [lines[0]];
      case 'single_string':
        return [lines[0]];
      case 'array_and_param':
        return [lines[0], lines[1]];
      case 'multi_param':
        return lines;
      default:
        return lines;
    }
  }
  
  generateJavaScriptTemplate(userCode, input, expectedOutput, inputType) {
    const args = this.parseInput(input, inputType);
    
    let testCallCode = '';
    let parseCode = '';
    
    switch (inputType) {
      case 'single_array':
        parseCode = `const param1 = JSON.parse('${args[0]}');`;
        testCallCode = 'const result = userFunction(param1);';
        break;
      case 'single_number':
        parseCode = `const param1 = ${args[0]};`;
        testCallCode = 'const result = userFunction(param1);';
        break;
      case 'single_string':
        parseCode = `const param1 = ${args[0]};`;
        testCallCode = 'const result = userFunction(param1);';
        break;
      case 'array_and_param':
        parseCode = `
const param1 = JSON.parse('${args[0]}');
const param2 = ${isNaN(args[1]) ? `"${args[1]}"` : args[1]};`;
        testCallCode = 'const result = userFunction(param1, param2);';
        break;
      default:
        parseCode = args.map((arg, i) => 
          `const param${i+1} = ${arg.startsWith('[') ? `JSON.parse('${arg}')` : 
          isNaN(arg) ? `"${arg}"` : arg};`
        ).join('\n');
        testCallCode = `const result = userFunction(${args.map((_, i) => `param${i+1}`).join(', ')});`;
    }
    
    return `
${userCode}

// Find user function dynamically
let userFunction = null;
const functionNames = Object.getOwnPropertyNames(global).filter(name => typeof global[name] === 'function');
for (const name of functionNames) {
  if (!name.startsWith('_') && name !== 'require' && name !== 'eval') {
    userFunction = global[name];
    break;
  }
}

if (!userFunction) {
  console.log('ERROR: No function found in code');
  process.exit(1);
}

try {
  ${parseCode}
  
  ${testCallCode}
  
  // Format output
  if (Array.isArray(result)) {
    console.log(JSON.stringify(result));
  } else if (typeof result === 'string') {
    console.log(result);
  } else {
    console.log(result);
  }
} catch (error) {
  console.log('ERROR: ' + error.message);
  process.exit(1);
}
`;
  }
  
  generatePythonTemplate(userCode, input, expectedOutput, inputType) {
    const args = this.parseInput(input, inputType);
    
    let testCallCode = '';
    let parseCode = '';
    
    switch (inputType) {
      case 'single_array':
        parseCode = `param1 = ${args[0]}`;
        testCallCode = 'result = user_function(param1)';
        break;
      case 'single_number':
        parseCode = `param1 = ${args[0]};`;
        testCallCode = 'result = user_function(param1)';
        break;
      case 'single_string':
        parseCode = `param1 = ${args[0]}`;
        testCallCode = 'result = user_function(param1)';
        break;
      case 'array_and_param':
        parseCode = `
param1 = ${args[0]}
param2 = ${isNaN(args[1]) ? `"${args[1]}"` : args[1]}`;
        testCallCode = 'result = user_function(param1, param2)';
        break;
      default:
        parseCode = args.map((arg, i) => 
          `param${i+1} = ${arg.startsWith('[') ? arg : 
          isNaN(arg) ? `"${arg}"` : arg}`
        ).join('\n');
        testCallCode = `result = user_function(${args.map((_, i) => `param${i+1}`).join(', ')})`;
    }
    
    return `
${userCode}

import json
import sys

# Find user function dynamically
user_function = None
for name in dir():
    obj = locals()[name]
    if callable(obj) and not name.startswith('_') and name not in ['json', 'sys']:
        user_function = obj
        break

if not user_function:
    print('ERROR: No function found in code')
    sys.exit(1)

try:
    ${parseCode}
    
    ${testCallCode}
    
    # Format output
    if isinstance(result, list):
        print(json.dumps(result))
    elif isinstance(result, str):
        print(result)
    else:
        print(result)
except Exception as error:
    print(f'ERROR: {error}')
    sys.exit(1)
`;
  }
  
  generateJavaTemplate(userCode, input, expectedOutput, inputType) {
    // For Java, we expect users to write complete programs with main()
    // Just return their code as-is for now since Java method detection is complex
    return userCode;
  }
  
  generateCppTemplate(userCode, input, expectedOutput, inputType) {
    // For C++, we expect users to write complete programs with main()
    // Just return their code as-is for now since C++ function detection is complex
    return userCode;
  }
  
  generateCTemplate(userCode, input, expectedOutput, inputType) {
    // For C, we expect users to write complete programs with main()
    // Just return their code as-is for now since C function detection is complex
    return userCode;
  }
}

// Judge0 CE executor with LeetCode-style templates
class Judge0Executor {
  constructor(config) {
    this.config = config;
    this.templateGenerator = new LeetCodeTemplateGenerator();
  }
  
  async execute(code, language, testCases) {
    const langConfig = this.config.languages[language];
    if (!langConfig) {
      throw new Error(`Unsupported language: ${language}`);
    }
    
    // Real execution with Judge0 CE API
    if (this.config.judge0.apiKey && this.config.judge0.apiKey !== 'demo-key') {
      return await this.executeWithJudge0(code, language, testCases, langConfig);
    }
    
    // Fallback mode for development
    if (this.config.enableFallback) {
      return await this.executeWithFallback(code, language, testCases);
    }
    
    throw new Error('No execution engine available. Please configure Judge0 API key.');
  }
  
  async executeWithJudge0(code, language, testCases, langConfig) {
    const results = [];
    
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      const input = testCase.input || '';
      const expectedOutput = testCase.output || '';
      
      try {
        // Generate LeetCode-style template with explicit data types if available
        const wrappedCode = this.templateGenerator.generateTemplate(
          language, code, input, expectedOutput, testCase.inputType, testCase.outputType
        );
        
        // Create submission using Judge0 CE API specification
        const submissionData = {
          language_id: langConfig.id,
          source_code: Buffer.from(wrappedCode).toString('base64'),
          stdin: Buffer.from('').toString('base64'), // No stdin needed for LeetCode style
          expected_output: Buffer.from(expectedOutput).toString('base64'),
          // Apply default execution limits
          cpu_time_limit: this.config.judge0.defaultLimits.cpu_time_limit,
          memory_limit: this.config.judge0.defaultLimits.memory_limit,
          wall_time_limit: this.config.judge0.defaultLimits.wall_time_limit,
          stack_limit: this.config.judge0.defaultLimits.stack_limit
        };

        const submissionResponse = await fetch(
          `${this.config.judge0.endpoint}/submissions?base64_encoded=true&wait=false`, 
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-RapidAPI-Key': this.config.judge0.apiKey,
              'X-RapidAPI-Host': this.config.judge0.host
            },
            body: JSON.stringify(submissionData)
          }
        );
        
        if (!submissionResponse.ok) {
          throw new Error(`Judge0 API error: ${submissionResponse.status} ${submissionResponse.statusText}`);
        }
        
        const submission = await submissionResponse.json();
        const token = submission.token;
        
        if (!token) {
          throw new Error('Failed to get submission token from Judge0');
        }
        
        // Poll for results according to Judge0 specification
        const result = await this.pollForResult(token);
        
        // Process result according to Judge0 status codes
        const processedResult = this.processExecutionResult(result, input, expectedOutput);
        results.push(processedResult);
        
      } catch (error) {
        console.error(`Execution error for test case ${i + 1}:`, error);
        results.push({
          input,
          expected: expectedOutput,
          actual: '',
          passed: false,
          error: `Execution failed: ${error.message}`,
          executionTime: '',
          memoryUsed: '',
          status: 'execution_error'
        });
      }
    }
    
    return results;
  }
  
  async pollForResult(token) {
    let attempts = 0;
    
    while (attempts < this.config.judge0.maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, this.config.judge0.pollInterval));
      attempts++;
      
      try {
        const resultResponse = await fetch(
          `${this.config.judge0.endpoint}/submissions/${token}?base64_encoded=true&fields=*`, 
          {
            headers: {
              'X-RapidAPI-Key': this.config.judge0.apiKey,
              'X-RapidAPI-Host': this.config.judge0.host
            }
          }
        );
        
        if (!resultResponse.ok) {
          console.warn(`Poll attempt ${attempts}: HTTP ${resultResponse.status}`);
          continue;
        }
        
        const resultData = await resultResponse.json();
        
        // Judge0 status codes: 1=In Queue, 2=Processing, 3=Accepted, >=4=Various errors
        if (resultData.status?.id >= 3) {
          return resultData;
        }
        
      } catch (error) {
        console.warn(`Poll attempt ${attempts} failed:`, error.message);
      }
    }
    
    throw new Error(`Execution timeout after ${this.config.judge0.maxAttempts} attempts`);
  }
  
  processExecutionResult(result, input, expectedOutput) {
    let actualOutput = '';
    let error = '';
    let status = 'unknown';
    
    // Decode base64 output if present
    if (result.stdout) {
      actualOutput = Buffer.from(result.stdout, 'base64').toString().trim();
    }
    
    // Handle ERROR prefix in output
    if (actualOutput.startsWith('ERROR: ')) {
      error = actualOutput;
      status = 'runtime_error_user';
      actualOutput = '';
    } else {
      // Process according to official Judge0 CE status codes
      switch (result.status?.id) {
        case 1:
          status = 'in_queue';
          error = 'Submission is in queue';
          break;
        case 2:
          status = 'processing';
          error = 'Submission is being processed';
          break;
        case 3:
          status = 'accepted';
          // No error for accepted submissions
          break;
        case 4:
          status = 'wrong_answer';
          error = 'Wrong Answer';
          break;
        case 5:
          status = 'time_limit_exceeded';
          error = 'Time Limit Exceeded';
          break;
        case 6:
          status = 'compilation_error';
          error = 'Compilation Error';
          if (result.compile_output) {
            const compileError = Buffer.from(result.compile_output, 'base64').toString();
            error = `Compilation Error: ${compileError.trim()}`;
          }
          break;
        case 7:
          status = 'runtime_error_sigsegv';
          error = 'Runtime Error (SIGSEGV)';
          break;
        case 8:
          status = 'runtime_error_sigxfsz';
          error = 'Runtime Error (SIGXFSZ)';
          break;
        case 9:
          status = 'runtime_error_sigfpe';
          error = 'Runtime Error (SIGFPE) - Division by zero or arithmetic error';
          break;
        case 10:
          status = 'runtime_error_sigabrt';
          error = 'Runtime Error (SIGABRT)';
          break;
        case 11:
          status = 'runtime_error_nzec';
          error = 'Runtime Error (NZEC) - Non-zero exit code';
          break;
        case 12:
          status = 'runtime_error_other';
          error = 'Runtime Error (Other)';
          break;
        case 13:
          status = 'internal_error';
          error = 'Internal Error';
          break;
        case 14:
          status = 'exec_format_error';
          error = 'Exec Format Error';
          break;
        default:
          status = 'unknown_error';
          error = `Unknown Error: ${result.status?.description || 'Unrecognized status'}`;
      }
    }
    
    // Add stderr information if available and no specific error set
    if (result.stderr && !error) {
      const stderrText = Buffer.from(result.stderr, 'base64').toString();
      if (stderrText.trim()) {
        error = `Runtime Error: ${stderrText.trim()}`;
        status = 'runtime_error_stderr';
      }
    }
    
    // For wrong answer, add specific information
    if (status === 'wrong_answer' && result.expected_output) {
      const expectedDecoded = Buffer.from(result.expected_output, 'base64').toString().trim();
      error = `Wrong Answer - Expected: "${expectedDecoded}", Got: "${actualOutput}"`;
    }
    
    const passed = status === 'accepted' && actualOutput === expectedOutput.trim();
    
    return {
      input,
      expected: expectedOutput,
      actual: actualOutput,
      passed,
      error,
      status,
      executionTime: result.time ? `${result.time}s` : '',
      memoryUsed: result.memory ? `${Math.round(result.memory / 1024)}MB` : '',
      wallTime: result.wall_time ? `${result.wall_time}s` : '',
      // Additional Judge0 information
      statusId: result.status?.id || 0,
      statusDescription: result.status?.description || 'Unknown',
      token: result.token,
      createdAt: result.created_at,
      finishedAt: result.finished_at
    };
  }
  
  async executeWithFallback(code, language, testCases) {
    console.log('Using fallback execution mode - configure Judge0 API key for real execution');
    
    const results = testCases.map((testCase, index) => ({
      input: testCase.input || '',
      expected: testCase.output || '',
      actual: `Fallback mode (Test ${index + 1})`,
      passed: false,
      error: 'Fallback execution - configure Judge0 API key for real code execution',
      status: 'fallback_mode',
      executionTime: '0.1s',
      memoryUsed: '1MB',
      statusId: -1,
      statusDescription: 'Fallback Mode'
    }));
    
    return results;
  }
}

// API endpoint for getting supported languages
export async function GET(req) {
  try {
    const config = createExecutionConfig();
    
    // Return available languages with their Judge0 CE IDs
    return NextResponse.json({
      languages: config.languages,
      judge0Config: {
        endpoint: config.judge0.endpoint,
        hasApiKey: !!(config.judge0.apiKey && config.judge0.apiKey !== 'demo-key'),
        defaultLimits: config.judge0.defaultLimits
      },
      fallbackEnabled: config.enableFallback,
      executionStyle: 'leetcode' // Indicate LeetCode-style execution
    });
    
  } catch (error) {
    console.error('Error getting language configuration:', error);
    return NextResponse.json({
      error: 'Failed to get language configuration',
      details: error.message
    }, { status: 500 });
  }
}

// Main code execution endpoint
export async function POST(req) {
  try {
    const { code, language, input, expectedOutput, inputType, outputType } = await req.json();

    if (!code || !language || !input || !expectedOutput) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const templateGenerator = new LeetCodeTemplateGenerator();
    const template = templateGenerator.generateTemplate(
      language,
      code,
      input,
      expectedOutput,
      inputType,
      outputType
    );

    // Execute the code using your preferred execution engine
    // This is a placeholder for the actual execution logic
    const result = await executeCode(template, language);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Execution error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to execute code' },
      { status: 500 }
    );
  }
}

async function executeCode(code, language) {
  // This is a placeholder for your actual code execution logic
  // You would typically use a service like Judge0 or a sandboxed environment
  return {
    output: 'Code execution placeholder',
    status: 'success',
    executionTime: 0
  };
} 