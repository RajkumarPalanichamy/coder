"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function TestListPage() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tests')
      .then(res => res.json())
      .then(setTests)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-black">Available Tests</h1>
      {loading ? <div>Loading...</div> : (
        <div className="space-y-4">
          {tests.length === 0 && <div>No tests available.</div>}
          {tests.map(test => (
            <div key={test._id} className="border rounded p-4 bg-white">
              <div className="font-semibold text-lg text-black">{test.title}</div>
              <div className="text-gray-600 mb-2">{test.description}</div>
              <Link href={`/tests/${test._id}`} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Start Test</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 