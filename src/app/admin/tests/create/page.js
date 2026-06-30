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
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 min-h-screen overflow-auto">
        <div className="w-full py-10 px-4 sm:px-8">
          <Link href="/admin/tests" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium mb-6">
            &#8592; Back to Tests
          </Link>
          <h1 className="text-2xl font-bold mb-6 text-gray-900">Create Test</h1>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <TestForm onSubmit={handleSubmit} mcqList={mcqList} />
          </div>
        </div>
      </main>
    </div>
  );
} 