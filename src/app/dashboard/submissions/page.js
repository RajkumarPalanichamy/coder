'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StudentSidebar from '../../components/StudentSidebar';
import SubmissionTable from '../../components/SubmissionTable';

export default function StudentSubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/submissions');
      const data = await res.json();
      setSubmissions(data.submissions || []);
    } catch (err) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <StudentSidebar onLogout={handleLogout} />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">My Submissions</h1>
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : (
          <SubmissionTable submissions={submissions} />
        )}
      </main>
    </div>
  );
} 