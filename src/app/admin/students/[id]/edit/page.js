'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Edit } from 'lucide-react';

export default function AdminStudentEditPage() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    isActive: true,
  });
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/students/${id}`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch student');
      setFormData({
        username: data.student.username,
        email: data.student.email,
        firstName: data.student.firstName,
        lastName: data.student.lastName,
        isActive: data.student.isActive
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
      const updateData = { ...formData };
      if (password) updateData.password = password;
      const response = await fetch(`/api/admin/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updateData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update student');
      setSuccess('Student updated successfully!');
      setTimeout(() => router.push('/admin/dashboard?tab=students'), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded shadow">
        <div className="flex items-center justify-center">
          <Edit className="h-8 w-8 text-indigo-600" />
        </div>
        <h2 className="mt-2 text-center text-2xl font-extrabold text-gray-900">Edit Student</h2>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">{error}</div>}
            {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded">{success}</div>}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                <input id="firstName" name="firstName" type="text" required value={formData.firstName} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                <input id="lastName" name="lastName" type="text" required value={formData.lastName} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
              <input id="username" name="username" type="text" required value={formData.username} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password (leave blank to keep unchanged)</label>
              <input id="password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" autoComplete="new-password" />
            </div>
            <div className="flex items-center">
              <input id="isActive" name="isActive" type="checkbox" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">Active</label>
            </div>
            <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">
              {loading ? 'Updating...' : 'Update Student'}
            </button>
            <div className="text-center mt-2">
              <Link href="/admin/dashboard?tab=students" className="text-indigo-600 hover:underline">Back to Students</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 