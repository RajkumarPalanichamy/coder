"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TestResult from '../../../../components/TestResult';

export default function TestResultPage() {
  const params = useParams();
  const router = useRouter();
  const [test, setTest] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [testRes, resultRes] = await Promise.all([
          fetch(`/api/tests/${params.id}`),
          fetch(`/api/tests/${params.id}/result`)
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
    };

    load();
  }, [params.id]);

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

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-black">{test.title} - Result</h1>
        <button
          onClick={() => router.push('/dashboard/tests')}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back to Tests
        </button>
      </div>
      <TestResult
        test={test}
        answers={result.answers}
        correctAnswers={result.correctAnswers}
        score={result.score}
        correctCount={result.correctCount}
        totalQuestions={result.totalQuestions}
      />
    </div>
  );
}
