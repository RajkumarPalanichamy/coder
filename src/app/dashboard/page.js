'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StudentSidebar from '../components/StudentSidebar';
import StudentStatsCards from '../components/StudentStatsCards';
import ProblemCard from '../components/ProblemCard';
import { UserCircle, ChevronDown, Code2, BookOpen, Filter } from 'lucide-react';

const LANGUAGES = [
  { label: 'All', value: '' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Python', value: 'python' },
  { label: 'Java', value: 'java' },
  { label: 'C++', value: 'cpp' },
  { label: 'C', value: 'c' },
];

export default function Dashboard() {
  const [stats, setStats] = useState({ totalProblems: 0, solvedProblems: 0, totalSubmissions: 0, averageScore: 0 });
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('');
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchStatsAndProblems();
    fetchUser();
  }, [language]);

  const fetchStatsAndProblems = async () => {
    setLoading(true);
    try {
      const [statsRes, problemsRes] = await Promise.all([
        fetch('/api/user/stats'),
        fetch(`/api/problems${language ? `?language=${language}` : ''}`)
      ]);
      const statsData = await statsRes.json();
      const problemsData = await problemsRes.json();
      setStats(statsData);
      setProblems(problemsData.problems || []);
    } catch (err) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/user/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (data.user.role === 'admin') {
          router.push('/admin/dashboard');
        }
      } else if (res.status === 401) {
        router.push('/login');
      }
    } catch {
      router.push('/login');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <StudentSidebar onLogout={handleLogout} />
      <main className="flex-1 px-0 md:px-8 py-0 md:py-8 relative">
        {/* Sticky header */}
        <div className="sticky top-0 z-20 bg-gradient-to-br from-blue-50 to-indigo-100 px-4 md:px-0 pt-6 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-indigo-100">
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-200 flex items-center justify-center text-2xl font-bold text-indigo-700">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl text-indigo-700 font-bold leading-tight">Welcome, {user.firstName}!</h1>
                  <p className="text-gray-600 text-sm">Ready to solve some problems?</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <UserCircle className="w-10 h-10 text-indigo-400" />
                <h1 className="text-xl md:text-2xl font-bold">Welcome!</h1>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-indigo-500" />
            <div className="flex gap-1 bg-white rounded-full shadow px-2 py-1">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.value}
                  onClick={() => setLanguage(lang.value)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    language === lang.value
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-indigo-700 hover:bg-indigo-100'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-7xl mx-auto px-4 md:px-0 mt-6">
          <StudentStatsCards stats={stats} />
        </div>

        {/* Problems Section */}
        <div className="max-w-7xl mx-auto px-4 md:px-0 mt-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-indigo-500" />
              <h2 className="text-xl font-semibold tracking-tight">Available Problems</h2>
            </div>
            <button
              onClick={() => router.push('/dashboard/submissions')}
              className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 transition-colors"
            >
              My Submissions
            </button>
          </div>
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : problems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No problems found for this language.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {problems.map((problem) => (
                <div key={problem._id} className="transition-transform hover:-translate-y-1">
                  <ProblemCard
                    problem={problem}
                    href={`/problems/${problem._id}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 