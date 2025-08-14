'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Play, Save, ArrowLeft, CheckCircle, XCircle, Clock, Timer, Send } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [runningCode, setRunningCode] = useState({});
  
  // Store code for each problem
  const [problemCodes, setProblemCodes] = useState({});
  const [problemLanguages, setProblemLanguages] = useState({});
  const [runResults, setRunResults] = useState({});
  const [canSubmitAll, setCanSubmitAll] = useState(false);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [levelSubmissionId, setLevelSubmissionId] = useState(null);
  const timerRef = useRef();

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

  const handleRunCode = async (problemId) => {
    setRunningCode(prev => ({ ...prev, [problemId]: true }));
    setRunResults(prev => ({ ...prev, [problemId]: null }));

    const problem = problems.find(p => p._id === problemId);
    const code = problemCodes[problemId];
    const lang = problemLanguages[problemId];

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language: lang,
          testCases: problem.examples || []
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setRunResults(prev => ({
          ...prev,
          [problemId]: {
            success: true,
            results: data.results,
            allPassed: data.results.every(r => r.passed)
          }
        }));
      } else {
        setRunResults(prev => ({
          ...prev,
          [problemId]: {
            success: false,
            error: data.error || 'Code execution failed'
          }
        }));
      }
    } catch (error) {
      setRunResults(prev => ({
        ...prev,
        [problemId]: {
          success: false,
          error: 'Error running code'
        }
      }));
    } finally {
      setRunningCode(prev => ({ ...prev, [problemId]: false }));
    }

    // Check if all problems have been run successfully
    checkCanSubmitAll();
  };

  const checkCanSubmitAll = () => {
    const allProblemsHaveCode = problems.every(problem => 
      problemCodes[problem._id] && problemCodes[problem._id].trim() !== ''
    );
    setCanSubmitAll(allProblemsHaveCode && sessionStarted);
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
        code: problemCodes[problem._id],
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

  const updateProblemCode = (problemId, newCode) => {
    setProblemCodes(prev => ({
      ...prev,
      [problemId]: newCode
    }));
    checkCanSubmitAll();
  };

  const updateProblemLanguage = (problemId, newLanguage) => {
    setProblemLanguages(prev => ({
      ...prev,
      [problemId]: newLanguage
    }));
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
              <span className="text-sm text-gray-500">{problems.length} Problems</span>
              <span className="text-sm text-gray-500">{levelData.totalPoints} Points</span>
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
                  Total Time: {Math.floor(levelData.totalTime / 60)} minutes
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
                  disabled={!canSubmitAll || submitting}
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
                      Submit All Problems
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Problems List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {problems.map((problem, index) => (
            <div key={problem._id} className="bg-white rounded-lg shadow">
              {/* Problem Header */}
              <div className="border-b border-gray-200 p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {index + 1}. {problem.title}
                    </h2>
                    <p className="text-gray-600 mt-2">{problem.description}</p>
                    {problem.points && (
                      <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {problem.points} points
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Examples */}
                {problem.examples && problem.examples.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Examples:</h3>
                    {problem.examples.map((example, idx) => (
                      <div key={idx} className="bg-gray-50 rounded p-3 mb-2">
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Input:</strong> {example.input}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Output:</strong> {example.output}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Code Editor */}
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Solution</h3>
                  <select
                    value={problemLanguages[problem._id] || 'javascript'}
                    onChange={(e) => updateProblemLanguage(problem._id, e.target.value)}
                    className="border border-gray-300 rounded px-3 py-1 text-sm"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="c">C</option>
                  </select>
                </div>
                
                <div className="border rounded-lg">
                  <MonacoEditor
                    height="200px"
                    language={problemLanguages[problem._id] || 'javascript'}
                    value={problemCodes[problem._id] || ''}
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
                    onChange={(value) => updateProblemCode(problem._id, value || '')}
                  />
                </div>

                {/* Run Code Button and Results */}
                <div className="mt-4 flex items-center space-x-4">
                  <button
                    onClick={() => handleRunCode(problem._id)}
                    disabled={runningCode[problem._id] || !sessionStarted}
                    className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {runningCode[problem._id] ? (
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
                  
                  {runResults[problem._id] && (
                    <div className={`flex items-center px-3 py-1 rounded-md ${
                      runResults[problem._id].success && runResults[problem._id].allPassed
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {runResults[problem._id].success && runResults[problem._id].allPassed ? (
                        <CheckCircle className="h-4 w-4 mr-1" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-1" />
                      )}
                      <span className="text-sm">
                        {runResults[problem._id].success 
                          ? runResults[problem._id].allPassed 
                            ? 'All tests passed' 
                            : 'Some tests failed'
                          : runResults[problem._id].error
                        }
                      </span>
                    </div>
                  )}
                </div>

                {/* Test Results */}
                {runResults[problem._id] && runResults[problem._id].results && (
                  <div className="mt-4 space-y-2">
                    {runResults[problem._id].results.map((result, idx) => (
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
          ))}
        </div>
      </div>
    </div>
  );
}