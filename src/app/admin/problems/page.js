"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Code2, FolderOpen } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import LanguageCard from '../../components/LanguageCard';
import CategoryCard from '../../components/CategoryCard';
import Loader from '../../components/Loader';
import { useRouter } from 'next/navigation';

export default function AdminProblemsPage() {
  const router = useRouter();
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [languagesLoading, setLanguagesLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState("");
  const [category, setCategory] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [selected, setSelected] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [languages, setLanguages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showLanguageCards, setShowLanguageCards] = useState(true);
  const [showCategoryCards, setShowCategoryCards] = useState(false);

  useEffect(() => {
    fetchLanguages();
  }, []);

  useEffect(() => {
    if (language && !category) {
      fetchCategories();
    }
  }, [language]);

  useEffect(() => {
    if (language && category) {
      fetchProblems();
    }
  }, [language, category]);

  const fetchLanguages = async () => {
    setLanguagesLoading(true);
    try {
      const res = await fetch('/api/admin/problems/meta', {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setLanguages(data.languages || []);
    } catch (err) {
      console.error('Error fetching languages:', err);
    } finally {
      setLanguagesLoading(false);
    }
  };

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await fetch(`/api/admin/problems/categories?language=${language}`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCategories(data.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchProblems = async () => {
    setLoading(true);
    setError("");
    try {
      const params = [];
      if (language) params.push(`language=${language}`);
      if (category) params.push(`category=${category}`);
      const query = params.length ? `?${params.join('&')}` : '';
      const res = await fetch(`/api/admin/problems${query}`, {
        credentials: 'include'
      });
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
      await fetch(`/api/admin/problems/${id}`, { 
        method: "DELETE",
        credentials: 'include'
      });
      setProblems(problems.filter((p) => p._id !== id));
    } catch {
      alert("Failed to delete problem.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selected.length === problems.length) {
      setSelected([]);
    } else {
      setSelected(problems.map((p) => p._id));
    }
  };

    const handleBulkDelete = async () => {
    if (selected.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selected.length} problems?`)) return;
    setBulkDeleting(true);
    try {
      await Promise.all(selected.map(id => fetch(`/api/admin/problems/${id}`, { 
        method: 'DELETE',
        credentials: 'include'
      })));
      setProblems(problems.filter((p) => !selected.includes(p._id)));
      setSelected([]);
    } catch {
      alert('Failed to delete selected problems.');
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleLanguageCardClick = (selectedLanguage) => {
    setLanguage(selectedLanguage);
    setCategory('');
    setShowLanguageCards(false);
    setShowCategoryCards(true);
  };

  const handleCategoryCardClick = (selectedCategory) => {
    setCategory(selectedCategory);
    setShowCategoryCards(false);
  };

  const handleBackToLanguages = () => {
    setLanguage("");
    setCategory("");
    setShowLanguageCards(true);
    setShowCategoryCards(false);
  };

  const handleBackToCategories = () => {
    setCategory("");
    setShowCategoryCards(true);
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar onLogout={handleLogout} />
      <main className="flex-1 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto py-10 px-4 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 border-b pb-4">
            <div className="flex items-center gap-3">
              {!showLanguageCards && (
                <button
                  onClick={showCategoryCards ? handleBackToLanguages : category ? handleBackToCategories : handleBackToLanguages}
                  className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {showCategoryCards ? 'Back to Languages' : category ? 'Back to Categories' : 'Back to Languages'}
                </button>
              )}
              <div>
                <h1 className="text-3xl font-bold text-black">
                  {showLanguageCards 
                    ? 'Problems by Language' 
                    : showCategoryCards 
                      ? 'Choose Problem Category' 
                      : 'Problems Management'
                  }
                </h1>
                {!showLanguageCards && language && (
                  <p className="text-gray-600 mt-1">
                    Showing {language.toUpperCase()} problems
                    {category && ` - ${category}`}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <Link href="/admin/problems/create" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Problem
              </Link>
            </div>
          </div>
          {/* Language Cards View */}
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
                  <p>No programming languages found. Create some problems first!</p>
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
                  <p>No categories found for {language}. Create some problems first!</p>
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
              {/* Bulk Delete Button */}
              {selected.length > 0 && (
                <div className="mb-4 flex items-center gap-4">
                  <button
                    onClick={handleBulkDelete}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
                    disabled={bulkDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                    {bulkDeleting ? 'Deleting...' : `Delete Selected (${selected.length})`}
                  </button>
                </div>
              )}
          {loading ? (
            <Loader type="table" />
          ) : error ? (
            <div className="text-center py-12 text-red-500">{error}</div>
          ) : problems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No problems found for {language.toUpperCase()} - {category}.
            </div>
          ) : (
            <div className="overflow-x-auto rounded shadow bg-white mt-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.length === problems.length && problems.length > 0}
                        onChange={handleSelectAll}
                        aria-label="Select all problems"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {problems.map((problem) => (
                    <tr key={problem._id} className="hover:bg-indigo-50 transition-colors">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selected.includes(problem._id)}
                          onChange={() => handleSelect(problem._id)}
                          aria-label={`Select problem ${problem.title}`}
                        />
                      </td>
                      <td className="px-6 py-4 text-black font-medium">{problem.title}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          problem.difficulty === 'level1' ? 'bg-green-100 text-green-800' :
                          problem.difficulty === 'level2' ? 'bg-yellow-100 text-yellow-800' :
                          problem.difficulty === 'level3' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {problem.difficulty === 'level1' ? 'Level 1' : problem.difficulty === 'level2' ? 'Level 2' : problem.difficulty === 'level3' ? 'Level 3' : problem.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{problem.category}</td>
                      <td className="px-6 py-4">
                        {problem.programmingLanguage && (
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700 capitalize">
                            {problem.programmingLanguage}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500">{(problem.tags || []).join(', ')}</td>
                      <td className="px-6 py-4 flex gap-2">
                        <Link href={`/admin/problems/${problem._id}/edit`} className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1">
                          <Edit className="h-4 w-4" /> Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(problem._id)}
                          className="text-red-600 hover:text-red-900 flex items-center gap-1"
                          disabled={deletingId === problem._id}
                        >
                          <Trash2 className="h-4 w-4" />
                          {deletingId === problem._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
            </>
          )}
        </div>
      </main>
    </div>
  );
} 