import { useState } from 'react';

export default function TestTaking({ test, onSubmit }) {
  const [answers, setAnswers] = useState(Array(test.mcqs.length).fill(null));
  const [error, setError] = useState('');

  const handleOptionChange = (qIdx, optIdx) => {
    const newAnswers = [...answers];
    newAnswers[qIdx] = optIdx;
    setAnswers(newAnswers);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (answers.some(a => a === null)) {
      setError('Please answer all questions.');
      return;
    }
    onSubmit(answers);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && <div className="text-red-500">{error}</div>}
      {test.mcqs.map((mcq, idx) => (
        <div key={mcq._id} className="border rounded p-4 bg-white">
          <div className="font-medium mb-2 text-black">Q{idx + 1}. {mcq.question}</div>
          <div className="space-y-1">
            {mcq.options.map((opt, oidx) => (
              <label key={oidx} className="flex items-center text-black">
                <input
                  type="radio"
                  name={`q${idx}`}
                  checked={answers[idx] === oidx}
                  onChange={() => handleOptionChange(idx, oidx)}
                  className="mr-2"
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      ))}
      <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
        Submit Test
      </button>
    </form>
  );
} 