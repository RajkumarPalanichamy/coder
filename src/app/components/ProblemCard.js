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

          const getLanguageImage = (language) => {
          if (!language) return null;
          
          switch (language.toLowerCase()) {
            case 'javascript':
              return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" alt="JavaScript" className="h-12 w-12" />;
            case 'python':
              return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" alt="Python" className="h-12 w-12" />;
            case 'java':
              return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" alt="Java" className="h-12 w-12" />;
            case 'cpp':
            case 'c++':
              return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg" alt="C++" className="h-12 w-12" />;
            case 'csharp':
            case 'c#':
              return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg" alt="C#" className="h-12 w-12" />;
            case 'c':
              return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg" alt="C" className="h-12 w-12" />;
            case 'go':
              return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg" alt="Go" className="h-12 w-12" />;
            case 'rust':
              return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-plain.svg" alt="Rust" className="h-12 w-12" />;
            case 'kotlin':
              return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg" alt="Kotlin" className="h-12 w-12" />;
            case 'typescript':
              return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" alt="TypeScript" className="h-12 w-12" />;
            case 'php':
              return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg" alt="PHP" className="h-12 w-12" />;
            case 'ruby':
              return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ruby/ruby-original.svg" alt="Ruby" className="h-12 w-12" />;
            case 'swift':
              return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg" alt="Swift" className="h-12 w-12" />;
            default:
              return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/code/code-plain.svg" alt="Code" className="h-12 w-12" />;
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
      <p className="text-sm text-gray-600 mb-4 line-clamp-2 whitespace-pre-wrap">{problem.description}</p>
      <div className="flex justify-between items-center mb-4">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(problem.difficulty)}`}>
          {problem.difficulty === 'level1' ? 'Level 1' : problem.difficulty === 'level2' ? 'Level 2' : problem.difficulty === 'level3' ? 'Level 3' : problem.difficulty}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{problem.category}</span>
                      {problem.programmingLanguage && (
              <div className="flex flex-col items-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded text-xs">
                {getLanguageImage(problem.programmingLanguage)}
                <span className="capitalize">{problem.programmingLanguage}</span>
              </div>
            )}
        </div>
      </div>
      <Link
        href={href}
        className="w-full block bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 text-center transition-colors"
      >
        Start Problem
      </Link>
    </div>
  );
} 