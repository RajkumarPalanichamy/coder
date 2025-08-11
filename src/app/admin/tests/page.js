"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Edit, Trash2, Plus, BarChart3, ArrowLeft, BookOpen, FolderOpen, Target, Code2 } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import LanguageCard from '../../components/LanguageCard';
import CategoryCard from '../../components/CategoryCard';
import LevelCard from '../../components/LevelCard';
import { useRouter } from 'next/navigation';

export default function AdminTestsPage() {
  const router = useRouter();
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const [tests, setTests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [showLanguages, setShowLanguages] = useState(true);
  const [showCategories, setShowCategories] = useState(false);
  const [showLevels, setShowLevels] = useState(false);

  useEffect(() => {
    if (showLanguages) {
      fetchLanguages();
    }
  }, [showLanguages]);

  useEffect(() => {
    if (selectedLanguage && showCategories) {
      fetchCategoriesByLanguage();
    }
  }, [selectedLanguage, showCategories]);

  useEffect(() => {
    if (selectedLanguage && selectedCategory && showLevels) {
      fetchLevelsByLanguageAndCategory();
    }
  }, [selectedLanguage, selectedCategory, showLevels]);

  useEffect(() => {
    if (selectedLanguage && selectedCategory && selectedLevel) {
      fetchTestsByLanguageCategoryLevel();
    }
  }, [selectedLanguage, selectedCategory, selectedLevel]);

  const fetchLanguages = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch('/api/admin/tests/meta');
      if (!res.ok) {
        throw new Error('Failed to fetch languages');
      }
      const data = await res.json();
      setLanguages(data.languages || []);
    } catch (err) {
      setError(err.message);
      setLanguages([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoriesByLanguage = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/tests/categories?language=${encodeURIComponent(selectedLanguage)}`);
      if (!res.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      setError(err.message);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLevelsByLanguageAndCategory = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/tests/levels?language=${encodeURIComponent(selectedLanguage)}&category=${encodeURIComponent(selectedCategory)}`);
      if (!res.ok) {
        throw new Error('Failed to fetch levels');
      }
      const data = await res.json();
      setLevels(data.levels || []);
    } catch (err) {
      setError(err.message);
      setLevels([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTestsByLanguageCategoryLevel = async () => {
    setLoading(true);
    setError("");
    try {
      const params = [];
      if (selectedLanguage) params.push(`language=${encodeURIComponent(selectedLanguage)}`);
      if (selectedCategory) params.push(`category=${encodeURIComponent(selectedCategory)}`);
      if (selectedLevel) params.push(`level=${encodeURIComponent(selectedLevel)}`);
      const query = params.length ? `?${params.join('&')}` : '';
      
      const res = await fetch(`/api/admin/tests${query}`);
      if (!res.ok) {
        throw new Error('Failed to fetch tests');
      }
      const data = await res.json();
      setTests(data.tests || []);
    } catch (err) {
      setError(err.message);
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    setSelectedCategory("");
    setSelectedLevel("");
    setShowLanguages(false);
    setShowCategories(true);
    setShowLevels(false);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedLevel("");
    setShowCategories(false);
    setShowLevels(true);
  };

  const handleLevelSelect = (level) => {
    setSelectedLevel(level);
    setShowLevels(false);
  };

  const handleBackToLanguages = () => {
    setSelectedLanguage("");
    setSelectedCategory("");
    setSelectedLevel("");
    setShowLanguages(true);
    setShowCategories(false);
    setShowLevels(false);
  };

  const handleBackToCategories = () => {
    setSelectedCategory("");
    setSelectedLevel("");
    setShowCategories(true);
    setShowLevels(false);
  };

  const handleBackToLevels = () => {
    setSelectedLevel("");
    setShowLevels(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this test?")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/admin/tests/${id}`, { method: "DELETE" });
      setTests(tests.filter((t) => t._id !== id));
    } catch {
      alert("Failed to delete test.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatLevelName = (level) => {
    switch (level) {
      case 'level1': return 'Level 1';
      case 'level2': return 'Level 2';
      case 'level3': return 'Level 3';
      default: return level;
    }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar onLogout={handleLogout} />
      <main className="flex-1 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto py-10 px-4 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 border-b pb-4">
            <div className="flex items-center gap-4">
              {!showLanguages && (
                <button
                  onClick={
                    showCategories ? handleBackToLanguages : 
                    showLevels ? handleBackToCategories : 
                    selectedLevel ? handleBackToLevels : 
                    handleBackToLanguages
                  }
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {showCategories ? 'Back to Languages' : 
                   showLevels ? 'Back to Categories' : 
                   selectedLevel ? 'Back to Levels' : 
                   'Back to Languages'}
                </button>
              )}
              <div>
                <h1 className="text-3xl font-bold text-black">
                  {showLanguages 
                    ? 'Aptitude Tests by Language' 
                    : showCategories 
                      ? 'Choose Test Category'
                      : showLevels
                        ? 'Choose Difficulty Level'
                        : 'Aptitude Tests Management'
                  }
                </h1>
                {!showLanguages && selectedLanguage && (
                  <p className="text-gray-600 mt-1">
                    Language: {selectedLanguage.toUpperCase()}
                    {selectedCategory && ` - Category: ${selectedCategory}`}
                    {selectedLevel && ` - Level: ${formatLevelName(selectedLevel)}`}
                  </p>
                )}
              </div>
            </div>
            <Link href="/admin/tests/create" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Test
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">{error}</div>
          ) : showLanguages ? (
            // Show languages
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Code2 className="h-6 w-6 text-indigo-500" />
                <h2 className="text-xl font-semibold text-gray-800">Choose a Programming Language</h2>
              </div>
              {languages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">📚</div>
                  <p className="text-lg mb-2">No test languages found</p>
                  <p>Create your first aptitude test to get started!</p>
                  <Link href="/admin/tests/create" className="inline-block mt-4 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
                    Create First Test
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {languages.map((langData) => (
                    <LanguageCard
                      key={langData.language}
                      language={langData.language}
                      problemCount={langData.count}
                      onClick={() => handleLanguageSelect(langData.language)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : showCategories ? (
            // Show categories
            <div>
              <div className="flex items-center gap-2 mb-6">
                <FolderOpen className="h-6 w-6 text-indigo-500" />
                <h2 className="text-xl font-semibold text-gray-800">Choose Test Category for {selectedLanguage.toUpperCase()}</h2>
              </div>
              {categories.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-lg mb-2">No test categories found for {selectedLanguage}</p>
                  <p>Create your first test to get started!</p>
                  <Link href="/admin/tests/create" className="inline-block mt-4 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
                    Create First Test
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((categoryData) => (
                    <CategoryCard
                      key={categoryData.category}
                      category={categoryData.category}
                      problemCount={categoryData.count}
                      onClick={() => handleCategorySelect(categoryData.category)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : showLevels ? (
            // Show levels
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Target className="h-6 w-6 text-indigo-500" />
                <h2 className="text-xl font-semibold text-gray-800">Choose Difficulty Level for {selectedLanguage.toUpperCase()} - {selectedCategory}</h2>
              </div>
              {levels.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">🎯</div>
                  <p className="text-lg mb-2">No difficulty levels found for {selectedLanguage} - {selectedCategory}</p>
                  <p>Create your first test to get started!</p>
                  <Link href="/admin/tests/create" className="inline-block mt-4 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
                    Create First Test
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {levels.map((levelData) => (
                    <LevelCard
                      key={levelData.level}
                      level={levelData.level}
                      problemCount={levelData.count}
                      onClick={() => handleLevelSelect(levelData.level)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Show tests for selected language/category/level
            <div>
              {tests.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">📝</div>
                  <p>No tests found for {selectedLanguage.toUpperCase()} - {selectedCategory} - {formatLevelName(selectedLevel)}.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded shadow bg-white mt-4">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questions</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {tests.map((test) => (
                        <tr key={test._id} className="hover:bg-indigo-50 transition-colors">
                          <td className="px-6 py-4 text-black font-medium">{test.title}</td>
                          <td className="px-6 py-4 text-gray-700 whitespace-pre-wrap max-w-xs truncate">{test.description}</td>
                          <td className="px-6 py-4 text-gray-700 capitalize">{test.language}</td>
                          <td className="px-6 py-4 text-gray-700">{test.category}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              test.level === 'level1' ? 'bg-green-100 text-green-800' :
                              test.level === 'level2' ? 'bg-yellow-100 text-yellow-800' :
                              test.level === 'level3' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {formatLevelName(test.level)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-700">{test.mcqs?.length || 0}</td>
                          <td className="px-6 py-4 text-gray-700">{test.duration} min</td>
                          <td className="px-6 py-4 flex gap-2 flex-wrap">
                            <Link href={`/admin/tests/${test._id}/edit`} className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1 text-sm">
                              <Edit className="h-4 w-4" /> Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(test._id)}
                              className="text-red-600 hover:text-red-900 flex items-center gap-1 text-sm"
                              disabled={deletingId === test._id}
                            >
                              <Trash2 className="h-4 w-4" />
                              {deletingId === test._id ? 'Deleting...' : 'Delete'}
                            </button>
                            <Link href={`/admin/tests/${test._id}/submissions`} className="text-blue-600 hover:text-blue-900 flex items-center gap-1 text-sm">
                              <BarChart3 className="h-4 w-4" /> Submissions
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 