'use client';

import { useState } from 'react';
import { Play, AlertCircle, CheckCircle, XCircle, Clock, Zap } from 'lucide-react';

/**
 * Code Executor Component with fallback for when Judge0 is not configured
 */
export default function CodeExecutor({ 
  code, 
  language, 
  testCases = [], 
  onExecutionComplete,
  disabled = false 
}) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState(null);
  const [error, setError] = useState(null);

  // Mock execution for when Judge0 is not available
  const mockExecution = async (code, language, testCases) => {
    // Simulate execution delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const results = testCases.map((testCase, index) => ({
      testCaseNumber: index + 1,
      input: testCase.input || '',
      expected: testCase.output || '',
      actual: testCase.output || '', // Mock: assume correct output
      passed: Math.random() > 0.3, // 70% pass rate for demo
      error: Math.random() > 0.7 ? 'Mock runtime error' : '',
      status: Math.random() > 0.3 ? 'accepted' : 'wrong_answer',
      executionTime: `${(Math.random() * 0.5 + 0.1).toFixed(3)}s`,
      memoryUsed: `${Math.floor(Math.random() * 50 + 10)}KB`,
      statusId: Math.random() > 0.3 ? 3 : 4
    }));

    const passed = results.filter(r => r.passed).length;
    
    return {
      results,
      summary: {
        total: testCases.length,
        passed,
        failed: testCases.length - passed,
        executionTime: `${Math.floor(Math.random() * 1000 + 500)}ms`,
        language: language,
        allPassed: passed === testCases.length
      },
      notice: '⚠️ Mock execution (Judge0 not configured)',
      isMock: true
    };
  };

  const executeCode = async () => {
    if (!code?.trim()) {
      setError('Code cannot be empty');
      return;
    }

    if (!testCases || testCases.length === 0) {
      setError('No test cases available');
      return;
    }

    setIsExecuting(true);
    setError(null);
    setExecutionResults(null);

    try {
      // First, check if Judge0 is configured
      const configResponse = await fetch('/api/execute', {
        method: 'GET',
        credentials: 'include'
      });
      
      const configData = await configResponse.json();
      const isJudge0Available = configData.judge0Config?.hasApiKey && 
                               configData.judge0Config?.connectionStatus?.success;

      let results;

      if (isJudge0Available) {
        // Use real Judge0 execution
        console.log('Using Judge0 for code execution');
        const response = await fetch('/api/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            code,
            language,
            testCases
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Code execution failed');
        }

        results = await response.json();
      } else {
        // Use mock execution
        console.log('Using mock execution (Judge0 not available)');
        results = await mockExecution(code, language, testCases);
      }

      setExecutionResults(results);
      onExecutionComplete?.(results);

    } catch (err) {
      console.error('Code execution error:', err);
      setError(err.message || 'An error occurred during code execution');
    } finally {
      setIsExecuting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'wrong_answer':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'time_limit_exceeded':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'runtime_error':
      case 'compilation_error':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'wrong_answer':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'time_limit_exceeded':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'runtime_error':
      case 'compilation_error':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Execute Button */}
      <button
        onClick={executeCode}
        disabled={disabled || isExecuting || !code?.trim()}
        className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isExecuting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Executing...
          </>
        ) : (
          <>
            <Play className="h-4 w-4 mr-2" />
            Run Code
          </>
        )}
      </button>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="font-medium text-red-800">Execution Error</span>
          </div>
          <p className="mt-1 text-red-700">{error}</p>
        </div>
      )}

      {/* Execution Results */}
      {executionResults && (
        <div className="space-y-4">
          {/* Summary */}
          <div className={`p-4 rounded border ${
            executionResults.summary?.allPassed 
              ? 'bg-green-50 border-green-200' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {executionResults.summary?.allPassed ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                ) : (
                  <Zap className="h-5 w-5 text-blue-600 mr-2" />
                )}
                <span className={`font-medium ${
                  executionResults.summary?.allPassed ? 'text-green-800' : 'text-blue-800'
                }`}>
                  {executionResults.notice || 'Execution Complete'}
                </span>
              </div>
              
              {executionResults.summary && (
                <div className="flex items-center space-x-4 text-sm">
                  <span className={`px-2 py-1 rounded ${
                    executionResults.summary.allPassed 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {executionResults.summary.passed}/{executionResults.summary.total} Passed
                  </span>
                  <span className="text-gray-600">
                    {executionResults.summary.executionTime}
                  </span>
                </div>
              )}
            </div>
            
            {executionResults.isMock && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                <AlertCircle className="h-4 w-4 inline mr-1" />
                This is a mock execution. To use real code execution, configure Judge0 API key in your environment.
              </div>
            )}
          </div>

          {/* Test Case Results */}
          {executionResults.results && executionResults.results.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Test Case Results</h4>
              {executionResults.results.map((result, index) => (
                <div key={index} className={`p-3 rounded border ${getStatusColor(result.status)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getStatusIcon(result.status)}
                      <span className="ml-2 font-medium">
                        Test Case {result.testCaseNumber || index + 1}: {
                          result.passed ? 'Passed' : 'Failed'
                        }
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm">
                      {result.executionTime && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          {result.executionTime}
                        </span>
                      )}
                      {result.memoryUsed && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                          {result.memoryUsed}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {result.error && (
                    <div className="mt-2 text-sm">
                      <strong>Error:</strong> {result.error}
                    </div>
                  )}
                  
                  {!result.passed && result.expected && (
                    <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Expected:</strong>
                        <pre className="mt-1 p-2 bg-white rounded border text-xs overflow-x-auto">
                          {result.expected}
                        </pre>
                      </div>
                      <div>
                        <strong>Got:</strong>
                        <pre className="mt-1 p-2 bg-white rounded border text-xs overflow-x-auto">
                          {result.actual}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
