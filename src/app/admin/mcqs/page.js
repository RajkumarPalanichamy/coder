"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function MCQListPage() {
  const [mcqs, setMcqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/mcqs')
      .then(res => res.json())
      .then(setMcqs)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this MCQ?')) return;
    await fetch(`/api/admin/mcqs/${id}`, { method: 'DELETE' });
    setMcqs(mcqs.filter(m => m._id !== id));
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">MCQ Management</h1>
        <Link href="/admin/mcqs/create" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">+ New MCQ</Link>
      </div>
      {loading ? <div>Loading...</div> : (
        <table className="w-full border bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Question</th>
              <th className="p-2 text-left">Language</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mcqs.map(mcq => (
              <tr key={mcq._id}>
                <td className="p-2 text-black">{mcq.question}</td>
                <td className="p-2 text-black">{mcq.language}</td>
                <td className="p-2">
                  <Link href={`/admin/mcqs/${mcq._id}/edit`} className="text-indigo-600 hover:underline mr-2">Edit</Link>
                  <button onClick={() => handleDelete(mcq._id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 