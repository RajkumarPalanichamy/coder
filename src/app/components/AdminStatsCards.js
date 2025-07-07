import { Users, BookOpen, BarChart3, TrendingUp, Clock, CheckCircle2, XCircle } from 'lucide-react';

export default function AdminStatsCards({ stats }) {
  // Calculate submission success rate
  const successRate = stats.totalSubmissions > 0 
    ? ((stats.successfulSubmissions || 0) / stats.totalSubmissions * 100).toFixed(1) 
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Stats */}
        <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-600/80">Total Students</p>
              <p className="text-3xl font-bold text-indigo-900 mt-2">{stats.totalStudents}</p>
              <p className="text-sm text-indigo-600/60 mt-2">
                <TrendingUp className="h-4 w-4 inline mr-1" />
                Active learners
              </p>
            </div>
            <div className="bg-indigo-100/50 p-3 rounded-lg">
              <Users className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-600/80">Total Problems</p>
              <p className="text-3xl font-bold text-emerald-900 mt-2">{stats.totalProblems}</p>
              <p className="text-sm text-emerald-600/60 mt-2">
                <BookOpen className="h-4 w-4 inline mr-1" />
                Coding challenges
              </p>
            </div>
            <div className="bg-emerald-100/50 p-3 rounded-lg">
              <BookOpen className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-violet-50 to-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-violet-600/80">Total Submissions</p>
              <p className="text-3xl font-bold text-violet-900 mt-2">{stats.totalSubmissions}</p>
              <p className="text-sm text-violet-600/60 mt-2">
                <BarChart3 className="h-4 w-4 inline mr-1" />
                Code attempts
              </p>
            </div>
            <div className="bg-violet-100/50 p-3 rounded-lg">
              <BarChart3 className="h-8 w-8 text-violet-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow transition-shadow duration-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Time</p>
              <p className="text-lg font-semibold text-gray-900">{stats.avgSolveTime || '25m'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow transition-shadow duration-200">
          <div className="flex items-center gap-3">
            <div className="bg-green-50 p-2 rounded">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-lg font-semibold text-gray-900">{successRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow transition-shadow duration-200">
          <div className="flex items-center gap-3">
            <div className="bg-amber-50 p-2 rounded">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active Today</p>
              <p className="text-lg font-semibold text-gray-900">{stats.activeToday || stats.totalStudents * 0.6}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow transition-shadow duration-200">
          <div className="flex items-center gap-3">
            <div className="bg-red-50 p-2 rounded">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Failed Attempts</p>
              <p className="text-lg font-semibold text-gray-900">{stats.failedSubmissions || stats.totalSubmissions * 0.3}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 