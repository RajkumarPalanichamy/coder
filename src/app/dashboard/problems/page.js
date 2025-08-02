'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LanguageCard from '../../components/LanguageCard';
import CategoryCard from '../../components/CategoryCard';
import LevelCard from '../../components/LevelCard';
import Loader from '../../components/Loader';
import { BookOpen, Code2, FolderOpen, Target } from 'lucide-react';

export default function StudentProblemsPage() {
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



  const fetchLanguages = async () => {
    setLanguagesLoading(true);
    try {
      const res = await fetch('/api/problems/meta');
      if (!res.ok) {
        throw new Error('Failed to fetch languages');
      }
      const data = await res.json();
      // Ensure data is an array and filter out invalid entries
      const validData = Array.isArray(data.languages) ? data.languages.filter(item => 
        item && 
        item.language && 
        typeof item.language === 'string' &&
        item.language.trim().length > 0
      ) : [];
      setLanguages(validData);
    } catch (err) {
      console.error('Error fetching languages:', err);
      setLanguages([]); // Set empty array on error
    } finally {
      setLanguagesLoading(false);
    }
  };

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await fetch(`/api/problems/categories?language=${encodeURIComponent(language)}`);
      const data = await res.json();
      // Ensure data is an array and filter out invalid entries
      const validData = Array.isArray(data.categories) ? data.categories.filter(item => 
        item && 
        item.category && 
        typeof item.category === 'string' &&
        item.category.trim().length > 0
      ) : [];
      setCategories(validData);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]); // Set empty array on error
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchLevels = async () => {
    setLevelsLoading(true);
    try {
      const res = await fetch(`/api/problems/levels?language=${encodeURIComponent(language)}&category=${encodeURIComponent(category)}`);
      const data = await res.json();
      // Ensure data is an array and filter out invalid entries
      const validData = Array.isArray(data.levels) ? data.levels.filter(item => 
        item && 
        item.level && 
        typeof item.level === 'string' &&
        item.level.trim().length > 0
      ) : [];
      setLevels(validData);
    } catch (err) {
      console.error('Error fetching levels:', err);
      setLevels([]); // Set empty array on error
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

  const handleLevelCardClick = async (selectedLevel) => {
    setLevel(selectedLevel);
    setShowLevelCards(false);
    
    // Fetch the latest problem and redirect to it
    try {
      const response = await fetch(`/api/problems/latest?language=${encodeURIComponent(language)}&category=${encodeURIComponent(category)}&difficulty=${encodeURIComponent(selectedLevel)}`);
      const data = await response.json();
      
      if (response.ok && data.problemId) {
        router.push(`/problems/${data.problemId}`);
      } else {
        // If no problems found, show error message
        console.error('No problems found for selected criteria:', data.error);
        // Could show a toast/notification here
      }
    } catch (error) {
      console.error('Error fetching latest problem:', error);
      // Could show a toast/notification here
    }
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





  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <>
      <div className="flex items-center gap-2 mb-6">
        {!showLanguageCards && (
          <button
            onClick={
              showCategoryCards ? handleBackToLanguages : 
              showLevelCards ? handleBackToCategories : 
              handleBackToLanguages
            }
            className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mr-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {showCategoryCards ? 'Back to Languages' : 
             showLevelCards ? 'Back to Categories' : 
             'Back to Languages'}
          </button>
        )}
        <BookOpen className="h-6 w-6 text-indigo-500" />
        <h1 className="text-2xl font-bold">
          {showLanguageCards 
            ? 'Problems by Language' 
            : showCategoryCards 
              ? 'Choose Problem Category' 
              : 'Choose Difficulty Level'
          }
        </h1>
        {!showLanguageCards && language && (
          <span className="text-gray-600 text-lg">
            - {language.toUpperCase()}
            {category && ` - ${category}`}
            {level && ` - ${level === 'level1' ? 'Level 1' : level === 'level2' ? 'Level 2' : level === 'level3' ? 'Level 3' : level}`}
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
              {languages
                .filter(langData => langData && langData.language) // Filter out invalid entries
                .map((langData) => (
                  <LanguageCard
                    key={langData.language}
                    language={langData.language}
                    problemCount={langData.count || 0}
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
              {categories
                .filter(categoryData => categoryData && categoryData.category) // Filter out invalid entries
                .map((categoryData) => (
                  <CategoryCard
                    key={categoryData.category}
                    category={categoryData.category}
                    problemCount={categoryData.count || 0}
                    onClick={() => handleCategoryCardClick(categoryData.category)}
                  />
                ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Target className="h-6 w-6 text-indigo-500" />
            <h2 className="text-xl font-semibold text-gray-800">Choose Difficulty Level for {language.toUpperCase()} - {category}</h2>
          </div>
          {levelsLoading ? (
            <Loader type="cards" />
          ) : levels.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No difficulty levels found for {language} - {category}. Check back later!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {levels
                .filter(levelData => levelData && levelData.level) // Filter out invalid entries
                .map((levelData) => (
                  <LevelCard
                    key={levelData.level}
                    level={levelData.level}
                    problemCount={levelData.count || 0}
                    onClick={() => handleLevelCardClick(levelData.level)}
                  />
                ))}
            </div>
          )}
        </div>
      )}
    </>
  );
} 