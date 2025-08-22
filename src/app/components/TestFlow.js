import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Target, Award, ChevronRight, ArrowLeft, Search, Filter, BarChart3, Clock, Users, Star } from 'lucide-react';

export default function TestFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedTest, setSelectedTest] = useState('');
  const [categories, setCategories] = useState([]);
  const [difficulties, setDifficulties] = useState([]);
  const [tests, setTests] = useState([]);
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
    fetchCategories();
    fetchWeeklyProgress();
  }, []);

  useEffect(() => {
    if (selectedCategory && currentStep >= 2) {
      fetchDifficulties();
    }
  }, [selectedCategory, currentStep]);

  useEffect(() => {
    if (selectedCategory && selectedDifficulty && currentStep >= 3) {
      fetchTests();
    }
  }, [selectedCategory, selectedDifficulty, currentStep]);

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

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tests/categories', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDifficulties = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tests/difficulties?category=${encodeURIComponent(selectedCategory)}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setDifficulties(data.difficulties || []);
      }
    } catch (err) {
      console.error('Error fetching difficulties:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tests/list?category=${encodeURIComponent(selectedCategory)}&difficulty=${encodeURIComponent(selectedDifficulty)}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setTests(data.tests || []);
      }
    } catch (err) {
      console.error('Error fetching tests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentStep(2);
    setSelectedDifficulty('');
    setSelectedTest('');
  };

  const handleDifficultySelect = (difficulty) => {
    setSelectedDifficulty(difficulty);
    setCurrentStep(3);
    setSelectedTest('');
  };

  const handleTestSelect = (test) => {
    setSelectedTest(test);
    router.push(`/dashboard/tests/${test._id}`);
  };

  const goBack = () => {
    if (currentStep === 3) {
      setCurrentStep(2);
      setSelectedTest('');
    } else if (currentStep === 2) {
      setCurrentStep(1);
      setSelectedDifficulty('');
      setSelectedCategory('');
    }
  };

  const getFilteredItems = (items, searchTerm) => {
    if (!searchTerm) return items;
    return items.filter(item => {
      const name = item.name || item.title || item.category || item.difficulty;
      return name.toLowerCase().includes(searchTerm.toLowerCase());
    });
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
          <span className="ml-2 font-medium">Category</span>
        </div>
        
        <ChevronRight className="w-5 h-5 text-gray-400" />
        
        <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            currentStep >= 2 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
          }`}>
            2
          </div>
          <span className="ml-2 font-medium">Difficulty</span>
        </div>
        
        <ChevronRight className="w-5 h-5 text-gray-400" />
        
        <div className={`flex items-center ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            currentStep >= 3 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
          }`}>
            3
          </div>
          <span className="ml-2 font-medium">Test</span>
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
          placeholder="Search for a test..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

  const renderCategoryCards = () => {
    const filteredCategories = getFilteredItems(categories, searchTerm);
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <div
            key={category._id || category.name}
            onClick={() => handleCategorySelect(category.name)}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden border border-gray-100"
          >
            <div className="bg-gradient-to-r from-blue-400 to-blue-600 p-4 text-white">
              <h3 className="text-lg font-semibold">{category.name}</h3>
              <p className="text-sm opacity-90">Test Category</p>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <BookOpen className="w-8 h-8 text-blue-500" />
                <span className="text-2xl font-bold text-gray-700">{category.testCount || 0}</span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                {category.testCount || 0} tests available in {category.name}
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

  const renderDifficultyCards = () => {
    const filteredDifficulties = getFilteredItems(difficulties, searchTerm);
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDifficulties.map((difficulty) => (
          <div
            key={difficulty._id || difficulty.name}
            onClick={() => handleDifficultySelect(difficulty.name)}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden border border-gray-100"
          >
            <div className="bg-gradient-to-r from-green-400 to-green-600 p-4 text-white">
              <h3 className="text-lg font-semibold">{difficulty.name}</h3>
              <p className="text-sm opacity-90">Difficulty Level</p>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Target className="w-8 h-8 text-green-500" />
                <span className="text-2xl font-bold text-gray-700">{difficulty.testCount || 0}</span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                {difficulty.testCount || 0} tests available at {difficulty.name} level
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

  const renderTestCards = () => {
    const filteredTests = getFilteredItems(tests, searchTerm);
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTests.map((test) => (
          <div
            key={test._id}
            onClick={() => handleTestSelect(test)}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden border border-gray-100"
          >
            <div className="bg-gradient-to-r from-purple-400 to-purple-600 p-4 text-white">
              <h3 className="text-lg font-semibold">{test.title}</h3>
              <p className="text-sm opacity-90">{test.category} • {test.difficulty}</p>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Award className="w-8 h-8 text-purple-500" />
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-700">{test.totalQuestions}</div>
                  <div className="text-xs text-gray-500">Questions</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">{test.duration} min</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">{test.attempts || 0} attempts</span>
                </div>
              </div>
              
              <button className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors font-medium">
                Start Test
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
            <h1 className="text-2xl font-bold text-gray-900">This Week</h1>
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
            Back to {currentStep === 2 ? 'Categories' : 'Difficulties'}
          </button>
        )}

        {/* Search and Filter */}
        {/* {renderSearchAndFilter()} */}

        {/* Content Based on Current Step */}
        <div>
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Choose Test Category</h2>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : (
                renderCategoryCards()
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Choose Difficulty Level for {selectedCategory}
              </h2>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : (
                renderDifficultyCards()
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Choose Test from {selectedCategory} - {selectedDifficulty}
              </h2>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : (
                renderTestCards()
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
