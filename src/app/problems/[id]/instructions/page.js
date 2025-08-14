'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Code2, BookOpen, Play, AlertCircle } from 'lucide-react';

export default function ProblemInstructionsPage() {
  const params = useParams();
  const router = useRouter();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProblem();
  }, [params.id]);

  const fetchProblem = async () => {
    try {
      const res = await fetch(`/api/problems/${params.id}`);
      const data = await res.json();
      setProblem(data.problem);
    } catch (err) {
      console.error('Error fetching problem:', err);
    } finally {
      setLoading(false);
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
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center text-gray-700 hover:text-indigo-600 mr-4"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </button>
              <h1 className="text-xl font-bold text-gray-900">Problem Instructions</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Problem Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">{problem.title}</h2>
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-white bg-opacity-20 text-white`}>
                    {problem.difficulty === 'level1' ? 'Level 1' : problem.difficulty === 'level2' ? 'Level 2' : problem.difficulty === 'level3' ? 'Level 3' : problem.difficulty}
                  </span>
                  <span className="text-indigo-100">{problem.category}</span>
                  {problem.programmingLanguage && (
                    <span className="text-sm px-2 py-1 bg-white bg-opacity-20 text-white rounded capitalize">
                      {problem.programmingLanguage}
                    </span>
                  )}
                </div>
              </div>
              {problem.timeLimit && (
                <div className="flex items-center text-white">
                  <Clock className="h-5 w-5 mr-2" />
                  <span className="text-lg font-semibold">{formatTime(problem.timeLimit)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Instructions Content */}
          <div className="px-8 py-6">
            {/* Problem Description Preview */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <BookOpen className="h-5 w-5 text-indigo-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Problem Overview</h3>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed line-clamp-4">
                  {problem.description}
                </p>
              </div>
            </div>

            {/* Session Instructions */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Code2 className="h-5 w-5 text-indigo-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Session Instructions</h3>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-2">Important Guidelines:</h4>
                      <ul className="space-y-2 text-blue-800">
                        <li>• Read the problem statement carefully before starting</li>
                        <li>• Test your solution with the provided examples</li>
                        {problem.timeLimit && (
                          <li>• You have {formatTime(problem.timeLimit)} to complete this problem</li>
                        )}
                        <li>• Your solution will be automatically submitted when time expires</li>
                        <li>• Make sure to save your progress by running and testing your code</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {problem.timeLimit && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex">
                      <Clock className="h-5 w-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-yellow-900 mb-2">Timer Information:</h4>
                        <p className="text-yellow-800">
                          Once you start the session, the timer will begin counting down. The timer will be visible at the top of your screen, and your solution will be automatically submitted when time runs out.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex">
                    <Code2 className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-green-900 mb-2">Coding Environment:</h4>
                      <ul className="space-y-2 text-green-800">
                        <li>• A code editor will be provided with starter code</li>
                        <li>• You can run your code to test it against sample cases</li>
                        <li>• Submit your final solution when you're confident it's correct</li>
                        <li>• Use the provided test cases to verify your logic</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Start Session Button */}
            <div className="text-center">
              <button
                onClick={() => router.push(`/problems/${params.id}`)}
                className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-lg"
              >
                <Play className="h-6 w-6 mr-3" />
                Start Problem Session
              </button>
              <p className="mt-3 text-sm text-gray-500">
                {problem.timeLimit ? `Timer will start immediately after clicking this button` : `Begin solving the problem`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}