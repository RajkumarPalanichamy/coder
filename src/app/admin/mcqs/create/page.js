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
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-xl mx-auto py-8">
          <Link href="/admin/mcqs" className="inline-flex items-center text-indigo-600 hover:underline mb-4">
            &#8592; Back to MCQ Management
          </Link>
          <h1 className="text-2xl font-bold mb-4 text-black">Create MCQ</h1>
          <MCQForm onSubmit={handleSubmit} testList={testList} />
        </div>
      </main>
    </div>
  );
} 