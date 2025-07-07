'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Play, Save, ArrowLeft, CheckCircle, XCircle, Copy } from 'lucide-react';
import dynamic from 'next/dynamic';
import { PROGRAMMING_LANGUAGES } from '../../../lib/constants';

// Monaco Editor (dynamically loaded to avoid SSR issues)
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export default function ProblemPage() {
  const params = useParams();
  const router = useRouter();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [canSubmit, setCanSubmit] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [runTestResults, setRunTestResults] = useState(null);
  const [runError, setRunError] = useState('');
  const [submissionTestResults, setSubmissionTestResults] = useState(null);
  const codeRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchProblem();
  }, [params.id]);

  const fetchProblem = async () => {
    try {
      const response = await fetch(`/api/problems/${params.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setProblem(data.problem);
        setCode(data.problem.starterCode || '');
      } else {
        console.error('Error fetching problem:', data.error);
      }
    } catch (error) {
      console.error('Error fetching problem:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async () => {
    setRunResult(null);
    setCanSubmit(false);
    setRunTestResults(null);
    setRunError('');
    setResult(null);
    setSubmissionTestResults(null);
    
    const sampleTestCases = (problem.testCases || []).filter(tc => !tc.isHidden);
    if (!sampleTestCases.length) {
      setRunError('No sample test cases available.');
      return;
    }

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          input: sampleTestCases[0].input,
          expectedOutput: sampleTestCases[0].output,
          inputType: sampleTestCases[0].inputType,
          outputType: sampleTestCases[0].outputType
        })
      });

      const data = await response.json();
      if (!response.ok) {
        setRunError(data.error || 'Code execution failed.');
        if (data.details) {
          console.error('Execution error details:', data.details);
        }
        return;
      }

      // Format test results
      const results = [{
        input: sampleTestCases[0].input,
        expected: sampleTestCases[0].output,
        actual: data.output,
        passed: data.output === sampleTestCases[0].output,
        error: data.error
      }];

      setRunTestResults(results);
      
      if (data.notice) {
        setRunResult({
          status: 'info',
          message: data.notice
        });
      }
      
      setCanSubmit(results.every(r => r.passed));
    } catch (err) {
      console.error('Error running code:', err);
      setRunError('Error running code. Please check your network connection and try again.');
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setResult(null);
    setSubmissionTestResults(null);

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          problemId: params.id,
          code,
          language
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Successful submission - all test cases passed
        setResult({
          status: 'success',
          message: data.message || 'Submission successful! All test cases passed.',
          submission: data.submission,
          passedCount: data.passedCount,
          totalCount: data.totalCount
        });
        
        // Show all test case results
        if (data.testCaseResults) {
          setSubmissionTestResults(data.testCaseResults);
        }
      } else {
        // Failed submission - show detailed results
        const passedCount = data.passedCount || 0;
        const totalCount = data.totalCount || 0;
        
        setResult({
          status: 'error',
          message: data.error || 'Submission failed',
          submission: data.submission,
          passedCount,
          totalCount
        });
        
        // Show detailed test case results for failed submission
        if (data.testCaseResults) {
          setSubmissionTestResults(data.testCaseResults);
        }
      }
    } catch (error) {
      console.error('Submission error:', error);
      setResult({
        status: 'error',
        message: 'Network error occurred. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCopy = useCallback(() => {
    if (codeRef.current) {
      navigator.clipboard.writeText(codeRef.current.getValue ? codeRef.current.getValue() : code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }, [code]);

  // After submission, show all test case results, grouped by sample and hidden
  const sampleResults = runTestResults ? runTestResults.filter((tc, idx) => problem.testCases && !problem.testCases[idx].isHidden) : [];
  const hiddenResults = runTestResults ? runTestResults.filter((tc, idx) => problem.testCases && problem.testCases[idx].isHidden) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading problem...</p>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Problem not found</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 text-indigo-600 hover:text-indigo-500"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel - Problem Description */}
      <div className="w-2/5 p-6 border-r border-gray-200 overflow-y-auto">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center text-indigo-600 hover:text-indigo-500 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Problems
        </button>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{problem.title}</h1>
        
        <div className="flex items-center gap-2 mb-4">
          <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
            {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
          </span>
          <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs font-medium">
            {PROGRAMMING_LANGUAGES[problem.category]?.label || problem.category}
          </span>
        </div>

        <div className="prose max-w-none mb-6">
          <div className="text-gray-700 mb-6">{problem.description}</div>
          
          {problem.constraints && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Constraints:</h3>
              <div className="text-sm text-gray-600">{problem.constraints}</div>
            </div>
          )}

          {problem.examples && problem.examples.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Examples:</h3>
              {problem.examples.map((ex, idx) => (
                <div key={idx} className="bg-gray-50 rounded p-3 mb-2">
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Input:</strong> {ex.input}
                    <span className="text-xs text-gray-500 ml-2">({ex.inputType})</span>
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Output:</strong> {ex.output}
                    <span className="text-xs text-gray-500 ml-2">({ex.outputType})</span>
                  </p>
                  {ex.explanation && (
                    <p className="text-sm text-gray-600">
                      <strong>Explanation:</strong> {ex.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {problem.testCases && problem.testCases.filter(tc => !tc.isHidden).length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Sample Test Cases:</h3>
              {problem.testCases.filter(tc => !tc.isHidden).map((tc, idx) => (
                <div key={idx} className="bg-gray-50 rounded p-3 mb-2">
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Input:</strong> {tc.input}
                    <span className="text-xs text-gray-500 ml-2">({tc.inputType})</span>
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Output:</strong> {tc.output}
                    <span className="text-xs text-gray-500 ml-2">({tc.outputType})</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Code Editor */}
      <div className="flex-1 flex flex-col">
        <div className="border-b border-gray-200 p-4 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  // Update code to the appropriate template
                  const template = problem.testCases.some(tc => tc.inputType === 'multiple_params')
                    ? PROGRAMMING_LANGUAGES[e.target.value].multiParamTemplate
                    : PROGRAMMING_LANGUAGES[e.target.value].defaultTemplate;
                  setCode(template);
                }}
                className="border border-gray-300 rounded px-3 py-1.5 text-sm"
              >
                {Object.entries(PROGRAMMING_LANGUAGES).map(([value, { label }]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              
              <button
                onClick={handleCopy}
                className="text-gray-600 hover:text-gray-800"
                title="Copy code"
              >
                <Copy className="h-4 w-4" />
                {copied && <span className="ml-1 text-xs">Copied!</span>}
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleRun}
                disabled={!code.trim()}
                className="flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 text-sm"
              >
                <Play className="h-4 w-4 mr-1" />
                Run
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm"
              >
                <Save className="h-4 w-4 mr-1" />
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <MonacoEditor
            height="100%"
            defaultLanguage={language}
            value={code}
            onChange={setCode}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              automaticLayout: true,
            }}
            onMount={(editor) => {
              codeRef.current = editor;
            }}
          />
        </div>

        {/* Results Panel */}
        <div className="border-t border-gray-200 bg-white">
          {runError && (
            <div className="p-4 bg-red-50 border-b border-red-200">
              <div className="flex items-center text-red-700">
                <XCircle className="h-5 w-5 mr-2" />
                {runError}
              </div>
            </div>
          )}

          {runTestResults && (
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Test Results</h3>
              <div className="space-y-3">
                {runTestResults.map((result, idx) => (
                  <div key={idx} className={`p-4 rounded-md border ${
                    result.passed 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center mb-2">
                      {result.passed ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mr-2" />
                      )}
                      <span className={`font-medium ${
                        result.passed ? 'text-green-700' : 'text-red-700'
                      }`}>
                        Test Case {idx + 1}: {result.passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-700">Input:</p>
                        <pre className="mt-1 p-2 bg-gray-100 rounded">{result.input}</pre>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Expected Output:</p>
                        <pre className="mt-1 p-2 bg-gray-100 rounded">{result.expected}</pre>
                      </div>
                      {!result.passed && (
                        <div className="col-span-2">
                          <p className="font-medium text-gray-700">Your Output:</p>
                          <pre className="mt-1 p-2 bg-gray-100 rounded">{result.actual}</pre>
                        </div>
                      )}
                      {result.error && (
                        <div className="col-span-2">
                          <p className="font-medium text-red-700">Error:</p>
                          <pre className="mt-1 p-2 bg-red-50 rounded text-red-700">{result.error}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result && (
            <div className="p-4">
              <div className={`flex items-center mb-3 ${
                result.status === 'success' ? 'text-green-700' : 'text-red-700'
              }`}>
                {result.status === 'success' ? (
                  <CheckCircle className="h-5 w-5 mr-2" />
                ) : (
                  <XCircle className="h-5 w-5 mr-2" />
                )}
                <span className="font-medium">{result.message}</span>
              </div>

              {result.submission && (
                <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                  <div className={`p-3 rounded ${
                    result.status === 'success' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <p className="font-medium text-gray-700">Score</p>
                    <p className={`text-lg font-bold ${
                      result.status === 'success' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {result.submission.score}%
                    </p>
                  </div>
                  <div className={`p-3 rounded ${
                    result.status === 'success' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <p className="font-medium text-gray-700">Test Cases</p>
                    <p className={`text-lg font-bold ${
                      result.status === 'success' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {result.passedCount || result.submission.testCasesPassed}/{result.totalCount || result.submission.totalTestCases}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {submissionTestResults && (
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Submission Test Results
                <span className="ml-2 text-sm font-normal text-gray-500">
                  (All test cases including hidden ones)
                </span>
              </h3>
              <div className="space-y-3">
                {submissionTestResults.map((result, idx) => {
                  const isHidden = problem.testCases && problem.testCases[idx] && problem.testCases[idx].isHidden;
                  
                  return (
                    <div key={idx} className={`p-4 rounded-md border ${
                      result.passed 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          {result.passed ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500 mr-2" />
                          )}
                          <span className={`font-medium ${
                            result.passed ? 'text-green-700' : 'text-red-700'
                          }`}>
                            Test Case {idx + 1}: {result.passed ? 'Passed' : 'Failed'}
                          </span>
                        </div>
                        {isHidden && (
                          <span className="text-xs text-gray-500 italic">Hidden Test Case</span>
                        )}
                      </div>
                      
                      {!isHidden && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-700">Input:</p>
                            <pre className="mt-1 p-2 bg-gray-100 rounded">{result.input}</pre>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Expected Output:</p>
                            <pre className="mt-1 p-2 bg-gray-100 rounded">{result.expected}</pre>
                          </div>
                          {!result.passed && (
                            <div className="col-span-2">
                              <p className="font-medium text-gray-700">Your Output:</p>
                              <pre className="mt-1 p-2 bg-gray-100 rounded">{result.actual}</pre>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {result.error && (
                        <div className="mt-2">
                          <p className="font-medium text-red-700">Error:</p>
                          <pre className="mt-1 p-2 bg-red-50 rounded text-red-700">{result.error}</pre>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 