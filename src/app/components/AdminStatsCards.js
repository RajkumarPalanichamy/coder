import { Users, BookOpen, BarChart3 } from 'lucide-react';

export default function AdminStatsCards({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <Users className="h-8 w-8 text-indigo-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Students</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <BookOpen className="h-8 w-8 text-green-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Problems</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalProblems}</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <BarChart3 className="h-8 w-8 text-purple-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Submissions</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalSubmissions}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 