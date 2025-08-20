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
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-xl mx-auto py-8">
          <Link href="/admin/tests" className="inline-flex items-center text-indigo-600 hover:underline mb-4">
            &#8592; Back to Tests
          </Link>
          <h1 className="text-2xl font-bold mb-4 text-black">Edit Test</h1>
          <TestForm initialData={test} onSubmit={handleSubmit} mcqList={mcqList} />
        </div>
      </main>
    </div>
  );
} 