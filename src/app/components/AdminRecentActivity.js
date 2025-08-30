import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Clock, 
  User, 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  Activity,
  Eye
} from 'lucide-react';

export default function AdminRecentActivity() {
  const router = useRouter();
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      // Fetch recent submissions
      const submissionsRes = await fetch('/api/admin/submissions?limit=10', { credentials: 'include' });
      const submissionsData = await submissionsRes.json();
      
      // Fetch recent students
      const studentsRes = await fetch('/api/admin/students?limit=5', { credentials: 'include' });
      const studentsData = await studentsRes.json();

      // Combine and format activities
      const activities = [];
      
      // Add submissions
      submissionsData.submissions?.forEach(sub => {
        activities.push({
          id: sub._id,
          type: 'submission',
          title: `${sub.user?.firstName} ${sub.user?.lastName} submitted ${sub.problem?.title}`,
          description: `${sub.problem?.category} - ${sub.problem?.difficulty}`,
          status: sub.isCorrect ? 'success' : 'error',
          timestamp: sub.submittedAt || sub.createdAt,
          user: sub.user,
          problem: sub.problem,
          isCorrect: sub.isCorrect,
          language: sub.problem?.programmingLanguage
        });
      });

      // Add new students
      studentsData.students?.forEach(student => {
        activities.push({
          id: student._id,
          type: 'student',
          title: `New student registered: ${student.firstName} ${student.lastName}`,
          description: student.email,
          status: 'info',
          timestamp: student.createdAt,
          user: student
        });
      });

      // Sort by timestamp
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      setRecentActivity(activities.slice(0, 15));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status, type) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'info':
        return type === 'student' ? <User className="h-5 w-5 text-blue-500" /> : <BookOpen className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const handleViewDetails = (activity) => {
    if (activity.type === 'submission') {
      router.push(`/admin/submissions/level/${activity.id}`);
    } else if (activity.type === 'student') {
      router.push(`/admin/students/${activity.id}/edit`);
    }
  };

  const getLanguageImage = (language) => {
    if (!language) return null;
    
    switch (language.toLowerCase()) {
      case 'javascript':
        return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" alt="JavaScript" className="h-4 w-4" />;
      case 'python':
        return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" alt="Python" className="h-4 w-4" />;
      case 'java':
        return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" alt="Java" className="h-4 w-4" />;
      case 'cpp':
      case 'c++':
        return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg" alt="C++" className="h-4 w-4" />;
      case 'csharp':
      case 'c#':
        return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg" alt="C#" className="h-4 w-4" />;
      case 'c':
        return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg" alt="C" className="h-4 w-4" />;
      case 'go':
        return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg" alt="Go" className="h-4 w-4" />;
      case 'rust':
        return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-plain.svg" alt="Rust" className="h-4 w-4" />;
      case 'kotlin':
        return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg" alt="Kotlin" className="h-4 w-4" />;
      case 'typescript':
        return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" alt="TypeScript" className="h-4 w-4" />;
      case 'php':
        return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg" alt="PHP" className="h-4 w-4" />;
      case 'ruby':
        return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ruby/ruby-original.svg" alt="Ruby" className="h-4 w-4" />;
      case 'swift':
        return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg" alt="Swift" className="h-4 w-4" />;
      default:
        return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/code/code-plain.svg" alt="Code" className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Activity className="h-6 w-6 text-indigo-600" />
          <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
        </div>
        <button
          onClick={fetchRecentActivity}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          <TrendingUp className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {recentActivity.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No recent activity</p>
          </div>
        ) : (
          recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer"
              onClick={() => handleViewDetails(activity)}
            >
              <div className="flex-shrink-0">
                {getStatusIcon(activity.status, activity.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {activity.title}
                  </p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                    {activity.type}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                
                {activity.type === 'submission' && (
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      activity.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {activity.isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                    {activity.problem?.difficulty && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        activity.problem.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                        activity.problem.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {activity.problem.difficulty}
                                              </span>
                      )}
                      {activity.language && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          {getLanguageImage(activity.language)}
                          <span className="capitalize">{activity.language}</span>
                        </div>
                      )}
                    </div>
                  )}
              </div>

              <div className="flex items-center space-x-2 text-xs text-gray-400">
                <Clock className="h-3 w-3" />
                <span>{formatTimeAgo(activity.timestamp)}</span>
                <Eye className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))
        )}
      </div>

      {recentActivity.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={() => router.push('/admin/submissions')}
            className="w-full text-center text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            View all activity →
          </button>
        </div>
      )}
    </div>
  );
}
