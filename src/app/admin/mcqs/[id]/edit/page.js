"use client";
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import MCQForm from '../../../../components/MCQForm';
import AdminSidebar from '../../../../components/AdminSidebar';

export default function EditMCQPage() {
  const router = useRouter();
  const params = useParams();
  const [mcq, setMcq] = useState(null);
  const [testList, setTestList] = useState([]);

  useEffect(() => {
    fetch(`/api/admin/mcqs/${params.id}`, { credentials: 'include' })
      .then(res => res.json())
      .then(setMcq);
    fetch('/api/admin/tests', { credentials: 'include' })
      .then(res => res.json())
      .then(setTestList);
  }, [params.id]);

  const handleSubmit = async (data) => {
    await fetch(`/api/admin/mcqs/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    router.push('/admin/mcqs');
  };
  if (!mcq) return <div>Loading...</div>;
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-xl mx-auto py-8">
          <Link href="/admin/mcqs" className="inline-flex items-center text-indigo-600 hover:underline mb-4">
            &#8592; Back to MCQ Management
          </Link>
          <h1 className="text-2xl font-bold mb-4 text-black">Edit MCQ</h1>
          <MCQForm initialData={mcq} onSubmit={handleSubmit} testList={testList} />
        </div>
      </main>
    </div>
  );
} 