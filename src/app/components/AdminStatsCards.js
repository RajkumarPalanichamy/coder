import { Users, BookOpen, BarChart3, TrendingUp, Code, CheckCircle, UserCheck } from 'lucide-react';

// Language icons
const languageIcons = {
  javascript: '🟨',
  python: '🐍',
  java: '☕',
  cpp: '⚡',
  c: '🔧'
};

const languageNames = {
  javascript: 'JavaScript',
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
  c: 'C'
};

export default function AdminStatsCards({ stats }) {
  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-600/80">Total Students</p>
              <p className="text-3xl font-bold text-indigo-900 mt-2">{stats.totalStudents}</p>
              <p className="text-sm text-indigo-600/60 mt-2">
                <UserCheck className="h-4 w-4 inline mr-1" />
                {stats.activeStudents || 0} active
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
              <p className="text-sm font-medium text-emerald-600/80">Total Submissions</p>
              <p className="text-3xl font-bold text-emerald-900 mt-2">{stats.totalSubmissions}</p>
              <p className="text-sm text-emerald-600/60 mt-2">
                <CheckCircle className="h-4 w-4 inline mr-1" />
                {stats.acceptedSubmissions || 0} accepted
              </p>
            </div>
            <div className="bg-emerald-100/50 p-3 rounded-lg">
              <BarChart3 className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-violet-50 to-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-violet-600/80">Success Rate</p>
              <p className="text-3xl font-bold text-violet-900 mt-2">{stats.submissionSuccessRate || 0}%</p>
              <p className="text-sm text-violet-600/60 mt-2">
                <TrendingUp className="h-4 w-4 inline mr-1" />
                Overall performance
              </p>
            </div>
            <div className="bg-violet-100/50 p-3 rounded-lg">
              <CheckCircle className="h-8 w-8 text-violet-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600/80">Recent Activity</p>
              <p className="text-3xl font-bold text-amber-900 mt-2">{stats.recentSubmissions || 0}</p>
              <p className="text-sm text-amber-600/60 mt-2">
                <TrendingUp className="h-4 w-4 inline mr-1" />
                Last 7 days
              </p>
            </div>
            <div className="bg-amber-100/50 p-3 rounded-lg">
              <BookOpen className="h-8 w-8 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Language-specific Problem Counts */}
      {stats.languageCounts && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Code className="h-5 w-5 text-indigo-600" />
            Problems by Language
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(stats.languageCounts).map(([lang, count]) => (
              <div key={lang} className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors">
                <div className="text-2xl mb-2">{languageIcons[lang]}</div>
                <p className="text-sm font-medium text-gray-600">{languageNames[lang]}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}