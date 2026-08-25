"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { formatQuestionText } from '@/lib/formatQuestionText';
import useTestProctoring from '@/lib/useTestProctoring';

const TERMINATION_MESSAGES = {
  exited_fullscreen: 'You left fullscreen mode, so the attempt was ended and your answers were submitted automatically.',
  left_test_screen: 'You left the test screen, so the attempt was ended and your answers were submitted automatically.',
  time_expired: 'Time is up. Your answers have been submitted automatically.',
  manual: 'Your test is being submitted.'
};

export default function ProfessionalTestTaking({ test, onSubmit, onAbandon }) {
  const [answers, setAnswers] = useState(Array(test.mcqs.length).fill(null));
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(test.duration * 60); // Convert to seconds
  const [showReview, setShowReview] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [markedQuestions, setMarkedQuestions] = useState(new Set());
  const [submitError, setSubmitError] = useState(null);
  const [confirmSubmit, setConfirmSubmit] = useState(null);
  const [showQuestionPanel, setShowQuestionPanel] = useState(false);
  // Once set the attempt is over - no more answering, whatever happens to the submission
  const [endedReason, setEndedReason] = useState(null);
  const warningDismissedRef = useRef(false);
  const endedRef = useRef(false);

  const totalQuestions = test.mcqs.length;
  const attemptEnded = endedReason !== null;

  const submitAnswers = useCallback(async (reason) => {
    setIsSubmitting(true);
    setSubmitError(null);

    // -1 marks a question the student never touched. It must never equal a real option
    // index, or an unanswered question gets scored as if "the first option" was picked.
    const filledAnswers = answers.map(answer => (answer !== null ? answer : -1));
    const timeTaken = Math.max(0, test.duration * 60 - timeLeft);

    try {
      const succeeded = await onSubmit(filledAnswers, timeTaken, reason);
      // On failure the retry affordance must be released, or it stays on "Submitting..." forever
      if (!succeeded) {
        setSubmitError('Submission failed. Check your connection and try again.');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Test submission failed:', error);
      setSubmitError('Submission failed. Check your connection and try again.');
      setIsSubmitting(false);
    }
  }, [answers, onSubmit, test.duration, timeLeft]);

  /**
   * The one and only way out of an attempt. Latched, because a single tab switch usually
   * fires several proctoring events and the timer keeps ticking through a failed submit.
   */
  const endAttempt = useCallback((reason) => {
    if (endedRef.current) return;
    endedRef.current = true;
    setEndedReason(reason);
    setConfirmSubmit(null);
    submitAnswers(reason);
  }, [submitAnswers]);

  // Fullscreen lock, presence detection and paste blocking - disarmed once the attempt ends
  const { isFullscreen, armed, enterFullscreen } = useTestProctoring({
    active: !attemptEnded,
    onViolation: endAttempt
  });

  const dismissWarning = () => {
    warningDismissedRef.current = true;
    setShowWarning(false);
  };

  // Countdown timer - frozen once the attempt has ended
  useEffect(() => {
    if (attemptEnded) return undefined;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev <= 0 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [attemptEnded]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeLeft <= 0) {
      endAttempt('time_expired');
    }
  }, [timeLeft, endAttempt]);

  // Show 5-minute warning once (until user dismisses it)
  useEffect(() => {
    if (timeLeft <= 300 && timeLeft > 0 && !warningDismissedRef.current && !attemptEnded) {
      setShowWarning(true);
    }
  }, [timeLeft, attemptEnded]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    if (attemptEnded) return;
    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleQuestionJump = (questionIndex) => {
    setCurrentQuestion(questionIndex);
    setShowReview(false);
    setShowQuestionPanel(false);
  };

  const handleReviewToggle = () => {
    setShowReview(!showReview);
  };

  const handleClearAnswer = () => {
    if (attemptEnded) return;
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = null;
    setAnswers(newAnswers);
  };

  const handleMarkQuestion = () => {
    const newMarked = new Set(markedQuestions);
    if (newMarked.has(currentQuestion)) {
      newMarked.delete(currentQuestion);
    } else {
      newMarked.add(currentQuestion);
    }
    setMarkedQuestions(newMarked);
  };

  /**
   * window.confirm cannot be used anywhere in here: the native dialog blurs the window,
   * which the proctoring hook correctly reads as leaving the test screen.
   */
  const handleFinalSubmit = () => {
    if (isSubmitting || attemptEnded) return;

    const unanswered = answers.filter(answer => answer === null).length;
    if (unanswered > 0) {
      setConfirmSubmit({ unanswered });
      return;
    }

    endAttempt('manual');
  };

  const getAnsweredCount = () => {
    return answers.filter(answer => answer !== null).length;
  };

  const getQuestionStatus = (index) => {
    if (markedQuestions.has(index)) return 'marked';
    if (answers[index] !== null) return 'answered';
    if (index === currentQuestion) return 'current';
    return 'unanswered';
  };

  const timerClasses = showWarning
    ? 'bg-red-100 text-red-800 animate-pulse'
    : timeLeft <= 600
      ? 'bg-yellow-100 text-yellow-800'
      : 'bg-green-100 text-green-800';

  /** Terminal state: the attempt is over, only the submission is still in flight. */
  const terminationOverlay = attemptEnded && (
    <div className="fixed inset-0 bg-gray-900/90 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
        <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Attempt ended</h3>
        <p className="text-gray-600 mb-6">
          {TERMINATION_MESSAGES[endedReason] || TERMINATION_MESSAGES.manual}
        </p>

        {submitError ? (
          <>
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
              {submitError} Your answers are not saved yet - do not close this window.
            </p>
            <button
              onClick={() => submitAnswers(endedReason)}
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Retrying...' : 'Retry Submit'}
            </button>
          </>
        ) : (
          <div className="flex items-center justify-center gap-3 text-gray-600">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
            <span>Submitting your answers...</span>
          </div>
        )}
      </div>
    </div>
  );

  /**
   * Only ever seen before fullscreen is first entered - if the browser refuses the initial
   * request the questions stay covered instead of being readable in a windowed tab.
   */
  const fullscreenGate = !attemptEnded && !isFullscreen && (
    <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Fullscreen required</h3>
        <p className="text-gray-600 mb-6">
          This test can only be taken in fullscreen, so your questions stay hidden until you
          enter it. Once you are in, leaving fullscreen ends the attempt and submits your answers.
        </p>
        <button
          onClick={enterFullscreen}
          className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
        >
          Enter Fullscreen
        </button>

        {/* Escape hatch for a browser that will not grant fullscreen at all. Offered only
            before the first entry, when no question has ever been rendered - so there is
            nothing to submit and nothing to cheat with. */}
        {!armed && onAbandon && (
          <button
            onClick={onAbandon}
            className="w-full mt-3 px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            My browser cannot go fullscreen - leave without starting
          </button>
        )}
      </div>
    </div>
  );

  const confirmSubmitModal = confirmSubmit && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[90] p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Submit test?</h3>
        <p className="text-gray-600 mb-6">
          You have {confirmSubmit.unanswered} unanswered question
          {confirmSubmit.unanswered === 1 ? '' : 's'}. Once submitted you cannot return to this
          attempt.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setConfirmSubmit(null)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Keep Working
          </button>
          <button
            onClick={() => endAttempt('manual')}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            Submit Anyway
          </button>
        </div>
      </div>
    </div>
  );

  if (showReview) {
    return (
      <div className="fixed inset-0 bg-white text-gray-900 flex flex-col overflow-hidden z-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-6">
            <h1 className="text-lg font-semibold text-gray-900">{test.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Answered: {getAnsweredCount()}/{totalQuestions}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${timerClasses}`}>
              {formatTime(timeLeft)}
            </div>

            <button
              onClick={handleReviewToggle}
              disabled={attemptEnded}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 disabled:opacity-50 transition-colors"
            >
              Back to Questions
            </button>
          </div>
        </div>

        {/* Review Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-white rounded-lg shadow-sm p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold text-gray-900">Review Your Answers</h2>
              <button
                onClick={handleFinalSubmit}
                disabled={isSubmitting || attemptEnded}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Test'}
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Submitting ends this attempt for good - you will not be able to return to it.
            </p>


            <div className="space-y-4">
              {test.mcqs.map((mcq, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${
                    answers[index] === null ? 'border-red-200 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Q{index + 1} - Your answer: </span>
                    {answers[index] !== null ? (
                      <span className="text-green-700 whitespace-pre-wrap font-mono text-sm">{mcq.options[answers[index]]}</span>
                    ) : (
                      <span className="text-red-600 italic">Not answered</span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {confirmSubmitModal}
        {fullscreenGate}
        {terminationOverlay}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white text-gray-900 flex flex-col overflow-hidden z-50">
      {/* Top Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{test.title}</h1>
          <p className="text-sm text-gray-500">
            Question {currentQuestion + 1} of {totalQuestions}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500 hidden lg:inline">
            Fullscreen is enforced - leaving the test screen submits your attempt
          </span>
          <div className={`px-3 py-2 rounded-lg text-sm font-medium ${timerClasses}`}>
            Time Left: {formatTime(timeLeft)}
          </div>
          <button
            onClick={() => setShowQuestionPanel(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Question Numbers"
          >
            <div className="flex flex-col gap-1">
              <div className="w-5 h-0.5 bg-gray-600"></div>
              <div className="w-5 h-0.5 bg-gray-600"></div>
              <div className="w-5 h-0.5 bg-gray-600"></div>
            </div>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 min-h-0">
        {/* Question Content */}
        <div className="w-full bg-white overflow-y-auto">
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-blue-600 mb-2">Answer The Following</h2>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm text-gray-600">
                  Q{currentQuestion + 1}-{test.mcqs[currentQuestion].category || 'B'}
                </span>
                <div className="bg-green-100 border border-green-200 px-3 py-1 rounded-lg">
                  <span className="text-sm font-medium text-green-800">Marks: 1</span>
                </div>
                <div className="bg-red-100 border border-red-200 px-3 py-1 rounded-lg">
                  <span className="text-sm font-medium text-red-800">Negative Marks: 0</span>
                </div>
              </div>
              <pre className="text-sm text-gray-800 leading-relaxed mb-6 whitespace-pre-wrap font-mono bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-x-auto">
                {formatQuestionText(test.mcqs[currentQuestion].question)}
              </pre>
            </div>

            <div className="space-y-3 mb-8">
              {test.mcqs[currentQuestion].options.map((option, index) => (
                <label
                  key={index}
                  className={`
                    flex items-center p-4 border rounded-lg cursor-pointer transition-all
                    ${answers[currentQuestion] === index
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion}`}
                    value={index}
                    checked={answers[currentQuestion] === index}
                    onChange={() => handleAnswerSelect(currentQuestion, index)}
                    disabled={attemptEnded}
                    className="mr-3 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-gray-800 whitespace-pre-wrap font-mono text-sm">{formatQuestionText(option)}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-3"></div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <button
            onClick={handleClearAnswer}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
          >
            Clear
          </button>

          <button
            onClick={handleMarkQuestion}
            className={`px-4 py-2 rounded-lg transition-colors ${
              markedQuestions.has(currentQuestion)
                ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                : 'bg-yellow-500 text-white hover:bg-yellow-600'
            }`}
          >
            Mark
          </button>

          <button
            onClick={handleNext}
            disabled={currentQuestion === totalQuestions - 1}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            Next
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReviewToggle}
            disabled={attemptEnded}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            Review &amp; Submit
          </button>
        </div>
      </div>

      {/* Time warning modal */}
      {showWarning && timeLeft > 0 && !attemptEnded && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[90]">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Time Warning</h3>
            </div>
            <p className="text-gray-600 mb-4">
              You have less than 5 minutes remaining! Please review and submit your answers.
            </p>
            <button
              onClick={dismissWarning}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Question Panel Overlay - opened via the 3-bar menu in the top bar */}
      {showQuestionPanel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[95] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
            <div className="bg-indigo-600 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Questions</h2>
              <button
                onClick={() => setShowQuestionPanel(false)}
                className="text-white hover:text-gray-200 transition-colors p-1 rounded-lg hover:bg-indigo-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-64px)]">
              <div className="grid grid-cols-5 gap-2 mb-6">
                {Array.from({ length: totalQuestions }, (_, index) => {
                  const status = getQuestionStatus(index);
                  return (
                    <button
                      key={index}
                      onClick={() => handleQuestionJump(index)}
                      className={`
                        w-10 h-10 rounded-full text-sm font-medium transition-colors
                        ${status === 'current'
                          ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                          : status === 'answered'
                            ? 'bg-green-500 text-white'
                            : status === 'marked'
                              ? 'bg-yellow-500 text-white'
                              : 'bg-blue-500 text-white hover:bg-blue-600'
                        }
                      `}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              <h3 className="font-semibold text-gray-900 mb-3">Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Total Questions</span>
                  <span className="font-medium">{totalQuestions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    Answered
                  </span>
                  <span className="font-medium">{getAnsweredCount()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    Not Answered
                  </span>
                  <span className="font-medium">{totalQuestions - getAnsweredCount()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                    Marked
                  </span>
                  <span className="font-medium">{markedQuestions.size}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmSubmitModal}
      {fullscreenGate}
      {terminationOverlay}
    </div>
  );
}
