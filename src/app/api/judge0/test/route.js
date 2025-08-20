import { NextResponse } from 'next/server';
import { judge0Service } from '../../../../lib/judge0.js';

/**
 * Test Judge0 API connection and basic functionality
 */
export async function GET() {
  try {
    console.log('Testing Judge0 API connection...');
    
    // Test basic connection
    const connectionTest = await judge0Service.testConnection();
    
    if (!connectionTest.success) {
      return NextResponse.json({
        success: false,
        error: 'Judge0 API connection failed',
        details: connectionTest,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // Test basic code execution with a simple test case
    const testCode = `console.log("Hello, Judge0!");`;
    const testCases = [{ input: '', output: 'Hello, Judge0!' }];
    
    console.log('Testing basic code execution...');
    const executionResult = await judge0Service.execute(testCode, 'javascript', testCases);
    
    return NextResponse.json({
      success: true,
      message: 'Judge0 API is working correctly',
      connectionTest,
      executionTest: {
        testCode,
        testCases,
        result: executionResult.summary,
        sampleResult: executionResult.results[0]
      },
      configuration: {
        apiUrl: judge0Service.baseUrl,
        hasApiKey: !!judge0Service.apiKey,
        supportedLanguages: Object.keys(judge0Service.getSupportedLanguages()),
        pollInterval: judge0Service.pollInterval,
        maxAttempts: judge0Service.maxAttempts
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Judge0 test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Judge0 test failed',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      configuration: {
        apiUrl: judge0Service.baseUrl,
        hasApiKey: !!judge0Service.apiKey,
        environmentCheck: {
          JUDGE0_API_KEY: !!process.env.JUDGE0_API_KEY,
          JUDGE0_URL: process.env.JUDGE0_URL || 'default'
        }
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * Test specific language execution
 */
export async function POST(req) {
  try {
    const { language = 'javascript', code, testCases } = await req.json();
    
    // Use default test code if none provided
    const defaultTestCode = {
      javascript: `console.log("Hello from JavaScript!");`,
      python: `print("Hello from Python!")`,
      java: `public class Solution { public static void main(String[] args) { System.out.println("Hello from Java!"); } }`,
      cpp: `#include <iostream>
using namespace std;
int main() { cout << "Hello from C++!" << endl; return 0; }`,
      c: `#include <stdio.h>
int main() { printf("Hello from C!\\n"); return 0; }`
    };

    const testCode = code || defaultTestCode[language] || defaultTestCode.javascript;
    const defaultTestCases = [{ input: '', output: `Hello from ${language.charAt(0).toUpperCase() + language.slice(1)}!` }];
    const finalTestCases = testCases || defaultTestCases;

    console.log(`Testing ${language} execution...`);
    
    const executionResult = await judge0Service.execute(testCode, language, finalTestCases);
    
    return NextResponse.json({
      success: true,
      message: `${language} execution test completed`,
      language,
      testCode,
      testCases: finalTestCases,
      executionResult,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`Language test failed:`, error);
    
    return NextResponse.json({
      success: false,
      error: 'Language execution test failed',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
