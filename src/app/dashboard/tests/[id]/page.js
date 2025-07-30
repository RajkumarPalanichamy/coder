"use client";
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import TestTaking from '../../../components/TestTaking';

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
    try {
      const response = await fetch(`/api/tests/${params.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Test submission error:', {
          status: response.status,
          error: errorData.error || 'Unknown error'
        });
        alert(`Submission failed: ${errorData.error || 'Unknown error'}`);
        return;
      }

      router.push('/dashboard/tests');
    } catch (error) {
      console.error('Network or submission error:', error);
      alert('Failed to submit test. Please try again.');
    }
  };
  if (!test) return <div>Loading...</div>;
  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4 text-black">{test.title}</h1>
      <div className="mb-4 text-gray-700 whitespace-pre-wrap">{test.description}</div>
      <TestTaking test={test} onSubmit={handleSubmit} />
    </div>
  );
} 