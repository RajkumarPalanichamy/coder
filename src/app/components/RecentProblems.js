import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import BrandLogo from '@/app/components/BrandLogo';

// Logo comes from the shared registry in `src/lib/brandLogos.js` so languages,
// companies and colleges stay consistent across the app.
const getLanguageImage = (language) =>
  language ? <BrandLogo name={language} size="xs" /> : null;

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