import { Users, BookOpen, BarChart3, TrendingUp, Layers, CheckCircle, Clock, Target, Activity } from 'lucide-react';

export default function AdminStatsCards({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-600/80">Total Students</p>
            <p className="text-3xl font-bold text-indigo-900 mt-2">{stats.totalStudents}</p>
            <p className="text-sm text-indigo-600/60 mt-2">
              <TrendingUp className="h-4 w-4 inline mr-1" />
              +{stats.recentStudents || 0} this week
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
            <p className="text-sm font-medium text-violet-600/80">Success Rate</p>
            <p className="text-3xl font-bold text-violet-900 mt-2">{stats.successRate || 0}%</p>
            <p className="text-sm text-violet-600/60 mt-2">
              <CheckCircle className="h-4 w-4 inline mr-1" />
              {stats.correctSubmissions || 0} correct
            </p>
          </div>
          <div className="bg-violet-100/50 p-3 rounded-lg">
            <Target className="h-8 w-8 text-violet-600" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-amber-50 to-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-amber-600/80">Total Tests</p>
            <p className="text-3xl font-bold text-amber-900 mt-2">{stats.totalTests || 0}</p>
            <p className="text-sm text-amber-600/60 mt-2">
              <BarChart3 className="h-4 w-4 inline mr-1" />
              +{stats.totalMCQs || 0} MCQs
            </p>
          </div>
          <div className="bg-amber-100/50 p-3 rounded-lg">
            <BarChart3 className="h-8 w-8 text-amber-600" />
          </div>
        </div>
      </div>
    </div>
  );
}