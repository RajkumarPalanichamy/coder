"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Code2, FolderOpen, Target, ArrowLeft } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import { useRouter } from 'next/navigation';

// Language configuration with icons
const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript', icon: '🟨', color: 'yellow' },
  { value: 'python', label: 'Python', icon: '🐍', color: 'blue' },
  { value: 'java', label: 'Java', icon: '☕', color: 'orange' },
  { value: 'cpp', label: 'C++', icon: '⚡', color: 'purple' },
  { value: 'c', label: 'C', icon: '🔧', color: 'gray' }
];

const LEVELS = [
  { value: 'level1', label: 'Level 1', color: 'green', icon: '🟢' },
  { value: 'level2', label: 'Level 2', color: 'yellow', icon: '🟡' },
  { value: 'level3', label: 'Level 3', color: 'red', icon: '🔴' }
];

export default function AdminProblemsPage() {
  const router = useRouter();
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [problemCounts, setProblemCounts] = useState({});

  // Navigation state
  const [currentView, setCurrentView] = useState('languages'); // languages, subcategories, levels, problems

  useEffect(() => {
    fetchProblemCounts();
  }, []);

  useEffect(() => {
    if (selectedLanguage && currentView === 'subcategories') {
      fetchSubcategories();
    }
  }, [selectedLanguage, currentView]);

  useEffect(() => {
    if (selectedLanguage && selectedSubcategory && selectedLevel && currentView === 'problems') {
      fetchProblems();
    }
  }, [selectedLanguage, selectedSubcategory, selectedLevel, currentView]);

  const fetchProblemCounts = async () => {
    try {
      const res = await fetch('/api/admin/problems/counts');
      const data = await res.json();
      setProblemCounts(data);
    } catch (err) {
      console.error('Error fetching problem counts:', err);
    }
  };

  const fetchSubcategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/problems/subcategories?language=${encodeURIComponent(selectedLanguage)}`);
      const data = await res.json();
      setSubcategories(data.subcategories || ['Basic Problems', 'Arrays', 'Strings', 'Algorithms', 'Data Structures']);
    } catch (err) {
      setSubcategories(['Basic Problems', 'Arrays', 'Strings', 'Algorithms', 'Data Structures']);
    } finally {
      setLoading(false);
    }
  };

  const fetchProblems = async () => {
    setLoading(true);
    setError("");
    try {
      const params = [];
      params.push(`language=${encodeURIComponent(selectedLanguage)}`);
      params.push(`subcategory=${encodeURIComponent(selectedSubcategory)}`);
      params.push(`difficulty=${encodeURIComponent(selectedLevel)}`);
      const query = `?${params.join('&')}`;
      
      const res = await fetch(`/api/admin/problems${query}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setProblems(data.problems || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this problem?")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/admin/problems/${id}`, { method: "DELETE" });
      setProblems(problems.filter((p) => p._id !== id));
      fetchProblemCounts(); // Update counts
    } catch {
      alert("Failed to delete problem.");
    } finally {
      setDeletingId(null);
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
    setCurrentView('problems');
  };

  const handleBack = () => {
    if (currentView === 'problems') {
      setSelectedLevel("");
      setCurrentView('levels');
    } else if (currentView === 'levels') {
      setSelectedSubcategory("");
      setCurrentView('subcategories');
    } else if (currentView === 'subcategories') {
      setSelectedLanguage("");
      setCurrentView('languages');
    }
  };

  const getBreadcrumbs = () => {
    const crumbs = [];
    crumbs.push({ label: 'Languages', onClick: () => { setCurrentView('languages'); setSelectedLanguage(''); } });
    
    if (selectedLanguage) {
      const lang = LANGUAGES.find(l => l.value === selectedLanguage);
      crumbs.push({ 
        label: lang?.label || selectedLanguage, 
        onClick: () => { setCurrentView('subcategories'); setSelectedSubcategory(''); } 
      });
    }
    
    if (selectedSubcategory) {
      crumbs.push({ 
        label: selectedSubcategory, 
        onClick: () => { setCurrentView('levels'); setSelectedLevel(''); } 
      });
    }
    
    if (selectedLevel) {
      const level = LEVELS.find(l => l.value === selectedLevel);
      crumbs.push({ label: level?.label || selectedLevel });
    }
    
    return crumbs;
  };

  const renderLanguageSelection = () => (
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
            {problemCounts[lang.value] || 0} problems
          </p>
        </button>
      ))}
    </div>
  );

  const renderSubcategorySelection = () => (
    <div className="space-y-4">
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {LEVELS.map((level) => (
        <button
          key={level.value}
          onClick={() => handleLevelSelect(level.value)}
          className={`bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all transform hover:scale-105 border-2 border-transparent hover:border-${level.color}-400`}
        >
          <div className="text-5xl mb-4">{level.icon}</div>
          <h3 className="text-2xl font-bold text-gray-800">{level.label}</h3>
          <p className="text-gray-600 mt-2">Click to view problems</p>
        </button>
      ))}
    </div>
  );

  const renderProblems = () => (
    <div className="bg-white rounded-lg shadow">
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading problems...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : problems.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No problems found.</p>
          <Link
            href={`/admin/problems/create?language=${selectedLanguage}&subcategory=${selectedSubcategory}&level=${selectedLevel}`}
            className="mt-4 inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" /> Create First Problem
          </Link>
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {problems.map((problem) => (
              <tr key={problem._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{problem.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${problem.difficulty === 'level1' ? 'bg-green-100 text-green-800' : 
                      problem.difficulty === 'level2' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'}`}>
                    {LEVELS.find(l => l.value === problem.difficulty)?.label || problem.difficulty}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${problem.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {problem.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link
                    href={`/admin/problems/${problem._id}/edit`}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    <Edit className="h-4 w-4 inline" /> Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(problem._id)}
                    className="text-red-600 hover:text-red-900"
                    disabled={deletingId === problem._id}
                  >
                    <Trash2 className="h-4 w-4 inline" /> 
                    {deletingId === problem._id ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <AdminSidebar onLogout={handleLogout} />
      <main className="flex-1 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Header with breadcrumbs */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">Technical Courses</h1>
              {currentView === 'problems' && (
                <Link
                  href={`/admin/problems/create?language=${selectedLanguage}&subcategory=${selectedSubcategory}&level=${selectedLevel}`}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" /> Add Problem
                </Link>
              )}
            </div>
            
            {/* Breadcrumbs */}
            <nav className="flex items-center space-x-2 text-sm">
              {currentView !== 'languages' && (
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
            {currentView === 'languages' && renderLanguageSelection()}
            {currentView === 'subcategories' && renderSubcategorySelection()}
            {currentView === 'levels' && renderLevelSelection()}
            {currentView === 'problems' && renderProblems()}
          </div>
        </div>
      </main>
    </div>
  );
} 