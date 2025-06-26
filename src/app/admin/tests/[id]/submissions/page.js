"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import TestSubmissionsTable from '../../../../components/TestSubmissionsTable';
import AdminSidebar from '../../../../components/AdminSidebar';

export default function TestSubmissionsPage() {
  const params = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/tests/${params.id}`)
      .then(res => res.json())
      .then(setTest);
    fetch(`/api/admin/tests/${params.id}/submissions`)
      .then(res => res.json())
      .then(setSubmissions)
      .finally(() => setLoading(false));
  }, [params.id]);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-gray-50 p-8">
        <h1 className="text-2xl font-bold mb-4 text-black">{test ? test.title : 'Test'} - Submissions</h1>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <TestSubmissionsTable submissions={submissions} />
        )}
      </main>
    </div>
  );
} 