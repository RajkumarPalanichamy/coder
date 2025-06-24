'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StudentSidebar from '../../components/StudentSidebar';
import ProblemCard from '../../components/ProblemCard';

export default function StudentProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/problems');
      const data = await res.json();
      setProblems(data.problems || []);
    } catch (err) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <StudentSidebar onLogout={handleLogout} />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Problems</h1>
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {problems.map((problem) => (
              <ProblemCard
                key={problem._id}
                problem={problem}
                href={`/problems/${problem._id}`}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 