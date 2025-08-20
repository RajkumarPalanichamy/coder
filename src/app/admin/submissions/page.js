'use client';
import { useEffect, useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Code, 
  Trash2, 
  Filter, 
  ArrowUpDown 
} from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import { useRouter } from 'next/navigation';

export default function AdminSubmissionsPage() {
  const router = useRouter();
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    router.push('/login');
  };
  const [problemSubmissions, setProblemSubmissions] = useState([]);
  const [testSubmissions, setTestSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'submittedAt', direction: 'desc' });

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const [problemRes, testRes] = await Promise.all([
        fetch('/api/admin/submissions', { credentials: 'include' }),
        fetch('/api/admin/tests/submissions', { credentials: 'include' }),
      ]);
      
      if (!problemRes.ok || !testRes.ok) {
        throw new Error('Failed to fetch submissions');
      }
      
      const problemData = await problemRes.json();
      const testData = await testRes.json();
      
      setProblemSubmissions(problemData.submissions || []);
      setTestSubmissions(testData.submissions || []);
    } catch (e) {
      console.error('Submissions fetch error:', e);
      setError(e.message);
      setProblemSubmissions([]);
      setTestSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, type) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;
    
    try {
      const url = type === 'problem' 
        ? `/api/admin/submissions/${id}` 
        : `/api/admin/tests/submissions/${id}`;
      
      const response = await fetch(url, { method: 'DELETE', credentials: 'include' });
      
      if (!response.ok) {
        throw new Error('Failed to delete submission');
      }
      
      fetchSubmissions();
    } catch (error) {
      console.error('Delete submission error:', error);
      alert('Failed to delete submission');
    }
  };

  // Status styling helper
  const getStatusStyle = (status) => {
    switch (status) {
      case 'accepted':
        return {
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle,
          text: 'Accepted'
        };
      case 'wrong_answer':
        return {
          color: 'bg-red-100 text-red-800',
          icon: XCircle,
          text: 'Wrong Answer'
        };
      case 'runtime_error':
        return {
          color: 'bg-orange-100 text-orange-800',
          icon: Code,
          text: 'Runtime Error'
        };
      case 'pending':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: Clock,
          text: 'Pending'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: null,
          text: status
        };
    }
  };

  // Sorting function
  const sortSubmissions = (submissions) => {
    return [...submissions].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  // Combine and filter submissions
  const combinedSubmissions = [
    ...problemSubmissions.map(sub => ({ ...sub, type: 'problem' })),
    ...testSubmissions.map(sub => ({ ...sub, type: 'test' }))
  ];

  const filteredSubmissions = combinedSubmissions.filter(sub => 
    filter === 'all' || sub.type === filter
  );

  const sortedSubmissions = sortSubmissions(filteredSubmissions);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar onLogout={handleLogout} />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Submissions</h1>
        
        {/* Filters and Controls */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            <button 
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded ${
                filter === 'all' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('problem')}
              className={`px-3 py-1 rounded ${
                filter === 'problem' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Problems
            </button>
            <button 
              onClick={() => setFilter('test')}
              className={`px-3 py-1 rounded ${
                filter === 'test' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Tests
            </button>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded-lg">
            <thead>
              <tr>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Student</th>
                <th className="px-4 py-2">
                  <div 
                    className="flex items-center cursor-pointer"
                    onClick={() => setSortConfig({
                      key: 'title', 
                      direction: sortConfig.key === 'title' && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                    })}
                  >
                    Title 
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">
                  <div 
                    className="flex items-center cursor-pointer"
                    onClick={() => setSortConfig({
                      key: 'score', 
                      direction: sortConfig.key === 'score' && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                    })}
                  >
                    Score 
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th className="px-4 py-2">
                  <div 
                    className="flex items-center cursor-pointer"
                    onClick={() => setSortConfig({
                      key: 'submittedAt', 
                      direction: sortConfig.key === 'submittedAt' && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                    })}
                  >
                    Date 
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedSubmissions.map(sub => {
                const StatusIcon = getStatusStyle(sub.status).icon;
                const statusStyle = getStatusStyle(sub.status);
                
                return (
                  <tr key={sub._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 capitalize">
                      <span className={`px-2 py-1 rounded text-xs ${
                        sub.type === 'problem' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {sub.type}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {(sub.user?.firstName && sub.user?.lastName) 
                        ? `${sub.user.firstName} ${sub.user.lastName}` 
                        : (sub.student?.firstName && sub.student?.lastName)
                        ? `${sub.student.firstName} ${sub.student.lastName}`
                        : 'N/A'}
                    </td>
                    <td className="px-4 py-2">
                      {sub.problem?.title || sub.test?.title || 'N/A'}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${statusStyle.color}`}>
                        {StatusIcon && <StatusIcon className="h-4 w-4 inline-block mr-1 -mt-1" />}
                        {statusStyle.text}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`font-bold ${
                        sub.score === 100 
                          ? 'text-green-600' 
                          : sub.score > 50 
                          ? 'text-yellow-600' 
                          : 'text-red-600'
                      }`}>
                        {sub.score ?? 'N/A'}%
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {new Date(sub.submittedAt || sub.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2">
                      <button 
                        onClick={() => handleDelete(sub._id, sub.type)}
                        className="text-red-600 hover:text-red-800 flex items-center"
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* No Submissions Message */}
        {sortedSubmissions.length === 0 && (
          <div className="text-center py-8 bg-white rounded-lg shadow mt-4">
            <p className="text-gray-600">No submissions found.</p>
          </div>
        )}
      </main>
    </div>
  );
} 