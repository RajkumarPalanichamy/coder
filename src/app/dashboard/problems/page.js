'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProblemCard from '../../components/ProblemCard';
import LanguageCard from '../../components/LanguageCard';
import CategoryCard from '../../components/CategoryCard';
import LevelCard from '../../components/LevelCard';
import Loader from '../../components/Loader';
import { BookOpen, Code2, FolderOpen, Target } from 'lucide-react';

export default function StudentProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [languagesLoading, setLanguagesLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [levelsLoading, setLevelsLoading] = useState(false);
  const [language, setLanguage] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [languages, setLanguages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [levels, setLevels] = useState([]);
  const [showLanguageCards, setShowLanguageCards] = useState(true);
  const [showCategoryCards, setShowCategoryCards] = useState(false);
  const [showLevelCards, setShowLevelCards] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchLanguages();
  }, []);

  useEffect(() => {
    if (language && !category) {
      fetchCategories();
    }
  }, [language]);

  useEffect(() => {
    if (language && category && !level) {
      fetchLevels();
    }
  }, [language, category]);

  useEffect(() => {
    if (language && category && level) {
      fetchProblems();
    }
  }, [language, category, level]);

  const fetchLanguages = async () => {
    setLanguagesLoading(true);
    try {
      const res = await fetch('/api/problems/meta');
      const data = await res.json();
      setLanguages(data.languages || []);
    } catch (err) {
      // handle error
    } finally {
      setLanguagesLoading(false);
    }
  };

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await fetch(`/api/problems/categories?language=${language}`);
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      // handle error
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchLevels = async () => {
    setLevelsLoading(true);
    try {
      const res = await fetch(`/api/problems/levels?language=${language}&category=${category}`);
      const data = await res.json();
      setLevels(data.levels || []);
    } catch (err) {
      // handle error
    } finally {
      setLevelsLoading(false);
    }
  };

  const handleLanguageCardClick = (selectedLanguage) => {
    setLanguage(selectedLanguage);
    setCategory('');
    setLevel('');
    setShowLanguageCards(false);
    setShowCategoryCards(true);
    setShowLevelCards(false);
  };

  const handleCategoryCardClick = (selectedCategory) => {
    setCategory(selectedCategory);
    setLevel('');
    setShowCategoryCards(false);
    setShowLevelCards(true);
  };

  const handleLevelCardClick = (selectedLevel) => {
    setLevel(selectedLevel);
    setShowLevelCards(false);
  };

  const handleBackToLanguages = () => {
    setLanguage("");
    setCategory("");
    setLevel("");
    setShowLanguageCards(true);
    setShowCategoryCards(false);
    setShowLevelCards(false);
  };

  const handleBackToCategories = () => {
    setCategory("");
    setLevel("");
    setShowCategoryCards(true);
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
            onClick={showCategoryCards ? handleBackToLanguages : category ? handleBackToCategories : handleBackToLanguages}
            className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mr-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {showCategoryCards ? 'Back to Languages' : category ? 'Back to Categories' : 'Back to Languages'}
          </button>
        )}
        <BookOpen className="h-6 w-6 text-indigo-500" />
        <h1 className="text-2xl font-bold">
          {showLanguageCards 
            ? 'Problems by Language' 
            : showCategoryCards 
              ? 'Choose Problem Category' 
              : 'Problems'
          }
        </h1>
        {!showLanguageCards && language && (
          <span className="text-gray-600 text-lg">
            - {language.toUpperCase()}
            {category && ` - ${category}`}
          </span>
        )}
      </div>

      {showLanguageCards ? (
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Code2 className="h-6 w-6 text-indigo-500" />
            <h2 className="text-xl font-semibold text-gray-800">Choose a Programming Language</h2>
          </div>
          {languagesLoading ? (
            <Loader type="cards" />
          ) : languages.length === 0 ? (
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
      ) : showCategoryCards ? (
        <div>
          <div className="flex items-center gap-2 mb-6">
            <FolderOpen className="h-6 w-6 text-indigo-500" />
            <h2 className="text-xl font-semibold text-gray-800">Choose Problem Category for {language.toUpperCase()}</h2>
          </div>
          {categoriesLoading ? (
            <Loader type="cards" />
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FolderOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No categories found for {language}. Check back later!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((categoryData) => (
                <CategoryCard
                  key={categoryData.category}
                  category={categoryData.category}
                  problemCount={categoryData.count}
                  onClick={() => handleCategoryCardClick(categoryData.category)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {loading ? (
            <Loader 
              type="problems" 
              message={`Loading ${language.toUpperCase()} problems...`}
            />
          ) : problems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No problems found for {language.toUpperCase()} - {category}.</p>
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