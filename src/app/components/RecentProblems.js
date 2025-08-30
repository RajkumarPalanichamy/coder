import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

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

export default function RecentProblems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const res = await fetch('/api/admin/problems?limit=5', { credentials: 'include' });
      const data = await res.json();
      setProblems(data.problems || []);
    } catch (error) {
      console.error('Error fetching recent problems:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {problems.map((problem) => (
        <div key={problem._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <BookOpen className="w-5 h-5 text-gray-500 mr-3" />
                          <div>
                <p className="font-semibold">{problem.title}</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    problem.difficulty === 'level1' ? 'bg-green-100 text-green-800' :
                    problem.difficulty === 'level2' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {problem.difficulty === 'level1' ? 'Level 1' : problem.difficulty === 'level2' ? 'Level 2' : 'Level 3'}
                  </span>
                  <div className="flex flex-col items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold capitalize">
                    {getLanguageImage(problem.language)}
                    <span>{problem.language}</span>
                  </div>
                </div>
              </div>
          </div>
        </div>
      ))}
    </div>
  );
}