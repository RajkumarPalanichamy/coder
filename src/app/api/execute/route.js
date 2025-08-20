import { NextResponse } from 'next/server';

const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;
const JUDGE0_URL = process.env.JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com';

const SUPPORTED_LANGUAGES = {
  javascript: { id: 63, name: 'JavaScript (Node.js 12.14.0)' },
  python: { id: 71, name: 'Python (3.8.1)' },
  java: { id: 62, name: 'Java (OpenJDK 13.0.1)' },
  cpp: { id: 54, name: 'C++ (GCC 9.2.0)' },
  c: { id: 50, name: 'C (GCC 9.2.0)' }
};

// Language mapping from frontend names to Judge0 keys
const LANGUAGE_MAPPING = {
  'javascript': 'javascript',
  'JavaScript': 'javascript',
  'python': 'python',
  'Python': 'python',
  'java': 'java',
  'Java': 'java',
  'cpp': 'cpp',
  'C++': 'cpp',
  'c': 'c',
  'C': 'c',
  'C Programming': 'c',
  'Embedded C Programming': 'c'
};

class Judge0Executor {
  constructor() {
    this.apiKey = JUDGE0_API_KEY;
    this.baseUrl = JUDGE0_URL;
    this.pollInterval = 1500;
    this.maxAttempts = 30;
  }

  async execute(code, language, testCases) {
    if (!this.apiKey) {
      throw new Error('Judge0 API key not configured');
    }

    // Map frontend language name to Judge0 language key
    const mappedLanguage = LANGUAGE_MAPPING[language] || language;
    const langConfig = SUPPORTED_LANGUAGES[mappedLanguage];
    if (!langConfig) {
      throw new Error(`Unsupported language: ${language} (mapped to: ${mappedLanguage})`);
    }

    const results = [];

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      const input = testCase.input || '';
      const expectedOutput = testCase.output || '';

      try {
        const token = await this.submitCode(code, langConfig.id, input);
        const result = await this.pollForResult(token);
        const processedResult = this.processResult(result, input, expectedOutput);
        results.push(processedResult);
      } catch (error) {
        console.error(`Error executing test case ${i + 1}:`, error);
        results.push({
          input,
          expected: expectedOutput,
          actual: '',
          passed: false,
          error: `Execution failed: ${error.message}`,
          status: 'execution_error',
          executionTime: '',
          memoryUsed: ''
        });
      }
    }

