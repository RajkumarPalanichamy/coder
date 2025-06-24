"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import TestResult from '../../components/TestResult';

export default function TestResultPage() {
  const params = useParams();
  const [test, setTest] = useState(null);
  const [result, setResult] = useState(null);
  useEffect(() => {
    fetch(`/api/tests/${params.id}`)
      .then(res => res.json())
      .then(setTest);
    fetch(`/api/tests/${params.id}/result`)
      .then(res => res.json())
      .then(setResult);
  }, [params.id]);
  if (!test || !result) return <div>Loading...</div>;
  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4 text-black">{test.title} - Result</h1>
      <TestResult test={test} answers={result.answers} correctAnswers={result.correctAnswers} score={result.score} />
    </div>
  );
} 