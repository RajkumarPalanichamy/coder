'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Play, ArrowLeft, CheckCircle, XCircle, Clock, Timer, Send, ChevronLeft, ChevronRight, Target, BookOpen, Code, AlertTriangle } from 'lucide-react';
import dynamic from 'next/dynamic';
import ProblemStatusCard from '../../../../components/ProblemStatusCard';
import useTestProctoring, { requestFullscreen, exitFullscreen } from '@/lib/useTestProctoring';

// Same wording as the aptitude test - leaving the test screen ends the attempt either way
const TERMINATION_MESSAGES = {
  exited_fullscreen: 'You left fullscreen mode, so the test was ended and your work was submitted automatically.',
  left_test_screen: 'You left the test screen, so the test was ended and your work was submitted automatically.',
  time_expired: 'Time is up. Your work has been submitted automatically.',
  manual: 'Your test is being submitted.'
};

const mapLanguageToMonacoKey = (lang) => {
  if (!lang) return 'javascript';
  const l = lang.toLowerCase().trim();
  if (l === 'cpp' || l === 'c++' || l === 'c++ programming' || l === 'cpp programming') return 'cpp';
  if (l === 'c' || l === 'c programming' || l === 'embedded c programming') return 'c';
  if (l === 'python') return 'python';
  if (l === 'java') return 'java';
  if (l === 'javascript' || l === 'js') return 'javascript';
  return l;
};

const isStandardLanguage = (lang) => {
  if (!lang) return false;
  const l = lang.toLowerCase().trim();
  return [
    'javascript', 'js',
    'python',
    'java',
    'cpp', 'c++', 'c++ programming', 'cpp programming',
    'c', 'c programming', 'embedded c programming',
    'csharp', 'c#',
    'go', 'rust', 'kotlin', 'typescript', 'php', 'ruby', 'swift'
  ].includes(l);
};

