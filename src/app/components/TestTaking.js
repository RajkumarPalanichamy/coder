import { useState } from 'react';

export default function TestTaking({ test, onSubmit }) {
  const [answers, setAnswers] = useState(Array(test.mcqs.length).fill(null));
  const [step, setStep] = useState(0); // 0..mcqs.length (last step is review)
  const [error, setError] = useState('');

  const totalQuestions = test.mcqs.length;
  const isReview = step === totalQuestions;

  const handleOptionChange = (qIdx, optIdx) => {
    const newAnswers = [...answers];
    newAnswers[qIdx] = optIdx;
    setAnswers(newAnswers);
    setError('');
  };

  const handleNext = () => {
    if (answers[step] === null) {
      setError('Please select an answer before proceeding.');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const handlePrev = () => {
    setError('');
    setStep(step - 1);
  };

  const handleReview = () => {
    setStep(totalQuestions);
  };

  const handleEdit = (qIdx) => {
    setStep(qIdx);
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    if (answers.some(a => a === null)) {
      setError('Please answer all questions before submitting.');
      return;
    }
    setError('');
    onSubmit(answers);
  };

  // Progress bar
  const progress = Math.round((Math.min(step, totalQuestions) / totalQuestions) * 100);

  return (
    <div className="space-y-8">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
        <div className="bg-indigo-600 h-3 rounded-full transition-all" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm text-gray-700 font-medium">
          {isReview ? 'Review Answers' : `Question ${step + 1} of ${totalQuestions}`}
        </div>
        <div className="text-xs text-gray-500">Progress: {progress}%</div>
      </div>
      {error && <div className="text-red-500 font-medium mb-2">{error}</div>}
      {/* Question or Review */}
      {!isReview ? (
        <div className="border rounded p-4 bg-white">
          <div className="font-medium mb-2 text-black">Q{step + 1}. {test.mcqs[step].question}</div>
          <div className="space-y-2">
            {test.mcqs[step].options.map((opt, oidx) => (
              <label key={oidx} className={`flex items-center px-3 py-2 rounded cursor-pointer transition-colors border ${answers[step] === oidx ? 'bg-indigo-100 border-indigo-400' : 'border-gray-200 hover:bg-indigo-50'}`}>
                <input
                  type="radio"
                  name={`q${step}`}
                  checked={answers[step] === oidx}
                  onChange={() => handleOptionChange(step, oidx)}
                  className="mr-2 accent-indigo-600"
                />
                <span className="mr-3 inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-700 font-medium">
                  {String.fromCharCode(65 + oidx)}
                </span>
                <span className="text-black">{opt}</span>
              </label>
            ))}
          </div>
        </div>
      ) : (
        <form onSubmit={handleFinalSubmit} className="space-y-6">
          <div className="text-lg font-semibold text-indigo-700 mb-2">Review your answers before submitting:</div>
          <div className="space-y-4">
            {test.mcqs.map((mcq, idx) => (
              <div key={mcq._id} className={`border rounded p-4 flex items-center justify-between ${answers[idx] === null ? 'bg-red-50 border-red-200' : 'bg-white'}`}>
                <div>
                  <div className="font-medium text-black">Q{idx + 1}. {mcq.question}</div>
                  <div className="text-gray-700 text-sm">
                    <span className="font-semibold">Your Answer: </span>
                    {answers[idx] !== null ? (
                      <span className="text-indigo-700">{mcq.options[answers[idx]]}</span>
                    ) : (
                      <span className="text-red-600 italic">Not answered</span>
                    )}
                  </div>
                </div>
                <button type="button" onClick={() => handleEdit(idx)} className="text-indigo-600 underline text-sm ml-4">Edit</button>
              </div>
            ))}
          </div>
          <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded shadow hover:bg-indigo-700 transition-colors w-full font-semibold text-lg mt-4">
            Submit Test
          </button>
        </form>
      )}
      {/* Navigation Buttons */}
      {!isReview && (
        <div className="flex justify-between mt-4">
          <button
            type="button"
            onClick={handlePrev}
            disabled={step === 0}
            className={`px-4 py-2 rounded font-medium transition-colors ${step === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
          >
            Previous
          </button>
          {step < totalQuestions - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 transition-colors font-medium"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleReview}
              className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition-colors font-medium"
            >
              Review & Submit
            </button>
          )}
        </div>
      )}
    </div>
  );
} 