"use client";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MCQForm from '../../../components/MCQForm';
import AdminSidebar from '../../../components/AdminSidebar';
import { useEffect, useState } from 'react';

export default function CreateMCQPage() {
  const router = useRouter();
  const [testList, setTestList] = useState([]);

  useEffect(() => {
    fetch('/api/admin/tests', { credentials: 'include' })
      .then(res => res.json())
      .then(setTestList);
  }, []);

  const handleSubmit = async (data) => {
    await fetch('/api/admin/mcqs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    router.push('/admin/mcqs');
  };
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 min-h-screen overflow-auto">
        <div className="w-full py-10 px-4 sm:px-8">
          <Link href="/admin/mcqs" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium mb-6">
            &#8592; Back to MCQ Management
          </Link>
          <h1 className="text-2xl font-bold mb-6 text-gray-900">Create MCQ</h1>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <MCQForm onSubmit={handleSubmit} testList={testList} />
          </div>
        </div>
      </main>
    </div>
  );
} 