    return results;
  }

  async submitCode(sourceCode, languageId, stdin) {
    const submissionData = {
      source_code: this.encodeBase64(sourceCode),
      language_id: languageId,
      stdin: this.encodeBase64(stdin)
    };

    const response = await fetch(`${this.baseUrl}/submissions?base64_encoded=true&wait=false`, {
      method: 'POST',
      headers: {
        'X-RapidAPI-Key': this.apiKey,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(submissionData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Judge0 submission failed:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText,
      });
      throw new Error(`Judge0 submission failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.token) {
      throw new Error('No token received from Judge0');
    }

    return data.token;
  }

  async pollForResult(token) {
    let attempts = 0;

    while (attempts < this.maxAttempts) {
      try {
        const response = await fetch(`${this.baseUrl}/submissions/${token}?base64_encoded=true`, {
          headers: {
            'X-RapidAPI-Key': this.apiKey,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Poll attempt ${attempts + 1}: HTTP ${response.status}`, {
            status: response.status,
            statusText: response.statusText,
            errorText: errorText,
          });
          
          // If it's a 400 error with UTF-8 message, we need to use base64
          if (response.status === 400 && errorText.includes('UTF-8')) {
            console.log('UTF-8 encoding error detected, using base64 encoding');
            // Continue with base64 encoding
          }
          
          attempts++;
          await new Promise(resolve => setTimeout(resolve, this.pollInterval));
          continue;
        }

        const result = await response.json();
        
        if (result.status && result.status.id >= 3) {
          return result;
        }

        attempts++;
        await new Promise(resolve => setTimeout(resolve, this.pollInterval));
      } catch (error) {
        console.error(`Error polling result (attempt ${attempts + 1}):`, error);
        attempts++;
        await new Promise(resolve => setTimeout(resolve, this.pollInterval));
      }
    }

    throw new Error(`Execution timeout after ${this.maxAttempts} attempts`);
  }

  processResult(result, input, expectedOutput) {
    const statusId = result.status?.id || 0;
    // Decode base64 output if present
    const actualOutput = result.stdout ? this.decodeBase64(result.stdout) : '';
    let error = '';
    let passed = false;
    let status = 'unknown';

    // Check if output matches expected
    if (actualOutput.trim() === expectedOutput.trim()) {
      passed = true;
      status = 'accepted';
    }

    // Handle different status codes
    switch (statusId) {
      case 3:
        status = 'accepted';
        break;
      case 4:
        status = 'wrong_answer';
        error = `Wrong Answer - Expected: "${expectedOutput}", Got: "${actualOutput}"`;
        break;
      case 5:
        status = 'time_limit_exceeded';
        error = 'Time Limit Exceeded';
        break;
      case 6:
        status = 'compilation_error';
        const compileOutput = result.compile_output ? this.decodeBase64(result.compile_output) : 'Unknown compilation error';
        error = `Compilation Error: ${compileOutput}`;
        break;
      case 7:
        status = 'runtime_error';
        error = 'Runtime Error';
        break;
      case 8:
        status = 'memory_limit_exceeded';
        error = 'Memory Limit Exceeded';
        break;
      case 9:
        status = 'internal_error';
        error = 'Internal Error';
        break;
      case 12:
        status = 'runtime_error';
        const stderr = result.stderr ? this.decodeBase64(result.stderr) : 'Unknown runtime error';
        error = `Runtime Error: ${stderr}`;
        break;
      default:
        error = `Unknown Error: ${result.status?.description || 'Unknown status'}`;
    }

    if (status === 'accepted' && !passed) {
      status = 'wrong_answer';
      error = `Wrong Answer - Expected: "${expectedOutput}", Got: "${actualOutput}"`;
    }

    return {
      input,
      expected: expectedOutput,
      actual: actualOutput,
      passed,
      error,
      status,
      executionTime: result.time ? `${result.time}s` : '',
      memoryUsed: result.memory ? `${Math.round(result.memory / 1024)}MB` : '',
      statusId,
      statusDescription: result.status?.description || 'Unknown',
      token: result.token
    };
  }

  // Helper method to encode strings to base64
  encodeBase64(str) {
    try {
      if (!str) return '';
      return Buffer.from(str, 'utf-8').toString('base64');
    } catch (error) {
      console.warn('Failed to encode string to base64:', error);
      return str; // Return original string if encoding fails
    }
  }

  // Helper method to decode base64 strings
  decodeBase64(str) {
    try {
      if (!str) return '';
      return Buffer.from(str, 'base64').toString('utf-8');
    } catch (error) {
      console.warn('Failed to decode base64 string:', error);
      return str; // Return original string if decoding fails
    }
  }
}

export async function GET() {
  try {
    return NextResponse.json({
      languages: SUPPORTED_LANGUAGES,
      judge0Config: {
        url: JUDGE0_URL,
        hasApiKey: !!JUDGE0_API_KEY
      }
    });
  } catch (error) {
    console.error('Error getting language configuration:', error);
    return NextResponse.json({
      error: 'Failed to get language configuration',
      details: error.message
    }, { status: 500 });
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

    if (testCases.length === 0) {
      return NextResponse.json({
        error: 'At least one test case is required'
      }, { status: 400 });
    }

    if (!JUDGE0_API_KEY) {
      return NextResponse.json({
        error: 'Judge0 API key not configured',
        suggestion: 'Please set JUDGE0_API_KEY environment variable'
      }, { status: 500 });
    }

    const executor = new Judge0Executor();
    const startTime = Date.now();
    
    const results = await executor.execute(code, language, testCases);
    const executionDuration = Date.now() - startTime;

    const passedCount = results.filter(r => r.passed).length;
    const failedCount = results.length - passedCount;

    // Get the mapped language from the executor's language mapping
    const mappedLanguage = LANGUAGE_MAPPING[language] || language;

    return NextResponse.json({
      results,
      executionInfo: {
        originalLanguage: language,
        mappedLanguage: mappedLanguage,
        language: SUPPORTED_LANGUAGES[mappedLanguage],
        timestamp: new Date().toISOString(),
        totalTestCases: testCases.length,
        passedTestCases: passedCount,
        failedTestCases: failedCount,
        executionDuration: `${executionDuration}ms`,
        judge0Config: {
          url: JUDGE0_URL,
          pollInterval: executor.pollInterval
        }
      },
      notice: '✅ Code execution completed using Judge0 CE API'
    });

  } catch (error) {
    console.error('Judge0 execution error:', error);
    return NextResponse.json({
      error: 'Code execution failed',
      details: error.message,
      timestamp: new Date().toISOString(),
      suggestion: 'Check your Judge0 API key configuration and network connection'
    }, { status: 500 });
  }
} 