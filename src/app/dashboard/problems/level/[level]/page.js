'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Play, Save, ArrowLeft, CheckCircle, XCircle, Clock, Timer, Send, ChevronLeft, ChevronRight, Target } from 'lucide-react';
import dynamic from 'next/dynamic';

// Monaco Editor (dynamically loaded to avoid SSR issues)
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export default function LevelProblemsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const language = searchParams.get('language');
  const category = searchParams.get('category');
  const { level } = params;

  const [levelData, setLevelData] = useState(null);
  const [problems, setProblems] = useState([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [runningCode, setRunningCode] = useState(false);
  
  // Store code for each problem
  const [problemCodes, setProblemCodes] = useState({});
  const [problemLanguages, setProblemLanguages] = useState({});
  const [runResults, setRunResults] = useState({});
  
  // Timer state for entire level
  const [timeLeft, setTimeLeft] = useState(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [levelSubmissionId, setLevelSubmissionId] = useState(null);
  const timerRef = useRef();

  // Current problem
  const currentProblem = problems[currentProblemIndex];
  const currentCode = currentProblem ? (problemCodes[currentProblem._id] || '') : '';
  const currentLanguage = currentProblem ? (problemLanguages[currentProblem._id] || 'javascript') : 'javascript';

  useEffect(() => {
    if (language && category && level) {
      fetchLevelProblems();
    } else {
      router.push('/dashboard/problems');
    }
  }, [language, category, level]);

  // Timer logic
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timeLeft]);

  // Auto submit when time expires
  useEffect(() => {
    if (timeLeft === 0 && sessionStarted) {
      handleSubmitAll();
    }
  }, [timeLeft, sessionStarted]);

  const fetchLevelProblems = async () => {
    try {
      const response = await fetch(`/api/problems/levels/${level}?language=${encodeURIComponent(language)}&category=${encodeURIComponent(category)}`);
      const data = await response.json();
      
      if (response.ok) {
        setLevelData(data);
        setProblems(data.problems || []);
        
        // Initialize code and language for each problem
        const codes = {};
        const langs = {};
        data.problems.forEach(problem => {
          codes[problem._id] = problem.starterCode || '';
          langs[problem._id] = problem.programmingLanguage || 'javascript';
        });
        setProblemCodes(codes);
        setProblemLanguages(langs);
        
      } else {
        console.error('Error fetching level problems:', data.error);
      }
    } catch (error) {
      console.error('Error fetching level problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const startLevelSession = async () => {
    try {
      const response = await fetch('/api/submissions/level', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level,
          language,
          category
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setLevelSubmissionId(data.levelSubmission._id);
        setTimeLeft(data.levelSubmission.timeAllowed);
        setSessionStarted(true);
      } else {
        alert(data.error || 'Failed to start level session');
      }
    } catch (error) {
      console.error('Error starting level session:', error);
      alert('Error starting level session');
    }
  };

  const handleRunCode = async () => {
    if (!currentProblem) return;
    
    setRunningCode(true);
    setRunResults(prev => ({ ...prev, [currentProblem._id]: null }));

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: currentCode,
          language: currentLanguage,
          testCases: currentProblem.examples || []
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setRunResults(prev => ({
          ...prev,
          [currentProblem._id]: {
            success: true,
            results: data.results,
            allPassed: data.results.every(r => r.passed)
          }
        }));
      } else {
        setRunResults(prev => ({
          ...prev,
          [currentProblem._id]: {
            success: false,
            error: data.error || 'Code execution failed'
          }
        }));
      }
    } catch (error) {
      setRunResults(prev => ({
        ...prev,
        [currentProblem._id]: {
          success: false,
          error: 'Error running code'
        }
      }));
    } finally {
      setRunningCode(false);
    }
  };

  const handleSubmitAll = async () => {
    if (!sessionStarted) {
      alert('Please start the level session first');
      return;
    }

    setSubmitting(true);

    try {
      const problemSubmissions = problems.map(problem => ({
        problemId: problem._id,
        code: problemCodes[problem._id] || '',
        submissionLanguage: problemLanguages[problem._id]
      }));

      const response = await fetch(`/api/problems/levels/${level}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          category,
          problemSubmissions
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(data.message || 'All problems submitted successfully!');
        // Redirect to submissions page
        router.push('/dashboard/submissions?type=level');
      } else {
        alert(data.error || 'Failed to submit problems');
      }
    } catch (error) {
      console.error('Error submitting all problems:', error);
      alert('Error submitting problems');
    } finally {
      setSubmitting(false);
    }
  };

  const updateCurrentCode = (newCode) => {
    if (!currentProblem) return;
    setProblemCodes(prev => ({
      ...prev,
      [currentProblem._id]: newCode
    }));
  };

  const updateCurrentLanguage = (newLanguage) => {
    if (!currentProblem) return;
    setProblemLanguages(prev => ({
      ...prev,
      [currentProblem._id]: newLanguage
    }));
  };

  const goToPrevious = () => {
    if (currentProblemIndex > 0) {
      setCurrentProblemIndex(currentProblemIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentProblemIndex < problems.length - 1) {
      setCurrentProblemIndex(currentProblemIndex + 1);
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const completed = Object.values(problemCodes).filter(code => code && code.trim() !== '').length;
    return `${completed}/${problems.length}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading level problems...</p>
        </div>
      </div>
    );
  }

  if (!levelData || problems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No problems found for this level</p>
          <button
            onClick={() => router.push('/dashboard/problems')}
            className="mt-4 text-indigo-600 hover:text-indigo-500"
          >
            Back to Problems
          </button>
        </div>
      </div>
    );
  }

  // Show instruction page BEFORE session starts (like tests)
  if (!sessionStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-4">
        <div className="max-w-2xl mx-auto pt-16">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {level === 'level1' ? 'Level 1' : level === 'level2' ? 'Level 2' : 'Level 3'} - {language}
              </h1>
              <p className="text-gray-600">{category} Problems</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold text-gray-900">Total Time</span>
                </div>
                <p className="text-2xl font-bold text-indigo-600">
                  {level === 'level1' ? '30' : level === 'level2' ? '45' : '60'} minutes
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-semibold text-gray-900">Problems</span>
                </div>
                <p className="text-2xl font-bold text-indigo-600">{problems.length}</p>
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
                <li>• You have {level === 'level1' ? '30' : level === 'level2' ? '45' : '60'} minutes to complete all {problems.length} problems</li>
                <li>• The timer will run for the entire level, not individual problems</li>
                <li>• You can navigate between problems freely during the session</li>
                <li>• Your code will be auto-saved as you work</li>
                <li>• Make sure you have a stable internet connection</li>
                <li>• The session will auto-submit when time expires</li>
                <li>• You can manually submit all solutions before time expires</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-3">Problem Overview</h3>
              <div className="space-y-2">
                {problems.slice(0, 3).map((problem, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-blue-700">{index + 1}. {problem.title}</span>
                    <span className="text-blue-600 font-medium">{problem.difficulty}</span>
                  </div>
                ))}
                {problems.length > 3 && (
                  <div className="text-sm text-blue-600">
                    ... and {problems.length - 3} more problems
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => router.push('/dashboard/problems')}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={startLevelSession}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
              >
                Start Level Session
              </button>
            </div>
          </div>
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
                onClick={() => router.push('/dashboard/problems')}
                className="flex items-center text-gray-700 hover:text-indigo-600 mr-4"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </button>
              <h1 className="text-xl font-bold text-gray-900">
                {level.toUpperCase()} - {language} - {category}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(level)}`}>
                {level === 'level1' ? 'Level 1' : level === 'level2' ? 'Level 2' : 'Level 3'}
              </span>
              <span className="text-sm text-gray-500">Problem {currentProblemIndex + 1}/{problems.length}</span>
              <span className="text-sm text-gray-500">Progress: {getProgress()}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Timer and Session Control */}
      <div className="w-full bg-blue-50 border-b border-blue-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Level Duration: {level === 'level1' ? '30' : level === 'level2' ? '45' : '60'} minutes
                </span>
              </div>
              {sessionStarted && timeLeft !== null && (
                <div className="flex items-center space-x-2">
                  <Timer className="h-5 w-5 text-orange-600" />
                  <span className={`text-lg font-semibold ${timeLeft <= 300 ? 'text-red-600' : 'text-orange-600'}`}>
                    Time Left: {formatTime(timeLeft)}
                  </span>
                </div>
              )}

            </div>
            <div className="flex items-center space-x-4">
              {!sessionStarted ? (
                <button
                  onClick={startLevelSession}
                  className="flex items-center bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 shadow"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Level Session
                </button>
              ) : (
                <button
                  onClick={handleSubmitAll}
                  disabled={submitting}
                  className="flex items-center bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit All Problems ({getProgress()})
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Current Problem */}
      {currentProblem && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Problem Description */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  Problem {currentProblemIndex + 1}: {currentProblem.title}
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    {currentProblem.points} points
                  </span>
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                    {currentProblem.problemTimeAllowed} min
                  </span>
                </div>
              </div>
              
              <div className="prose max-w-none">
                <p className="text-gray-700 mb-4 whitespace-pre-wrap">{currentProblem.description}</p>
                
                {currentProblem.constraints && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Constraints:</h3>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{currentProblem.constraints}</p>
                  </div>
                )}

                {currentProblem.examples && currentProblem.examples.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Examples:</h3>
                    {currentProblem.examples.map((example, index) => (
                      <div key={index} className="bg-gray-50 rounded p-3 mb-2">
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Input:</strong> {example.input}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Output:</strong> {example.output}
                        </p>
                        {example.explanation && (
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">
                            <strong>Explanation:</strong> {example.explanation}
                          </p>
                        )}
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
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-700 capitalize">{currentLanguage}</span>
                </div>
                <select
                  value={currentLanguage}
                  onChange={(e) => updateCurrentLanguage(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1 text-sm text-black bg-white"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="c">C</option>
                </select>
              </div>
              
              <div className="p-0 flex-1 min-h-[384px]">
                <MonacoEditor
                  height="384px"
                  language={currentLanguage}
                  value={currentCode}
                  theme="vs-light"
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    automaticLayout: true,
                    lineNumbers: 'on',
                    tabSize: 2,
                  }}
                  onChange={(value) => updateCurrentCode(value || '')}
                />
              </div>

              <div className="p-4">
                {/* Run Code Button and Results */}
                <div className="flex items-center space-x-4 mb-4">
                  <button
                    onClick={handleRunCode}
                    disabled={runningCode || !sessionStarted}
                    className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
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
                  
                  {runResults[currentProblem._id] && (
                    <div className={`flex items-center px-3 py-1 rounded-md ${
                      runResults[currentProblem._id].success && runResults[currentProblem._id].allPassed
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {runResults[currentProblem._id].success && runResults[currentProblem._id].allPassed ? (
                        <CheckCircle className="h-4 w-4 mr-1" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-1" />
                      )}
                      <span className="text-sm">
                        {runResults[currentProblem._id].success 
                          ? runResults[currentProblem._id].allPassed 
                            ? 'All tests passed' 
                            : 'Some tests failed'
                          : runResults[currentProblem._id].error
                        }
                      </span>
                    </div>
                  )}
                </div>

                {/* Test Results */}
                {runResults[currentProblem._id] && runResults[currentProblem._id].results && (
                  <div className="space-y-2">
                    {runResults[currentProblem._id].results.map((result, idx) => (
                      <div key={idx} className={`p-3 rounded border ${
                        result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                      }`}>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Test {idx + 1}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            result.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {result.passed ? 'PASS' : 'FAIL'}
                          </span>
                        </div>
                        {!result.passed && (
                          <div className="mt-2 text-xs text-gray-600">
                            <div>Expected: {result.expected}</div>
                            <div>Got: {result.actual}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-center items-center space-x-6">
          <button
            onClick={goToPrevious}
            disabled={currentProblemIndex === 0}
            className="flex items-center px-6 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200 text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            <div className="text-left">
              <div className="text-sm text-gray-500">Previous</div>
              <div className="text-sm">Problem {currentProblemIndex}</div>
            </div>
          </button>

          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">
              Problem {currentProblemIndex + 1} of {problems.length}
            </div>
            <div className="w-48 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentProblemIndex + 1) / problems.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <button
            onClick={goToNext}
            disabled={currentProblemIndex === problems.length - 1}
            className="flex items-center px-6 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200 text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-right">
              <div className="text-sm text-gray-500">Next</div>
              <div className="text-sm">Problem {currentProblemIndex + 2}</div>
            </div>
            <ChevronRight className="h-5 w-5 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
}