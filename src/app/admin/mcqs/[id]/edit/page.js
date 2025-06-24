"use client";
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MCQForm from '@/src/app/components/MCQForm';

export default function EditMCQPage() {
  const router = useRouter();
  const params = useParams();
  const [mcq, setMcq] = useState(null);
  useEffect(() => {
    fetch(`/api/admin/mcqs/${params.id}`)
      .then(res => res.json())
      .then(setMcq);
  }, [params.id]);
  const handleSubmit = async (data) => {
    await fetch(`/api/admin/mcqs/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    router.push('/admin/mcqs');
  };
  if (!mcq) return <div>Loading...</div>;
  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4 text-black">Edit MCQ</h1>
      <MCQForm initialData={mcq} onSubmit={handleSubmit} />
    </div>
  );
} 