'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Play, ArrowLeft, CheckCircle, XCircle, Clock, Timer, Send, ChevronLeft, ChevronRight, Target, BookOpen, Code, AlertTriangle } from 'lucide-react';
import dynamic from 'next/dynamic';
import ProblemStatusCard from '../../../../components/ProblemStatusCard';

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
  const [problemLanguages, setProblemLanguages] = useState({});
  const [problemCodes, setProblemCodes] = useState({}); // Add back problemCodes state
  const [runResults, setRunResults] = useState({});
  const [markedProblems, setMarkedProblems] = useState(new Set()); // Add marked problems state
  const [problemStatuses, setProblemStatuses] = useState({}); // Track pass/fail status for each problem
  const [currentCode, setCurrentCode] = useState(''); // Simple current code state
   
  // Timer state for entire level
  const [timeLeft, setTimeLeft] = useState(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [levelSubmissionId, setLevelSubmissionId] = useState(null);
  const timerRef = useRef();
  const [forceUpdate, setForceUpdate] = useState(0); // Force re-render
  
  // Problem Status popup state
  const [showProblemStatusPopup, setShowProblemStatusPopup] = useState(false);

  // Current problem
  const currentProblem = problems[currentProblemIndex];
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

  // Update current language when problem changes
  useEffect(() => {
    if (currentProblem && problemLanguages[currentProblem._id]) {
      // This will trigger a re-render with the correct language
    }
  }, [currentProblemIndex, problemLanguages]);

  // Update current code when switching problems
  useEffect(() => {
    if (currentProblem && problemCodes[currentProblem._id] !== undefined) {
      setCurrentCode(problemCodes[currentProblem._id] || '');
    }
  }, [currentProblemIndex, currentProblem, problemCodes]);

  // Remove auto-save functionality

  const fetchLevelProblems = async () => {
    try {
      const response = await fetch(`/api/problems/levels/${level}?language=${encodeURIComponent(language)}&category=${encodeURIComponent(category)}`, {
        credentials: 'include'
      });
      const data = await response.json();
       
      if (response.ok) {
        setLevelData(data);
        setProblems(data.problems || []);
         
        // Initialize code and language for each problem
        const langs = {};
        const codes = {};
        data.problems.forEach(problem => {
          // Default to JavaScript console.log if no starter code
          const defaultStarterCode = problem.starterCode || 'console.log("Hello, World!");';
          langs[problem._id] = 'javascript'; // Always default to JavaScript
          codes[problem._id] = defaultStarterCode; // Initialize with starter code
        });
        setProblemLanguages(langs);
        setProblemCodes(codes);
         
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
        credentials: 'include',
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
        const element = document.documentElement;
        if (element.requestFullscreen) {
          element.requestFullscreen().catch(console.error);
        }
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
        credentials: 'include',
        body: JSON.stringify({
          code: currentCode,
          language: currentLanguage,
          testCases: currentProblem.examples || []
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Track pass/fail status instead of saving code
        const allPassed = data.results && data.results.every(r => r.passed);
        
        // Save the current code to this problem's code
        setProblemCodes(prev => ({
          ...prev,
          [currentProblem._id]: currentCode
        }));
        
        setProblemStatuses(prev => ({
          ...prev,
          [currentProblem._id]: allPassed ? 'passed' : 'failed'
        }));
        
        setRunResults(prev => ({
          ...prev,
          [currentProblem._id]: {
            success: true,
            results: data.results,
            allPassed: allPassed
          }
        }));
      } else {
        setProblemStatuses(prev => ({
          ...prev,
          [currentProblem._id]: 'failed'
        }));
        
        setRunResults(prev => ({
          ...prev,
          [currentProblem._id]: {
            success: false,
            error: data.error || 'Code execution failed'
          }
        }));
      }
    } catch (error) {
      setProblemStatuses(prev => ({
        ...prev,
        [currentProblem._id]: 'failed'
      }));
      
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

    // Check if any problems have been tested
    const testedProblems = Object.keys(problemStatuses).length;
    if (testedProblems === 0) {
      alert('⚠️ No problems have been tested!\n\nPlease run code for at least one problem before submitting.');
      return;
    }

    if (testedProblems < problems.length) {
      const confirmSubmit = confirm(`⚠️ Only ${testedProblems} out of ${problems.length} problems have been tested.\n\nAre you sure you want to submit? Untested problems will be marked as "not attempted".`);
      if (!confirmSubmit) return;
    }

    setSubmitting(true);

    try {
      const problemSubmissions = problems.map(problem => ({
        problemId: problem._id,
        code: problemCodes[problem._id] || currentCode || '', // Use problem-specific code or fallback to current code
        submissionLanguage: problemLanguages[problem._id] || 'javascript',
        status: problemStatuses[problem._id] || 'not_attempted', // This will be used as passFailStatus
        passFailStatus: problemStatuses[problem._id] || 'not_attempted' // Explicit pass/fail status
      }));

      const response = await fetch(`/api/problems/levels/${level}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          language,
          category,
          problemSubmissions
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Show simple success message without scores
        alert(`✅ Successfully submitted ${problems.length} problems for ${level}!\n\nRedirecting to submissions page to view your results.`);
        
        // Exit fullscreen if active before navigating
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
        // Redirect to submissions page
        router.push('/dashboard/submissions?type=level');
      } else {
        const errorData = await response.json();
        
        // Check if it's an "already submitted" error
        if (errorData.error && errorData.error.includes('already have a submission')) {
          alert('⚠️ ' + errorData.error + '\n\nRedirecting to submissions page...');
          if (document.fullscreenElement) {
            document.exitFullscreen();
          }
          router.push('/dashboard/submissions?type=level');
        } else {
          alert(errorData.error || 'Failed to submit problems');
        }
      }
    } catch (error) {
      console.error('Error submitting all problems:', error);
      alert('Error submitting problems');
    } finally {
      setSubmitting(false);
    }
  };

  // updateCurrentCode function is removed

  // Auto-save code as user types
  const handleCodeChange = (value) => {
    if (!currentProblem) return;
    const codeValue = value || '';
    setCurrentCode(codeValue);
    
    // Also save to problem-specific codes
    setProblemCodes(prev => ({
      ...prev,
      [currentProblem._id]: codeValue
    }));
  };

  const updateCurrentLanguage = (newLanguage) => {
    if (!currentProblem) return;
    const languageToSet = newLanguage || 'javascript'; // Default to JavaScript
     
    setProblemLanguages(prev => ({
      ...prev,
      [currentProblem._id]: languageToSet
    }));
     
    // Force a re-render to update the UI
    setForceUpdate(prev => prev + 1);
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
      case 'level1': return 'bg-green-600 text-white';
      case 'level2': return 'bg-yellow-600 text-white';
      case 'level3': return 'bg-red-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const passed = Object.values(problemStatuses).filter(status => status === 'passed').length;
    return `${passed}/${problems.length}`;
  };

  const getTestedProblemsCount = () => {
    return Object.keys(problemStatuses).length;
  };

  const getCurrentProblemStatus = () => {
    if (!currentProblem) return 'No problem selected';
    const status = problemStatuses[currentProblem._id];
    if (!status) return 'Not tested';
    return status === 'passed' ? '✅ Passed' : '❌ Failed';
  };

  const handleMarkProblem = () => {
    if (!currentProblem) return;
    
    const newMarked = new Set(markedProblems);
    if (newMarked.has(currentProblem._id)) {
      newMarked.delete(currentProblem._id);
    } else {
      newMarked.add(currentProblem._id);
    }
    setMarkedProblems(newMarked);
  };

  const handleClearProblem = () => {
    if (!currentProblem) return;
    
    if (confirm('Are you sure you want to clear all code for this problem?')) {
      setCurrentCode('');
      setProblemCodes(prev => ({
        ...prev,
        [currentProblem._id]: ''
      }));
      setRunResults(prev => ({ ...prev, [currentProblem._id]: null }));
    }
  };

  const isProblemMarked = (problemId) => {
    return markedProblems.has(problemId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!levelData || problems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold mb-2">No Problems Found</h2>
          <p className="text-gray-400 mb-4">No problems found for this level</p>
          <button
            onClick={() => router.push('/dashboard/problems')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
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
      <div className="min-h-screen bg-gray-50 text-gray-900 p-4">
        <div className="max-w-2xl mx-auto pt-16">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {level === 'level1' ? 'Level 1' : level === 'level2' ? 'Level 2' : 'Level 3'} - {language}
              </h1>
              <p className="text-gray-600">{category} Problems</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center mb-2">
                  <Clock className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="font-semibold text-gray-900">Total Time</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {problems.reduce((total, problem) => total + (problem.timeLimit ? Math.floor(problem.timeLimit / 60) : 10), 0)} minutes
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center mb-2">
                  <Target className="w-5 h-5 text-green-600 mr-2" />
                  <span className="font-semibold text-gray-900">Problems</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{problems.length}</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-amber-800 mb-3 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Important Instructions
              </h3>
              <ul className="text-amber-700 space-y-2 text-sm">
                <li>• You have {problems.reduce((total, problem) => total + (problem.timeLimit ? Math.floor(problem.timeLimit / 60) : 10), 0)} minutes to complete all {problems.length} problems</li>
                <li>• The timer will run for the entire level, not individual problems</li>
                <li>• You can navigate between problems freely during the session</li>
                <li>• Your code will be auto-saved as you work</li>
                <li>• Make sure you have a stable internet connection</li>
                <li>• The session will auto-submit when time expires</li>
                <li>• You can manually submit all solutions before time expires</li>
              </ul>
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
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
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
    <div className="fixed inset-0 bg-white text-gray-900 flex flex-col overflow-hidden z-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Programming Challenge... ({problems.length})</h1>
            <p className="text-sm text-gray-500">{level.toUpperCase()} - {language} - {category}</p>
            <p className="text-xs text-blue-600 mt-1">
               🧪 Tested: {getTestedProblemsCount()}/{problems.length} | Current: {getCurrentProblemStatus()}
              </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className={`inline-flex px-3 py-2 text-sm font-semibold rounded-lg ${getDifficultyColor(level)}`}>
            {level === 'level1' ? 'Level 1' : level === 'level2' ? 'Level 2' : 'Level 3'}
          </span>
          {sessionStarted && timeLeft !== null && (
            <div className="flex items-center gap-2 bg-red-600 px-3 py-2 rounded-lg">
              <Clock className="w-4 h-4 text-white" />
              <span className="font-mono font-semibold text-white">Time Left: {formatTime(timeLeft)}</span>
            </div>
          )}
          <button
            onClick={() => setShowProblemStatusPopup(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Problem Status"
          >
            <div className="flex flex-col gap-1">
              <div className="w-5 h-0.5 bg-gray-600"></div>
              <div className="w-5 h-0.5 bg-gray-600"></div>
              <div className="w-5 h-0.5 bg-gray-600"></div>
            </div>
          </button>
        </div>
      </div>



      {/* Main Content - Split Layout */}
      {currentProblem && (
        <div className="flex flex-1 min-h-0">
          {/* Left Panel - Problem Details */}
          <div className="w-1/2 bg-white border-r border-gray-200 overflow-y-auto">
            <div className="p-6">
              {/* Title */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-blue-600 mb-2">Answer The Following</h2>
                <h3 className="text-xl font-semibold text-gray-900">Problem {currentProblemIndex + 1}: {currentProblem.title}</h3>
              </div>

              {/* Scoring */}
              {/* <div className="flex gap-6 mb-6">
                <div className="bg-blue-100 border border-blue-200 px-3 py-2 rounded-lg">
                  <span className="text-sm font-medium text-blue-800">Time: {currentProblem.problemTimeAllowed || 10} min</span>
                </div>
              </div> */}

              {/* Problem Statement */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-3 text-blue-600">Problem Statement</h4>
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{currentProblem.description}</p>
                </div>
              </div>

              {/* Constraints */}
              {currentProblem.constraints && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-3 text-red-600">Constraints</h4>
                  <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                    <p className="text-gray-700 font-mono whitespace-pre-wrap">{currentProblem.constraints}</p>
                  </div>
                </div>
              )}

              {/* Examples */}
              {currentProblem.examples && currentProblem.examples.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-3 text-green-600">Examples</h4>
                  {currentProblem.examples.map((example, index) => (
                    <div key={index} className="bg-gray-50 border border-gray-200 p-4 rounded-lg mb-3">
                      <div className="space-y-2">
                        <div>
                          <span className="text-blue-600 font-medium">Input:</span>
                          <span className="text-gray-700 ml-2">{example.input}</span>
                        </div>
                        <div>
                          <span className="text-blue-600 font-medium">Output:</span>
                          <span className="text-gray-700 ml-2">{example.output}</span>
                        </div>
                        {example.explanation && (
                          <div>
                            <span className="text-blue-600 font-medium">Explanation:</span>
                            <span className="text-gray-700 ml-2">{example.explanation}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Code Editor */}
          <div className="w-1/2 bg-gray-50 flex flex-col">
            {/* Editor Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Language:</span>
                  <select
                    value={currentLanguage}
                    onChange={(e) => updateCurrentLanguage(e.target.value)}
                    className="bg-white border border-gray-300 text-gray-900 px-3 py-1 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="c">C</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Code Editor */}
            <div className="flex-1 p-4 min-h-0">
              <MonacoEditor
                height="100%"
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
                  // Disable code suggestions and IntelliSense
                  suggestOnTriggerCharacters: false,
                  quickSuggestions: false,
                  parameterHints: { enabled: false },
                  hover: { enabled: false },
                  contextmenu: false,
                  suggest: { showKeywords: false, showSnippets: false, showClasses: false, showFunctions: false, showVariables: false, showConstants: false, showEnums: false, showEnumsMembers: false, showColors: false, showFiles: false, showReferences: false, showFolders: false, showTypeParameters: false, showWords: false, showUsers: false, showIssues: false },
                  acceptSuggestionOnCommitCharacter: false,
                  acceptSuggestionOnEnter: 'off',
                  tabCompletion: 'off',
                  wordBasedSuggestions: 'off',
                  suggestSelection: 'first',
                  suggest: false,
                }}
                onChange={handleCodeChange}
              />
            </div>

            {/* Action Buttons */}
            <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center gap-3 flex-shrink-0 shadow-sm">
              <button
                onClick={handleRunCode}
                disabled={runningCode || !sessionStarted}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {runningCode ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Run Code
                  </>
                )}
              </button>
              
              {runResults[currentProblem._id] && (
                <div className={`flex items-center px-3 py-1 rounded-md ${
                  runResults[currentProblem._id].success && runResults[currentProblem._id].allPassed
                    ? 'bg-green-100 border border-green-200 text-green-800'
                    : 'bg-red-100 border border-red-200 text-red-800'
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
          </div>
        </div>
      )}

      {/* Test Results */}
      {currentProblem && runResults[currentProblem._id] && runResults[currentProblem._id].results && (
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex-shrink-0">
          <h3 className="text-lg font-semibold mb-3 text-gray-900">Test Results</h3>
          <div className="space-y-2">
            {runResults[currentProblem._id].results.map((result, idx) => (
              <div key={idx} className={`p-3 rounded border ${
                result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-900">Test {idx + 1}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    result.passed ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
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
        </div>
      )}

      {/* Bottom Bar */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors border border-gray-300">
            <AlertTriangle className="w-4 h-4 inline mr-2" />
            Report Error
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={goToPrevious}
            disabled={currentProblemIndex === 0}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={handleClearProblem}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
          >
            Clear
          </button>
          <button
            onClick={handleMarkProblem}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isProblemMarked(currentProblem._id)
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isProblemMarked(currentProblem._id) ? 'Unmark' : 'Mark'}
          </button>
          <button
            onClick={goToNext}
            disabled={currentProblemIndex === problems.length - 1}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            Next
          </button>
          {sessionStarted && (
            <button
              onClick={handleSubmitAll}
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit All ({getTestedProblemsCount()}/{problems.length})
                </>
              )}
            </button>
          )}
          {sessionStarted && (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to end this test? All progress will be lost.')) {
                  router.push('/dashboard/problems');
                }
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              End Test
            </button>
          )}
        </div>
      </div>

      {/* Problem Status Overlay */}
      {showProblemStatusPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-[60] pointer-events-none">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden pointer-events-auto">
            {/* Header */}
            <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Problem Status Overview</h2>
              <button
                onClick={() => setShowProblemStatusPopup(false)}
                className="text-white hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-blue-700"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <ProblemStatusCard
                totalProblems={problems.length}
                answeredCount={getTestedProblemsCount()}
                currentProblemIndex={currentProblemIndex}
                problemCodes={problemLanguages}
                markedProblems={markedProblems}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}