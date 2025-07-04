import { NextResponse } from 'next/server';

// Dynamic configuration system for real-time coding
const createExecutionConfig = () => {
  return {
    // Judge0 API Configuration - fully dynamic
    judge0: {
      endpoint: process.env.JUDGE0_ENDPOINT || 'https://judge0-ce.p.rapidapi.com',
      apiKey: process.env.JUDGE0_API_KEY || process.env.RAPIDAPI_KEY,
      host: process.env.JUDGE0_HOST || 'judge0-ce.p.rapidapi.com',
      timeout: parseInt(process.env.JUDGE0_TIMEOUT) || 30000,
      pollInterval: parseInt(process.env.JUDGE0_POLL_INTERVAL) || 1000,
      maxAttempts: parseInt(process.env.JUDGE0_MAX_ATTEMPTS) || 30
    },
    
    // Dynamic language configuration
    languages: JSON.parse(process.env.SUPPORTED_LANGUAGES || JSON.stringify({
      javascript: { id: 63, extension: 'js', compiler: 'Node.js' },
      python: { id: 71, extension: 'py', compiler: 'Python 3' },
      java: { id: 62, extension: 'java', compiler: 'OpenJDK' },
      cpp: { id: 54, extension: 'cpp', compiler: 'GCC' },
      c: { id: 50, extension: 'c', compiler: 'GCC' }
    })),
    
    // Real-time execution settings
    realtime: {
      enableWebSocket: process.env.ENABLE_WEBSOCKET === 'true',
      streamResults: process.env.STREAM_RESULTS === 'true',
      cacheResults: process.env.CACHE_RESULTS === 'true',
      enableFallback: process.env.ENABLE_FALLBACK !== 'false'
    }
  };
};

// Dynamic problem type detection based on input patterns
const detectProblemType = (testCases) => {
  if (!testCases || testCases.length === 0) return 'unknown';
  
  const firstInput = testCases[0].input;
  if (!firstInput) return 'unknown';
  
  // Real-time pattern analysis
  const patterns = [
    { type: 'array_with_param', test: /^\[.*\]\s*\n\s*\d+/ },
    { type: 'matrix', test: /^\[\[.*\]\]/ },
    { type: 'array', test: /^\[.*\]$/ },
    { type: 'string', test: /^".*"$/ },
    { type: 'multiple_numbers', test: /^\d+(\s+\d+)+$/ },
    { type: 'single_number', test: /^\d+$/ },
    { type: 'multiline', test: /\n/ },
    { type: 'two_numbers', test: /^\d+\s+\d+$/ }
  ];
  
  for (const pattern of patterns) {
    if (pattern.test.test(firstInput.trim())) {
      return pattern.type;
    }
  }
  
  return 'custom';
};

// Dynamic template generation system
class TemplateGenerator {
  constructor(config) {
    this.config = config;
  }
  
  generateForLanguage(language, userCode, input, problemType) {
    const method = `generate${language.charAt(0).toUpperCase() + language.slice(1)}Template`;
    if (typeof this[method] === 'function') {
      return this[method](userCode, input, problemType);
    }
    throw new Error(`Template generation not supported for language: ${language}`);
  }
  
  generateJavascriptTemplate(userCode, input, problemType) {
    const templates = {
      array_with_param: this.createArrayWithParamTemplate('js', userCode, input),
      array: this.createArrayTemplate('js', userCode, input),
      matrix: this.createMatrixTemplate('js', userCode, input),
      string: this.createStringTemplate('js', userCode, input),
      single_number: this.createSingleNumberTemplate('js', userCode, input),
      multiple_numbers: this.createMultipleNumbersTemplate('js', userCode, input),
      multiline: this.createMultilineTemplate('js', userCode, input),
      two_numbers: this.createTwoNumbersTemplate('js', userCode, input),
      custom: this.createCustomTemplate('js', userCode, input)
    };
    
    return templates[problemType] || templates.custom;
  }
  
