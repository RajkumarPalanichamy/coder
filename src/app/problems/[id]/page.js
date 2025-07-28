'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Play, Save, ArrowLeft, CheckCircle, XCircle, Copy, ChevronLeft, ChevronRight } from 'lucide-react';
import dynamic from 'next/dynamic';

// Monaco Editor (dynamically loaded to avoid SSR issues)
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export default function ProblemPage() {
  const params = useParams();
  const router = useRouter();
  const [problem, setProblem] = useState(null);
  const [navigation, setNavigation] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [runningCode, setRunningCode] = useState(false);
  const [result, setResult] = useState(null);
  const [canSubmit, setCanSubmit] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [runTestResults, setRunTestResults] = useState(null);
  const [runError, setRunError] = useState('');
  const [submissionTestResults, setSubmissionTestResults] = useState(null);
  const codeRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const timerRef = useRef();

  useEffect(() => {
    fetchProblem();
  }, [params.id]);

  useEffect(() => {
    if (problem && problem.timeLimit) {
      setTimeLeft(problem.timeLimit);
    }
  }, [problem]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timeLeft]);

  useEffect(() => {
    if (timeLeft === 0) {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const fetchProblem = async () => {
    try {
      const response = await fetch(`/api/problems/${params.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setProblem(data.problem);
        setNavigation(data.navigation);
        setCode(data.problem.starterCode || '');
        // Set the language based on the problem's language field
        if (data.problem.programmingLanguage) {
          setLanguage(data.problem.programmingLanguage);
        }
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
    setRunningCode(true);
    setRunResult(null);
    setCanSubmit(false);
    setRunTestResults(null);
    setRunError('');
    setResult(null); // Clear previous submission results
    setSubmissionTestResults(null); // Clear previous submission test results
    // Only use non-hidden test cases
    const sampleTestCases = (problem.testCases || []).filter(tc => !tc.isHidden);
    if (!sampleTestCases.length) {
      setRunError('No sample test cases available.');
      setRunningCode(false);
      return;
    }
    try {
      // Real Judge0 execution
      console.log('Running Judge0 execution for sample test cases');
      
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          testCases: sampleTestCases
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
      
      setRunTestResults(data.results);
      
      // Display Judge0 notice
      if (data.notice) {
        setRunResult({
          status: 'info',
          message: data.notice
        });
      }
      
      // If all passed, allow submit
      setCanSubmit(data.results.every(r => r.passed));
    } catch (err) {
      console.error('Error running code:', err);
      setRunError('Error running code. Please check your network connection and try again.');
    } finally {
      setRunningCode(false);
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
      case 'level1': return 'bg-green-100 text-green-800';
      case 'level2': return 'bg-yellow-100 text-yellow-800';
      case 'level3': return 'bg-red-100 text-red-800';
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center text-gray-700 hover:text-indigo-600 mr-4"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </button>
              <h1 className="text-xl font-bold text-gray-900">{problem.title}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(problem.difficulty)}`}>
                {problem.difficulty === 'level1' ? 'Level 1' : problem.difficulty === 'level2' ? 'Level 2' : problem.difficulty === 'level3' ? 'Level 3' : problem.difficulty}
              </span>
              <span className="text-sm text-gray-500">{problem.category}</span>
              {problem.programmingLanguage && (
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded capitalize">
                  {problem.programmingLanguage}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>
      {/* Timer */}
      {problem.timeLimit && timeLeft !== null && timeLeft > 0 && (
        <div className="w-full bg-yellow-50 border-b border-yellow-200 py-2 flex justify-center items-center">
          <span className="text-lg font-semibold text-yellow-800">
            Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')} min
          </span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Problem Description */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Problem Description</h2>
              {problem.programmingLanguage && (
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded capitalize">
                  {problem.programmingLanguage}
                </span>
              )}
            </div>
            <div className="prose max-w-none">
              <p className="text-gray-700 mb-4">{problem.description}</p>
              
              {problem.constraints && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Constraints:</h3>
                  <p className="text-sm text-gray-600">{problem.constraints}</p>
                </div>
              )}

              {problem.examples && problem.examples.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Examples:</h3>
                  {problem.examples.map((example, index) => (
                    <div key={index} className="bg-gray-50 rounded p-3 mb-2">
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Input:</strong> {example.input}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Output:</strong> {example.output}
                      </p>
                      {example.explanation && (
                        <p className="text-sm text-gray-600">
                          <strong>Explanation:</strong> {example.explanation}
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
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Expected Output:</strong> {tc.output}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Code Editor */}
          <div className="bg-white rounded-lg shadow flex flex-col">
            <div className="border-b border-gray-200 p-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-medium text-gray-900">Code Editor</h2>
                <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-700 capitalize">{language}</span>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1 text-sm text-black bg-white"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="c">C</option>
                </select>
                <button
                  onClick={handleCopy}
                  className={`flex items-center px-2 py-1 rounded text-xs border ${copied ? 'bg-green-100 border-green-300 text-green-700' : 'bg-gray-100 border-gray-300 text-gray-700'} hover:bg-gray-200 transition`}
                  title="Copy code"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
            <div className="p-0 flex-1 min-h-[384px]">
              <MonacoEditor
                height="384px"
                defaultLanguage={language}
                language={language === 'cpp' ? 'cpp' : language}
                value={code}
                theme="vs-light"
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  automaticLayout: true,
                  lineNumbers: 'on',
                  tabSize: 2,
                  formatOnPaste: true,
                  formatOnType: true,
                  smoothScrolling: true,
                  scrollbar: { vertical: 'auto', horizontal: 'auto' },
                  suggestOnTriggerCharacters: false,
                  quickSuggestions: false,
                  wordBasedSuggestions: false,
                  parameterHints: { enabled: false },
                  tabCompletion: 'off',
                  acceptSuggestionOnEnter: 'off',
                  suggestSelection: 'first',
                  snippetSuggestions: 'none',
                }}
                onChange={(value) => setCode(value || '')}
                onMount={(editor) => {
                  codeRef.current = editor;
                  // Disable copy, cut, and paste
                  editor.onKeyDown((e) => {
                    if ((e.ctrlKey || e.metaKey) && (e.keyCode === 33 || e.keyCode === 35 || e.keyCode === 41)) {
                      // 33: Ctrl+X, 35: Ctrl+C, 41: Ctrl+V
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  });
                  editor.onDidPaste(() => {
                    editor.setValue(code); // revert paste
                  });
                  // Also block context menu copy/paste
                  editor.onContextMenu((e) => {
                    e.event.preventDefault();
                    e.event.stopPropagation();
                  });
                }}
              />
            </div>
            <div className="p-4">
              {/* Error message for run code */}
              {runError && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                  {runError}
                </div>
              )}
              {/* Run Test Results */}
              {runTestResults && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Test Results</h3>
                  {runTestResults.map((result, idx) => (
                    <div key={idx} className={`mb-3 p-4 rounded-md border ${
                      result.passed 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-gray-700">
                          Test Case {idx + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          {result.executionTime && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {result.executionTime}
                            </span>
                          )}
                          {result.memoryUsed && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                              {result.memoryUsed}
                            </span>
                          )}
                          <span className={`text-xs px-2 py-1 rounded font-medium ${
                            result.passed 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {result.passed ? '✓ PASS' : '✗ FAIL'}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Input:</span>
                          <pre className="bg-gray-100 p-2 rounded mt-1 text-xs font-mono overflow-x-auto">
                            {result.input || '(empty)'}
                          </pre>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Expected:</span>
                          <pre className="bg-gray-100 p-2 rounded mt-1 text-xs font-mono overflow-x-auto">
                            {result.expected}
                          </pre>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Your Output:</span>
                          <pre className={`p-2 rounded mt-1 text-xs font-mono overflow-x-auto ${
                            result.passed ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {result.actual || '(no output)'}
                          </pre>
                        </div>
                      </div>
                      {result.error && (
                        <div className="mt-2">
                          <span className="font-medium text-red-600">Error:</span>
                          <div className="bg-red-100 p-2 rounded mt-1 text-xs text-red-700">
                            {result.error}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 flex space-x-4">
                <button
                  onClick={handleRun}
                  disabled={submitting || runningCode}
                  className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow"
                  title="Run your code against sample test cases"
                >
                  {runningCode ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Run Code
                    </>
                  )}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit || submitting}
                  className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow"
                  title="Submit your solution for full evaluation"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Submit Solution
                </button>
              </div>
              {/* Run Result Notice */}
              {runResult && (
                <div className={`mt-4 p-3 rounded-md ${
                  runResult.status === 'info' 
                    ? 'bg-blue-50 border border-blue-200' 
                    : runResult.status === 'success'
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <p className={`text-sm ${
                    runResult.status === 'info' ? 'text-blue-800' :
                    runResult.status === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    ℹ️ {runResult.message}
                  </p>
                </div>
              )}
              {/* Submission Result */}
              {result && (
                <div className={`mt-4 p-4 rounded-md ${
                  result.status === 'success' 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center">
                    {result.status === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mr-2" />
                    )}
                    <p className={`text-sm font-medium ${
                      result.status === 'success' ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {result.message}
                    </p>
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
                  {result.submission && result.submission.status && (
                    <div className="mt-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        result.submission.status === 'accepted' 
                          ? 'bg-green-100 text-green-800'
                          : result.submission.status === 'wrong_answer'
                          ? 'bg-red-100 text-red-800'
                          : result.submission.status === 'runtime_error'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {result.submission.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Detailed Submission Test Results */}
              {submissionTestResults && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Submission Test Results
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      (All test cases including hidden ones)
                    </span>
                  </h3>
                  <div className="space-y-3">
                    {submissionTestResults.map((result, idx) => {
                      // Determine if this is a hidden test case
                      const isHidden = problem.testCases && problem.testCases[idx] && problem.testCases[idx].isHidden;
                      
                      return (
                        <div key={idx} className={`p-4 rounded-md border ${
                          result.passed 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-red-50 border-red-200'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm text-gray-700">
                                Test Case {idx + 1}
                              </span>
                              {isHidden && (
                                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                                  Hidden
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {result.executionTime && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                  {result.executionTime}
                                </span>
                              )}
                              {result.memoryUsed && (
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                  {result.memoryUsed}
                                </span>
                              )}
                              <span className={`text-xs px-2 py-1 rounded font-medium ${
                                result.passed 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {result.passed ? '✓ PASS' : '✗ FAIL'}
                              </span>
                            </div>
                          </div>
                          
                          {/* Show input/output details only for failed cases or sample cases */}
                          {(!result.passed || !isHidden) && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                              <div>
                                <span className="font-medium text-gray-600">Input:</span>
                                <pre className="bg-gray-100 p-2 rounded mt-1 text-xs font-mono overflow-x-auto">
                                  {result.input || '(empty)'}
                                </pre>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">Expected:</span>
                                <pre className="bg-gray-100 p-2 rounded mt-1 text-xs font-mono overflow-x-auto">
                                  {result.expected}
                                </pre>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">Your Output:</span>
                                <pre className={`p-2 rounded mt-1 text-xs font-mono overflow-x-auto ${
                                  result.passed ? 'bg-green-100' : 'bg-red-100'
                                }`}>
                                  {result.actual || '(no output)'}
                                </pre>
                              </div>
                            </div>
                          )}
                          
                          {/* For hidden test cases that passed, just show that they passed */}
                          {result.passed && isHidden && (
                            <div className="text-sm text-green-700">
                              ✓ Hidden test case passed successfully
                            </div>
                          )}
                          
                          {result.error && (
                            <div className="mt-2">
                              <span className="font-medium text-red-600">Error:</span>
                              <div className="bg-red-100 p-2 rounded mt-1 text-xs text-red-700">
                                {result.error}
                              </div>
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
      </div>

      {/* Navigation buttons */}
      {navigation && (navigation.previous || navigation.next) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-center items-center space-x-6">
            {navigation.previous ? (
              <button
                onClick={() => router.push(`/problems/${navigation.previous.id}`)}
                className="flex items-center px-6 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200 text-gray-700 font-medium"
              >
                <ChevronLeft className="h-5 w-5 mr-2" />
                <div className="text-left">
                  <div className="text-sm text-gray-500">Previous</div>
                  <div className="truncate max-w-[200px]">{navigation.previous.title}</div>
                </div>
              </button>
            ) : (
              <div className="w-[240px]"></div>
            )}

            {navigation.totalProblems > 1 && (
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-1">
                  Problem {navigation.currentPosition} of {navigation.totalProblems}
                </div>
                <div className="w-48 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(navigation.currentPosition / navigation.totalProblems) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {navigation.next ? (
              <button
                onClick={() => router.push(`/problems/${navigation.next.id}`)}
                className="flex items-center px-6 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200 text-gray-700 font-medium"
              >
                <div className="text-right">
                  <div className="text-sm text-gray-500">Next</div>
                  <div className="truncate max-w-[200px]">{navigation.next.title}</div>
                </div>
                <ChevronRight className="h-5 w-5 ml-2" />
              </button>
            ) : (
              <div className="w-[240px]"></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 