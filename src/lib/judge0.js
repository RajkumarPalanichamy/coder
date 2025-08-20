/**
 * Judge0 Service - Enhanced version with better error handling and testing
 */

const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;
const JUDGE0_URL = process.env.JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com';

// Comprehensive language support with Judge0 language IDs
export const SUPPORTED_LANGUAGES = {
  javascript: { 
    id: 63, 
    name: 'JavaScript (Node.js 12.14.0)',
    extension: '.js',
    template: `function solution(input) {
    // Your code here
    return "";
}

// Example usage:
// console.log(solution("test input"));`
  },
  python: { 
    id: 71, 
    name: 'Python (3.8.1)',
    extension: '.py',
    template: `def solution(input_data):
    # Your code here
    return ""

# Example usage:
# print(solution("test input"))`
  },
  java: { 
    id: 62, 
    name: 'Java (OpenJDK 13.0.1)',
    extension: '.java',
    template: `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String input = br.readLine();
        
        System.out.println(solution(input));
    }
    
    public static String solution(String input) {
        // Your code here
        return "";
    }
}`
  },
  cpp: { 
    id: 54, 
    name: 'C++ (GCC 9.2.0)',
    extension: '.cpp',
    template: `#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
using namespace std;

string solution(string input) {
    // Your code here
    return "";
}

int main() {
    string input;
    getline(cin, input);
    cout << solution(input) << endl;
    return 0;
}`
  },
  c: { 
    id: 50, 
    name: 'C (GCC 9.2.0)',
    extension: '.c',
    template: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

char* solution(char* input) {
    // Your code here
    static char result[256];
    strcpy(result, "");
    return result;
}

int main() {
    char input[1000];
    fgets(input, sizeof(input), stdin);
    
    char* result = solution(input);
    printf("%s\\n", result);
    
    return 0;
}`
  }
};

// Language mapping from frontend names to Judge0 keys
export const LANGUAGE_MAPPING = {
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

// Judge0 status codes and their meanings
export const STATUS_CODES = {
  1: { name: 'In Queue', description: 'Submission is in queue' },
  2: { name: 'Processing', description: 'Submission is being processed' },
  3: { name: 'Accepted', description: 'Submission was accepted' },
  4: { name: 'Wrong Answer', description: 'Submission was not accepted' },
  5: { name: 'Time Limit Exceeded', description: 'Submission exceeded time limit' },
  6: { name: 'Compilation Error', description: 'Submission could not be compiled' },
  7: { name: 'Runtime Error (SIGSEGV)', description: 'Submission caused a segmentation fault' },
  8: { name: 'Runtime Error (SIGXFSZ)', description: 'Submission exceeded file size limit' },
  9: { name: 'Runtime Error (SIGFPE)', description: 'Submission caused a floating point exception' },
  10: { name: 'Runtime Error (SIGABRT)', description: 'Submission was aborted' },
  11: { name: 'Runtime Error (NZEC)', description: 'Submission had non-zero exit code' },
  12: { name: 'Runtime Error (Other)', description: 'Submission had runtime error' },
  13: { name: 'Internal Error', description: 'Judge0 internal error' },
  14: { name: 'Exec Format Error', description: 'Submission could not be executed' }
};

export class Judge0Service {
  constructor() {
    this.apiKey = JUDGE0_API_KEY;
    this.baseUrl = JUDGE0_URL;
    this.pollInterval = 1000; // Start with faster polling
    this.maxAttempts = 60; // Allow more attempts
    this.backoffFactor = 1.2; // Exponential backoff
  }

  /**
   * Test the Judge0 API connection
   */
  async testConnection() {
    try {
      if (!this.apiKey) {
        throw new Error('Judge0 API key not configured. Please set JUDGE0_API_KEY environment variable.');
      }

      const response = await fetch(`${this.baseUrl}/languages`, {
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        }
      });

      if (!response.ok) {
        throw new Error(`Judge0 API connection failed: ${response.status} ${response.statusText}`);
      }

      const languages = await response.json();
      return {
        success: true,
        message: 'Judge0 API connection successful',
        availableLanguages: languages.length,
        supportedLanguages: Object.keys(SUPPORTED_LANGUAGES)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        suggestion: 'Check your Judge0 API key and network connection'
      };
    }
  }

  /**
   * Execute code with multiple test cases
   */
  async execute(code, language, testCases = []) {
    if (!this.apiKey) {
      throw new Error('Judge0 API key not configured. Please set JUDGE0_API_KEY environment variable.');
    }

    if (!code || !code.trim()) {
      throw new Error('Code cannot be empty');
    }

    if (!testCases || testCases.length === 0) {
      throw new Error('At least one test case is required');
    }

    // Map frontend language name to Judge0 language key
    const mappedLanguage = LANGUAGE_MAPPING[language] || language;
    const langConfig = SUPPORTED_LANGUAGES[mappedLanguage];
    
    if (!langConfig) {
      throw new Error(`Unsupported language: ${language}. Supported languages: ${Object.keys(SUPPORTED_LANGUAGES).join(', ')}`);
    }

    const results = [];
    const startTime = Date.now();

    // Process test cases sequentially to avoid rate limiting
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      const input = (testCase.input || '').toString();
      const expectedOutput = (testCase.output || '').toString();

      try {
        console.log(`Executing test case ${i + 1}/${testCases.length}...`);
        
        const token = await this.submitCode(code, langConfig.id, input);
        const result = await this.pollForResult(token);
        const processedResult = this.processResult(result, input, expectedOutput, i + 1);
        
        results.push(processedResult);
        
        // Add small delay between submissions to avoid rate limiting
        if (i < testCases.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`Error executing test case ${i + 1}:`, error);
        results.push({
          testCaseNumber: i + 1,
          input,
          expected: expectedOutput,
          actual: '',
          passed: false,
          error: `Execution failed: ${error.message}`,
          status: 'execution_error',
          executionTime: '',
          memoryUsed: '',
          statusId: null
        });
      }
    }

    const executionTime = Date.now() - startTime;
    const passedCount = results.filter(r => r.passed).length;

    return {
      results,
      summary: {
        total: testCases.length,
        passed: passedCount,
        failed: testCases.length - passedCount,
        executionTime: `${executionTime}ms`,
        language: langConfig.name,
        allPassed: passedCount === testCases.length
      }
    };
  }

  /**
   * Submit code to Judge0 API
   */
  async submitCode(sourceCode, languageId, stdin = '') {
    const submissionData = {
      source_code: this.encodeBase64(sourceCode),
      language_id: languageId,
      stdin: this.encodeBase64(stdin),
      expected_output: null // We'll handle output comparison ourselves
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
      let errorMessage = `Judge0 submission failed: ${response.status} ${response.statusText}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error || errorJson.message) {
          errorMessage += ` - ${errorJson.error || errorJson.message}`;
        }
      } catch {
        errorMessage += ` - ${errorText}`;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (!data.token) {
      throw new Error('No token received from Judge0 API');
    }

    return data.token;
  }

  /**
   * Poll for execution result with exponential backoff
   */
  async pollForResult(token) {
    let attempts = 0;
    let currentInterval = this.pollInterval;

    while (attempts < this.maxAttempts) {
      try {
        const response = await fetch(`${this.baseUrl}/submissions/${token}?base64_encoded=true`, {
          headers: {
            'X-RapidAPI-Key': this.apiKey,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
          }
        });

        if (!response.ok) {
          if (response.status === 429) {
            // Rate limited, increase wait time
            currentInterval *= 2;
            console.warn(`Rate limited, increasing poll interval to ${currentInterval}ms`);
          } else {
            const errorText = await response.text();
            console.error(`Poll attempt ${attempts + 1}: HTTP ${response.status}`, errorText);
          }
        } else {
          const result = await response.json();
          
          // Check if execution is complete (status ID >= 3)
          if (result.status && result.status.id >= 3) {
            return result;
          }
        }

        attempts++;
        await new Promise(resolve => setTimeout(resolve, currentInterval));
        
        // Exponential backoff
        currentInterval = Math.min(currentInterval * this.backoffFactor, 5000);
        
      } catch (error) {
        console.error(`Error polling result (attempt ${attempts + 1}):`, error);
        attempts++;
        await new Promise(resolve => setTimeout(resolve, currentInterval));
      }
    }

    throw new Error(`Execution timeout after ${this.maxAttempts} attempts (${Math.round(this.maxAttempts * this.pollInterval / 1000)}s)`);
  }

  /**
   * Process and format execution result
   */
  processResult(result, input, expectedOutput, testCaseNumber) {
    const statusId = result.status?.id || 0;
    const actualOutput = result.stdout ? this.decodeBase64(result.stdout).trim() : '';
    const expectedTrimmed = expectedOutput.trim();
    
    let error = '';
    let passed = false;
    let status = 'unknown';

    // Check if output matches expected (normalize whitespace)
    if (this.normalizeOutput(actualOutput) === this.normalizeOutput(expectedTrimmed)) {
      passed = true;
      status = 'accepted';
    }

    // Handle different status codes
    const statusInfo = STATUS_CODES[statusId] || { name: 'Unknown', description: 'Unknown status' };
    
    switch (statusId) {
      case 3:
        status = passed ? 'accepted' : 'wrong_answer';
        if (!passed) {
          error = `Wrong Answer - Expected: "${expectedTrimmed}", Got: "${actualOutput}"`;
        }
        break;
      case 4:
        status = 'wrong_answer';
        error = `Wrong Answer - Expected: "${expectedTrimmed}", Got: "${actualOutput}"`;
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
      case 11:
      case 12:
        status = 'runtime_error';
        const stderr = result.stderr ? this.decodeBase64(result.stderr) : statusInfo.description;
        error = `Runtime Error: ${stderr}`;
        break;
      case 8:
        status = 'memory_limit_exceeded';
        error = 'Memory Limit Exceeded';
        break;
      case 9:
      case 13:
        status = 'internal_error';
        error = 'Judge0 Internal Error - Please try again';
        break;
      default:
        status = 'error';
        error = `${statusInfo.name}: ${statusInfo.description}`;
    }

    return {
      testCaseNumber,
      input,
      expected: expectedTrimmed,
      actual: actualOutput,
      passed,
      error,
      status,
      executionTime: result.time ? `${result.time}s` : '',
      memoryUsed: result.memory ? `${Math.round(result.memory / 1024)}KB` : '',
      statusId,
      statusDescription: statusInfo.name,
      token: result.token
    };
  }

  /**
   * Normalize output for comparison (handle different line endings, extra spaces)
   */
  normalizeOutput(output) {
    return output
      .replace(/\r\n/g, '\n')  // Convert CRLF to LF
      .replace(/\r/g, '\n')    // Convert CR to LF
      .split('\n')
      .map(line => line.trim()) // Trim each line
      .join('\n')
      .trim();                 // Trim the whole string
  }

  /**
   * Helper method to encode strings to base64
   */
  encodeBase64(str) {
    try {
      if (!str) return '';
      return Buffer.from(str.toString(), 'utf-8').toString('base64');
    } catch (error) {
      console.warn('Failed to encode string to base64:', error);
      return str; // Return original string if encoding fails
    }
  }

  /**
   * Helper method to decode base64 strings
   */
  decodeBase64(str) {
    try {
      if (!str) return '';
      return Buffer.from(str, 'base64').toString('utf-8');
    } catch (error) {
      console.warn('Failed to decode base64 string:', error);
      return str; // Return original string if decoding fails
    }
  }

  /**
   * Get language template code
   */
  getLanguageTemplate(language) {
    const mappedLanguage = LANGUAGE_MAPPING[language] || language;
    const langConfig = SUPPORTED_LANGUAGES[mappedLanguage];
    return langConfig ? langConfig.template : '';
  }

  /**
   * Get supported languages info
   */
  getSupportedLanguages() {
    return SUPPORTED_LANGUAGES;
  }
}

// Export singleton instance
export const judge0Service = new Judge0Service();
