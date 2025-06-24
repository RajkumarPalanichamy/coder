"use client";
import { useRouter } from 'next/navigation';
import MCQForm from '@/src/app/components/MCQForm';

export default function CreateMCQPage() {
  const router = useRouter();
  const handleSubmit = async (data) => {
    await fetch('/api/admin/mcqs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    router.push('/admin/mcqs');
  };
  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4 text-black">Create MCQ</h1>
      <MCQForm onSubmit={handleSubmit} />
    </div>
  );
} 