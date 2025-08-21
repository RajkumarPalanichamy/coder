import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Languages, Target, Activity } from 'lucide-react';

export default function AdminAnalytics({ stats }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!stats) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getLanguageColor = (language) => {
    const colors = [
      'text-blue-600 bg-blue-100',
      'text-green-600 bg-green-100',
      'text-purple-600 bg-purple-100',
      'text-orange-600 bg-orange-100',
      'text-red-600 bg-red-100',
      'text-indigo-600 bg-indigo-100'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Analytics & Insights</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'trends'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Trends
          </button>
          <button
            onClick={() => setActiveTab('distribution')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'distribution'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Distribution
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Language Distribution */}
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Languages className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="font-semibold text-gray-900">Language Distribution</h3>
            </div>
            <div className="space-y-2">
              {stats.languageStats?.slice(0, 5).map((lang, index) => (
                <div key={lang._id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{lang._id}</span>
                  <span className="text-sm font-semibold text-blue-600">{lang.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Difficulty Distribution */}
          <div className="bg-gradient-to-br from-green-50 to-white rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Target className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="font-semibold text-gray-900">Difficulty Distribution</h3>
            </div>
            <div className="space-y-2">
              {stats.difficultyStats?.map((diff, index) => (
                <div key={diff._id} className="flex items-center justify-between">
                  <span className={`text-sm px-2 py-1 rounded-full capitalize ${getDifficultyColor(diff._id)}`}>
                    {diff._id}
                  </span>
                  <span className="text-sm font-semibold text-green-600">{diff.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-gradient-to-br from-purple-50 to-white rounded-lg p-4">
            <div className="flex items-center mb-3">
              <BarChart3 className="h-5 w-5 text-purple-600 mr-2" />
              <h3 className="font-semibold text-gray-900">Category Distribution</h3>
            </div>
            <div className="space-y-2">
              {stats.categoryStats?.slice(0, 5).map((cat, index) => (
                <div key={cat._id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{cat._id}</span>
                  <span className="text-sm font-semibold text-purple-600">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="space-y-6">
          {/* Daily Submissions Chart */}
          <div className="bg-gradient-to-br from-indigo-50 to-white rounded-lg p-4">
            <div className="flex items-center mb-4">
              <TrendingUp className="h-5 w-5 text-indigo-600 mr-2" />
              <h3 className="font-semibold text-gray-900">Daily Submissions (Last 7 Days)</h3>
            </div>
            <div className="flex items-end justify-between h-32">
              {stats.dailySubmissions?.map((day, index) => {
                const maxCount = Math.max(...stats.dailySubmissions.map(d => d.count));
                const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                return (
                  <div key={day._id} className="flex flex-col items-center">
                    <div className="text-xs text-gray-500 mb-1">{formatDate(day._id)}</div>
                    <div 
                      className="w-8 bg-indigo-500 rounded-t transition-all duration-300 hover:bg-indigo-600"
                      style={{ height: `${height}%` }}
                    ></div>
                    <div className="text-xs font-semibold text-indigo-600 mt-1">{day.count}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Performing Students */}
          <div className="bg-gradient-to-br from-emerald-50 to-white rounded-lg p-4">
            <div className="flex items-center mb-4">
              <Activity className="h-5 w-5 text-emerald-600 mr-2" />
              <h3 className="font-semibold text-gray-900">Top Performing Students</h3>
            </div>
            <div className="space-y-3">
              {stats.topStudents?.map((student, index) => (
                <div key={student._id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-sm mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {student.userInfo?.firstName} {student.userInfo?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{student.userInfo?.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600">{student.correctSubmissions}</p>
                    <p className="text-xs text-gray-500">correct</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'distribution' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* System Health */}
          <div className="bg-gradient-to-br from-amber-50 to-white rounded-lg p-4">
            <div className="flex items-center mb-4">
              <Activity className="h-5 w-5 text-amber-600 mr-2" />
              <h3 className="font-semibold text-gray-900">System Health</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <span className="text-sm text-gray-600">Average Execution Time</span>
                <span className="font-semibold text-amber-600">
                  {stats.avgSubmissionTime ? `${(stats.avgSubmissionTime / 1000).toFixed(2)}s` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <span className="text-sm text-gray-600">Total Submissions</span>
                <span className="font-semibold text-amber-600">{stats.totalSubmissions}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <span className="text-sm text-gray-600">Level Submissions</span>
                <span className="font-semibold text-amber-600">{stats.totalLevelSubmissions}</span>
              </div>
            </div>
          </div>

          {/* Recent Activity Summary */}
          <div className="bg-gradient-to-br from-violet-50 to-white rounded-lg p-4">
            <div className="flex items-center mb-4">
              <TrendingUp className="h-5 w-5 text-violet-600 mr-2" />
              <h3 className="font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <span className="text-sm text-gray-600">New Students (7 days)</span>
                <span className="font-semibold text-violet-600">+{stats.recentStudents || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <span className="text-sm text-gray-600">Submissions (7 days)</span>
                <span className="font-semibold text-violet-600">+{stats.recentSubmissions || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="font-semibold text-violet-600">{stats.successRate || 0}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
