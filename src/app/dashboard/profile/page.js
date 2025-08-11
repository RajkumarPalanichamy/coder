'use client';
import { useEffect, useState } from 'react';
import { AtSign, Mail, BookOpen, Trophy, FileText, MapPin, User, Calendar, LogIn, ShieldCheck, Phone, Edit2, Save, X, Cake, Users, CheckCircle2, BarChart3 } from 'lucide-react';
import StudentProgressCard from "@/components/StudentProgressCard";

export default function StudentProfilePage() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentProblems, setRecentProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dob: '',
    gender: '',
    about: ''
  });

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
      
      // Initialize edit form with user data
      if (userData) {
        setEditForm({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          phone: userData.phone || '',
          dob: userData.dob ? new Date(userData.dob).toISOString().split('T')[0] : '',
          gender: userData.gender || '',
          about: userData.about || ''
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing && user) {
      // Reset form when canceling
      setEditForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
        gender: user.gender || '',
        about: user.about || ''
      });
    }
  };

  const handleInputChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser.user);
        setIsEditing(false);
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
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
      <div className="max-w-5xl mx-auto">
        {/* Score Display at Top Center */}
        {stats && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-indigo-100 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Score Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-indigo-50 rounded-lg p-4">
                <Trophy className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-indigo-700">{stats.solvedProblems}</p>
                <p className="text-sm text-gray-600">Problems Solved</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-green-700">{stats.acceptedSubmissions || 0}</p>
                <p className="text-sm text-gray-600">Accepted</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <FileText className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-yellow-700">{stats.totalSubmissions}</p>
                <p className="text-sm text-gray-600">Total Attempts</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-purple-700">{stats.averageScore}%</p>
                <p className="text-sm text-gray-600">Average Score</p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-12 flex flex-col items-center border border-indigo-100" style={{ background: 'linear-gradient(135deg, #f8fafc 60%, #e0e7ff 100%)' }}>
          <div className="w-28 h-28 rounded-full bg-indigo-100 flex items-center justify-center text-5xl font-bold text-indigo-600 mb-4 shadow border-4 border-white">
            {user.firstName[0]}{user.lastName[0]}
          </div>
          
          {/* Editable Profile Section */}
          {isEditing ? (
            <div className="w-full max-w-md space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="firstName"
                  value={editForm.firstName}
                  onChange={handleInputChange}
                  placeholder="First Name"
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  name="lastName"
                  value={editForm.lastName}
                  onChange={handleInputChange}
                  placeholder="Last Name"
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <input
                type="tel"
                name="phone"
                value={editForm.phone}
                onChange={handleInputChange}
                placeholder="Phone Number"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="date"
                name="dob"
                value={editForm.dob}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select
                name="gender"
                value={editForm.gender}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <textarea
                name="about"
                value={editForm.about}
                onChange={handleInputChange}
                placeholder="About yourself..."
                rows="3"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleSave}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" /> Save
                </button>
                <button
                  onClick={handleEditToggle}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 flex items-center gap-2"
                >
                  <X className="h-4 w-4" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-extrabold text-gray-900 mb-1 text-center">{user.firstName} {user.lastName}</div>
              <button
                onClick={handleEditToggle}
                className="text-indigo-600 hover:text-indigo-800 mb-2"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <div className="space-y-2 text-center mb-4">
                <div className="flex items-center gap-2 text-indigo-500 justify-center"><AtSign className="h-4 w-4" />@{user.username}</div>
                <div className="flex items-center gap-2 text-gray-500 justify-center"><Mail className="h-4 w-4" />{user.email}</div>
                {user.phone && <div className="flex items-center gap-2 text-gray-500 justify-center"><Phone className="h-4 w-4" />{user.phone}</div>}
                {user.dob && <div className="flex items-center gap-2 text-gray-500 justify-center"><Cake className="h-4 w-4" />{new Date(user.dob).toLocaleDateString()}</div>}
                {user.gender && <div className="flex items-center gap-2 text-gray-500 justify-center"><Users className="h-4 w-4" />{user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}</div>}
                <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">Student</span>
                <div className="flex items-center gap-2 text-gray-500 justify-center"><MapPin className="h-4 w-4" />India</div>
              </div>
              {user.about && (
                <div className="text-center text-gray-600 mb-4 max-w-md">
                  <p className="italic">&ldquo;{user.about}&rdquo;</p>
                </div>
              )}
            </>
          )}
          
          {/* Progress Card */}
          {stats && !isEditing && (
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
          
          {/* Account Details */}
          {!isEditing && (
            <div className="w-full bg-indigo-50 rounded-xl shadow flex flex-col items-start py-6 px-6 mb-8 border border-indigo-100">
              <div className="text-lg font-bold mb-4 text-indigo-700">Account Details</div>
              <div className="flex items-center gap-2 text-gray-700 mb-2"><ShieldCheck className="h-4 w-4 text-green-600" />Role: <span className="font-semibold">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span></div>
              <div className="flex items-center gap-2 text-gray-700 mb-2"><User className="h-4 w-4 text-indigo-600" />Status: <span className="font-semibold">{user.isActive ? 'Active' : 'Inactive'}</span></div>
              <div className="flex items-center gap-2 text-gray-700 mb-2"><Calendar className="h-4 w-4 text-indigo-600" />Joined: <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span></div>
              <div className="flex items-center gap-2 text-gray-700"><LogIn className="h-4 w-4 text-indigo-600" />Last Login: <span>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}</span></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 