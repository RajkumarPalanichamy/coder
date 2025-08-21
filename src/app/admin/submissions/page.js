'use client';
import { useEffect, useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Code, 
  Trash2, 
  Filter, 
  ArrowUpDown,
  Layers,
  FileText,
  Target,
  Award,
  Timer,
  FileSpreadsheet,
  CheckSquare
} from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import { useRouter } from 'next/navigation';
import { exportSubmissionsToExcel, exportSelectedSubmissionsToExcel } from '../../../lib/excelExport';

export default function AdminSubmissionsPage() {
  const router = useRouter();
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    router.push('/login');
  };
  const [problemSubmissions, setProblemSubmissions] = useState([]);
  const [testSubmissions, setTestSubmissions] = useState([]);
  const [levelSubmissions, setLevelSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'submittedAt', direction: 'desc' });
  const [activeTab, setActiveTab] = useState('individual'); // 'individual' or 'level'
  const [selectedSubmissions, setSelectedSubmissions] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const [problemRes, testRes, levelRes] = await Promise.all([
        fetch('/api/admin/submissions', { credentials: 'include' }),
        fetch('/api/admin/tests/submissions', { credentials: 'include' }),
        fetch('/api/admin/submissions/level', { credentials: 'include' })
      ]);
      
      if (!problemRes.ok || !testRes.ok || !levelRes.ok) {
        throw new Error('Failed to fetch submissions');
      }
      
      const problemData = await problemRes.json();
      const testData = await testRes.json();
      const levelData = await levelRes.json();
      
      setProblemSubmissions(problemData.submissions || []);
      setTestSubmissions(testData.submissions || []);
      setLevelSubmissions(levelData.levelSubmissions || []);
    } catch (e) {
      console.error('Submissions fetch error:', e);
      setError(e.message);
      setProblemSubmissions([]);
      setTestSubmissions([]);
      setLevelSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, type) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;
    
    try {
      let url;
      if (type === 'problem') {
        url = `/api/admin/submissions/${id}`;
      } else if (type === 'test') {
        url = `/api/admin/tests/submissions/${id}`;
      } else if (type === 'level') {
        url = `/api/admin/submissions/level?id=${id}`;
      }
      
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

  // Handle individual checkbox selection
  const handleSelectSubmission = (submissionId) => {
    setSelectedSubmissions(prev => {
      if (prev.includes(submissionId)) {
        return prev.filter(id => id !== submissionId);
      } else {
        return [...prev, submissionId];
      }
    });
  };

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (activeTab === 'individual') {
      const allIds = sortedSubmissions.map(sub => sub._id);
      if (selectAll) {
        setSelectedSubmissions([]);
      } else {
        setSelectedSubmissions(allIds);
      }
    } else {
      const allIds = levelSubmissions.map(sub => sub._id);
      if (selectAll) {
        setSelectedSubmissions([]);
      } else {
        setSelectedSubmissions(allIds);
      }
    }
    setSelectAll(!selectAll);
  };

  // Export all submissions to Excel
  const handleExportAll = () => {
    if (activeTab === 'individual') {
      const fileName = `all_submissions_${new Date().toISOString().split('T')[0]}.xlsx`;
      if (filter === 'problem') {
        exportSubmissionsToExcel(problemSubmissions, fileName, 'problem');
      } else if (filter === 'test') {
        exportSubmissionsToExcel(testSubmissions, fileName, 'test');
      } else {
        // Export combined submissions with proper type handling
        const allSubmissions = sortedSubmissions.map(sub => ({
          ...sub,
          submissionType: sub.type
        }));
        exportSubmissionsToExcel(allSubmissions, fileName, 'problem');
      }
    } else {
      const fileName = `level_submissions_${new Date().toISOString().split('T')[0]}.xlsx`;
      exportSubmissionsToExcel(levelSubmissions, fileName, 'level');
    }
  };

  // Export selected submissions to Excel
  const handleExportSelected = () => {
    if (selectedSubmissions.length === 0) {
      alert('Please select submissions to export');
      return;
    }

    const fileName = `selected_submissions_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    if (activeTab === 'individual') {
      exportSelectedSubmissionsToExcel(sortedSubmissions, selectedSubmissions, fileName, filter === 'test' ? 'test' : 'problem');
    } else {
      exportSelectedSubmissionsToExcel(levelSubmissions, selectedSubmissions, fileName, 'level');
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
      case 'in_progress':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: Clock,
          text: 'In Progress'
        };
      case 'completed':
        return {
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle,
          text: 'Completed'
        };
      case 'submitted':
        return {
          color: 'bg-indigo-100 text-indigo-800',
          icon: Award,
          text: 'Submitted'
        };
      case 'time_expired':
        return {
          color: 'bg-red-100 text-red-800',
          icon: Timer,
          text: 'Time Expired'
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
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-white rounded-lg shadow p-1">
          <button
            onClick={() => {
              setActiveTab('individual');
              setSelectedSubmissions([]);
              setSelectAll(false);
            }}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'individual'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="w-4 h-4 inline-block mr-2" />
            Individual Submissions
          </button>
          <button
            onClick={() => {
              setActiveTab('level');
              setSelectedSubmissions([]);
              setSelectAll(false);
            }}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'level'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Layers className="w-4 h-4 inline-block mr-2" />
            Level Submissions
          </button>
        </div>
        
        {/* Conditional Content Based on Tab */}
        {activeTab === 'individual' ? (
          <>
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
          
          {/* Excel Export Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={handleExportSelected}
              disabled={selectedSubmissions.length === 0}
              className={`px-3 py-1 rounded flex items-center ${
                selectedSubmissions.length > 0
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 mr-1" />
              Export Selected ({selectedSubmissions.length})
            </button>
            <button
              onClick={handleExportAll}
              className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 flex items-center"
            >
              <FileSpreadsheet className="w-4 h-4 mr-1" />
              Export All
            </button>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded-lg">
            <thead>
              <tr>
                <th className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                </th>
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
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selectedSubmissions.includes(sub._id)}
                        onChange={() => handleSelectSubmission(sub._id)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                    </td>
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
        </>
        ) : (
          /* Level Submissions Tab */
          <>
            {/* Excel Export Buttons for Level Submissions */}
            <div className="flex justify-end mb-4 space-x-2">
              <button
                onClick={handleExportSelected}
                disabled={selectedSubmissions.length === 0}
                className={`px-3 py-1 rounded flex items-center ${
                  selectedSubmissions.length > 0
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 mr-1" />
                Export Selected ({selectedSubmissions.length})
              </button>
              <button
                onClick={handleExportAll}
                className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 flex items-center"
              >
                <FileSpreadsheet className="w-4 h-4 mr-1" />
                Export All
              </button>
            </div>
            
            {/* Level Submissions Table */}
            <div className="bg-white shadow rounded-lg">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Level-based Submissions</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Level
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Language
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time Used
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted At
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {levelSubmissions.map((submission) => {
                      const statusStyle = getStatusStyle(submission.status);
                      const StatusIcon = statusStyle.icon;
                      
                      return (
                        <tr key={submission._id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedSubmissions.includes(submission._id)}
                              onChange={() => handleSelectSubmission(submission._id)}
                              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {submission.user?.firstName && submission.user?.lastName 
                                ? `${submission.user.firstName} ${submission.user.lastName}`
                                : submission.user?.username || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {submission.user?.email || 'N/A'}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              submission.level === 'level1' ? 'bg-green-100 text-green-800' :
                              submission.level === 'level2' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {submission.level === 'level1' ? 'Level 1' :
                               submission.level === 'level2' ? 'Level 2' : 'Level 3'}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {submission.category}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 capitalize">
                              {submission.programmingLanguage}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${statusStyle.color}`}>
                              {StatusIcon && <StatusIcon className="h-4 w-4 inline-block mr-1" />}
                              {statusStyle.text}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {submission.completedProblems}/{submission.totalProblems}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`text-sm font-bold ${
                              submission.totalScore >= 90 ? 'text-green-600' :
                              submission.totalScore >= 70 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {submission.totalScore}%
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {Math.floor(submission.timeUsed / 60)}m {submission.timeUsed % 60}s
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(submission.createdAt).toLocaleString()}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => router.push(`/admin/submissions/level/${submission._id}`)}
                              className="text-indigo-600 hover:text-indigo-900 mr-3"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => handleDelete(submission._id, 'level')}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4 inline" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* No Level Submissions Message */}
            {levelSubmissions.length === 0 && (
              <div className="text-center py-8 bg-white rounded-lg shadow mt-4">
                <p className="text-gray-600">No level submissions found.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
} 