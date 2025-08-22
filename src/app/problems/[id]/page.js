'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Play, Save, ArrowLeft, CheckCircle, XCircle, Copy, ChevronLeft, ChevronRight } from 'lucide-react';
import dynamic from 'next/dynamic';

// Monaco Editor (dynamically loaded to avoid SSR issues)
const MonacoEditor = dynamic(() => import('../../../components/MonacoEditor'), { ssr: false });
const CodeExecutor = dynamic(() => import('../../../components/CodeExecutor'), { ssr: false });

export default function ProblemPage() {
  const params = useParams();
  const router = useRouter();
  const [problem, setProblem] = useState(null);
  const [navigation, setNavigation] = useState(null);
  const [problemStarted, setProblemStarted] = useState(false);
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
    if (problem && problem.timeLimit && problemStarted) {
      setTimeLeft(problem.timeLimit);
    }
  }, [problem, problemStarted]);

  useEffect(() => {
    if (!problemStarted || timeLeft === null || timeLeft <= 0) return;
    timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, problemStarted]);

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

  const handleStartProblem = () => {
    setProblemStarted(true);
  };

  const handleExitProblem = () => {
    router.push('/dashboard');
  };

  const handleRunCode = async () => {
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
        credentials: 'include',
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
      
      // Handle improved response format
      const results = data.results || [];
      setRunTestResults(results);
      
      // Display execution summary
      if (data.summary) {
        setRunResult({
          status: data.summary.allPassed ? 'success' : 'info',
          message: data.notice || `Execution completed: ${data.summary.passed}/${data.summary.total} test cases passed`,
          summary: data.summary
        });
      } else if (data.notice) {
        setRunResult({
          status: 'info',
          message: data.notice
        });
      }
      
      // If all passed, allow submit
      setCanSubmit(results.every(r => r.passed));
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
        credentials: 'include',
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

  const handleSaveCode = () => {
    // This could be enhanced to actually save to backend
    console.log('Code saved:', code);
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

  // Show instructions first (same pattern as tests)
  if (!problemStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-4">
        <div className="max-w-2xl mx-auto pt-16">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{problem.title}</h1>
              <p className="text-gray-600">{problem.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold text-gray-900">Time Limit</span>
                </div>
                <p className="text-2xl font-bold text-indigo-600">
                  {problem.timeLimit ? `${Math.floor(problem.timeLimit / 60)} minutes` : 'No limit'}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold text-gray-900">Difficulty</span>
                </div>
                <p className="text-2xl font-bold text-indigo-600">
                  {problem.difficulty === 'level1' ? 'Level 1' : 
                   problem.difficulty === 'level2' ? 'Level 2' : 
                   problem.difficulty === 'level3' ? 'Level 3' : problem.difficulty}
                </p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-amber-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Important Instructions
              </h3>
              <ul className="text-amber-700 space-y-2 text-sm">
                <li>• Read the problem statement carefully before starting</li>
                <li>• Test your solution with the provided examples</li>
                {problem.timeLimit && (
                  <li>• You have {Math.floor(problem.timeLimit / 60)} minutes to complete this problem</li>
                )}
                <li>• Your solution will be automatically submitted when time expires</li>
                <li>• Make sure to save your progress by running and testing your code</li>
                <li>• Use the provided test cases to verify your logic</li>
                {problem.timeLimit && (
                  <li>• Once started, the timer cannot be paused</li>
                )}
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleExitProblem}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStartProblem}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
              >
                Start Problem
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show the actual problem interface (after user clicks "Start Problem")
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto px-4">
          <div className="flex justify-between items-center h-12">
            <div className="flex items-center gap-4">
              <span className="bg-yellow-400 text-black px-4 py-1 rounded font-medium text-sm">
                Programming Challenge ({problem.marks || 6})
              </span>
            </div>
            <div className="flex items-center text-lg font-medium">
              <span className="mr-2">Time Left :</span>
              <span className="font-mono">
                {timeLeft !== null && timeLeft > 0 
                  ? `${Math.floor(timeLeft / 3600).toString().padStart(2, '0')} : ${Math.floor((timeLeft % 3600) / 60).toString().padStart(2, '0')} : ${(timeLeft % 60).toString().padStart(2, '0')}`
                  : '00 : 00 : 00'
                }
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto px-4 py-4">
        <div className="flex gap-4">
          {/* Left side - Problem Description */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-4">
                <h2 className="text-lg font-medium mb-1">
                  Answer The Following&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Marks : {problem.marks || 15}&nbsp;&nbsp;Negative Marks : 0
                </h2>
                <h3 className="text-base font-medium mb-3 text-gray-700">
                  {problem.title}
                </h3>
              </div>
              
              <details className="mb-4">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                  Instructions:
                </summary>
                <div className="mt-2 p-4 bg-gray-50 rounded text-sm text-gray-700">
                  <p>Click to view instructions...</p>
                </div>
              </details>

              <div className="mb-4">
                <h4 className="font-medium text-gray-800 mb-2">Problem Statement:</h4>
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {problem.description}
                </div>
                
                {problem.examples && problem.examples.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="text-gray-700">
                      <div className="mb-2">Example :</div>
                      {problem.examples.map((example, index) => (
                        <div key={index} className="ml-4 font-mono text-sm">
                          <div>Position {example.input}</div>
                          <div className="ml-12">{example.output}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right side - Code Editor */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-between p-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="c">C</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Theme</label>
                  <select className="text-sm border border-gray-300 rounded px-2 py-1">
                    <option>Tomorrow</option>
                    <option>Dark</option>
                    <option>Light</option>
                  </select>
                </div>
              </div>
              
              <div className="border-b border-gray-200 px-3 py-2">
                <span className="text-sm text-gray-600">Enter your code here</span>
              </div>
              
              <div className="h-96 relative">
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-50 border-r border-gray-200 text-right text-xs text-gray-500 py-2 pr-2">
                  {Array.from({ length: 20 }, (_, i) => (
                    <div key={i} className="leading-6">{i + 1}</div>
                  ))}
                </div>
                <div className="ml-12 h-full">
                  <MonacoEditor
                    height="100%"
                    language={language}
                    code={code}
                    onChange={(value) => setCode(value || '')}
                    onMount={(editor) => { codeRef.current = editor; }}
                    starterCode={problem?.starterCode}
                    showToolbar={false}
                    className="border-0"
                    options={{
                      lineNumbers: 'off',
                      folding: false,
                      lineDecorationsWidth: 0,
                      lineNumbersMinChars: 0,
                      glyphMargin: false,
                      scrollBeyondLastLine: false,
                      minimap: { enabled: false }
                    }}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 border-t border-gray-200">
                <div className="flex gap-2">
                  <button className="text-sm text-gray-600 hover:text-gray-800">
                    Reset
                  </button>
                  <button
                    onClick={handleRunCode}
                    disabled={runningCode}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    {runningCode ? 'Running...' : 'Run'}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !canSubmit}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="flex justify-center gap-3 mt-6">
          <button className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors">
            Previous
          </button>
          <button className="px-8 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors">
            Clear
          </button>
          <button className="px-8 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors">
            Mark
          </button>
          <button className="px-8 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            Next
          </button>
                    <button className="px-6 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors">
            End Test
          </button>
        </div>
      </div>
    </div>
  );
} 