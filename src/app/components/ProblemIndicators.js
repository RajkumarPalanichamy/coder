'use client';

export default function ProblemIndicators({ 
  totalProblems, 
  answeredCount, 
  currentProblemIndex 
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      {/* Problem number indicators */}
      <div className="flex flex-wrap gap-2 justify-center">
        {Array.from({ length: totalProblems }, (_, index) => {
          const problemNumber = index + 1;
          const isAnswered = index < answeredCount;
          const isCurrent = index === currentProblemIndex;
          
          return (
            <div
              key={index}
              className={`
                w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium
                ${isCurrent 
                  ? 'bg-blue-500 text-white border-2 border-blue-600' 
                  : isAnswered 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                }
              `}
            >
              {problemNumber}
            </div>
          );
        })}
      </div>
    </div>
  );
}