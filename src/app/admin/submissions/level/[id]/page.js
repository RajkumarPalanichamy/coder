'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Code,
  Timer,
  Award,
  Target,
  FileText,
  User,
  Calendar,
  BarChart
} from 'lucide-react';
import AdminSidebar from '../../../../components/AdminSidebar';

export default function AdminLevelSubmissionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    router.push('/login');
  };

  useEffect(() => {
    fetchSubmissionDetails();
  }, [id]);

  const fetchSubmissionDetails = async () => {
    try {
      const response = await fetch(`/api/submissions/level/${id}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch submission details');
      }

      const data = await response.json();
      setSubmission(data.levelSubmission);
    } catch (err) {
      console.error('Error fetching submission details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'accepted':
      case 'completed':
        return {
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle,
          text: status === 'accepted' ? 'Accepted' : 'Completed'
        };
      case 'wrong_answer':
        return {
          color: 'bg-red-100 text-red-800',
          icon: XCircle,
          text: 'Wrong Answer'
        };
      case 'runtime_error':
        return {
          color: 'bg-orange-100 text-orange-800',
          icon: Code,
          text: 'Runtime Error'
        };
      case 'compilation_error':
        return {
          color: 'bg-red-100 text-red-800',
          icon: Code,
          text: 'Compilation Error'
        };
      case 'time_limit_exceeded':
        return {
          color: 'bg-orange-100 text-orange-800',
          icon: Timer,
          text: 'Time Limit Exceeded'
        };
      case 'pending':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: Clock,
          text: 'Pending'
        };
      case 'in_progress':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: Clock,
          text: 'In Progress'
        };
      case 'submitted':
        return {
          color: 'bg-indigo-100 text-indigo-800',
          icon: Award,
          text: 'Submitted'
        };
      case 'time_expired':
        return {
          color: 'bg-red-100 text-red-800',
          icon: Timer,
          text: 'Time Expired'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: FileText,
          text: status
        };
    }
  };

  const getLevelStyle = (level) => {
    switch (level) {
      case 'level1':
        return 'bg-green-100 text-green-800';
      case 'level2':
        return 'bg-yellow-100 text-yellow-800';
      case 'level3':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading submission details...</p>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Submission not found'}</p>
          <button
            onClick={() => router.push('/admin/submissions')}
            className="text-indigo-600 hover:text-indigo-500"
          >
            Back to Submissions
          </button>
        </div>
      </div>
    );
  }

  const overallStatus = getStatusStyle(submission.status);
  const OverallStatusIcon = overallStatus.icon;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar onLogout={handleLogout} />
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin/submissions')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Submissions
          </button>
          <h1 className="text-2xl font-bold">Level Submission Details</h1>
        </div>

        {/* Submission Overview */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Student</p>
              <div className="flex items-center">
                <User className="h-4 w-4 text-gray-400 mr-2" />
                <div>
                  <p className="font-medium">{submission.user?.name || 'N/A'}</p>
                  <p className="text-sm text-gray-500">{submission.user?.email || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-1">Level & Category</p>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${getLevelStyle(submission.level)}`}>
                  {submission.level === 'level1' ? 'Level 1' :
                   submission.level === 'level2' ? 'Level 2' : 'Level 3'}
                </span>
                <span className="text-sm font-medium">{submission.category}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Language: <span className="font-medium capitalize">{submission.programmingLanguage}</span>
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-1">Status</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${overallStatus.color}`}>
                {OverallStatusIcon && <OverallStatusIcon className="h-4 w-4 mr-1" />}
                {overallStatus.text}
              </span>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-1">Timing</p>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm font-medium">
                    {new Date(submission.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Time Used: {Math.floor(submission.timeUsed / 60)}m {submission.timeUsed % 60}s
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Summary */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart className="h-5 w-5 mr-2" />
            Progress Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-indigo-600">
                {submission.completedProblems}/{submission.totalProblems}
              </p>
              <p className="text-sm text-gray-600">Problems Completed</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {submission.totalScore}%
              </p>
              <p className="text-sm text-gray-600">Total Score</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {submission.totalPoints || 0}
              </p>
              <p className="text-sm text-gray-600">Total Points</p>
            </div>
          </div>
          
          {/* Submission Summary */}
          {submission.submissionSummary && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium text-gray-700 mb-2">Submission Results</p>
              <div className="flex flex-wrap gap-2">
                {submission.submissionSummary.accepted > 0 && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    Accepted: {submission.submissionSummary.accepted}
                  </span>
                )}
                {submission.submissionSummary.wrongAnswer > 0 && (
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                    Wrong Answer: {submission.submissionSummary.wrongAnswer}
                  </span>
                )}
                {submission.submissionSummary.timeLimit > 0 && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                    Time Limit: {submission.submissionSummary.timeLimit}
                  </span>
                )}
                {submission.submissionSummary.runtimeError > 0 && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                    Runtime Error: {submission.submissionSummary.runtimeError}
                  </span>
                )}
                {submission.submissionSummary.compilationError > 0 && (
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                    Compilation Error: {submission.submissionSummary.compilationError}
                  </span>
                )}
                {submission.submissionSummary.pending > 0 && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    Pending: {submission.submissionSummary.pending}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Individual Problem Submissions */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Individual Problem Submissions
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Problem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Test Cases
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Execution Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {submission.problemSubmissions?.map((ps, index) => {
                  const subStatus = ps.submission ? getStatusStyle(ps.submission.status) : getStatusStyle('pending');
                  const SubStatusIcon = subStatus.icon;
                  
                  return (
                    <tr key={ps._id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ps.order || index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-medium text-gray-900">
                          {ps.problem?.title || 'N/A'}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          getLevelStyle(ps.problem?.difficulty)
                        }`}>
                          {ps.problem?.difficulty === 'level1' ? 'Level 1' :
                           ps.problem?.difficulty === 'level2' ? 'Level 2' :
                           ps.problem?.difficulty === 'level3' ? 'Level 3' : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${subStatus.color}`}>
                          {SubStatusIcon && <SubStatusIcon className="h-3 w-3 mr-1" />}
                          {subStatus.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-bold ${
                          ps.submission?.score >= 90 ? 'text-green-600' :
                          ps.submission?.score >= 70 ? 'text-yellow-600' :
                          ps.submission?.score > 0 ? 'text-red-600' : 'text-gray-400'
                        }`}>
                          {ps.submission?.score ?? 0}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ps.submission ? 
                          `${ps.submission.testCasesPassed}/${ps.submission.totalTestCases}` : 
                          'N/A'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ps.submission?.executionTime ? 
                          `${ps.submission.executionTime}ms` : 
                          'N/A'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {ps.submission && (
                          <button
                            onClick={() => router.push(`/problems/${ps.problem._id}?submission=${ps.submission._id}`)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View Code
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}