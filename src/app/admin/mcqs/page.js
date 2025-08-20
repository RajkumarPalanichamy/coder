"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, CheckCircle } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import { useRouter } from 'next/navigation';

export default function MCQListPage() {
  const router = useRouter();
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    router.push('/login');
  };
  const [mcqs, setMcqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchMCQs();
  }, []);

  const fetchMCQs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch('/api/admin/mcqs', { credentials: 'include' });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMcqs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this MCQ?')) return;
    setDeletingId(id);
    try {
      await fetch(`/api/admin/mcqs/${id}`, { method: 'DELETE', credentials: 'include' });
      setMcqs(mcqs.filter(m => m._id !== id));
    } catch {
      alert('Failed to delete MCQ.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar onLogout={handleLogout} />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-4xl mx-auto py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <h1 className="text-2xl font-bold text-black">MCQ Management</h1>
            <Link href="/admin/mcqs/create" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 flex items-center gap-2">
              <Plus className="h-4 w-4" /> New MCQ
            </Link>
          </div>
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">{error}</div>
          ) : mcqs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No MCQs found.</div>
          ) : (
            <div className="overflow-x-auto rounded shadow bg-white">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Options</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correct</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {mcqs.map((mcq) => (
                    <tr key={mcq._id} className="hover:bg-indigo-50 transition-colors">
                      <td className="px-6 py-4 text-black font-medium max-w-xs truncate">{mcq.question}</td>
                      <td className="px-6 py-4 text-gray-700">
                        <ol className="list-decimal ml-4">
                          {mcq.options.map((opt, idx) => (
                            <li key={idx} className={idx === mcq.correctOption ? 'font-semibold text-green-700' : ''}>{opt}</li>
                          ))}
                        </ol>
                      </td>
                      <td className="px-6 py-4 text-green-700 font-bold flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        {mcq.options[mcq.correctOption]}
                      </td>
                      <td className="px-6 py-4 text-gray-500">{mcq.language}</td>
                      <td className="px-6 py-4 flex gap-2">
                        <Link href={`/admin/mcqs/${mcq._id}/edit`} className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1">
                          <Edit className="h-4 w-4" /> Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(mcq._id)}
                          className="text-red-600 hover:text-red-900 flex items-center gap-1"
                          disabled={deletingId === mcq._id}
                        >
                          <Trash2 className="h-4 w-4" />
                          {deletingId === mcq._id ? 'Deleting...' : 'Delete'}
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