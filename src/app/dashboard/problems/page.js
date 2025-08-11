'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Code2, FolderOpen, Target, ArrowLeft, Clock, AlertCircle, CheckSquare2 } from 'lucide-react';

// Language configuration with icons
const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript', icon: '🟨', color: 'yellow' },
  { value: 'python', label: 'Python', icon: '🐍', color: 'blue' },
  { value: 'java', label: 'Java', icon: '☕', color: 'orange' },
  { value: 'cpp', label: 'C++', icon: '⚡', color: 'purple' },
  { value: 'c', label: 'C', icon: '🔧', color: 'gray' }
];

const LEVELS = [
  { value: 'level1', label: 'Level 1', color: 'green', icon: '🟢', description: 'Beginner - Basic concepts and syntax' },
  { value: 'level2', label: 'Level 2', color: 'yellow', icon: '🟡', description: 'Intermediate - Problem solving skills' },
  { value: 'level3', label: 'Level 3', color: 'red', icon: '🔴', description: 'Advanced - Complex algorithms' }
];

export default function StudentProblemsPage() {
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [subcategories, setSubcategories] = useState([]);
  const [problemCounts, setProblemCounts] = useState({});
  const [currentView, setCurrentView] = useState('languages');
  const [showInstructions, setShowInstructions] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchProblemCounts();
  }, []);

  useEffect(() => {
    if (selectedLanguage && currentView === 'subcategories') {
      fetchSubcategories();
    }
  }, [selectedLanguage, currentView]);

  const fetchProblemCounts = async () => {
    try {
      const res = await fetch('/api/problems/counts');
      const data = await res.json();
      setProblemCounts(data);
    } catch (err) {
      console.error('Error fetching problem counts:', err);
    }
  };

  const fetchSubcategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/problems/subcategories?language=${encodeURIComponent(selectedLanguage)}`);
      const data = await res.json();
      setSubcategories(data.subcategories || ['Basic Problems', 'Arrays', 'Strings', 'Algorithms', 'Data Structures']);
    } catch (err) {
      setSubcategories(['Basic Problems', 'Arrays', 'Strings', 'Algorithms', 'Data Structures']);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageSelect = (lang) => {
    setSelectedLanguage(lang);
    setCurrentView('subcategories');
  };

  const handleSubcategorySelect = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setCurrentView('levels');
  };

  const handleLevelSelect = (level) => {
    setSelectedLevel(level);
    setShowInstructions(true);
  };

  const handleStartTest = async () => {
    try {
      const response = await fetch(`/api/problems/latest?language=${encodeURIComponent(selectedLanguage)}&subcategory=${encodeURIComponent(selectedSubcategory)}&difficulty=${encodeURIComponent(selectedLevel)}`);
      const data = await response.json();
      
      if (response.ok && data.problemId) {
        router.push(`/problems/${data.problemId}`);
      } else {
        alert('No problems found for selected criteria. Please try another selection.');
      }
    } catch (error) {
      console.error('Error fetching problem:', error);
      alert('Error loading problems. Please try again.');
    }
  };

  const handleBack = () => {
    if (showInstructions) {
      setShowInstructions(false);
    } else if (currentView === 'levels') {
      setSelectedSubcategory('');
      setCurrentView('subcategories');
    } else if (currentView === 'subcategories') {
      setSelectedLanguage('');
      setCurrentView('languages');
    }
  };

  const getBreadcrumbs = () => {
    const crumbs = [];
    crumbs.push({ label: 'Languages', onClick: () => { setCurrentView('languages'); setSelectedLanguage(''); setShowInstructions(false); } });
    
    if (selectedLanguage) {
      const lang = LANGUAGES.find(l => l.value === selectedLanguage);
      crumbs.push({ 
        label: lang?.label || selectedLanguage, 
        onClick: () => { setCurrentView('subcategories'); setSelectedSubcategory(''); setShowInstructions(false); } 
      });
    }
    
    if (selectedSubcategory) {
      crumbs.push({ 
        label: selectedSubcategory, 
        onClick: () => { setCurrentView('levels'); setSelectedLevel(''); setShowInstructions(false); } 
      });
    }
    
    if (selectedLevel) {
      const level = LEVELS.find(l => l.value === selectedLevel);
      crumbs.push({ label: level?.label || selectedLevel });
    }
    
    return crumbs;
  };

  const renderLanguageSelection = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Choose Your Programming Language</h3>
        <p className="text-blue-700">Select a programming language to start practicing problems.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.value}
            onClick={() => handleLanguageSelect(lang.value)}
            className={`bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all transform hover:scale-105 border-2 border-transparent hover:border-${lang.color}-400`}
          >
            <div className="text-6xl mb-4">{lang.icon}</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{lang.label}</h3>
            <p className="text-gray-600">
              {problemCounts[lang.value] || 0} problems available
            </p>
          </button>
        ))}
      </div>
    </div>
  );

  const renderSubcategorySelection = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Select Problem Category</h3>
        <p className="text-blue-700">Choose a category to focus on specific types of problems.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subcategories.map((subcategory) => (
          <button
            key={subcategory}
            onClick={() => handleSubcategorySelect(subcategory)}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all hover:bg-indigo-50 border border-gray-200"
          >
            <FolderOpen className="h-8 w-8 text-indigo-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-800">{subcategory}</h3>
          </button>
        ))}
      </div>
    </div>
  );

  const renderLevelSelection = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Select Difficulty Level</h3>
        <p className="text-blue-700">Choose a difficulty level that matches your current skill level.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {LEVELS.map((level) => (
          <button
            key={level.value}
            onClick={() => handleLevelSelect(level.value)}
            className={`bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all transform hover:scale-105 border-2 border-transparent hover:border-${level.color}-400`}
          >
            <div className="text-5xl mb-4">{level.icon}</div>
            <h3 className="text-2xl font-bold text-gray-800">{level.label}</h3>
            <p className="text-gray-600 mt-2 text-sm">{level.description}</p>
          </button>
        ))}
      </div>
    </div>
  );

  const renderInstructions = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <AlertCircle className="h-6 w-6 text-blue-600" />
          Test Instructions
        </h2>
        
        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-3">
            <CheckSquare2 className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-semibold">Number of Questions</h4>
              <p className="text-gray-600">You will be presented with 10 questions in this test.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold">Time Limit</h4>
              <p className="text-gray-600">Total time allocated: 1 hour 30 minutes (90 minutes)</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h4 className="font-semibold">Important Notes</h4>
              <ul className="text-gray-600 list-disc list-inside space-y-1">
                <li>Once you start the test, the timer will begin immediately</li>
                <li>You can navigate between questions using Previous/Next buttons</li>
                <li>All your progress will be saved automatically</li>
                <li>Test will auto-submit when time expires</li>
                <li>Each problem has multiple test cases to validate your solution</li>
              </ul>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Target className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <h4 className="font-semibold">Scoring</h4>
              <p className="text-gray-600">Each problem carries equal marks. Your score will be based on the number of test cases passed.</p>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 font-medium">
            ⚠️ Please ensure you have a stable internet connection before starting the test.
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleStartTest}
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
          >
            Start Test
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with breadcrumbs */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Technical Courses</h1>
          
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-sm">
            {(currentView !== 'languages' || showInstructions) && (
              <button
                onClick={handleBack}
                className="text-gray-500 hover:text-gray-700 mr-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            {getBreadcrumbs().map((crumb, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && <span className="mx-2 text-gray-400">/</span>}
                {crumb.onClick ? (
                  <button
                    onClick={crumb.onClick}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className="text-gray-900 font-medium">{crumb.label}</span>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="mt-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <>
              {!showInstructions && currentView === 'languages' && renderLanguageSelection()}
              {!showInstructions && currentView === 'subcategories' && renderSubcategorySelection()}
              {!showInstructions && currentView === 'levels' && renderLevelSelection()}
              {showInstructions && renderInstructions()}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 