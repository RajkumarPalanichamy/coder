import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export default function RecentSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch('/api/admin/submissions?limit=5');
      const data = await res.json();
      setSubmissions(data.submissions || []);
    } catch (error) {
      console.error('Error fetching recent submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <div key={submission._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            {submission.isCorrect ? (
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500 mr-3" />
            )}
            <div>
              <p className="font-semibold">{submission.problem.title}</p>
              <p className="text-sm text-gray-500">by {submission.user.firstName} {submission.user.lastName}</p>
            </div>
          </div>
          <div className="text-sm text-gray-500 flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {new Date(submission.createdAt).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
}