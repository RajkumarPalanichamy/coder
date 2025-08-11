import { Users, BookOpen, BarChart3, TrendingUp, Code, Star, Target } from 'lucide-react';

// Language icons mapping
const languageIcons = {
  'javascript': '🟨',
  'python': '🐍',
  'java': '☕',
  'cpp': '⚡',
  'c': '🔧',
  'csharp': '🔷'
};

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
              Active learners
            </p>
          </div>
          <div className="bg-indigo-100/50 p-3 rounded-lg">
            <Users className="h-8 w-8 text-indigo-600" />
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

      <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-orange-600/80">Average Score</p>
            <p className="text-3xl font-bold text-orange-900 mt-2">{stats.avgScore || 0}%</p>
            <p className="text-sm text-orange-600/60 mt-2">
              <Target className="h-4 w-4 inline mr-1" />
              Success rate
            </p>
          </div>
          <div className="bg-orange-100/50 p-3 rounded-lg">
            <Star className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-600/80">Total Problems</p>
            <p className="text-3xl font-bold text-emerald-900 mt-2">{stats.totalProblems}</p>
            <p className="text-sm text-emerald-600/60 mt-2">
              <Code className="h-4 w-4 inline mr-1" />
              Coding challenges
            </p>
          </div>
          <div className="bg-emerald-100/50 p-3 rounded-lg">
            <BookOpen className="h-8 w-8 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* Language-specific problem counts */}
      {stats.problemsByLanguage && Object.keys(stats.problemsByLanguage).length > 0 && (
        <div className="md:col-span-2 lg:col-span-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Problems by Language</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(stats.problemsByLanguage).map(([language, count]) => (
              <div key={language} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">{languageIcons[language] || '💻'}</div>
                <div className="text-sm font-medium text-gray-600 capitalize">{language}</div>
                <div className="text-xl font-bold text-gray-900">{count}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}