// Monaco Editor (dynamically loaded to avoid SSR issues)
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export default function LevelProblemsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
   
  const language = searchParams.get('language');
  const category = searchParams.get('category');
  const { level } = params;
  const isLanguageFixed = isStandardLanguage(language);

  const [levelData, setLevelData] = useState(null);
  const [problems, setProblems] = useState([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [runningCode, setRunningCode] = useState(false);
  const [submittingProblem, setSubmittingProblem] = useState(false);
  const [submittedProblems, setSubmittedProblems] = useState(new Set()); // Questions answered via the per-question Submit
  const [problemSubmitNotice, setProblemSubmitNotice] = useState(null); // { type, message } for the current question
  const [submitError, setSubmitError] = useState(null); // Final submit failed - offer a retry
  const [confirmDialog, setConfirmDialog] = useState(null); // { type: 'submit' | 'exit' | 'clear', ... }
  // Once set the attempt is over - no more coding, whatever happens to the submission
  const [endedReason, setEndedReason] = useState(null);
   
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
  const deadlineRef = useRef(null); // Wall-clock end of the session
  const endedRef = useRef(false); // The attempt may only be ended once
  const [forceUpdate, setForceUpdate] = useState(0); // Force re-render
  
  // Problem Status popup state
  const [showProblemStatusPopup, setShowProblemStatusPopup] = useState(false);
  const [showTestResults, setShowTestResults] = useState(true); // Control test results visibility

  // Current problem
  const currentProblem = problems[currentProblemIndex];
  const currentLanguage = currentProblem ? (problemLanguages[currentProblem._id] || 'javascript') : 'javascript';
  const attemptEnded = endedReason !== null;
   
  useEffect(() => {
    if (language && category && level) {
      fetchLevelProblems();
    } else {
      router.push('/dashboard/problems');
    }
  }, [language, category, level]);

  // Timer logic - remaining time is derived from the wall clock, not from counting
  // ticks, so a throttled/backgrounded tab still hits zero at the right moment
  useEffect(() => {
    if (!sessionStarted || deadlineRef.current === null) return;

    const tick = () => {
      const remaining = Math.max(0, Math.round((deadlineRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) clearInterval(timerRef.current);
    };

    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, [sessionStarted]);

  // Auto submit when time expires - runs unattended, so it must never prompt
  useEffect(() => {
    if (timeLeft === 0 && sessionStarted) {
      endAttempt('time_expired');
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

  // The submit banner belongs to the question it was raised on
  useEffect(() => {
    setProblemSubmitNotice(null);
  }, [currentProblemIndex]);

  // Fullscreen lock, presence detection and paste blocking - disarmed once the attempt ends
  const { isFullscreen, armed, enterFullscreen } = useTestProctoring({
    active: sessionStarted && !attemptEnded,
    onViolation: (reason) => endAttempt(reason)
  });

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
          const isStd = isStandardLanguage(language || problem.programmingLanguage);
          const mappedLang = isStd ? mapLanguageToMonacoKey(language || problem.programmingLanguage) : 'javascript';
          // Default to JavaScript console.log if no starter code
          const defaultStarterCode = problem.starterCode || (mappedLang === 'javascript' ? 'console.log("Hello, World!");' : '');
          langs[problem._id] = mappedLang;
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
        const { timeAllowed, startTime } = data.levelSubmission;
        // Anchor to the server's start time so a reload or a slow tab cannot extend the sitting
        const startedAt = startTime ? new Date(startTime).getTime() : Date.now();
        deadlineRef.current = startedAt + timeAllowed * 1000;

        setLevelSubmissionId(data.levelSubmission._id);
        setTimeLeft(Math.max(0, Math.round((deadlineRef.current - Date.now()) / 1000)));
        setSessionStarted(true);
        requestFullscreen();
      } else {
        alert(data.error || 'Failed to start level session');
      }
    } catch (error) {
      console.error('Error starting level session:', error);
      alert('Error starting level session');
    }
  };

  const handleRunCode = async () => {
    if (!currentProblem || attemptEnded) return;
    
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

  // Submit the question currently on screen, without ending the test
  const handleSubmitProblem = async () => {
    if (!currentProblem || !sessionStarted || submittingProblem || submitting || attemptEnded) return;

    if (!levelSubmissionId) {
      setProblemSubmitNotice({
        type: 'error',
        message: 'Session not ready yet. Please try again in a moment.'
      });
      return;
    }

    const problemId = currentProblem._id;
    const alreadySubmitted = submittedProblems.has(problemId);

    setSubmittingProblem(true);
    setProblemSubmitNotice(null);

    try {
      const response = await fetch(`/api/submissions/level/${levelSubmissionId}/problem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          problemId,
          code: currentCode,
          language: currentLanguage,
          passFailStatus: problemStatuses[problemId] || 'not_attempted'
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setProblemSubmitNotice({
          type: 'error',
          message: data.error || 'Failed to submit this question. Please try again.'
        });
        return;
      }

      // Keep the answer on record locally too, so the final submit sends the same code
      setProblemCodes(prev => ({ ...prev, [problemId]: currentCode }));
      setSubmittedProblems(prev => new Set(prev).add(problemId));

      const isLastProblem = currentProblemIndex === problems.length - 1;
      setProblemSubmitNotice({
        type: 'success',
        message: alreadySubmitted || data.resubmitted
          ? isLastProblem
            ? 'Answer updated. This is the last question - use Submit Test when you are done.'
            : 'Answer updated. Click Next to move to the following question.'
          : isLastProblem
            ? 'Answer submitted. This is the last question - use Submit Test when you are done.'
            : 'Answer submitted. Click Next to move to the following question.'
      });
    } catch (error) {
      console.error('Error submitting problem:', error);
      setProblemSubmitNotice({
        type: 'error',
        message: 'Network error while submitting this question. Please try again.'
      });
    } finally {
      setSubmittingProblem(false);
    }
  };

  /**
   * Sends every question, including untouched ones, so partial work is never dropped.
   * Never prompts: by the time it runs the attempt is already over.
   */
  const submitAll = async (reason) => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const problemSubmissions = problems.map(problem => ({
        problemId: problem._id,
        code: problemCodes[problem._id] ?? (problem._id === currentProblem?._id ? currentCode : ''),
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
          problemSubmissions,
          autoSubmitted: reason !== 'manual'
        })
      });

      const data = await response.json().catch(() => ({}));

      // An attempt already on record is a success from here - show it rather than
      // stranding the student on a test they can no longer submit.
      const alreadyOnRecord =
        data.code === 'ALREADY_SUBMITTED' ||
        (data.error && data.error.includes('already have a submission'));

      if (!response.ok && !alreadyOnRecord) {
        setSubmitError(data.error || 'Submission failed. Check your connection and try again.');
        setSubmitting(false);
        return;
      }

      exitFullscreen();
      router.push('/dashboard/submissions?type=level');
    } catch (error) {
      console.error('Error submitting all problems:', error);
      setSubmitError('Submission failed. Check your connection and try again.');
      setSubmitting(false);
    }
  };

  /**
   * The one and only way out of an attempt. Latched, because a single tab switch usually
   * fires several proctoring events and the timer keeps ticking through a failed submit.
   */
  const endAttempt = (reason) => {
    if (endedRef.current) return;
    endedRef.current = true;
    setEndedReason(reason);
    setConfirmDialog(null);
    submitAll(reason);
  };

  // Manual finish - the modal is the confirmation, so this just ends the attempt
  const handleSubmitAll = () => {
    if (!sessionStarted || submitting || attemptEnded) return;

    const answeredCount = problems.filter(
      p => submittedProblems.has(p._id) || problemStatuses[p._id]
    ).length;

    setConfirmDialog({ type: 'submit', answeredCount });
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

  const getSubmittedProblemsCount = () => {
    return problems.filter(p => submittedProblems.has(p._id)).length;
  };

  const isCurrentProblemSubmitted = () => {
    return !!currentProblem && submittedProblems.has(currentProblem._id);
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
    if (!currentProblem || attemptEnded) return;
    setConfirmDialog({ type: 'clear' });
  };

  const clearCurrentProblem = () => {
    setConfirmDialog(null);
    if (!currentProblem) return;

    setCurrentCode('');
    setProblemCodes(prev => ({
      ...prev,
      [currentProblem._id]: ''
    }));
    setRunResults(prev => ({ ...prev, [currentProblem._id]: null }));
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
                <li>• Use <strong>Run Code</strong> to compile your solution and check it against the examples</li>
                <li>• Use <strong>Submit Answer</strong> to record a question, then click <strong>Next</strong> to move on</li>
                <li>• You can resubmit a question any time before the test ends</li>
                <li>• Make sure you have a stable internet connection</li>
                <li className="font-semibold">• The test runs in fullscreen. If you switch back to the normal screen, or leave the test screen, the test ends immediately and your work is submitted automatically</li>
                <li>• Copy-paste into the editor is disabled for the whole test</li>
                <li>• When the timer runs out, everything you have written is submitted automatically</li>
                <li>• Use <strong>Submit Test</strong> to finish early</li>
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
               🧪 Tested: {getTestedProblemsCount()}/{problems.length} | 📤 Submitted: {getSubmittedProblemsCount()}/{problems.length} | Current: {getCurrentProblemStatus()}
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
                          <pre className="text-gray-700 ml-2 mt-1 text-sm bg-white p-2 rounded border">
                            {example.input.split('\n').map((line, i) => (
                              <div key={i}>{line}</div>
                            ))}
                          </pre>
                        </div>
                        <div>
                          <span className="text-blue-600 font-medium">Output:</span>
                          <pre className="text-gray-700 ml-2 mt-1 text-sm bg-white p-2 rounded border">
                            {example.output.split('\n').map((line, i) => (
                              <div key={i}>{line}</div>
                            ))}
                          </pre>
                        </div>
                        {example.explanation && (
                          <div>
                            <span className="text-blue-600 font-medium">Explanation:</span>
                            <pre className="text-gray-700 ml-2 mt-1 text-sm bg-white p-2 rounded border">
                              {example.explanation.split('\n').map((line, i) => (
                                <div key={i}>{line}</div>
                              ))}
                            </pre>
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
                    disabled={isLanguageFixed}
                    className={`border text-sm rounded-lg px-3 py-1 focus:outline-none ${
                      isLanguageFixed
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300'
                        : 'bg-white text-gray-900 border-gray-300 focus:ring-2 focus:ring-blue-500'
                    }`}
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
            <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0 shadow-sm">
              <div className="flex items-center gap-3">
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
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRunCode}
                  disabled={runningCode || !sessionStarted}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50"
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

                {/* Per-question submit - records this answer without ending the test */}
                <button
                  onClick={handleSubmitProblem}
                  disabled={submittingProblem || submitting || !sessionStarted}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {submittingProblem ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {isCurrentProblemSubmitted() ? 'Resubmit Answer' : 'Submit Answer'}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Result of the last per-question submit */}
            {problemSubmitNotice && (
              <div
                className={`px-6 py-3 border-t flex items-center justify-between gap-4 flex-shrink-0 ${
                  problemSubmitNotice.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  {problemSubmitNotice.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span className="text-sm">{problemSubmitNotice.message}</span>
                </div>
                {problemSubmitNotice.type === 'success' && currentProblemIndex < problems.length - 1 && (
                  <button
                    onClick={goToNext}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors whitespace-nowrap"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Test Results */}
      {currentProblem && runResults[currentProblem._id] && runResults[currentProblem._id].results && (
        <div className="bg-gray-50 border-t border-gray-200 flex-shrink-0">
          {/* Test Results Header with Toggle */}
          <div className="px-6 py-3 bg-gray-100 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-900">Test Results</h3>
                <span className="text-sm text-gray-600">
                  ({runResults[currentProblem._id].results.filter(r => r.passed).length}/{runResults[currentProblem._id].results.length} passed)
                </span>
              </div>
              <button
                onClick={() => setShowTestResults(!showTestResults)}
                className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-md transition-colors"
              >
                {showTestResults ? (
                  <>
                    <span>Hide Details</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </>
                ) : (
                  <>
                    <span>Show Details</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Collapsible Test Results Content */}
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
            showTestResults ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="px-6 py-4 space-y-3">
              {runResults[currentProblem._id].results.map((result, idx) => (
                <div key={idx} className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                  result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  {/* Test Case Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        result.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {result.passed ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-900">Test Case {idx + 1}</span>
                        {result.input && (
                          <span className="text-xs text-gray-500 ml-2">
                            Input: {result.input.length > 20 ? result.input.substring(0, 20) + '...' : result.input}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {result.executionTime && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          {result.executionTime}ms
                        </span>
                      )}
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        result.passed ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                      }`}>
                        {result.passed ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Failed Test Details */}
                  {!result.passed && (
                    <div className="space-y-3 pt-3 border-t border-gray-200">
                      {/* Input/Output Comparison */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700 text-sm">Expected Output:</span>
                          <pre className="mt-2 text-xs text-gray-600 bg-white p-3 rounded-lg border overflow-x-auto shadow-sm">{result.expected || 'N/A'}</pre>
                        </div>
                        <div>
                          <span className="font-medium text-red-700 text-sm">Your Output:</span>
                          <pre className="mt-2 text-xs text-gray-600 bg-white p-3 rounded-lg border overflow-x-auto shadow-sm">{result.actual || 'N/A'}</pre>
                        </div>
                      </div>
                      
                      {/* Error Details from Judge0 */}
                      {result.error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium text-red-700 text-sm">Error Details:</span>
                          </div>
                          <pre className="text-xs text-red-600 overflow-x-auto whitespace-pre-wrap bg-red-100 p-2 rounded border">{result.error}</pre>
                        </div>
                      )}
                      
                      {/* Execution Details */}
                      <div className="flex items-center gap-4 text-xs text-gray-500 pt-2">
                        {result.executionTime && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {result.executionTime}ms
                          </span>
                        )}
                        {result.memory && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            {result.memory}KB
                          </span>
                        )}
                        {result.status && (
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            result.status === 'Accepted' ? 'bg-green-100 text-green-700' :
                            result.status === 'Wrong Answer' ? 'bg-red-100 text-red-700' :
                            result.status === 'Runtime Error' ? 'bg-orange-100 text-orange-700' :
                            result.status === 'Compilation Error' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {result.status}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Bar */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-center flex-shrink-0 shadow-sm">
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
            className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
              isCurrentProblemSubmitted()
                ? 'bg-blue-600 hover:bg-blue-700 ring-2 ring-blue-300'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Next
          </button>

          {sessionStarted && (
                  <button
                    onClick={() => handleSubmitAll()}
                    disabled={submitting}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                    title="Ends the test and submits every question"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Test ({getSubmittedProblemsCount()}/{problems.length})
                      </>
                    )}
                  </button>
                )}

          {sessionStarted && (
            <button
              onClick={() => setConfirmDialog({ type: 'exit' })}
              disabled={submitting || attemptEnded}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              End Test
            </button>
          )}
        </div>
      </div>

      {/* Confirmations. window.confirm cannot be used anywhere in here: the native dialog
          blurs the window, which the proctoring hook correctly reads as leaving the test. */}
      {confirmDialog?.type === 'submit' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[85] p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Submit test?</h3>
            <p className="text-gray-600 mb-6">
              {confirmDialog.answeredCount < problems.length
                ? `You have worked on ${confirmDialog.answeredCount} of ${problems.length} questions. Everything you have written is saved; the rest are recorded as "not attempted". Once submitted you cannot return to this attempt.`
                : 'Once submitted you cannot return to this attempt.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDialog(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Keep Working
              </button>
              <button
                onClick={() => endAttempt('manual')}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Submit Test
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDialog?.type === 'exit' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[85] p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">End the test?</h3>
            <p className="text-gray-600 mb-6">
              Your work will be submitted as it stands and the attempt will be closed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDialog(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Keep Working
              </button>
              <button
                onClick={() => endAttempt('manual')}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                End Test
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDialog?.type === 'clear' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[85] p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Clear your code?</h3>
            <p className="text-gray-600 mb-6">
              This removes everything you have written for this question.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDialog(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={clearCurrentProblem}
                className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-semibold"
              >
                Clear Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/*
        Only ever seen before fullscreen is first entered - if the browser refuses the
        initial request the questions stay covered instead of being readable in a window.
      */}
      {sessionStarted && !attemptEnded && !isFullscreen && (
        <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Fullscreen required</h3>
            <p className="text-gray-600 mb-6">
              This test can only be taken in fullscreen, so the questions stay hidden until you
              enter it. Once you are in, leaving fullscreen ends the test and submits your work.
            </p>
            <button
              onClick={enterFullscreen}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Enter Fullscreen
            </button>

            {/* Escape hatch for a browser that will not grant fullscreen at all. Offered only
                before the first entry, when no question has ever been rendered. */}
            {!armed && (
              <button
                onClick={() => router.push('/dashboard/problems')}
                className="w-full mt-3 px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                My browser cannot go fullscreen - leave without starting
              </button>
            )}
          </div>
        </div>
      )}

      {/* Terminal state: the attempt is over, only the submission is still in flight. */}
      {attemptEnded && (
        <div className="fixed inset-0 bg-gray-900/90 flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Test ended</h3>
            <p className="text-gray-600 mb-6">
              {TERMINATION_MESSAGES[endedReason] || TERMINATION_MESSAGES.manual}
            </p>

            {submitError ? (
              <>
                <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
                  {submitError} Your work is not saved yet - do not close this window.
                </p>
                <button
                  onClick={() => submitAll(endedReason)}
                  disabled={submitting}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Retrying...' : 'Retry Submit'}
                </button>
              </>
            ) : (
              <div className="flex items-center justify-center gap-3 text-gray-600">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span>Submitting your work...</span>
              </div>
            )}
          </div>
        </div>
      )}

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
                submittedProblems={submittedProblems}
                problems={problems}
                problemStatuses={problemStatuses}
                onSelectProblem={(index) => {
                  setCurrentProblemIndex(index);
                  setShowProblemStatusPopup(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}