  generatePythonTemplate(userCode, input, problemType) {
    const templates = {
      array_with_param: this.createArrayWithParamTemplate('python', userCode, input),
      array: this.createArrayTemplate('python', userCode, input),
      matrix: this.createMatrixTemplate('python', userCode, input),
      string: this.createStringTemplate('python', userCode, input),
      single_number: this.createSingleNumberTemplate('python', userCode, input),
      multiple_numbers: this.createMultipleNumbersTemplate('python', userCode, input),
      multiline: this.createMultilineTemplate('python', userCode, input),
      two_numbers: this.createTwoNumbersTemplate('python', userCode, input),
      custom: this.createCustomTemplate('python', userCode, input)
    };
    
    return templates[problemType] || templates.custom;
  }
  
  generateJavaTemplate(userCode, input, problemType) {
    const templates = {
      array_with_param: this.createArrayWithParamTemplate('java', userCode, input),
      array: this.createArrayTemplate('java', userCode, input),
      two_numbers: this.createTwoNumbersTemplate('java', userCode, input),
      custom: this.createCustomTemplate('java', userCode, input)
    };
    
    return templates[problemType] || templates.custom;
  }
  
  generateCppTemplate(userCode, input, problemType) {
    const templates = {
      array_with_param: this.createArrayWithParamTemplate('cpp', userCode, input),
      array: this.createArrayTemplate('cpp', userCode, input),
      two_numbers: this.createTwoNumbersTemplate('cpp', userCode, input),
      custom: this.createCustomTemplate('cpp', userCode, input)
    };
    
    return templates[problemType] || templates.custom;
  }
  
  generateCTemplate(userCode, input, problemType) {
    const templates = {
      array_with_param: this.createArrayWithParamTemplate('c', userCode, input),
      two_numbers: this.createTwoNumbersTemplate('c', userCode, input),
      custom: this.createCustomTemplate('c', userCode, input)
    };
    
    return templates[problemType] || templates.custom;
  }
  
