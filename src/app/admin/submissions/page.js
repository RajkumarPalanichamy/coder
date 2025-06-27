'use client';
import { useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';

export default function AdminSubmissionsPage() {
  const [problemSubmissions, setProblemSubmissions] = useState([]);
  const [testSubmissions, setTestSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const [problemRes, testRes] = await Promise.all([
        fetch('/api/admin/submissions'),
        fetch('/api/admin/tests/submissions'),
      ]);
      const problemData = await problemRes.json();
      const testData = await testRes.json();
      setProblemSubmissions(problemData.submissions || []);
      setTestSubmissions(testData.submissions || []);
    } catch (e) {
      setProblemSubmissions([]);
      setTestSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, type) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;
    const url = type === 'problem' ? `/api/admin/submissions/${id}` : `/api/admin/tests/submissions/${id}`;
    await fetch(url, { method: 'DELETE' });
    fetchSubmissions();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Submissions</h1>
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Problem Submissions</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow rounded-lg">
              <thead>
                <tr>
                  <th className="px-4 py-2">Student</th>
                  <th className="px-4 py-2">Problem</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {problemSubmissions.map(sub => (
                  <tr key={sub._id}>
                    <td className="px-4 py-2">{(sub.user?.firstName && sub.user?.lastName) ? `${sub.user.firstName} ${sub.user.lastName}` : 'N/A'}</td>
                    <td className="px-4 py-2">{sub.problemTitle || sub.problem?.title || 'N/A'}</td>
                    <td className="px-4 py-2">{sub.status || sub.score || 'N/A'}</td>
                    <td className="px-4 py-2">{new Date(sub.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-2">
                      <button onClick={() => handleDelete(sub._id, 'problem')} className="text-red-600 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Test Submissions</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow rounded-lg">
              <thead>
                <tr>
                  <th className="px-4 py-2">Student</th>
                  <th className="px-4 py-2">Test</th>
                  <th className="px-4 py-2">Score</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {testSubmissions.map(sub => (
                  <tr key={sub._id}>
                    <td className="px-4 py-2">{(sub.student?.firstName && sub.student?.lastName) ? `${sub.student.firstName} ${sub.student.lastName}` : 'N/A'}</td>
                    <td className="px-4 py-2">{sub.testTitle || sub.test?.title || 'N/A'}</td>
                    <td className="px-4 py-2">{sub.score ?? 'N/A'}</td>
                    <td className="px-4 py-2">{new Date(sub.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-2">
                      <button onClick={() => handleDelete(sub._id, 'test')} className="text-red-600 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
} 