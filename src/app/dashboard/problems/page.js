'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProblemCard from '../../components/ProblemCard';
import { BookOpen, Code, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const LANGUAGES = [
  { 
    label: 'JavaScript', 
    value: 'javascript', 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: '🟨'
  },
  { 
    label: 'Python', 
    value: 'python', 
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: '🐍'
  },
  { 
    label: 'Java', 
    value: 'java', 
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: '☕'
  },
  { 
    label: 'C++', 
    value: 'cpp', 
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: '⚡'
  },
  { 
    label: 'C', 
    value: 'c', 
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: '🔧'
  },
];

const DIFFICULTIES = [
  { label: 'All', value: '' },
  { label: 'Level 1', value: 'level1' },
  { label: 'Level 2', value: 'level2' },
  { label: 'Level 3', value: 'level3' },
];

export default function StudentProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedLanguage = searchParams.get('language');

  useEffect(() => {
    fetchMeta();
  }, []);

  useEffect(() => {
    if (selectedLanguage) {
      fetchProblems();
    }
  }, [selectedLanguage, difficulty, category]);

  const fetchMeta = async () => {
    try {
      const res = await fetch('/api/problems/meta');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      // handle error
    }
  };

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const params = [];
      if (selectedLanguage) params.push(`language=${selectedLanguage}`);
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

  const handleLanguageClick = (languageValue) => {
    router.push(`/dashboard/problems?language=${languageValue}`);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  // If no language is selected, show language cards
  if (!selectedLanguage) {
    return (
      <>
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="h-6 w-6 text-indigo-500" />
          <h1 className="text-2xl font-bold">Choose Programming Language</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LANGUAGES.map((language) => (
            <div
              key={language.value}
              onClick={() => handleLanguageClick(language.value)}
              className={`${language.color} border-2 rounded-lg p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">{language.icon}</div>
                <Code className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">{language.label}</h3>
              <p className="text-sm opacity-80">
                Practice {language.label} programming problems
              </p>
              <div className="mt-4 flex items-center justify-end">
                <span className="text-sm font-medium">View Problems →</span>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  // If language is selected, show filtered problems
  const currentLanguage = LANGUAGES.find(lang => lang.value === selectedLanguage);
  
  return (
    <>
      <div className="flex items-center gap-2 mb-6">
        <Link 
          href="/dashboard/problems" 
          className="flex items-center gap-2 text-indigo-500 hover:text-indigo-700 mr-4"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{currentLanguage?.icon}</span>
          <h1 className="text-2xl font-bold">{currentLanguage?.label} Problems</h1>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-4 mb-8 items-center bg-white p-4 rounded shadow">
        <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="border rounded px-3 py-1">
          {DIFFICULTIES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
        <select value={category} onChange={e => setCategory(e.target.value)} className="border rounded px-3 py-1">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : problems.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No {currentLanguage?.label} problems found.</p>
          <Link 
            href="/dashboard/problems" 
            className="text-indigo-500 hover:text-indigo-700 mt-2 inline-block"
          >
            Choose another language
          </Link>
        </div>
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
    </>
  );
} 