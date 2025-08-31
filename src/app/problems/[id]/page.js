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
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen().catch(console.error);
    }
  };

  const handleExitProblem = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    router.push('/dashboard');
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
        if (data.testCaseResults) {
          setSubmissionTestResults(data.testCaseResults);
        }
      }
    } catch (error) {
      setResult({
        status: 'error',
        message: 'Network error occurred. Please try again.'
      });
    } finally {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      setSubmitting(false);
    }
  };

  const handleSaveCode = () => {
    // This could be enhanced to actually save to backend
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'level1': return 'bg-green-100 text-green-800';
      case 'level2': return 'bg-yellow-100 text-yellow-800';
      case 'level3': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

          const getLanguageImage = (language) => {
          if (!language) return null;
          
          switch (language.toLowerCase()) {
            case 'javascript':
              return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" alt="JavaScript" className="h-12 w-12" />;
            case 'python':
              return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" alt="Python" className="h-12 w-12" />;
            case 'java':
              return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" alt="Java" className="h-12 w-12" />;
            case 'cpp':
            case 'c++':
              return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg" alt="C++" className="h-12 w-12" />;
            case 'csharp':
            case 'c#':
              return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg" alt="C#" className="h-12 w-12" />;
            case 'c':
              return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg" alt="C" className="h-12 w-12" />;
            case 'go':
              return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg" alt="Go" className="h-12 w-12" />;
            case 'rust':
              return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-plain.svg" alt="Rust" className="h-12 w-12" />;
            case 'kotlin':
              return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg" alt="Kotlin" className="h-12 w-12" />;
            case 'typescript':
              return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" alt="TypeScript" className="h-12 w-12" />;
            case 'php':
              return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg" alt="PHP" className="h-12 w-12" />;
            case 'ruby':
              return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ruby/ruby-original.svg" alt="Ruby" className="h-12 w-12" />;
            case 'swift':
              return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg" alt="Swift" className="h-12 w-12" />;
            default:
              return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/code/code-plain.svg" alt="Code" className="h-12 w-12" />;
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
              <p className="text-gray-600 whitespace-pre-wrap">{problem.description}</p>
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
              <div className="flex items-center gap-2 mb-4">
                <div className="flex flex-col items-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded text-sm font-semibold capitalize">
                  {getLanguageImage(problem.programmingLanguage)}
                  <span>{problem.programmingLanguage}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(problem.difficulty)}`}>
                  {problem.difficulty === 'level1' ? 'Level 1' : problem.difficulty === 'level2' ? 'Level 2' : problem.difficulty === 'level3' ? 'Level 3' : problem.difficulty}
                </span>
              </div>
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
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                  {getLanguageImage(problem.programmingLanguage)}
                  <span className="capitalize">{problem.programmingLanguage}</span>
                </div>
              )}
            </div>
            <div className="prose max-w-none">
              <p className="text-gray-700 mb-4 whitespace-pre-wrap">{problem.description}</p>
              
              {problem.inputFormat && (
                <div className="mb-4">
                  <h3 className="text-md font-semibold text-gray-900 mb-2">Input Format</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{problem.inputFormat}</p>
                </div>
              )}
              
              {problem.outputFormat && (
                <div className="mb-4">
                  <h3 className="text-md font-semibold text-gray-900 mb-2">Output Format</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{problem.outputFormat}</p>
                </div>
              )}
              
              {problem.constraints && (
                <div className="mb-4">
                  <h3 className="text-md font-semibold text-gray-900 mb-2">Constraints</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{problem.constraints}</p>
                </div>
              )}
              
              {problem.examples && problem.examples.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-md font-semibold text-gray-900 mb-2">Examples</h3>
                  {problem.examples.map((example, index) => (
                    <div key={index} className="mb-4 p-4 bg-gray-50 rounded">
                      <h4 className="font-medium text-gray-900 mb-2">Example {index + 1}</h4>
                      <div className="mb-2">
                        <span className="font-medium text-gray-700">Input:</span>
                        <pre className="mt-1 text-sm text-gray-600 bg-white p-2 rounded border">
                          {example.input.split('\n').map((line, i) => (
                            <div key={i}>{line}</div>
                          ))}
                        </pre>
                      </div>
                      <div className="mb-2">
                        <span className="font-medium text-gray-700">Output:</span>
                        <pre className="mt-1 text-sm text-gray-600 bg-white p-2 rounded border">
                          {example.output.split('\n').map((line, i) => (
                            <div key={i}>{line}</div>
                          ))}
                        </pre>
                      </div>
                      {example.explanation && (
                        <div>
                          <span className="font-medium text-gray-700">Explanation:</span>
                          <pre className="mt-1 text-sm text-gray-600 bg-white p-2 rounded border">
                            {example.explanation.split('\n').map((line, i) => (
                              <div key={i}>{line}</div>
                            ))}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Code Editor */}
          <div className="bg-white rounded-lg shadow">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Code Editor</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="c">C</option>
                </select>
              </div>
            </div>
            
            <div className="h-96">
              <MonacoEditor
                height="100%"
                language={language}
                code={code}
                onChange={(value) => setCode(value || '')}
                onMount={(editor) => { codeRef.current = editor; }}
                starterCode={problem?.starterCode}
                showToolbar={true}
                className="border rounded-lg overflow-hidden"
              />
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <div className="space-y-4">
                {/* Code Executor Component */}
                <CodeExecutor
                  code={code}
                  language={language}
                  testCases={(problem?.testCases || []).filter(tc => !tc.isHidden)}
                  onExecutionComplete={(results) => {
                    setRunTestResults(results.results);
                    setRunResult({
                      status: results.summary?.allPassed ? 'success' : 'info',
                      message: results.notice || `Execution completed: ${results.summary?.passed}/${results.summary?.total} test cases passed`,
                      summary: results.summary
                    });
                    setCanSubmit(results.summary?.allPassed || false);
                    setRunError('');
                  }}
                  disabled={runningCode || submitting}
                />
                
                {/* Additional Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !canSubmit}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {submitting ? 'Submitting...' : 'Submit Solution'}
                  </button>
                  <button
                    onClick={handleSaveCode}
                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Code
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {(runResult || result || runError) && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Results</h3>
            
            {/* Results Summary */}
            {(runResult || result) && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  {runResult && (
                    <>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {runResult.summary ? `${runResult.summary.passed}/${runResult.summary.total}` : 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">Run Tests Passed</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {runResult.summary ? Math.round((runResult.summary.passed / runResult.summary.total) * 100) : 0}%
                        </div>
                        <div className="text-sm text-gray-600">Run Success Rate</div>
                      </div>
                    </>
                  )}
                  {result && (
                    <>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {result.passedCount}/{result.totalCount}
                        </div>
                        <div className="text-sm text-gray-600">Submission Tests Passed</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {result.submission.score || 0}%
                        </div>
                        <div className="text-sm text-gray-600">Final Score</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
            
            {runError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
                <div className="flex items-center">
                  <XCircle className="h-5 w-5 text-red-600 mr-2" />
                  <span className="font-medium text-red-800">Error</span>
                </div>
                <p className="mt-1 text-red-700">{runError}</p>
              </div>
            )}

            {result && (
              <div className="mb-4">
                <div className={`p-4 rounded border ${
                  result.submission.status === 'accepted' 
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : result.submission.status === 'wrong_answer'
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : result.submission.status === 'runtime_error'
                    ? 'bg-orange-50 border-orange-200 text-orange-800'
                    : 'bg-gray-50 border-gray-200 text-gray-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {result.submission.status === 'accepted' ? (
                        <CheckCircle className="h-5 w-5 mr-2" />
                      ) : (
                        <XCircle className="h-5 w-5 mr-2" />
                      )}
                      <span className="font-medium">
                        {result.submission.status === 'accepted' ? 'Accepted' : 
                         result.submission.status === 'wrong_answer' ? 'Wrong Answer' :
                         result.submission.status === 'runtime_error' ? 'Runtime Error' : 
                         result.submission.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {result.executionTime && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {result.executionTime}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded ${
                        result.submission.status === 'accepted' 
                          ? 'bg-green-100 text-green-700'
                          : result.submission.status === 'wrong_answer'
                          ? 'bg-red-100 text-red-700'
                          : result.submission.status === 'runtime_error'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        Score: {result.submission.score || 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Run Test Results */}
            {runTestResults && runTestResults.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Run Test Results</h4>
                <div className="space-y-3">
                  {runTestResults.map((testResult, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${
                      testResult.passed 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          {testResult.passed ? (
                            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 mr-2" />
                          )}
                          <span className={`font-medium ${
                            testResult.passed ? 'text-green-800' : 'text-red-800'
                          }`}>
                            Test Case {index + 1}: {testResult.passed ? 'Passed' : 'Failed'}
                          </span>
                        </div>
                        {testResult.executionTime && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {testResult.executionTime}ms
                          </span>
                        )}
                      </div>
                      
                      {/* Input/Output Display */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Input:</span>
                          <pre className="mt-1 text-xs text-gray-600 bg-white p-2 rounded border overflow-x-auto whitespace-pre-wrap" style={{ whiteSpace: 'pre-wrap' }}>{testResult.input || 'N/A'}</pre>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Expected Output:</span>
                          <pre className="mt-1 text-xs text-gray-600 bg-white p-2 rounded border overflow-x-auto whitespace-pre-wrap" style={{ whiteSpace: 'pre-wrap' }}>{testResult.expectedOutput || 'N/A'}</pre>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Your Output:</span>
                          <pre className="mt-1 text-xs text-gray-600 bg-white p-2 rounded border overflow-x-auto whitespace-pre-wrap" style={{ whiteSpace: 'pre-wrap' }}>{testResult.output || 'N/A'}</pre>
                        </div>
                        {testResult.error && (
                          <div className="md:col-span-2">
                            <span className="font-medium text-red-700">Error:</span>
                            <pre className="mt-1 text-xs text-red-600 bg-red-50 p-2 rounded border overflow-x-auto">{testResult.error}</pre>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submission Test Results */}
            {submissionTestResults && submissionTestResults.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Submission Test Results</h4>
                <div className="space-y-3">
                  {submissionTestResults.map((testResult, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${
                      testResult.passed 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          {testResult.passed ? (
                            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 mr-2" />
                          )}
                          <span className={`font-medium ${
                            testResult.passed ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {testResult.isHidden ? 'Hidden Test' : 'Test Case'} {index + 1}: {testResult.passed ? 'Passed' : 'Failed'}
                          </span>
                        </div>
                        {testResult.executionTime && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {testResult.executionTime}ms
                          </span>
                        )}
                      </div>
                      
                      {/* Show input/output for non-hidden test cases or failed hidden tests */}
                      {(!testResult.isHidden || !testResult.passed) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Input:</span>
                            <pre className="mt-1 text-xs text-gray-600 bg-white p-2 rounded border overflow-x-auto whitespace-pre-wrap" style={{ whiteSpace: 'pre-wrap' }}>{testResult.input || 'N/A'}</pre>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Expected Output:</span>
                            <pre className="mt-1 text-xs text-gray-600 bg-white p-2 rounded border overflow-x-auto whitespace-pre-wrap" style={{ whiteSpace: 'pre-wrap' }}>{testResult.expectedOutput || 'N/A'}</pre>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Your Output:</span>
                            <pre className="mt-1 text-xs text-gray-600 bg-white p-2 rounded border overflow-x-auto whitespace-pre-wrap" style={{ whiteSpace: 'pre-wrap' }}>{testResult.output || 'N/A'}</pre>
                          </div>
                          {testResult.error && (
                            <div className="md:col-span-2">
                              <span className="font-medium text-red-700">Error:</span>
                              <pre className="mt-1 text-xs text-red-600 bg-red-50 p-2 rounded border overflow-x-auto">{testResult.error}</pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        {navigation && (navigation.previous || navigation.next) && (
          <div className="mt-8 flex justify-center">
            <div className="flex justify-center items-center space-x-6">
              {navigation.previous ? (
                <button
                  onClick={() => router.push(`/problems/${navigation.previous.id}`)}
                  className="flex items-center px-6 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200 text-gray-700 font-medium"
                >
                  <ChevronLeft className="h-5 w-5 mr-2" />
                  <div className="text-left">
                    <div className="text-xs text-gray-500">Previous</div>
                  </div>
                </button>
              ) : (
                <div className="w-48"></div>
              )}

              {navigation.next ? (
                <button
                  onClick={() => router.push(`/problems/${navigation.next.id}`)}
                  className="flex items-center px-6 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200 text-gray-700 font-medium"
                >
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Next</div>
                  </div>
                  <ChevronRight className="h-5 w-5 ml-2" />
                </button>
              ) : (
                <div className="w-48"></div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 