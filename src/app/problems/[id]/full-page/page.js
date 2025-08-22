'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Clock, AlertCircle, Play, Send } from 'lucide-react';
import dynamic from 'next/dynamic';

// Monaco Editor (dynamically loaded to avoid SSR issues)
const MonacoEditor = dynamic(() => import('../../../../components/MonacoEditor'), { ssr: false });
const CodeExecutor = dynamic(() => import('../../../../components/CodeExecutor'), { ssr: false });

export default function FullPageProblemPage() {
  const params = useParams();
  const router = useRouter();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('c');
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [showEndTestModal, setShowEndTestModal] = useState(false);
  const [runningCode, setRunningCode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [editorTheme, setEditorTheme] = useState('vs-light');
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
      handleEndTest();
    }
  }, [timeLeft]);

  const fetchProblem = async () => {
    try {
      const response = await fetch(`/api/problems/${params.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setProblem(data.problem);
        setCode(data.problem.starterCode || '');
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

  const handleEndTest = async () => {
    // Submit the solution before ending the test
    try {
      await fetch(`/api/problems/${params.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language,
        }),
      });
    } catch (error) {
      console.error('Error submitting solution:', error);
    }
    
    // Navigate back to dashboard
    router.push('/dashboard');
  };

  const confirmEndTest = () => {
    handleEndTest();
  };

  const handleClearCode = () => {
    setCode('');
  };

  const handleReportError = () => {
    // TODO: Implement error reporting functionality
    alert('Error reporting functionality will be implemented.');
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading problem...</p>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Problem not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header with timer and problem info */}
      <div className="bg-yellow-400 text-black px-6 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h2 className="text-lg font-semibold">Programming Challenge ({problem.score || 0})</h2>
            <div className="flex items-center gap-4 text-sm">
              <span>Time Left : {timeLeft ? `${Math.floor(timeLeft / 3600).toString().padStart(2, '0')}:${Math.floor((timeLeft % 3600) / 60).toString().padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}` : '00:00:00'}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">Marks : {problem.marks || 15} Negative Marks : {problem.negativeMarks || 0}</span>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full p-6">
          <div className="bg-white rounded-lg shadow-sm h-full flex flex-col">
            {/* Problem content */}
            <div className="p-6 flex-1 overflow-auto">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Problem Statement:</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{problem.description}</p>
              </div>

              {problem.inputFormat && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-2">Input Format:</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{problem.inputFormat}</p>
                </div>
              )}

              {problem.outputFormat && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-2">Output Format:</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{problem.outputFormat}</p>
                </div>
              )}

              {problem.constraints && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-2">Constraints:</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{problem.constraints}</p>
                </div>
              )}

              {problem.examples && problem.examples.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-2">Example:</h4>
                  {problem.examples.map((example, index) => (
                    <div key={index} className="mb-4">
                      <div className="mb-2">
                        <span className="font-medium">Input:</span>
                        <pre className="mt-1 bg-gray-50 p-3 rounded text-sm">{example.input}</pre>
                      </div>
                      <div className="mb-2">
                        <span className="font-medium">Output:</span>
                        <pre className="mt-1 bg-gray-50 p-3 rounded text-sm">{example.output}</pre>
                      </div>
                      {example.explanation && (
                        <div>
                          <span className="font-medium">Explanation:</span>
                          <p className="mt-1 text-gray-600">{example.explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Code Editor Section */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold">Enter your code here</h4>
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Language:</label>
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
                    <label className="text-sm ml-4">Theme:</label>
                    <select 
                      value={editorTheme}
                      onChange={(e) => setEditorTheme(e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="vs-light">Light</option>
                      <option value="vs-dark">Dark</option>
                      <option value="hc-black">High Contrast</option>
                    </select>
                  </div>
                </div>
                <div className="h-96 border border-gray-300 rounded">
                  <MonacoEditor
                    height="100%"
                    language={language}
                    code={code}
                    onChange={(value) => setCode(value || '')}
                    starterCode={problem?.starterCode}
                    showToolbar={false}
                    theme={editorTheme}
                  />
                </div>
              </div>

              {/* Run and Submit buttons */}
              <div className="mb-6">
                {problem?.testCases && (
                  <CodeExecutor
                    code={code}
                    language={language}
                    testCases={(problem.testCases || []).filter(tc => !tc.isHidden)}
                    onExecutionComplete={(results) => {
                      setTestResults(results.results);
                      setShowResults(true);
                      setRunningCode(false);
                    }}
                    disabled={runningCode || submitting}
                  />
                )}
              </div>

              {/* Test Results */}
              {showResults && testResults && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Test Results:</h4>
                  <div className="space-y-2">
                    {testResults.map((result, index) => (
                      <div key={index} className={`p-2 rounded ${result.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        Test Case {index + 1}: {result.passed ? 'Passed' : 'Failed'}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="border-t p-4 flex justify-center gap-4">
              <button 
                onClick={handleReportError}
                className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Report Error
              </button>
              <button 
                disabled
                className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button 
                onClick={handleClearCode}
                className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Clear
              </button>
              <button 
                disabled
                className="px-6 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mark
              </button>
              <button 
                disabled
                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
              <button 
                onClick={() => setShowEndTestModal(true)}
                className="px-6 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 transition-colors"
              >
                End Test
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* End Test Confirmation Modal */}
      {showEndTestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm End Test</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to end the test? Your current progress will be submitted.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowEndTestModal(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmEndTest}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                End Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}