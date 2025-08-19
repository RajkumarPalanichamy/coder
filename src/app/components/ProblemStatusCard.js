'use client';

import { CheckCircle, Clock, Circle } from 'lucide-react';

export default function ProblemStatusCard({ 
  totalProblems, 
  answeredCount, 
  currentProblemIndex 
}) {
  const notAnsweredCount = totalProblems - answeredCount;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Questions</h3>
      
      {/* Problem number indicators */}
      <div className="flex flex-wrap gap-2 mb-4">
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
      
      {/* Legend */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded bg-green-100 border border-green-200 flex items-center justify-center">
            <CheckCircle className="w-3 h-3 text-green-600" />
          </div>
          <span className="text-sm text-gray-700">Answered</span>
          <span className="text-sm text-gray-500 ml-auto">{answeredCount}</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded bg-blue-500 flex items-center justify-center">
            <Clock className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm text-gray-700">Current</span>
          <span className="text-sm text-gray-500 ml-auto">1</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded bg-gray-100 border border-gray-200 flex items-center justify-center">
            <Circle className="w-3 h-3 text-gray-400" />
          </div>
          <span className="text-sm text-gray-700">Not answered</span>
          <span className="text-sm text-gray-500 ml-auto">{notAnsweredCount}</span>
        </div>
      </div>
    </div>
  );
}