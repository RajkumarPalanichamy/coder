'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function AdminProblemCreatePage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'easy',
    category: '',
    constraints: '',
    starterCode: '',
    solution: '',
    tags: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch('/api/admin/problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create problem');
      setSuccess('Problem created successfully!');
      setTimeout(() => router.push('/admin/dashboard?tab=problems'), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 bg-white p-8 rounded shadow">
        <div className="flex items-center justify-center">
          <Plus className="h-8 w-8 text-indigo-600" />
        </div>
        <h2 className="mt-2 text-center text-2xl font-extrabold text-gray-900">Add New Problem</h2>
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
          <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Problem'}
          </button>
          <div className="text-center mt-2">
            <Link href="/admin/dashboard?tab=problems" className="text-indigo-600 hover:underline">Back to Problems</Link>
          </div>
        </form>
      </div>
    </div>
  );
} 