'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProblemCard from '../../components/ProblemCard';
import LanguageCard from '../../components/LanguageCard';
import LevelCard from '../../components/LevelCard';
import { BookOpen, Code2, Trophy } from 'lucide-react';

export default function StudentProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('');
  const [level, setLevel] = useState('');
  const [languages, setLanguages] = useState([]);
  const [levels, setLevels] = useState([]);
  const [showLanguageCards, setShowLanguageCards] = useState(true);
  const [showLevelCards, setShowLevelCards] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchLanguages();
  }, []);

  useEffect(() => {
    if (language && !level) {
      fetchLevels();
    }
  }, [language]);

  useEffect(() => {
    if (language && level) {
      fetchProblems();
    }
  }, [language, level]);

  const fetchLanguages = async () => {
    try {
      const res = await fetch('/api/problems/meta');
      const data = await res.json();
      setLanguages(data.languages || []);
    } catch (err) {
      // handle error
    }
  };

  const fetchLevels = async () => {
    try {
      const res = await fetch(`/api/problems/levels?language=${language}`);
      const data = await res.json();
      setLevels(data.levels || []);
    } catch (err) {
      // handle error
    }
  };

  const handleLanguageCardClick = (selectedLanguage) => {
    setLanguage(selectedLanguage);
    setLevel('');
    setShowLanguageCards(false);
    setShowLevelCards(true);
  };

  const handleLevelCardClick = (selectedLevel) => {
    setLevel(selectedLevel);
    setShowLevelCards(false);
  };

  const handleBackToLanguages = () => {
    setLanguage("");
    setLevel("");
    setShowLanguageCards(true);
    setShowLevelCards(false);
  };

  const handleBackToLevels = () => {
    setLevel("");
    setShowLevelCards(true);
  };

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const params = [];
      if (language) params.push(`language=${language}`);
      if (level) params.push(`difficulty=${level}`);
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
            onClick={showLevelCards ? handleBackToLanguages : level ? handleBackToLevels : handleBackToLanguages}
            className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mr-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {showLevelCards ? 'Back to Languages' : level ? 'Back to Levels' : 'Back to Languages'}
          </button>
        )}
        <BookOpen className="h-6 w-6 text-indigo-500" />
        <h1 className="text-2xl font-bold">
          {showLanguageCards 
            ? 'Problems by Language' 
            : showLevelCards 
              ? 'Choose Difficulty Level' 
              : 'Problems'
          }
        </h1>
        {!showLanguageCards && language && (
          <span className="text-gray-600 text-lg">
            - {language.toUpperCase()}
            {level && ` - ${level === 'level1' ? 'Level 1' : level === 'level2' ? 'Level 2' : 'Level 3'}`}
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
      ) : showLevelCards ? (
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="h-6 w-6 text-indigo-500" />
            <h2 className="text-xl font-semibold text-gray-800">Choose Difficulty Level for {language.toUpperCase()}</h2>
          </div>
          {levels.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No levels found for {language}. Check back later!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {levels.map((levelData) => (
                <LevelCard
                  key={levelData.level}
                  level={levelData.level}
                  problemCount={levelData.count}
                  onClick={() => handleLevelCardClick(levelData.level)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : problems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No problems found for {language.toUpperCase()} - {level === 'level1' ? 'Level 1' : level === 'level2' ? 'Level 2' : 'Level 3'}.</p>
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