'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Play, Save, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

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
  const codeRef = useRef(null);

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
    // Only use non-hidden test cases
    const sampleTestCases = (problem.testCases || []).filter(tc => !tc.isHidden);
    if (!sampleTestCases.length) {
      setRunError('No sample test cases available.');
      return;
    }
    try {
      // Mock API call to /api/execute
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
        return;
      }
      setRunTestResults(data.results); // [{input, expected, actual, passed, error}]
      // If all passed, allow submit
      setCanSubmit(data.results.every(r => r.passed));
    } catch (err) {
      setRunError('Error running code.');
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setResult(null);

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
        setResult({
          status: 'success',
          message: 'Submission successful!',
          submission: data.submission
        });
      } else {
        setResult({
          status: 'error',
          message: data.error || 'Submission failed'
        });
      }
    } catch (error) {
      setResult({
        status: 'error',
        message: 'Network error occurred'
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

  // Generate line numbers for code editor
  const getLineNumbers = () => {
    return code.split('\n').map((_, i) => i + 1).join('\n');
  };

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
                {problem.difficulty}
              </span>
              <span className="text-sm text-gray-500">{problem.category}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Problem Description */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Problem Description</h2>
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
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200 p-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Code Editor</h2>
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
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex rounded-md border border-gray-300 bg-white" style={{ minHeight: 384 }}>
                <pre className="select-none text-gray-400 text-xs py-4 px-2 bg-gray-50 rounded-l-md border-r border-gray-200 font-mono" style={{ minWidth: 32, textAlign: 'right' }}>
                  {getLineNumbers()}
                </pre>
                <textarea
                  ref={codeRef}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-96 p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black bg-white resize-none rounded-r-md"
                  style={{ minHeight: 384, lineHeight: '1.5', tabSize: 2, overflow: 'auto' }}
                  spellCheck={false}
                  autoCorrect="off"
                  autoCapitalize="off"
                  placeholder="Write your code here..."
                />
              </div>
              {/* Error message for run code */}
              {runError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                  {runError}
                </div>
              )}
              {/* Test case results table */}
              {runTestResults && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Test Case Results:</h3>
                  {sampleResults.length > 0 && (
                    <div className="mb-2">
                      <div className="font-semibold text-green-700">Sample Test Cases</div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-xs border mb-2">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="px-2 py-1 border">#</th>
                              <th className="px-2 py-1 border">Input</th>
                              <th className="px-2 py-1 border">Expected Output</th>
                              <th className="px-2 py-1 border">Your Output</th>
                              <th className="px-2 py-1 border">Result</th>
                              <th className="px-2 py-1 border">Error</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sampleResults.map((res, idx) => (
                              <tr key={idx} className={res.passed ? 'bg-green-50' : 'bg-red-50'}>
                                <td className="px-2 py-1 border text-center">{idx + 1}</td>
                                <td className="px-2 py-1 border font-mono whitespace-pre">{res.input}</td>
                                <td className="px-2 py-1 border font-mono whitespace-pre">{res.expected}</td>
                                <td className="px-2 py-1 border font-mono whitespace-pre">{res.actual}</td>
                                <td className="px-2 py-1 border text-center">{res.passed ? <span className="text-green-700 font-bold">Pass</span> : <span className="text-red-700 font-bold">Fail</span>}</td>
                                <td className="px-2 py-1 border text-xs text-red-600">{res.error || ''}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  {hiddenResults.length > 0 && (
                    <div className="mb-2">
                      <div className="font-semibold text-blue-700">Hidden Test Cases</div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-xs border">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="px-2 py-1 border">#</th>
                              <th className="px-2 py-1 border">Input</th>
                              <th className="px-2 py-1 border">Expected Output</th>
                              <th className="px-2 py-1 border">Your Output</th>
                              <th className="px-2 py-1 border">Result</th>
                              <th className="px-2 py-1 border">Error</th>
                            </tr>
                          </thead>
                          <tbody>
                            {hiddenResults.map((res, idx) => (
                              <tr key={idx} className={res.passed ? 'bg-green-50' : 'bg-red-50'}>
                                <td className="px-2 py-1 border text-center">{idx + 1}</td>
                                <td className="px-2 py-1 border font-mono whitespace-pre">{res.input}</td>
                                <td className="px-2 py-1 border font-mono whitespace-pre">{res.expected}</td>
                                <td className="px-2 py-1 border font-mono whitespace-pre">{res.actual}</td>
                                <td className="px-2 py-1 border text-center">{res.passed ? <span className="text-green-700 font-bold">Pass</span> : <span className="text-red-700 font-bold">Fail</span>}</td>
                                <td className="px-2 py-1 border text-xs text-red-600">{res.error || ''}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="mt-4 flex space-x-4">
                <button
                  onClick={handleRun}
                  disabled={submitting}
                  className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Run Code
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit || submitting}
                  className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Submit Solution
                </button>
              </div>

              {/* Run Result */}
              {runResult && (
                <div className={`mt-4 p-4 rounded-md ${
                  runResult.status === 'success' 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center">
                    {runResult.status === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mr-2" />
                    )}
                    <p className={`text-sm ${
                      runResult.status === 'success' ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {runResult.message}
                    </p>
                  </div>
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
                    <p className={`text-sm ${
                      result.status === 'success' ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {result.message}
                    </p>
                  </div>
                  {result.submission && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p>Score: {result.submission.score}%</p>
                      <p>Test Cases: {result.submission.testCasesPassed}/{result.submission.totalTestCases}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 