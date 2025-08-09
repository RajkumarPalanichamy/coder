"use client";
import { useState, useEffect, useCallback } from 'react';

export default function ProfessionalTestTaking({ test, onSubmit, onExit }) {
  const [answers, setAnswers] = useState(Array(test.mcqs.length).fill(null));
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(test.duration * 60); // Convert to seconds
  const [showReview, setShowReview] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (answers[index] !== null) return 'answered';
    if (index === currentQuestion) return 'current';
    return 'unanswered';
  };

  const getProgressPercentage = () => {
    return Math.round((getAnsweredCount() / totalQuestions) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with timer and controls */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
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
                {showReview ? 'Back to Questions' : 'Review'}
              </button>
              
              <button
                onClick={handleExit}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
              >
                Exit
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{getProgressPercentage()}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-3">Questions</h3>
              <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                {Array.from({ length: totalQuestions }, (_, index) => {
                  const status = getQuestionStatus(index);
                  return (
                    <button
                      key={index}
                      onClick={() => handleQuestionJump(index)}
                      className={`
                        w-10 h-10 rounded-lg text-sm font-medium transition-colors
                        ${status === 'current' 
                          ? 'bg-indigo-600 text-white ring-2 ring-indigo-300' 
                          : status === 'answered'
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }
                      `}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
              
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-100 rounded mr-2"></div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-indigo-600 rounded mr-2"></div>
                  <span>Current</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-100 rounded mr-2"></div>
                  <span>Not answered</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {showReview ? (
              // Review Page
              <div className="bg-white rounded-lg shadow-sm p-6">
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
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">
                          Q{index + 1}. {mcq.question}
                        </h4>
                        <button
                          onClick={() => handleQuestionJump(index)}
                          className="text-indigo-600 hover:text-indigo-800 text-sm ml-4"
                        >
                          Edit
                        </button>
                      </div>
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
            ) : (
              // Question Page
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Question {currentQuestion + 1}
                  </h2>
                  <p className="text-lg text-gray-800 leading-relaxed">
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
                      <span className="mr-3 inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-700 font-medium">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-gray-800">{option}</span>
                    </label>
                  ))}
                </div>

                {/* Navigation buttons */}
                <div className="flex justify-between">
                  <button
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleReviewToggle}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Review All
                    </button>
                    
                    {currentQuestion < totalQuestions - 1 ? (
                      <button
                        onClick={handleNext}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        onClick={handleReviewToggle}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Finish & Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
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