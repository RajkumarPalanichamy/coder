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
import AdminAnalytics from '../../components/AdminAnalytics';
import AdminQuickActions from '../../components/AdminQuickActions';
import AdminRecentActivity from '../../components/AdminRecentActivity';
import AdminNotifications from '../../components/AdminNotifications';
import AdminSystemHealth from '../../components/AdminSystemHealth';
import AuthDebug from '../../components/AuthDebug';
import ProblemCard from '../../components/ProblemCard';
import TestForm from '../../components/TestForm';

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
  const [authError, setAuthError] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState('students');
  const [language, setLanguage] = useState('');
  const [user, setUser] = useState(null);
  const [tests, setTests] = useState([]);
  const [showTestForm, setShowTestForm] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [testMCQs, setTestMCQs] = useState([]);
  const router = useRouter();

  useEffect(() => {
    // Prevent multiple initializations
    if (!initialized) {
      setInitialized(true);
      fetchUser();
    }
    
    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log('Loading timeout reached, setting loading to false');
        setLoading(false);
      }
    }, 5000); // Reduced to 5 seconds

    return () => clearTimeout(timeoutId);
  }, [initialized]);

  // Remove the duplicate useEffect that was calling fetchDashboardData and fetchTests
  // useEffect(() => {
  //   fetchDashboardData();
  //   fetchTests();
  // }, [language]);

  const fetchUser = async () => {
    try {
      console.log('Fetching user data...');
      setLoading(true);
      setAuthError(null);
      
      const res = await fetch('/api/user/me', { 
        credentials: 'include',
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      console.log('User API response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('User data received:', data.user);
        setUser(data.user);
        
        if (data.user.role !== 'admin') {
          console.error('User is not an admin, redirecting to dashboard');
          router.push('/dashboard');
          return;
        }
        
        // User is admin, continue with dashboard data
        console.log('User is admin, fetching dashboard data...');
        await Promise.all([
          fetchDashboardData(),
          fetchTests()
        ]);
      } else if (res.status === 401) {
        console.log('Authentication required - middleware will handle redirect');
        setAuthError('Authentication required. Please log in.');
        setLoading(false);
        return;
      } else {
        console.error('Unexpected response status:', res.status);
        setAuthError(`Unexpected error: ${res.status}`);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      if (error.name === 'AbortError') {
        setAuthError('Request timeout. Please try again.');
      } else {
        setAuthError(`Network error: ${error.message}`);
      }
      setLoading(false);
      return;
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch students
      const studentsResponse = await fetch('/api/admin/students', { credentials: 'include' });
      const studentsData = await studentsResponse.json();
      setStudents(studentsData.students || []);

      // Fetch problems
      const problemsResponse = await fetch(`/api/admin/problems${language ? `?language=${encodeURIComponent(language)}` : ''}`, { credentials: 'include' });
      const problemsData = await problemsResponse.json();
      setProblems(problemsData.problems || []);

      // Fetch stats
      const statsResponse = await fetch('/api/admin/stats', { credentials: 'include' });
      const statsData = await statsResponse.json();
      setStats(statsData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTests = async () => {
    try {
      const res = await fetch('/api/admin/tests', { credentials: 'include' });
      const data = await res.json();
      setTests(data);
    } catch (e) {
      setTests([]);
    }
  };

  const fetchMCQs = async () => {
    try {
      const res = await fetch('/api/admin/mcqs', { credentials: 'include' });
      const data = await res.json();
      setTestMCQs(data);
    } catch (e) {
      setTestMCQs([]);
    }
  };

  const handleCreateTest = () => {
    setEditingTest(null);
    fetchMCQs();
    setShowTestForm(true);
  };

  const handleEditTest = (test) => {
    setEditingTest(test);
    fetchMCQs();
    setShowTestForm(true);
  };

  const handleDeleteTest = async (testId) => {
    if (!confirm('Are you sure you want to delete this test?')) return;
    await fetch(`/api/admin/tests/${testId}`, { method: 'DELETE' });
    setTests(tests.filter(t => t._id !== testId));
  };

  const handleSaveTest = async (data) => {
    if (editingTest) {
      await fetch(`/api/admin/tests/${editingTest._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
    } else {
      await fetch('/api/admin/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
    }
    setShowTestForm(false);
    setEditingTest(null);
    fetchTests();
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate to login even if logout request fails
      router.push('/login');
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
      const response = await fetch(`/api/admin/students/${studentId}`, {
        method: 'DELETE',
        credentials: 'include'
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
        method: 'DELETE',
        credentials: 'include'
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

  // Show loading state immediately if we haven't initialized yet
  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
          {!initialized && (
            <p className="text-xs text-gray-400 mt-2">Initializing...</p>
          )}
          {loading && initialized && (
            <div className="mt-4">
              <div className="w-48 bg-gray-200 rounded-full h-2 mx-auto">
                <div className="bg-indigo-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Fetching data...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Check if there's an authentication error
  if (authError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{authError}</p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setAuthError(null);
                setLoading(true);
                fetchUser();
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors ml-3"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if user is authenticated and is admin
  if (!user) {
    // If we're not loading and there's no user, show authentication required
    if (!loading && !authError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please log in to access the admin dashboard.</p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setLoading(true);
                  setAuthError(null);
                  fetchUser();
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Retry Authentication
              </button>
              <button
                onClick={() => router.push('/login')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors ml-3"
              >
                Go to Login
              </button>
              <button
                onClick={() => {
                  setLoading(true);
                  setInitialized(false);
                  setUser(null);
                  setAuthError(null);
                }}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors ml-3"
              >
                Reset State
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    // If we're still loading, show loading state
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don&apos;t have permission to access the admin dashboard.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Simple test render to check if the page can load
  if (user && user.role === 'admin') {
    // First, try to render a simple version to test if the page loads
    if (!stats || Object.keys(stats).length === 0) {
      return (
        <div className="flex min-h-screen bg-gray-50">
          <AdminSidebar onLogout={handleLogout} />
          <main className="flex-1 p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Loading Dashboard Data...</h2>
              <p className="text-gray-600">Please wait while we load your dashboard data.</p>
              <div className="mt-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            </div>

            {/* Debug Component */}
            <AuthDebug />
          </main>
        </div>
      );
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar onLogout={handleLogout} />
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.firstName}! Here&apos;s what&apos;s happening with your platform.</p>
            </div>
            <AdminNotifications />
          </div>
        </div>
        

        {/* Stats Cards */}
        <AdminStatsCards stats={stats} />
        {/* Navigation Cards */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Navigation</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <button
              onClick={() => router.push('/admin/students')}
              className="bg-white shadow rounded-lg p-6 flex flex-col items-center hover:bg-indigo-50 transition cursor-pointer group"
            >
              <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors mb-3">
                <Users className="h-8 w-8 text-indigo-600" />
              </div>
              <span className="font-semibold text-lg text-gray-900">Students</span>
              <span className="text-sm text-gray-500 mt-1">Manage student accounts</span>
            </button>
            <button
              onClick={() => router.push('/admin/problems')}
              className="bg-white shadow rounded-lg p-6 flex flex-col items-center hover:bg-emerald-50 transition cursor-pointer group"
            >
              <div className="p-3 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors mb-3">
                <BookOpen className="h-8 w-8 text-emerald-600" />
              </div>
              <span className="font-semibold text-lg text-gray-900">Problems</span>
              <span className="text-sm text-gray-500 mt-1">Coding challenges</span>
            </button>
            <button
              onClick={() => router.push('/admin/tests')}
              className="bg-white shadow rounded-lg p-6 flex flex-col items-center hover:bg-purple-50 transition cursor-pointer group"
            >
              <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors mb-3">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <span className="font-semibold text-lg text-gray-900">Tests</span>
              <span className="text-sm text-gray-500 mt-1">Assessments & MCQs</span>
            </button>
            <button
              onClick={() => router.push('/admin/submissions')}
              className="bg-white shadow rounded-lg p-6 flex flex-col items-center hover:bg-violet-50 transition cursor-pointer group"
            >
              <div className="p-3 bg-violet-100 rounded-lg group-hover:bg-violet-200 transition-colors mb-3">
                <Code className="h-8 w-8 text-violet-600" />
              </div>
              <span className="font-semibold text-lg text-gray-900">Submissions</span>
              <span className="text-sm text-gray-500 mt-1">Code submissions</span>
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <AdminQuickActions />


        {/* Analytics & Insights */}
        <AdminAnalytics stats={stats} />

          {/* Recent Activity */}
          <div className="mt-8">
          <AdminRecentActivity />
        </div>

        {/* System Health */}
        <div className="mt-8">
          <AdminSystemHealth />
        </div>

      

        

        {/* Test Form Modal */}
        {showTestForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <TestForm
                onSubmit={handleSaveTest}
                onCancel={() => setShowTestForm(false)}
                test={editingTest}
                mcqs={testMCQs}
              />
            </div>
          </div>
        )}

        {/* Debug Component - Remove after fixing auth issues */}
        <AuthDebug />
      </main>
    </div>
  );
} 