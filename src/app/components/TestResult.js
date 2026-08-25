export default function TestResult({ test, answers, correctAnswers, score, correctCount, totalQuestions }) {
  const total = totalQuestions ?? test.mcqs.length;
  // score is a percentage; fall back to counting when an older payload omits correctCount
  const correct = correctCount ?? answers.reduce(
    (acc, ans, i) => (ans === correctAnswers[i] ? acc + 1 : acc),
    0
  );

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="text-3xl font-bold text-indigo-600">{score}%</div>
        <div className="text-lg font-semibold text-black mt-1">
          {correct} / {total} correct
        </div>
      </div>
      {test.mcqs.map((mcq, idx) => {
        const isCorrect = answers[idx] === correctAnswers[idx];
        return (
          <div key={mcq._id} className={`border rounded p-4 ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}> 
            <div className="font-medium mb-2 text-black whitespace-pre-wrap font-mono text-sm">Q{idx + 1}. {mcq.question}</div>
            <div className="mb-1">
              <span className="font-semibold">Your Answer: </span>
              <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                {mcq.options[answers[idx]] ?? <span className="italic">No answer</span>}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
