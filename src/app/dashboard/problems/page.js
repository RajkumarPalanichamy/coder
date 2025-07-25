'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProblemCard from '../../components/ProblemCard';
import { BookOpen, Code, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getLanguageConfig } from '@/lib/languageConfig';

const DIFFICULTIES = [
  { label: 'All', value: '' },
  { label: 'Level 1', value: 'level1' },
  { label: 'Level 2', value: 'level2' },
  { label: 'Level 3', value: 'level3' },
];

export default function StudentProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [languagesLoading, setLanguagesLoading] = useState(true);
  const [difficulty, setDifficulty] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [availableLanguages, setAvailableLanguages] = useState([]);
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
    setLanguagesLoading(true);
    try {
      const res = await fetch('/api/problems/meta');
      const data = await res.json();
      setCategories(data.categories || []);
      setAvailableLanguages(data.languages || []);
    } catch (err) {
      console.error('Error fetching meta:', err);
    } finally {
      setLanguagesLoading(false);
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
      console.error('Error fetching problems:', err);
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
        
        {languagesLoading ? (
          <div className="text-center py-12 text-gray-500">Loading languages...</div>
        ) : availableLanguages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No programming languages available.</p>
            <p className="text-sm mt-2">Please contact your administrator to add problems.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableLanguages.map((language) => {
              const config = getLanguageConfig(language);
              return (
                <div
                  key={language}
                  onClick={() => handleLanguageClick(language)}
                  className={`${config.color} border-2 rounded-lg p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-4xl">{config.icon}</div>
                    <Code className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{config.displayName}</h3>
                  <p className="text-sm opacity-80">
                    Practice {config.displayName} programming problems
                  </p>
                  <div className="mt-4 flex items-center justify-end">
                    <span className="text-sm font-medium">View Problems →</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </>
    );
  }

  // If language is selected, show filtered problems
  const currentLanguageConfig = getLanguageConfig(selectedLanguage);
  
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
          <span className="text-2xl">{currentLanguageConfig.icon}</span>
          <h1 className="text-2xl font-bold">{currentLanguageConfig.displayName} Problems</h1>
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
          <p>No {currentLanguageConfig.displayName} problems found.</p>
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