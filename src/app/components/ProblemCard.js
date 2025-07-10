import Link from 'next/link';

export default function ProblemCard({ problem, href, showStatus, status }) {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'level1': return 'bg-green-100 text-green-800';
      case 'level2': return 'bg-yellow-100 text-yellow-800';
      case 'level3': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h4 className="text-lg font-medium text-gray-900">{problem.title}</h4>
        {showStatus && (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            status === 'accepted' ? 'bg-green-100 text-green-800' :
            status === 'not-attempted' ? 'bg-gray-100 text-gray-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {status === 'accepted' ? 'Solved' : status === 'not-attempted' ? 'Not Attempted' : status}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{problem.description}</p>
      <div className="flex justify-between items-center mb-4">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(problem.difficulty)}`}>
          {problem.difficulty === 'level1' ? 'Level 1' : problem.difficulty === 'level2' ? 'Level 2' : problem.difficulty === 'level3' ? 'Level 3' : problem.difficulty}
        </span>
        <span className="text-sm text-gray-500">{problem.category}</span>
      </div>
      <Link
        href={href}
        className="w-full block bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 text-center transition-colors"
      >
        View
      </Link>
    </div>
  );
} 