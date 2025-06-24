"use client";
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import TestTaking from '@/src/app/components/TestTaking';

export default function TakeTestPage() {
  const router = useRouter();
  const params = useParams();
  const [test, setTest] = useState(null);
  useEffect(() => {
    fetch(`/api/tests/${params.id}`)
      .then(res => res.json())
      .then(setTest);
  }, [params.id]);
  const handleSubmit = async (answers) => {
    await fetch(`/api/tests/${params.id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    });
    router.push(`/tests/${params.id}/result`);
  };
  if (!test) return <div>Loading...</div>;
  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4 text-black">{test.title}</h1>
      <div className="mb-4 text-gray-700">{test.description}</div>
      <TestTaking test={test} onSubmit={handleSubmit} />
    </div>
  );
} 