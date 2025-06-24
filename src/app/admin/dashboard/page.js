'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  LogOut, 
  Code,
  BarChart3,
  UserPlus
} from 'lucide-react';
import AdminStatsCards from '../../components/AdminStatsCards';
import AdminSidebar from '../../components/AdminSidebar';
import ProblemCard from '../../components/ProblemCard';

const LANGUAGES = [
  { label: 'All', value: '' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Python', value: 'python' },
  { label: 'Java', value: 'java' },
  { label: 'C++', value: 'cpp' },
  { label: 'C', value: 'c' },
];

export default function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [problems, setProblems] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalProblems: 0,
    totalSubmissions: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('students');
  const [language, setLanguage] = useState('');
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchUser();
    fetchDashboardData();
  }, [language]);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/user/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (data.user.role !== 'admin') {
          window.location.href = '/login';
        }
      } else if (res.status === 401) {
        window.location.href = '/login';
      }
    } catch {
      window.location.href = '/login';
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch students
      const studentsResponse = await fetch('/api/admin/students');
      const studentsData = await studentsResponse.json();
      setStudents(studentsData.students || []);

      // Fetch problems
      const problemsResponse = await fetch(`/api/admin/problems${language ? `?language=${language}` : ''}`);
      const problemsData = await problemsResponse.json();
      setProblems(problemsData.problems || []);

      // Fetch stats
      const statsResponse = await fetch('/api/admin/stats');
      const statsData = await statsResponse.json();
      setStats(statsData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
      const response = await fetch(`/api/admin/students/${studentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setStudents(students.filter(student => student._id !== studentId));
      }
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  const handleDeleteProblem = async (problemId) => {
    if (!confirm('Are you sure you want to delete this problem?')) return;

    try {
      const response = await fetch(`/api/admin/problems/${problemId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setProblems(problems.filter(problem => problem._id !== problemId));
      }
    } catch (error) {
      console.error('Error deleting problem:', error);
    }
  };

  // Group problems by language
  const problemsByLanguage = LANGUAGES.filter(l => l.value).reduce((acc, lang) => {
    acc[lang.value] = problems.filter(p => (p.tags || []).includes(lang.value));
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar onLogout={handleLogout} />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        <AdminStatsCards stats={stats} />
        {/* <div className="flex items-center gap-2 mb-6">
          <label htmlFor="language" className="text-sm font-medium text-gray-700">Filter by Language:</label>
          <select
            id="language"
            name="language"
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-black bg-white"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </select>
        </div> */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {/* <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button> */}
              <button
                onClick={() => setActiveTab('students')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'students'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Students
              </button>
              <button
                onClick={() => setActiveTab('problems')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'problems'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Problems
              </button>
            </nav>
          </div>
          <div className="p-6">
            {/* {activeTab === 'overview' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">No recent activity to display.</p>
                  </div>
                </div>
              </div>
            )} */}
            {activeTab === 'students' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Manage Students</h3>
                  <button
                    onClick={() => router.push('/admin/students/create')}
                    className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Student
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Username
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map((student) => (
                        <tr key={student._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {student.firstName} {student.lastName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{student.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{student.username}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              student.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {student.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => router.push(`/admin/students/${student._id}/edit`)}
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(student._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {activeTab === 'problems' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Manage Problems</h3>
                  <button
                    onClick={() => router.push('/admin/problems/create')}
                    className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Problem
                  </button>
                </div>
                {/* Segregate problems by language */}
                {LANGUAGES.filter(l => l.value).map(lang => (
                  <div key={lang.value} className="mb-8">
                    <h4 className="text-lg font-semibold mb-2 text-indigo-700">{lang.label}</h4>
                    {problemsByLanguage[lang.value].length === 0 ? (
                      <div className="text-gray-400 text-sm mb-4">No problems for {lang.label}.</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {problemsByLanguage[lang.value].map(problem => (
                          <ProblemCard
                            key={problem._id}
                            problem={problem}
                            href={`/admin/problems/${problem._id}/edit`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 