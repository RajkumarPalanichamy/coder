"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2 } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import { useRouter } from 'next/navigation';

export default function AdminProblemsPage() {
  const router = useRouter();
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [selected, setSelected] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  useEffect(() => {
    fetchProblems();
  }, [language]);

  const fetchProblems = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/problems${language ? `?language=${language}` : ""}`);
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
      await Promise.all(selected.map(id => fetch(`/api/admin/problems/${id}`, { method: 'DELETE' })));
      setProblems(problems.filter((p) => !selected.includes(p._id)));
      setSelected([]);
    } catch {
      alert('Failed to delete selected problems.');
    } finally {
      setBulkDeleting(false);
    }
  };

  const LANGUAGES = [
    { label: "All", value: "" },
    { label: "JavaScript", value: "javascript" },
    { label: "Python", value: "python" },
    { label: "Java", value: "java" },
    { label: "C++", value: "cpp" },
    { label: "C", value: "c" },
  ];

  return (
    <div className="flex min-h-screen">
      <AdminSidebar onLogout={handleLogout} />
      <main className="flex-1 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto py-10 px-4 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 border-b pb-4">
            <h1 className="text-3xl font-bold text-black">Problems Management</h1>
            <div className="flex gap-2 items-center">
              <select
                className="border rounded px-3 py-2 text-black"
                value={language}
                onChange={e => setLanguage(e.target.value)}
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
              <Link href="/admin/problems/create" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Problem
              </Link>
            </div>
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
            <div className="text-center py-12 text-gray-500">No problems found.</div>
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