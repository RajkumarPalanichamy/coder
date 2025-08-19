export default function ProblemStatusCard({ 
  problemNumber, 
  title, 
  isAnswered, // boolean - true if problem is answered
  onClick
}) {
  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-sm hover:border-gray-300"
      onClick={onClick}
    >
      {/* Line 1: Problem Number */}
      <div className="text-sm font-medium text-gray-900 mb-1">
        Problem {problemNumber}
      </div>
      
      {/* Line 2: Checkbox and Title */}
      <div className="flex items-center space-x-2 mb-1">
        <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
          isAnswered 
            ? 'bg-green-500 border-green-500' 
            : 'border-gray-300 bg-white'
        }`}>
          {isAnswered && (
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <span className="text-sm text-gray-700 truncate flex-1">{title}</span>
      </div>
      
      {/* Line 3: Status Text */}
      <div className={`text-xs ${isAnswered ? 'text-green-600' : 'text-gray-500'}`}>
        {isAnswered ? 'Answered' : 'Not Answered'}
      </div>
    </div>
  );
}