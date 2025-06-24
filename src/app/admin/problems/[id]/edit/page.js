'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Edit } from 'lucide-react';
import AdminSidebar from '../../../../components/AdminSidebar';

export default function AdminProblemEditPage() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'easy',
    category: '',
    constraints: '',
    starterCode: '',
    solution: '',
    tags: '',
    isActive: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchProblem();
  }, [id]);

  const fetchProblem = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/problems/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch problem');
      setFormData({
        title: data.problem.title,
        description: data.problem.description,
        difficulty: data.problem.difficulty,
        category: data.problem.category,
        constraints: data.problem.constraints,
        starterCode: data.problem.starterCode,
        solution: data.problem.solution,
        tags: (data.problem.tags || []).join(', '),
        isActive: data.problem.isActive
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`/api/admin/problems/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update problem');
      setSuccess('Problem updated successfully!');
      setTimeout(() => router.push('/admin/dashboard?tab=problems'), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-lg mx-auto py-8">
          <Link href="/admin/problems" className="inline-flex items-center text-indigo-600 hover:underline mb-4">
            &#8592; Back to Problems
          </Link>
          <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg w-full space-y-8 bg-white p-8 rounded shadow">
              <div className="flex items-center justify-center">
                <Edit className="h-8 w-8 text-indigo-600" />
              </div>
              <h2 className="mt-2 text-center text-2xl font-extrabold text-gray-900">Edit Problem</h2>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : (
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                  {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">{error}</div>}
                  {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded">{success}</div>}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                    <input id="title" name="title" type="text" required value={formData.title} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea id="description" name="description" required value={formData.description} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" rows={4} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">Difficulty</label>
                      <select id="difficulty" name="difficulty" value={formData.difficulty} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                      <input id="category" name="category" type="text" required value={formData.category} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="constraints" className="block text-sm font-medium text-gray-700">Constraints</label>
                    <textarea id="constraints" name="constraints" required value={formData.constraints} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" rows={2} />
                  </div>
                  <div>
                    <label htmlFor="starterCode" className="block text-sm font-medium text-gray-700">Starter Code</label>
                    <textarea id="starterCode" name="starterCode" required value={formData.starterCode} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md font-mono" rows={3} />
                  </div>
                  <div>
                    <label htmlFor="solution" className="block text-sm font-medium text-gray-700">Solution</label>
                    <textarea id="solution" name="solution" required value={formData.solution} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md font-mono" rows={3} />
                  </div>
                  <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
                    <input id="tags" name="tags" type="text" value={formData.tags} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                  <div className="flex items-center">
                    <input id="isActive" name="isActive" type="checkbox" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">Active</label>
                  </div>
                  <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">
                    {loading ? 'Updating...' : 'Update Problem'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 