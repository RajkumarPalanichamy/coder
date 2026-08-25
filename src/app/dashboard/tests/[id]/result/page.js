"use client";
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TestResult from '../../../../components/TestResult';
import { formatDateTime } from '@/lib/formatDateTime';

const TERMINATION_LABELS = {
  time_expired: 'Auto-submitted - time expired',
  exited_fullscreen: 'Auto-submitted - left fullscreen',
  left_test_screen: 'Auto-submitted - left the test screen'
};

/**
 * Read-only review of a submitted attempt.
 *
 * Deliberately offers no way back into the test: correct answers are shown here in green,
 * so a route from this screen into a live answer sheet would be a route to a perfect score.
 * A new attempt has to be started from the test list.
 */
export default function TestResultPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.id;

  const [test, setTest] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (submissionId) => {
    setLoading(true);
    setError(null);

    const resultUrl = submissionId
      ? `/api/tests/${testId}/result?submissionId=${submissionId}`
      : `/api/tests/${testId}/result`;

    try {
      const [testRes, resultRes] = await Promise.all([
        fetch(`/api/tests/${testId}`),
        fetch(resultUrl)
      ]);

      if (!testRes.ok) throw new Error('Test not found');

      if (!resultRes.ok) {
        const data = await resultRes.json().catch(() => ({}));
        throw new Error(
          data.code === 'NO_SUBMISSION'
            ? 'You have not submitted this test yet.'
            : data.error || 'Failed to load result'
        );
      }

      setTest(await testRes.json());
      setResult(await resultRes.json());
    } catch (err) {
      console.error('Error loading result:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    // Read the query directly so this page needs no Suspense boundary
    const requested = new URLSearchParams(window.location.search).get('submissionId');
    load(requested);
  }, [load]);

  const handleAttemptChange = (submissionId) => {
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}?submissionId=${submissionId}`
    );
    load(submissionId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading result...</p>
        </div>
      </div>
    );
  }

  if (error || !test || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error || 'Result not available'}</p>
          <button
            onClick={() => router.push('/dashboard/tests')}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Back to Tests
          </button>
        </div>
      </div>
    );
  }

  const attempts = result.attempts || [];
  const terminationLabel = TERMINATION_LABELS[result.terminationReason];

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black">{test.title} - Result</h1>
          <p className="text-sm text-gray-600 mt-1">
            Attempt {result.attemptNumber}
            {attempts.length > 1 && <> of {attempts.length}</>}
            {result.submittedAt && <> · {formatDateTime(result.submittedAt)}</>}
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/tests')}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
        >
          Back to Tests
        </button>
      </div>

      {terminationLabel && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {terminationLabel}
        </div>
      )}

      {attempts.length > 1 && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Your attempts</h2>
          <div className="flex flex-wrap gap-2">
            {attempts.map((attempt) => {
              const isActive = attempt.submissionId === result.submissionId;
              return (
                <button
                  key={attempt.submissionId}
                  onClick={() => handleAttemptChange(attempt.submissionId)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors border ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Attempt {attempt.attemptNumber} · {attempt.score}%
                </button>
              );
            })}
          </div>
        </div>
      )}

      <TestResult
        test={test}
        answers={result.answers}
        correctAnswers={result.correctAnswers}
        score={result.score}
        correctCount={result.correctCount}
        totalQuestions={result.totalQuestions}
      />

      <p className="mt-8 text-sm text-gray-500 text-center">
        This attempt is final and cannot be changed. To try again, start a new attempt from the
        test list.
      </p>
    </div>
  );
}
