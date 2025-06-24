"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentMCQPage() {
  const [mcqs, setMcqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [lastScore, setLastScore] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchMCQs();
    fetchLastSubmission();
  }, []);

  const fetchMCQs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch('/api/admin/mcqs');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMcqs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLastSubmission = async () => {
    try {
      const res = await fetch('/api/mcq-submissions');
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) setLastScore(data[0].score);
      }
    } catch {}
  };

  const handleSelect = (mcqId, idx) => {
    setAnswers({ ...answers, [mcqId]: idx });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let correct = 0;
    const answerArr = mcqs.map(mcq => {
      if (answers[mcq._id] === mcq.correctOption) correct++;
      return { mcq: mcq._id, selected: answers[mcq._id] };
    });
    const score = correct;
    setSubmitted(true);
    setLastScore(score);
    // Save submission
    await fetch('/api/mcq-submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: answerArr, score }),
    });
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading MCQs...</div>;
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>;
  if (mcqs.length === 0) return <div className="text-center py-12 text-gray-500">No MCQs available.</div>;

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="mb-6 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded shadow"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold mb-4 text-black">MCQ Results</h1>
        <div className="mb-6 text-lg">You got <span className="font-bold text-green-700">{lastScore}</span> out of <span className="font-bold">{mcqs.length}</span> correct.</div>
        <div className="space-y-6">
          {mcqs.map((mcq, idx) => (
            <div key={mcq._id} className="bg-white rounded shadow p-4">
              <div className="font-semibold mb-2">Q{idx + 1}: {mcq.question}</div>
              <ol className="list-decimal ml-6 mb-2">
                {mcq.options.map((opt, i) => (
                  <li key={i} className={
                    i === mcq.correctOption ? 'text-green-700 font-bold' :
                    answers[mcq._id] === i ? 'text-red-700 font-semibold' : ''
                  }>
                    {opt}
                    {i === mcq.correctOption ? ' (Correct)' : ''}
                    {answers[mcq._id] === i && i !== mcq.correctOption ? ' (Your answer)' : ''}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto py-12">
      <button
        type="button"
        onClick={() => router.push('/dashboard')}
        className="mb-6 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded shadow"
      >
        ← Back to Dashboard
      </button>
      <h1 className="text-2xl font-bold mb-4 text-black">MCQ Practice</h1>
      {lastScore !== null && (
        <div className="mb-4 text-green-700 font-semibold">Last Score: {lastScore} / {mcqs.length}</div>
      )}
      <div className="space-y-8">
        {mcqs.map((mcq, idx) => (
          <div key={mcq._id} className="bg-white rounded shadow p-4">
            <div className="font-semibold mb-2">Q{idx + 1}: {mcq.question}</div>
            <ol className="list-decimal ml-6">
              {mcq.options.map((opt, i) => (
                <li key={i} className="mb-1">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`mcq-${mcq._id}`}
                      checked={answers[mcq._id] === i}
                      onChange={() => handleSelect(mcq._id, i)}
                      className="accent-indigo-600"
                    />
                    <span>{opt}</span>
                  </label>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
      <button type="submit" className="mt-8 bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 font-semibold">
        Submit Answers
      </button>
    </form>
  );
} 