import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

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
              <p className="text-sm text-gray-500">{problem.category} - {problem.difficulty}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}