  // Dynamic template creators for different problem types
  createArrayWithParamTemplate(lang, userCode, input) {
    const escapedInput = input.replace(/`/g, '\\`').replace(/"/g, '\\"').replace(/\n/g, '\\n');
    
    switch (lang) {
      case 'js':
        return `
${userCode}

const input = \`${escapedInput}\`;
const lines = input.trim().split('\\n');
const arr = JSON.parse(lines[0]);
const param = parseInt(lines[1]);

let result;
if (typeof solve === 'function') {
  result = solve(arr, param);
} else if (typeof subarraySum === 'function') {
  result = subarraySum(arr, param);
} else {
  result = 0;
}
console.log(result);
`;
      
      case 'python':
        return `
${userCode}

import json
input_data = """${escapedInput}"""
lines = input_data.strip().split('\\n')
arr = json.loads(lines[0])
param = int(lines[1])

result = None
if 'subarray_sum' in locals():
    result = subarray_sum(arr, param)
elif 'solve' in locals():
    result = solve(arr, param)
else:
    result = 0

print(result)
`;
      
      case 'java':
        return `
import java.util.*;

public class Main {
    ${userCode.includes('class') ? userCode.replace(/public\s+class\s+\w+/g, '').replace(/class\s+\w+/g, '') : userCode}
    
    public static void main(String[] args) {
        String input = "${escapedInput}";
        String[] lines = input.split("\\\\n");
        
        String arrayStr = lines[0].trim().replaceAll("[\\\\[\\\\]]", "");
        String[] parts = arrayStr.split(",");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) {
            nums[i] = Integer.parseInt(parts[i].trim());
        }
        
        int k = Integer.parseInt(lines[1].trim());
        
        Main solution = new Main();
        int result = solution.subarraySum(nums, k);
        System.out.println(result);
    }
    
    public int subarraySum(int[] nums, int k) {
        return 0;
    }
}
`;
      
      default:
        return userCode; // Fallback to raw code
    }
  }
  
  createArrayTemplate(lang, userCode, input) {
    const escapedInput = input.replace(/`/g, '\\`').replace(/"/g, '\\"');
    
    switch (lang) {
      case 'js':
        return `
${userCode}

const input = \`${escapedInput}\`;
const arr = JSON.parse(input.trim());

let result;
if (typeof solve === 'function') {
  result = solve(arr);
} else {
  result = arr.reduce((a, b) => a + b, 0);
}
console.log(Array.isArray(result) ? JSON.stringify(result) : result);
`;
      
      case 'python':
        return `
${userCode}

import json
input_data = """${escapedInput}"""
arr = json.loads(input_data.strip())

result = None
if 'solve' in locals():
    result = solve(arr)
else:
    result = sum(arr)

if isinstance(result, list):
    print(json.dumps(result))
else:
    print(result)
`;
      
      default:
        return userCode;
    }
  }
  
  createTwoNumbersTemplate(lang, userCode, input) {
    const escapedInput = input.replace(/"/g, '\\"');
    
    switch (lang) {
      case 'js':
        return `
${userCode}

const input = \`${escapedInput}\`;
const [a, b] = input.trim().split(' ').map(Number);

let result;
if (typeof solve === 'function') {
  result = solve(a, b);
} else {
  result = a + b;
}
console.log(result);
`;
      
      case 'python':
        return `
${userCode}

input_data = """${escapedInput}"""
a, b = map(int, input_data.strip().split())

result = None
if 'solve' in locals():
    result = solve(a, b)
else:
    result = a + b

print(result)
`;
      
      default:
        return userCode;
    }
  }
  
  // Additional template creators for other problem types...
  createMatrixTemplate(lang, userCode, input) { return this.createArrayTemplate(lang, userCode, input); }
  createStringTemplate(lang, userCode, input) { return this.createArrayTemplate(lang, userCode, input); }
  createSingleNumberTemplate(lang, userCode, input) { return this.createTwoNumbersTemplate(lang, userCode, input); }
  createMultipleNumbersTemplate(lang, userCode, input) { return this.createArrayTemplate(lang, userCode, input); }
  createMultilineTemplate(lang, userCode, input) { return this.createArrayTemplate(lang, userCode, input); }
  createCustomTemplate(lang, userCode, input) { return userCode; }
}

// Real-time execution engine
class RealTimeExecutor {
  constructor(config) {
    this.config = config;
    this.templateGenerator = new TemplateGenerator(config);
  }
  
  async execute(code, language, testCases) {
    const langConfig = this.config.languages[language];
    if (!langConfig) {
      throw new Error(`Unsupported language: ${language}`);
    }
    
    // Real-time execution with Judge0
    if (this.config.judge0.apiKey && this.config.judge0.apiKey !== 'demo-key') {
      return await this.executeWithJudge0(code, language, testCases, langConfig);
    }
    
    // Fallback only if enabled
    if (this.config.realtime.enableFallback) {
      return await this.executeWithFallback(code, language, testCases);
    }
    
    throw new Error('No execution engine available. Please configure Judge0 API key.');
  }
  
  async executeWithJudge0(code, language, testCases, langConfig) {
    const problemType = detectProblemType(testCases);
    const results = [];
    
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      const input = testCase.input || '';
      const expectedOutput = testCase.output || '';
      
      try {
        const wrappedCode = this.templateGenerator.generateForLanguage(language, code, input, problemType);
        
        // Submit to Judge0 with dynamic configuration
        const submissionResponse = await fetch(`${this.config.judge0.endpoint}/submissions?base64_encoded=true&wait=false`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': this.config.judge0.apiKey,
            'X-RapidAPI-Host': this.config.judge0.host
          },
          body: JSON.stringify({
            language_id: langConfig.id,
            source_code: Buffer.from(wrappedCode).toString('base64'),
            stdin: ''
          })
        });
        
        if (!submissionResponse.ok) {
          throw new Error(`Judge0 API error: ${submissionResponse.statusText}`);
        }
        
        const submissionData = await submissionResponse.json();
        const token = submissionData.token;
        
        if (!token) {
          throw new Error('Failed to get submission token');
        }
        
        // Poll for results with dynamic configuration
        const result = await this.pollForResult(token);
        
        // Process result
        const processedResult = this.processExecutionResult(result, input, expectedOutput);
        results.push(processedResult);
        
      } catch (error) {
        results.push({
          input,
          expected: expectedOutput,
          actual: '',
          passed: false,
          error: `Execution failed: ${error.message}`,
          executionTime: '',
          memoryUsed: ''
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
      
      const resultResponse = await fetch(`${this.config.judge0.endpoint}/submissions/${token}?base64_encoded=true`, {
        headers: {
          'X-RapidAPI-Key': this.config.judge0.apiKey,
          'X-RapidAPI-Host': this.config.judge0.host
        }
      });
      
      if (!resultResponse.ok) continue;
      
      const resultData = await resultResponse.json();
      
      if (resultData.status?.id >= 3) {
        return resultData;
      }
    }
    
    throw new Error('Execution timeout');
  }
  
  processExecutionResult(result, input, expectedOutput) {
    let actualOutput = '';
    let error = '';
    
    if (result.stdout) {
      actualOutput = Buffer.from(result.stdout, 'base64').toString().trim();
    }
    
    if (result.status?.id === 6) {
      error = 'Compilation Error';
      if (result.compile_output) {
        const compileError = Buffer.from(result.compile_output, 'base64').toString();
        error = `Compilation Error: ${compileError.trim()}`;
      }
    } else if (result.status?.id === 5) {
      error = 'Time Limit Exceeded';
    } else if (result.status?.id !== 3) {
      error = `Runtime Error: ${result.status?.description || 'Unknown'}`;
    }
    
    if (result.stderr) {
      const stderrText = Buffer.from(result.stderr, 'base64').toString();
      if (stderrText.trim()) {
        error = error || `Runtime Error: ${stderrText.trim()}`;
      }
    }
    
    const passed = !error && actualOutput === expectedOutput.trim();
    
    return {
      input,
      expected: expectedOutput,
      actual: actualOutput,
      passed,
      error,
      executionTime: result.time ? `${result.time}s` : '',
      memoryUsed: result.memory ? `${result.memory}KB` : ''
    };
  }
  
  async executeWithFallback(code, language, testCases) {
    // Minimal fallback for development only
    console.log('Using fallback execution mode...');
    
    const results = testCases.map(testCase => ({
      input: testCase.input || '',
      expected: testCase.output || '',
      actual: 'Fallback mode active',
      passed: false,
      error: 'Fallback execution - configure Judge0 for real execution',
      executionTime: '0.1s',
      memoryUsed: '1MB'
    }));
    
    return results;
  }
}

export async function POST(req) {
  try {
    const { code, language, testCases } = await req.json();
    
    if (!code || !language || !Array.isArray(testCases)) {
      return NextResponse.json({ 
        error: 'Missing required parameters: code, language, or testCases' 
      }, { status: 400 });
    }
    
    // Create dynamic configuration
    const config = createExecutionConfig();
    
    // Validate language support
    if (!config.languages[language]) {
      return NextResponse.json({ 
        error: `Unsupported language: ${language}. Supported: ${Object.keys(config.languages).join(', ')}` 
      }, { status: 400 });
    }
    
    // Initialize real-time executor
    const executor = new RealTimeExecutor(config);
    
    // Execute code
    const results = await executor.execute(code, language, testCases);
    
    // Determine problem type for response
    const problemType = detectProblemType(testCases);
    
    // Return results with execution info
    return NextResponse.json({
      results,
      executionInfo: {
        problemType,
        language: config.languages[language],
        timestamp: new Date().toISOString(),
        totalTestCases: testCases.length,
        passedTestCases: results.filter(r => r.passed).length
      },
      notice: config.judge0.apiKey && config.judge0.apiKey !== 'demo-key' 
        ? `✅ Real-time execution (${problemType} problem type detected)`
        : '⚠️ Configure Judge0 API key for real-time execution'
    });
    
  } catch (error) {
    console.error('Real-time execution error:', error);
    return NextResponse.json({
      error: 'Real-time execution failed',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 