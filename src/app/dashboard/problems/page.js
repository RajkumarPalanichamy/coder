'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StudentSidebar from '../../components/StudentSidebar';
import ProblemCard from '../../components/ProblemCard';
import { BookOpen, Filter } from 'lucide-react';

const LANGUAGES = [
  { label: 'All', value: '' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Python', value: 'python' },
  { label: 'Java', value: 'java' },
  { label: 'C++', value: 'cpp' },
  { label: 'C', value: 'c' },
];
const DIFFICULTIES = [
  { label: 'All', value: '' },
  { label: 'Easy', value: 'easy' },
  { label: 'Medium', value: 'medium' },
  { label: 'Hard', value: 'hard' },
];
const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Math', value: 'Math' },
  { label: 'String', value: 'String' },
  { label: 'Array', value: 'Array' },
  { label: 'Stack', value: 'Stack' },
  { label: 'Hash Table', value: 'hash-table' },
];

export default function StudentProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [category, setCategory] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchProblems();
  }, [language, difficulty, category]);

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const params = [];
      if (language) params.push(`language=${language}`);
      if (difficulty) params.push(`difficulty=${difficulty}`);
      if (category) params.push(`category=${category}`);
      const query = params.length ? `?${params.join('&')}` : '';
      const res = await fetch(`/api/problems${query}`);
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
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="h-6 w-6 text-indigo-500" />
          <h1 className="text-2xl font-bold">Problems</h1>
        </div>
        {/* Filter Bar */}
        <div className="flex flex-wrap gap-4 mb-8 items-center bg-white p-4 rounded shadow">
          <Filter className="h-5 w-5 text-indigo-500" />
          <select value={language} onChange={e => setLanguage(e.target.value)} className="border rounded px-3 py-1">
            {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
          <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="border rounded px-3 py-1">
            {DIFFICULTIES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
          <select value={category} onChange={e => setCategory(e.target.value)} className="border rounded px-3 py-1">
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
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