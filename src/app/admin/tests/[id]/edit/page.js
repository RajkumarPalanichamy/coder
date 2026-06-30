"use client";
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import TestForm from '../../../../components/TestForm';
import AdminSidebar from '../../../../components/AdminSidebar';

export default function EditTestPage() {
  const router = useRouter();
  const params = useParams();
  const [test, setTest] = useState(null);
  const [mcqList, setMcqList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/tests/${params.id}`, { credentials: 'include' })
      .then(res => res.json())
      .then(setTest);
    fetch('/api/admin/mcqs', { credentials: 'include' })
      .then(res => res.json())
      .then(setMcqList)
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleSubmit = async (data) => {
    await fetch(`/api/admin/tests/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    router.push('/admin/tests');
  };

  if (loading || !test) return <div className="flex min-h-screen"><AdminSidebar /><main className="flex-1 bg-gray-50 p-8"><div>Loading...</div></main></div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 min-h-screen overflow-auto">
        <div className="w-full py-10 px-4 sm:px-8">
          <Link href="/admin/tests" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium mb-6">
            &#8592; Back to Tests
          </Link>
          <h1 className="text-2xl font-bold mb-6 text-gray-900">Edit Test</h1>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <TestForm initialData={test} onSubmit={handleSubmit} mcqList={mcqList} />
          </div>
        </div>
      </main>
    </div>
  );
} 