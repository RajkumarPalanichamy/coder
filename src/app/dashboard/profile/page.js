'use client';
import { useEffect, useState } from 'react';
import { AtSign, Mail, BookOpen, Trophy, FileText, MapPin, User, Calendar, LogIn, ShieldCheck, Phone, Heart, Edit3, Save, X } from 'lucide-react';
import StudentProgressCard from "@/components/StudentProgressCard";

export default function StudentProfilePage() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentProblems, setRecentProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [saving, setSaving] = useState(false);

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
      setEditedUser(userData);
      setStats(statsData);
      setRecentProblems(problemSubs.slice(0, 5));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedUser({ ...user });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedUser({ ...user });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: editedUser.phoneNumber,
          dateOfBirth: editedUser.dateOfBirth,
          gender: editedUser.gender,
          about: editedUser.about,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser.user);
        setEditedUser(updatedUser.user);
        setIsEditing(false);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditedUser(prev => ({
      ...prev,
      [field]: value
    }));
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
        {/* Profile Header */}
        <div className="relative w-full flex justify-center mb-8">
          <div className="text-center">
            <div className="w-28 h-28 rounded-full bg-indigo-100 flex items-center justify-center text-5xl font-bold text-indigo-600 mb-4 shadow border-4 border-white mx-auto">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="text-3xl font-extrabold text-gray-900 mb-1 text-center">{user.firstName} {user.lastName}</div>
            <div className="flex items-center justify-center gap-2 text-indigo-500 mb-1"><AtSign className="h-4 w-4" />@{user.username}</div>
            <div className="flex items-center justify-center gap-2 text-gray-500 mb-1"><Mail className="h-4 w-4" />{user.email}</div>
            <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-2">Student</span>
          </div>
          
          {/* Edit Button */}
          <div className="absolute top-0 right-0">
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm"
              >
                <Edit3 className="h-4 w-4" /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm disabled:opacity-50"
                >
                  <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2 text-sm"
                >
                  <X className="h-4 w-4" /> Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Personal Information */}
        <div className="w-full bg-white rounded-xl shadow px-6 py-6 border border-indigo-50 mb-8">
          <div className="text-lg font-bold mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-500" />Personal Information
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Phone Number */}
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Phone Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editedUser.phoneNumber || ''}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              ) : (
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="h-4 w-4 text-indigo-600" />
                  <span>{user.phoneNumber || 'Not provided'}</span>
                </div>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Date of Birth</label>
              {isEditing ? (
                <input
                  type="date"
                  value={editedUser.dateOfBirth ? new Date(editedUser.dateOfBirth).toISOString().split('T')[0] : ''}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              ) : (
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="h-4 w-4 text-indigo-600" />
                  <span>{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'}</span>
                </div>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Gender</label>
              {isEditing ? (
                <select
                  value={editedUser.gender || ''}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              ) : (
                <div className="flex items-center gap-2 text-gray-700">
                  <Heart className="h-4 w-4 text-indigo-600" />
                  <span className="capitalize">{user.gender || 'Not specified'}</span>
                </div>
              )}
            </div>

            {/* About */}
            <div className="md:col-span-2">
              <label className="text-sm text-gray-500 mb-1 block">About</label>
              {isEditing ? (
                <textarea
                  value={editedUser.about || ''}
                  onChange={(e) => handleInputChange('about', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  placeholder="Tell us about yourself..."
                  maxLength={500}
                />
              ) : (
                <div className="text-gray-700 bg-gray-50 rounded-lg p-3 min-h-[80px]">
                  {user.about || 'No description provided.'}
                </div>
              )}
            </div>
          </div>
        </div>
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