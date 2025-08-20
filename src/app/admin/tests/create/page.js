"use client";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import TestForm from '../../../components/TestForm';
import AdminSidebar from '../../../components/AdminSidebar';

export default function CreateTestPage() {
  const router = useRouter();
  const [mcqList, setMcqList] = useState([]);

  useEffect(() => {
    fetch('/api/admin/mcqs', { credentials: 'include' })
      .then(res => res.json())
      .then(setMcqList);
  }, []);

  const handleSubmit = async (data) => {
    await fetch('/api/admin/tests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    router.push('/admin/tests');
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-xl mx-auto py-8">
          <Link href="/admin/tests" className="inline-flex items-center text-indigo-600 hover:underline mb-4">
            &#8592; Back to Tests
          </Link>
          <h1 className="text-2xl font-bold mb-4 text-black">Create Test</h1>
          <TestForm onSubmit={handleSubmit} mcqList={mcqList} />
        </div>
      </main>
    </div>
  );
} 