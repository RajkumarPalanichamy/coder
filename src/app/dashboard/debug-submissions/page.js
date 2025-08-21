'use client';

import { useState, useEffect } from 'react';

export default function DebugSubmissionsPage() {
  const [debugData, setDebugData] = useState(null);
  const [individualData, setIndividualData] = useState(null);
  const [levelData, setLevelData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDebugData();
    fetchIndividualSubmissions();
    fetchLevelSubmissions();
  }, []);

  const fetchDebugData = async () => {
    try {
      const res = await fetch('/api/debug/submissions', { credentials: 'include' });
      const data = await res.json();
      setDebugData(data);
    } catch (err) {
      console.error('Debug fetch error:', err);
    }
  };

  const fetchIndividualSubmissions = async () => {
    try {
      const res = await fetch('/api/submissions', { credentials: 'include' });
      const data = await res.json();
      setIndividualData(data);
    } catch (err) {
      console.error('Individual submissions fetch error:', err);
    }
  };

  const fetchLevelSubmissions = async () => {
    try {
      const res = await fetch('/api/submissions/level', { credentials: 'include' });
      const data = await res.json();
      setLevelData(data);
    } catch (err) {
      console.error('Level submissions fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Submissions</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Debug Info</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(debugData, null, 2)}
        </pre>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Individual Submissions Response</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
          {JSON.stringify(individualData, null, 2)}
        </pre>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Level Submissions Response</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
          {JSON.stringify(levelData, null, 2)}
        </pre>
      </div>
    </div>
  );
}