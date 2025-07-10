'use client';
import { useEffect, useState } from 'react';
import { AtSign, Mail, BookOpen, Trophy, FileText, MapPin, User, Calendar, LogIn, ShieldCheck } from 'lucide-react';
import StudentProgressCard from "@/components/StudentProgressCard";

export default function StudentProfilePage() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentProblems, setRecentProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllProfileData();
  }, []);

  const fetchAllProfileData = async () => {
    try {
      const [userRes, statsRes, problemSubRes] = await Promise.all([
        fetch('/api/user/me'),
        fetch('/api/user/stats'),
        fetch('/api/submissions'),
      ]);
      const userData = userRes.ok ? (await userRes.json()).user : null;
      const statsData = statsRes.ok ? await statsRes.json() : null;
      const problemSubs = problemSubRes.ok ? (await problemSubRes.json()).submissions : [];
      setUser(userData);
      setStats(statsData);
      setRecentProblems(problemSubs.slice(0, 5));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen bg-gray-50">Loading...</div>;
  }

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen bg-gray-50">User not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white py-12 px-2">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl p-12 flex flex-col items-center border border-indigo-100" style={{ background: 'linear-gradient(135deg, #f8fafc 60%, #e0e7ff 100%)' }}>
        <div className="w-28 h-28 rounded-full bg-indigo-100 flex items-center justify-center text-5xl font-bold text-indigo-600 mb-4 shadow border-4 border-white">
          {user.firstName[0]}{user.lastName[0]}
        </div>
        <div className="text-3xl font-extrabold text-gray-900 mb-1 text-center">{user.firstName} {user.lastName}</div>
        <div className="flex items-center gap-2 text-indigo-500 mb-1"><AtSign className="h-4 w-4" />@{user.username}</div>
        <div className="flex items-center gap-2 text-gray-500 mb-1"><Mail className="h-4 w-4" />{user.email}</div>
        <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-2">Student</span>
        <div className="flex items-center gap-2 text-gray-500 mb-2"><MapPin className="h-4 w-4" />India</div>
        {/* Progress Card */}
        {stats && (
          <div className="w-full flex justify-center mb-8 mt-4">
            <StudentProgressCard
              solved={stats.solvedProblems}
              total={stats.totalProblems}
              attempting={stats.totalProblems - stats.solvedProblems}
              perLevelSolved={stats.perLevelSolved || { 1: 0, 2: 0, 3: 0 }}
              perLevelTotal={stats.perLevelTotal || { 1: 0, 2: 0, 3: 0 }}
            />
          </div>
        )}
        {/* Submission Details */}
        {stats && (
          <div className="w-full bg-white rounded-xl shadow px-6 py-6 border border-indigo-50 mb-8">
            <div className="text-lg font-bold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-500" />Submission Details
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-500 mb-1">Total Submissions</span>
                <span className="text-lg font-bold text-indigo-700">{stats.totalSubmissions}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-500 mb-1">Accepted</span>
                <span className="text-lg font-bold text-green-600">{stats.acceptedSubmissions || 0}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-500 mb-1">Rejected</span>
                <span className="text-lg font-bold text-red-600">{stats.rejectedSubmissions || 0}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-500 mb-1">Avg Score</span>
                <span className="text-lg font-bold text-yellow-600">{stats.averageScore}%</span>
              </div>
            </div>
          </div>
        )}
        {/* Account Details */}
        <div className="w-full bg-indigo-50 rounded-xl shadow flex flex-col items-start py-6 px-6 mb-8 border border-indigo-100">
          <div className="text-lg font-bold mb-4 text-indigo-700">Account Details</div>
          <div className="flex items-center gap-2 text-gray-700 mb-2"><ShieldCheck className="h-4 w-4 text-green-600" />Role: <span className="font-semibold">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span></div>
          <div className="flex items-center gap-2 text-gray-700 mb-2"><User className="h-4 w-4 text-indigo-600" />Status: <span className="font-semibold">{user.isActive ? 'Active' : 'Inactive'}</span></div>
          <div className="flex items-center gap-2 text-gray-700 mb-2"><Calendar className="h-4 w-4 text-indigo-600" />Joined: <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span></div>
          <div className="flex items-center gap-2 text-gray-700"><LogIn className="h-4 w-4 text-indigo-600" />Last Login: <span>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}</span></div>
        </div>
      </div>
    </div>
  );
} 