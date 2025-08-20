import { NextResponse } from 'next/server';
import { judge0Service, SUPPORTED_LANGUAGES, LANGUAGE_MAPPING } from '../../../lib/judge0.js';

// Legacy Judge0Executor class removed - now using improved judge0Service

export async function GET() {
  try {
    const connectionTest = await judge0Service.testConnection();
    
    return NextResponse.json({
      languages: SUPPORTED_LANGUAGES,
      judge0Config: {
        url: judge0Service.baseUrl,
        hasApiKey: !!judge0Service.apiKey,
        connectionStatus: connectionTest
      },
      supportedLanguages: judge0Service.getSupportedLanguages()
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

    // Validate input parameters
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

    // Test Judge0 connection first
    const connectionTest = await judge0Service.testConnection();
    if (!connectionTest.success) {
      return NextResponse.json({
        error: 'Judge0 API connection failed',
        details: connectionTest.error,
        suggestion: connectionTest.suggestion
      }, { status: 500 });
    }

    // Execute code with improved service
    const executionResult = await judge0Service.execute(code, language, testCases);
    
    const mappedLanguage = LANGUAGE_MAPPING[language] || language;

    return NextResponse.json({
      results: executionResult.results,
      summary: executionResult.summary,
      executionInfo: {
        originalLanguage: language,
        mappedLanguage: mappedLanguage,
        language: SUPPORTED_LANGUAGES[mappedLanguage],
        timestamp: new Date().toISOString(),
        judge0Config: {
          url: judge0Service.baseUrl,
          pollInterval: judge0Service.pollInterval,
          connectionStatus: 'success'
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