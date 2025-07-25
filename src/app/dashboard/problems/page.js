'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProblemCard from '../../components/ProblemCard';
import LanguageCard from '../../components/LanguageCard';
import { BookOpen, Filter, Code2 } from 'lucide-react';

const DIFFICULTIES = [
  { label: 'All', value: '' },
  { label: 'Level 1', value: 'level1' },
  { label: 'Level 2', value: 'level2' },
  { label: 'Level 3', value: 'level3' },
];

export default function StudentProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [category, setCategory] = useState('');
  const [languages, setLanguages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showLanguageCards, setShowLanguageCards] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchMeta();
  }, []);

  useEffect(() => {
    fetchProblems();
  }, [language, difficulty, category]);

  const fetchMeta = async () => {
    try {
      const res = await fetch('/api/problems/meta');
      const data = await res.json();
      setLanguages(data.languages || []);
      setCategories(data.categories || []);
    } catch (err) {
      // handle error
    }
  };

  const handleLanguageCardClick = (selectedLanguage) => {
    setLanguage(selectedLanguage);
    setShowLanguageCards(false);
  };

  const handleBackToLanguages = () => {
    setLanguage("");
    setDifficulty("");
    setCategory("");
    setShowLanguageCards(true);
  };

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
    <>
      <div className="flex items-center gap-2 mb-6">
        {!showLanguageCards && (
          <button
            onClick={handleBackToLanguages}
            className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mr-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Languages
          </button>
        )}
        <BookOpen className="h-6 w-6 text-indigo-500" />
        <h1 className="text-2xl font-bold">
          {showLanguageCards ? 'Problems by Language' : 'Problems'}
        </h1>
        {!showLanguageCards && language && (
          <span className="text-gray-600 text-lg">
            - {language.toUpperCase()}
          </span>
        )}
      </div>

      {showLanguageCards ? (
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Code2 className="h-6 w-6 text-indigo-500" />
            <h2 className="text-xl font-semibold text-gray-800">Choose a Programming Language</h2>
          </div>
          {languages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Code2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No programming languages found. Check back later!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {languages.map((langData) => (
                <LanguageCard
                  key={langData.language}
                  language={langData.language}
                  problemCount={langData.count}
                  onClick={() => handleLanguageCardClick(langData.language)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Filter Bar */}
          <div className="flex flex-wrap gap-4 mb-8 items-center bg-white p-4 rounded shadow">
            <Filter className="h-5 w-5 text-indigo-500" />
            <select value={language} onChange={e => setLanguage(e.target.value)} className="border rounded px-3 py-1">
              <option value="">All Languages</option>
              {languages.map(langData => <option key={langData.language} value={langData.language}>{langData.language}</option>)}
            </select>
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
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No problems found for the selected filters.</p>
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
      )}
    </>
  );
} 