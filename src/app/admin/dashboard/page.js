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
  const [activeTab, setActiveTab] = useState('students');
  const [language, setLanguage] = useState('');
  const [user, setUser] = useState(null);
  const [tests, setTests] = useState([]);
  const [showTestForm, setShowTestForm] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [testMCQs, setTestMCQs] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchDashboardData();
    fetchTests();
  }, [language]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/user/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (data.user.role !== 'admin') {
          router.push('/login');
        }
      } else if (res.status === 401) {
        router.push('/login');
      }
    } catch {
      router.push('/login');
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch students
      const studentsResponse = await fetch('/api/admin/students');
      const studentsData = await studentsResponse.json();
      setStudents(studentsData.students || []);

      // Fetch problems
      const problemsResponse = await fetch(`/api/admin/problems${language ? `?language=${encodeURIComponent(language)}` : ''}`);
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

  const fetchTests = async () => {
    try {
      const res = await fetch('/api/admin/tests');
      const data = await res.json();
      setTests(data);
    } catch (e) {
      setTests([]);
    }
  };

  const fetchMCQs = async () => {
    try {
      const res = await fetch('/api/admin/mcqs');
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
        body: JSON.stringify(data),
      });
    } else {
      await fetch('/api/admin/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    }
    setShowTestForm(false);
    setEditingTest(null);
    fetchTests();
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
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
        {/* Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-8">
          <button
            onClick={() => router.push('/admin/students')}
            className="bg-white shadow rounded-lg p-6 flex flex-col items-center hover:bg-indigo-50 transition cursor-pointer"
          >
            <Users className="h-8 w-8 text-indigo-600 mb-2" />
            <span className="font-semibold text-lg">Students</span>
          </button>
          <button
            onClick={() => router.push('/admin/problems')}
            className="bg-white shadow rounded-lg p-6 flex flex-col items-center hover:bg-indigo-50 transition cursor-pointer"
          >
            <BookOpen className="h-8 w-8 text-indigo-600 mb-2" />
            <span className="font-semibold text-lg">Problems</span>
          </button>
          {/* <button
            onClick={() => router.push('/admin/mcqs')}
            className="bg-white shadow rounded-lg p-6 flex flex-col items-center hover:bg-indigo-50 transition cursor-pointer"
          >
            <Edit className="h-8 w-8 text-indigo-600 mb-2" />
            <span className="font-semibold text-lg">MCQs</span>
          </button> */}
          <button
            onClick={() => router.push('/admin/tests')}
            className="bg-white shadow rounded-lg p-6 flex flex-col items-center hover:bg-indigo-50 transition cursor-pointer"
          >
            <BarChart3 className="h-8 w-8 text-indigo-600 mb-2" />
            <span className="font-semibold text-lg">Tests</span>
          </button>
          <button
            onClick={() => router.push('/admin/submissions')}
            className="bg-white shadow rounded-lg p-6 flex flex-col items-center hover:bg-indigo-50 transition cursor-pointer"
          >
            <Code className="h-8 w-8 text-indigo-600 mb-2" />
            <span className="font-semibold text-lg">Submissions</span>
          </button>
        </div>
      </main>
    </div>
  );
} 