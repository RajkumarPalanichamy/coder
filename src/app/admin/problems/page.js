"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Code, ArrowLeft } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import { useRouter, useSearchParams } from 'next/navigation';
import { getLanguageConfig } from '@/lib/languageConfig';

export default function AdminProblemsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedLanguage = searchParams.get('language');
  
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };
  
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [languagesLoading, setLanguagesLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [selected, setSelected] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState([]);

  useEffect(() => {
    fetchMeta();
  }, []);

  useEffect(() => {
    if (selectedLanguage) {
      fetchProblems();
    }
  }, [selectedLanguage]);

  const fetchMeta = async () => {
    setLanguagesLoading(true);
    try {
      const res = await fetch('/api/admin/problems/meta', {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAvailableLanguages(data.languages || []);
    } catch (err) {
      console.error('Error fetching meta:', err);
    } finally {
      setLanguagesLoading(false);
    }
  };

  const fetchProblems = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/problems${selectedLanguage ? `?language=${selectedLanguage}` : ""}`, {
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

  const handleLanguageClick = (languageValue) => {
    router.push(`/admin/problems?language=${languageValue}`);
  };

  // If no language is selected, show language cards
  if (!selectedLanguage) {
    return (
      <div className="flex min-h-screen">
        <AdminSidebar onLogout={handleLogout} />
        <main className="flex-1 bg-gray-50 min-h-screen">
          <div className="max-w-6xl mx-auto py-10 px-4 sm:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 border-b pb-4">
              <h1 className="text-3xl font-bold text-black">Problems Management</h1>
              <Link href="/admin/problems/create" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Problem
              </Link>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Choose Programming Language</h2>
              {languagesLoading ? (
                <div className="text-center py-12 text-gray-500">Loading languages...</div>
              ) : availableLanguages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No programming languages available.</p>
                  <p className="text-sm mt-2">Create some problems to see language options.</p>
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
                           Manage {config.displayName} programming problems
                         </p>
                        <div className="mt-4 flex items-center justify-end">
                          <span className="text-sm font-medium">Manage Problems →</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">All Languages</h3>
              <div 
                onClick={() => router.push('/admin/problems?language=all')}
                className="bg-gray-100 text-gray-800 border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">📋</div>
                    <div>
                      <h4 className="font-semibold">All Problems</h4>
                      <p className="text-sm opacity-80">View and manage all problems regardless of language</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium">Manage All →</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // If language is selected, show filtered problems table
  const currentLanguageConfig = getLanguageConfig(selectedLanguage);
  const isAllLanguages = selectedLanguage === 'all';
  
  return (
    <div className="flex min-h-screen">
      <AdminSidebar onLogout={handleLogout} />
      <main className="flex-1 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto py-10 px-4 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 border-b pb-4">
            <div className="flex items-center gap-4">
              <Link 
                href="/admin/problems" 
                className="flex items-center gap-2 text-indigo-500 hover:text-indigo-700"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back</span>
              </Link>
                              <div className="flex items-center gap-2">
                  {!isAllLanguages && <span className="text-2xl">{currentLanguageConfig.icon}</span>}
                  <h1 className="text-3xl font-bold text-black">
                    {isAllLanguages ? 'All Problems' : `${currentLanguageConfig.displayName} Problems`}
                  </h1>
                </div>
            </div>
            <Link href="/admin/problems/create" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Problem
            </Link>
          </div>
          
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
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">{error}</div>
          ) : problems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No {isAllLanguages ? '' : currentLanguageConfig.displayName} problems found.</p>
              <Link 
                href="/admin/problems" 
                className="text-indigo-500 hover:text-indigo-700 mt-2 inline-block"
              >
                Choose another language
              </Link>
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
        </div>
      </main>
    </div>
  );
} 