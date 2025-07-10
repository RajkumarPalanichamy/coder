'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StudentStatsCards from '../components/StudentStatsCards';
import ProblemCard from '../components/ProblemCard';
import StudentProfileCard from '../components/StudentProfileCard';
import { UserCircle, ChevronDown, Code2, BookOpen, Filter } from 'lucide-react';

const LANGUAGES = [
  { label: 'All', value: '' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Python', value: 'python' },
  { label: 'Java', value: 'java' },
  { label: 'C++', value: 'cpp' },
  { label: 'C', value: 'c' },
];

const MOTIVATION_QUOTES = [
  {
    quote: 'Success is not the key to happiness. Happiness is the key to success. If you love what you are doing, you will be successful.',
    author: 'Albert Schweitzer',
  },
  {
    quote: 'The future belongs to those who believe in the beauty of their dreams.',
    author: 'Eleanor Roosevelt',
  },
  {
    quote: 'Believe you can and you’re halfway there.',
    author: 'Theodore Roosevelt',
  },
  {
    quote: 'Don’t watch the clock; do what it does. Keep going.',
    author: 'Sam Levenson',
  },
  {
    quote: 'The only limit to our realization of tomorrow will be our doubts of today.',
    author: 'Franklin D. Roosevelt',
  },
  {
    quote: 'It always seems impossible until it’s done.',
    author: 'Nelson Mandela',
  },
  {
    quote: 'Start where you are. Use what you have. Do what you can.',
    author: 'Arthur Ashe',
  },
  {
    quote: 'Great things are done by a series of small things brought together.',
    author: 'Vincent Van Gogh',
  },
];

function MotivationCard() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % MOTIVATION_QUOTES.length);
        setFade(true);
      }, 400);
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  const { quote, author } = MOTIVATION_QUOTES[index];

  return (
    <div className="relative bg-gradient-to-br from-pink-50 via-indigo-50 to-blue-100 rounded-3xl shadow-2xl px-8 py-12 flex flex-col items-center justify-center border border-indigo-100 overflow-hidden transition-all duration-500">
      <div className="absolute left-8 top-4 text-indigo-100 text-8xl font-serif select-none opacity-40 z-0 animate-fadeIn">“</div>
      <div className={`z-10 w-full flex flex-col items-center transition-opacity duration-400 ${fade ? 'opacity-100' : 'opacity-0'}`} style={{ minHeight: 110 }}>
        <div className="text-lg md:text-xl font-bold text-indigo-700 mb-4 tracking-wide text-center">Motivation for Today</div>
        <div className="text-2xl md:text-3xl font-serif text-gray-800 text-center leading-snug mb-6 animate-fadeIn" style={{ maxWidth: 700 }}>
          {quote}
        </div>
        <div className="flex items-center justify-center mt-2">
          <span className="text-indigo-400 text-2xl mr-2">—</span>
          <span className="text-indigo-700 font-bold text-lg md:text-xl italic signature-font">{author}</span>
        </div>
      </div>
      <style jsx>{`
        .signature-font {
          font-family: 'Pacifico', 'Dancing Script', cursive, sans-serif;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease;
        }
      `}</style>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({ totalProblems: 0, solvedProblems: 0, totalSubmissions: 0, averageScore: 0 });
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('');
  const [user, setUser] = useState(null);
  const [tests, setTests] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchStatsAndProblems();
    fetchUser();
    fetchTests();
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

  const fetchTests = async () => {
    try {
      const res = await fetch('/api/tests');
      const data = await res.json();
      setTests(data);
    } catch (err) {
      // handle error
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <>
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
        {/* <div className="flex items-center gap-2">
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
          </div> */}
      </div>

      {/* Student Profile */}
      {/* Removed StudentProfileCard from dashboard as requested */}
      {/* Motivation Card */}
      <div className="max-w-3xl mx-auto px-4 md:px-0 mt-6">
        <MotivationCard />
      </div>

      {/* Available Tests Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-0 mt-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-indigo-500" />
            <h2 className="text-xl font-semibold tracking-tight">Available Tests</h2>
          </div>
          <button
            onClick={() => router.push('/dashboard/tests')}
            className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 transition-colors"
          >
            View All Tests
          </button>
        </div>
        {tests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No tests available.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {tests.slice(0, 3).map(test => (
              <div key={test._id} className="border rounded p-4 bg-white shadow hover:shadow-lg transition-shadow">
                <div className="font-semibold text-lg text-black mb-1">{test.title}</div>
                <div className="text-gray-600 mb-2 line-clamp-2">{test.description}</div>
                <button
                  onClick={() => router.push(`/tests/${test._id}`)}
                  className="bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600 text-sm mt-2"
                >
                  Start Test
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Problems Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-0 mt-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-indigo-500" />
            <h2 className="text-xl font-semibold tracking-tight">Available Problems</h2>
          </div>
          <button
            onClick={() => router.push('/dashboard/problems')}
            className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 transition-colors"
          >
            View All Problems
          </button>
        </div>
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : problems.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No problems found for this language.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {problems.slice(0, 3).map((problem) => (
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
    </>
  );
} 