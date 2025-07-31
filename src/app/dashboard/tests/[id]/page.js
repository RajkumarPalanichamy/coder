"use client";
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProfessionalTestTaking from '../../../components/ProfessionalTestTaking';

export default function TakeTestPage() {
  const router = useRouter();
  const params = useParams();
  const [test, setTest] = useState(null);
  const [testStarted, setTestStarted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await fetch(`/api/tests/${params.id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch test');
        }
        const testData = await res.json();
        setTest(testData);
      } catch (error) {
        console.error('Error fetching test:', error);
        router.push('/dashboard/tests');
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [params.id, router]);

  const handleSubmit = async (answers) => {
    try {
      const response = await fetch(`/api/tests/${params.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Test submission error:', {
          status: response.status,
          error: errorData.error || 'Unknown error'
        });
        alert(`Submission failed: ${errorData.error || 'Unknown error'}`);
        return;
      }

      // Exit fullscreen if active
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }

      router.push('/dashboard/tests');
    } catch (error) {
      console.error('Network or submission error:', error);
      alert('Failed to submit test. Please try again.');
    }
  };

  const handleStartTest = () => {
    setTestStarted(true);
    // Request fullscreen
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen().catch(console.error);
    }
  };

  const handleExitTest = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    router.push('/dashboard/tests');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test...</p>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">Test not found</p>
          <button 
            onClick={() => router.push('/dashboard/tests')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Back to Tests
          </button>
        </div>
      </div>
    );
  }

  if (!testStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-4">
        <div className="max-w-2xl mx-auto pt-16">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{test.title}</h1>
              <p className="text-gray-600">{test.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold text-gray-900">Duration</span>
                </div>
                <p className="text-2xl font-bold text-indigo-600">{test.duration} minutes</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-semibold text-gray-900">Questions</span>
                </div>
                <p className="text-2xl font-bold text-indigo-600">{test.mcqs?.length || 0}</p>
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
                <li>• The test will automatically enter fullscreen mode</li>
                <li>• You have {test.duration} minutes to complete all questions</li>
                <li>• The timer will be visible throughout the test</li>
                <li>• You can navigate between questions and review answers</li>
                <li>• Make sure you have a stable internet connection</li>
                <li>• Once started, the timer cannot be paused</li>
                <li>• The test will auto-submit when time expires</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleExitTest}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStartTest}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
              >
                Start Test
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProfessionalTestTaking 
      test={test} 
      onSubmit={handleSubmit} 
      onExit={handleExitTest}
    />
  );
} 