export default function TestResult({ test, answers, correctAnswers, score }) {
  return (
    <div className="space-y-8">
      <div className="text-xl font-bold text-black">Your Score: {score} / {test.mcqs.length}</div>
      {test.mcqs.map((mcq, idx) => {
        const isCorrect = answers[idx] === correctAnswers[idx];
        return (
          <div key={mcq._id} className={`border rounded p-4 ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}> 
            <div className="font-medium mb-2 text-black">Q{idx + 1}. {mcq.question}</div>
            <div className="mb-1">
              <span className="font-semibold">Your Answer: </span>
              <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                {mcq.options[answers[idx]] ?? <span className="italic">No answer</span>}
              </span>
            </div>
            {!isCorrect && (
              <div>
                <span className="font-semibold">Correct Answer: </span>
                <span className="text-green-700">{mcq.options[correctAnswers[idx]]}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
} 