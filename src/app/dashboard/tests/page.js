"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Clock } from 'lucide-react';
import StudentSidebar from '../../components/StudentSidebar';

export default function TestListPage() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch('/api/tests')
      .then(res => res.json())
      .then(setTests)
      .finally(() => setLoading(false));
  }, []);

  const filteredTests = tests.filter(test =>
    test.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <StudentSidebar onLogout={handleLogout} />
      <main className="flex-1 px-0 md:px-8 py-0 md:py-8 relative">
    <div className="max-w-5xl mx-auto py-8 px-4 md:px-0">
      <h1 className="text-2xl font-bold mb-6 text-black">Available Tests</h1>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
        <input
          type="text"
          placeholder="Search tests by title..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-72 px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : filteredTests.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No tests found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTests.map(test => (
            <div key={test._id} className="border rounded-xl p-6 bg-white shadow hover:shadow-lg transition-shadow flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-5 w-5 text-indigo-500" />
                  <span className="font-semibold text-lg text-black line-clamp-1">{test.title}</span>
                </div>
                <div className="text-gray-600 mb-3 line-clamp-2 min-h-[40px]">{test.description}</div>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                  <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {test.mcqs?.length ?? 0} Questions</span>
                  {test.duration && (
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {test.duration} min</span>
                  )}
                </div>
              </div>
              <div className="mt-4 flex">
                <Link
                  href={`/dashboard/tests/${test._id}`}
                  className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 transition-colors w-full text-center font-medium"
                >
                  Start Test
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </main>
    </div>
  );
} 