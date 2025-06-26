"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Edit, Trash2, Plus, BarChart3 } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';

export default function AdminTestsPage() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch('/api/admin/tests');
      const data = await res.json();
      setTests(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto py-10 px-4 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 border-b pb-4">
            <h1 className="text-3xl font-bold text-black">Tests Management</h1>
            <Link href="/admin/tests/create" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Test
            </Link>
          </div>
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">{error}</div>
          ) : tests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No tests found.</div>
          ) : (
            <div className="overflow-x-auto rounded shadow bg-white mt-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {tests.map((test) => (
                    <tr key={test._id} className="hover:bg-indigo-50 transition-colors">
                      <td className="px-6 py-4 text-black font-medium">{test.title}</td>
                      <td className="px-6 py-4 text-gray-700">{test.description}</td>
                      <td className="px-6 py-4 text-gray-700">{test.language}</td>
                      <td className="px-6 py-4 flex gap-2">
                        <Link href={`/admin/tests/${test._id}/edit`} className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1">
                          <Edit className="h-4 w-4" /> Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(test._id)}
                          className="text-red-600 hover:text-red-900 flex items-center gap-1"
                          disabled={deletingId === test._id}
                        >
                          <Trash2 className="h-4 w-4" />
                          {deletingId === test._id ? 'Deleting...' : 'Delete'}
                        </button>
                        <Link href={`/admin/tests/${test._id}/submissions`} className="text-blue-600 hover:text-blue-900 flex items-center gap-1">
                          <BarChart3 className="h-4 w-4" /> View Submissions
                        </Link>
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