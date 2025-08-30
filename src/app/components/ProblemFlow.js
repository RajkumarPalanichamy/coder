import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Code2, FolderOpen, Target, ChevronRight, ArrowLeft, Search, Filter, BarChart3 } from 'lucide-react';

export default function ProblemFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [languages, setLanguages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('regular');
  const [weeklyProgress, setWeeklyProgress] = useState({
    dayStreak: 0,
    completed: 0,
    progress: 0,
    rank: 'Top 50%',
    points: 0
  });
  const [progressLoading, setProgressLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchLanguages();
    fetchWeeklyProgress();
  }, []);

  useEffect(() => {
    if (selectedLanguage && currentStep >= 2) {
      fetchCategories();
    }
  }, [selectedLanguage, currentStep]);

  useEffect(() => {
    if (selectedLanguage && selectedCategory && currentStep >= 3) {
      fetchLevels();
    }
  }, [selectedLanguage, selectedCategory, currentStep]);

  const fetchWeeklyProgress = async () => {
    try {
      const res = await fetch('/api/user/weekly-progress', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setWeeklyProgress(data);
      }
    } catch (err) {
      console.error('Error fetching weekly progress:', err);
    } finally {
      setProgressLoading(false);
    }
  };

  const fetchLanguages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/problems/meta', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const validData = Array.isArray(data.languages) ? data.languages.filter(item => 
          item && item.language && typeof item.language === 'string' && item.language.trim().length > 0
        ) : [];
        setLanguages(validData);
      }
    } catch (err) {
      console.error('Error fetching languages:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/problems/categories?language=${encodeURIComponent(selectedLanguage)}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const validData = Array.isArray(data.categories) ? data.categories.filter(item => 
          item && item.category && typeof item.category === 'string' && item.category.trim().length > 0
        ) : [];
        setCategories(validData);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLevels = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/problems/levels?language=${encodeURIComponent(selectedLanguage)}&category=${encodeURIComponent(selectedCategory)}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const validData = Array.isArray(data.levels) ? data.levels.filter(item => 
          item && item.level && typeof item.level === 'string' && item.level.trim().length > 0
        ) : [];
        setLevels(validData);
      }
    } catch (err) {
      console.error('Error fetching levels:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    setCurrentStep(2);
    setSelectedCategory('');
    setSelectedLevel('');
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentStep(3);
    setSelectedLevel('');
  };

  const handleLevelSelect = (level) => {
    setSelectedLevel(level);
    router.push(`/dashboard/problems/level/${level}?language=${encodeURIComponent(selectedLanguage)}&category=${encodeURIComponent(selectedCategory)}`);
  };

  const goBack = () => {
    if (currentStep === 3) {
      setCurrentStep(2);
      setSelectedLevel('');
    } else if (currentStep === 2) {
      setCurrentStep(1);
      setSelectedCategory('');
      setSelectedLanguage('');
    }
  };

  const getFilteredItems = (items, searchTerm) => {
    if (!searchTerm) return items;
    return items.filter(item => {
      const name = item.language || item.category || item.level;
      return name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  };

  const getLanguageImage = (language) => {
    if (!language) return <Code2 className="w-10 h-10 text-blue-500" />;
    
    switch (language.toLowerCase()) {
      case 'javascript':
        return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" alt="JavaScript" className="w-10 h-10" />;
      case 'python':
        return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" alt="Python" className="w-10 h-10" />;
      case 'java':
        return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" alt="Java" className="w-10 h-10" />;
      case 'cpp':
      case 'c++':
        return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg" alt="C++" className="w-10 h-10" />;
      case 'csharp':
      case 'c#':
        return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg" alt="C#" className="w-10 h-10" />;
      case 'c':
        return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg" alt="C" className="w-10 h-10" />;
      case 'go':
        return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg" alt="Go" className="w-10 h-10" />;
      case 'rust':
        return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-plain.svg" alt="Rust" className="w-10 h-10" />;
      case 'kotlin':
        return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg" alt="Kotlin" className="w-10 h-10" />;
      case 'typescript':
        return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" alt="TypeScript" className="w-10 h-10" />;
      case 'php':
        return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg" alt="PHP" className="w-10 h-10" />;
      case 'ruby':
        return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ruby/ruby-original.svg" alt="Ruby" className="w-10 h-10" />;
      case 'swift':
        return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg" alt="Swift" className="w-10 h-10" />;
      default:
        return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/code/code-plain.svg" alt="Code" className="w-10 h-10" />;
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            currentStep >= 1 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
          }`}>
            1
          </div>
          <span className="ml-2 font-medium">Language</span>
        </div>
        
        <ChevronRight className="w-5 h-5 text-gray-400" />
        
        <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            currentStep >= 2 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
          }`}>
            2
          </div>
          <span className="ml-2 font-medium">Category</span>
        </div>
        
        <ChevronRight className="w-5 h-5 text-gray-400" />
        
        <div className={`flex items-center ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            currentStep >= 3 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
          }`}>
            3
          </div>
          <span className="ml-2 font-medium">Level</span>
        </div>
      </div>
    </div>
  );

  const renderSearchAndFilter = () => (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search problems..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        />
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => setFilterType('regular')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterType === 'regular'
              ? 'bg-yellow-500 text-gray-900'
              : 'bg-white text-yellow-500 border border-yellow-500 hover:bg-yellow-50'
          }`}
        >
          Regular
        </button>
        <button
          onClick={() => setFilterType('custom')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterType === 'custom'
              ? 'bg-yellow-500 text-gray-900'
              : 'bg-white text-yellow-500 border border-yellow-500 hover:bg-yellow-50'
          }`}
        >
          Custom
        </button>
      </div>
    </div>
  );

  const renderLanguageCards = () => {
    const filteredLanguages = getFilteredItems(languages, searchTerm);
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLanguages.map((langData) => (
          <div
            key={langData.language}
            onClick={() => handleLanguageSelect(langData.language)}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden border border-gray-100"
          >
            <div className="bg-gradient-to-r from-blue-400 to-blue-600 p-4 text-white">
              <h3 className="text-lg font-semibold">{langData.language.toUpperCase()}</h3>
              <p className="text-sm opacity-90">Programming Language</p>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                {getLanguageImage(langData.language)}
                {/* <span className="text-2xl font-bold text-gray-700">{langData.count || 0}</span> */}
                <span className="text-2xl font-bold text-gray-700">∞</span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Available in {langData.categories || 0} categories
              </p>
              <button className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors font-medium">
                Continue
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderCategoryCards = () => {
    const filteredCategories = getFilteredItems(categories, searchTerm);
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((catData) => (
          <div
            key={catData.category}
            onClick={() => handleCategorySelect(catData.category)}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden border border-gray-100"
          >
            <div className="bg-gradient-to-r from-green-400 to-green-600 p-4 text-white">
              <h3 className="text-lg font-semibold">{catData.category}</h3>
              <p className="text-sm opacity-90">Problem Category</p>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <FolderOpen className="w-8 h-8 text-green-500" />
                {/* <span className="text-2xl font-bold text-gray-700">{catData.count || 0}</span> */}
                <span className="text-2xl font-bold text-gray-700">∞</span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Problems available in {catData.category}
              </p>
              <button className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors font-medium">
                Continue
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderLevelCards = () => {
    const filteredLevels = getFilteredItems(levels, searchTerm);
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLevels.map((levelData) => (
          <div
            key={levelData.level}
            onClick={() => handleLevelSelect(levelData.level)}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden border border-gray-100"
          >
            <div className="bg-gradient-to-r from-purple-400 to-purple-600 p-4 text-white">
              <h3 className="text-lg font-semibold">
                {levelData.level === 'level1' ? 'Level 1' : 
                 levelData.level === 'level2' ? 'Level 2' : 
                 levelData.level === 'level3' ? 'Level 3' : levelData.level}
              </h3>
              <p className="text-sm opacity-90">
                {levelData.level === 'level1' ? 'Beginner' : 
                 levelData.level === 'level2' ? 'Intermediate' : 
                 levelData.level === 'level3' ? 'Advanced' : 'Unknown'}
              </p>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Target className="w-8 h-8 text-purple-500" />
                {/* <span className="text-2xl font-bold text-gray-700">{levelData.count || 0}</span> */}
                <span className="text-2xl font-bold text-gray-700">∞</span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Problems available at this level
              </p>
              <button className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors font-medium">
                Continue
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section - This Week Dashboard */}
      <div className="bg-white py-8 px-6 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          {/* Title */}
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-6 h-6 text-gray-600" />
            <h1 className="text-2xl font-bold text-gray-900">Total Progress</h1>
          </div>
          
          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Day Streak */}
            <div className="bg-purple-100 rounded-lg p-4 text-center">
              {progressLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-purple-200 rounded mb-1"></div>
                  <div className="h-4 bg-purple-200 rounded"></div>
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-purple-600 mb-1">{weeklyProgress.dayStreak}</div>
                  <div className="text-sm text-purple-600 font-medium">Day Streak</div>
                </>
              )}
            </div>
            
            {/* Completed */}
            <div className="bg-green-100 rounded-lg p-4 text-center">
              {progressLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-green-200 rounded mb-1"></div>
                  <div className="h-4 bg-green-200 rounded"></div>
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-green-600 mb-1">{weeklyProgress.completed}</div>
                  <div className="text-sm text-green-600 font-medium">Completed</div>
                </>
              )}
            </div>
            
            {/* Progress */}
            <div className="bg-purple-100 rounded-lg p-4 text-center">
              {progressLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-purple-200 rounded mb-1"></div>
                  <div className="h-4 bg-purple-200 rounded"></div>
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-purple-600 mb-1">{weeklyProgress.progress}%</div>
                  <div className="text-sm text-purple-600 font-medium">Progress</div>
                </>
              )}
            </div>
            
            {/* Rank */}
            <div className="bg-yellow-100 rounded-lg p-4 text-center">
              {progressLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-yellow-200 rounded mb-1"></div>
                  <div className="h-4 bg-yellow-200 rounded"></div>
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-orange-600 mb-1">{weeklyProgress.rank}</div>
                  <div className="text-sm text-orange-600 font-medium">Rank</div>
                </>
              )}
            </div>
            
            {/* Points */}
            <div className="bg-blue-100 rounded-lg p-4 text-center">
              {progressLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-blue-200 rounded mb-1"></div>
                  <div className="h-4 bg-blue-200 rounded"></div>
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-blue-600 mb-1">{weeklyProgress.points}</div>
                  <div className="text-sm text-blue-600 font-medium">Points</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
       

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Back Button */}
        {currentStep > 1 && (
          <button
            onClick={goBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to {currentStep === 2 ? 'Languages' : 'Categories'}
          </button>
        )}

        {/* Search and Filter */}
        {/* {renderSearchAndFilter()} */}

        {/* Content Based on Current Step */}
        <div>
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Choose Programming Language</h2>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : (
                renderLanguageCards()
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Choose Problem Category for {selectedLanguage.toUpperCase()}
              </h2>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : (
                renderCategoryCards()
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Choose Difficulty Level for {selectedLanguage.toUpperCase()} - {selectedCategory}
              </h2>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : (
                renderLevelCards()
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
