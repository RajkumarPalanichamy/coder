"use client";
import { useState, useEffect, useCallback } from 'react';

export default function ProfessionalTestTaking({ test, onSubmit, onExit }) {
  const [answers, setAnswers] = useState(Array(test.mcqs.length).fill(null));
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(test.duration * 60); // Convert to seconds
  const [showReview, setShowReview] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [markedQuestions, setMarkedQuestions] = useState(new Set());

  const totalQuestions = test.mcqs.length;

  // Timer logic
  useEffect(() => {
    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }

    if (timeLeft <= 300) { // 5 minutes warning
      setShowWarning(true);
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAutoSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    // Auto-submit when time runs out
    const filledAnswers = answers.map(answer => answer !== null ? answer : 0);
    await onSubmit(filledAnswers);
  }, [answers, onSubmit, isSubmitting]);

  const handleAnswerSelect = (questionIndex, optionIndex) => {
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
  };

  const handleReviewToggle = () => {
    setShowReview(!showReview);
  };

  const handleClearAnswer = () => {
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

  const handleFinalSubmit = async () => {
    if (isSubmitting) return;
    
    const unanswered = answers.filter(answer => answer === null).length;
    if (unanswered > 0) {
      const confirmed = window.confirm(
        `You have ${unanswered} unanswered questions. Are you sure you want to submit?`
      );
      if (!confirmed) return;
    }

    setIsSubmitting(true);
    const filledAnswers = answers.map(answer => answer !== null ? answer : 0);
    await onSubmit(filledAnswers);
  };

  const handleExit = () => {
    const confirmed = window.confirm(
      'Are you sure you want to exit? Your progress will be lost.'
    );
    if (confirmed) {
      onExit();
    }
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

  const getProgressPercentage = () => {
    return Math.round((getAnsweredCount() / totalQuestions) * 100);
  };

  if (showReview) {
    return (
      <div className="fixed inset-0 bg-white text-gray-900 flex flex-col overflow-hidden z-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-6">
            <h1 className="text-lg font-semibold text-gray-900">{test.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Question {currentQuestion + 1} of {totalQuestions}</span>
              <span>•</span>
              <span>Answered: {getAnsweredCount()}/{totalQuestions}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              showWarning 
                ? 'bg-red-100 text-red-800 animate-pulse' 
                : timeLeft <= 600 
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
            }`}>
              ⏱️ {formatTime(timeLeft)}
            </div>
            
            <button
              onClick={handleReviewToggle}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
            >
              Back to Questions
            </button>
            
            <button
              onClick={handleExit}
              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors"
            >
              Exit
            </button>
          </div>
        </div>

        {/* Review Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-white rounded-lg shadow-sm p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Review Your Answers</h2>
              <button
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Test'}
              </button>
            </div>

            <div className="space-y-4">
              {test.mcqs.map((mcq, index) => (
                <div 
                  key={index}
                  className={`border rounded-lg p-4 ${
                    answers[index] === null ? 'border-red-200 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Your answer: </span>
                    {answers[index] !== null ? (
                      <span className="text-green-700">{mcq.options[answers[index]]}</span>
                    ) : (
                      <span className="text-red-600 italic">Not answered</span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white text-gray-900 flex flex-col overflow-hidden z-50">
      {/* Top Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={handleExit}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            End & Exit
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Professional Test... ({totalQuestions})</h1>
            <p className="text-sm text-gray-500">{test.title}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
            showWarning 
              ? 'bg-red-100 text-red-800 animate-pulse' 
              : timeLeft <= 600 
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-green-100 text-green-800'
          }`}>
            Time Left: {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 min-h-0">
        {/* Left Panel - Question Content */}
        <div className="w-3/4 bg-white border-r border-gray-200 overflow-y-auto">
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
              <p className="text-lg text-gray-800 leading-relaxed mb-6">
                {test.mcqs[currentQuestion].question}
              </p>
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
                    className="mr-3 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-gray-800">{option}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Question Navigation & Summary */}
        <div className="w-1/4 bg-gray-50 flex flex-col">
          {/* Questions Navigation */}
          <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
            <h3 className="font-semibold text-gray-900 mb-3">Questions</h3>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: totalQuestions }, (_, index) => {
                const status = getQuestionStatus(index);
                return (
                  <button
                    key={index}
                    onClick={() => handleQuestionJump(index)}
                    className={`
                      w-8 h-8 rounded-full text-xs font-medium transition-colors
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
          </div>
          
          {/* Summary Section */}
          <div className="bg-white p-4 flex-shrink-0">
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

      {/* Bottom Navigation Bar */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          {/* <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors border border-gray-300">
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Report Error
          </button> */}
        </div>
        
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
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            End Test
          </button>
        </div>
      </div>

      {/* Time warning modal */}
      {showWarning && timeLeft > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
              onClick={() => setShowWarning(false)}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}