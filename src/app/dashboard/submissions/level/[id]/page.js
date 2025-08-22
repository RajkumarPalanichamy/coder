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
  Calendar,
  BarChart
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Monaco Editor for code display
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export default function LevelSubmissionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState(null);

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
      console.log('🔍 Debug: Received submission data:', data);
      setSubmission(data.levelSubmission);
      
      // Select first problem by default
      if (data.levelSubmission?.problemSubmissions?.length > 0) {
        console.log('🔍 Debug: Setting first problem:', data.levelSubmission.problemSubmissions[0]);
        setSelectedProblem(data.levelSubmission.problemSubmissions[0]);
      } else {
        console.log('🔍 Debug: No problem submissions found in data');
      }
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
      case 'passed':
        return {
          color: 'text-green-600 bg-green-50',
          icon: CheckCircle,
          text: status === 'accepted' ? 'Accepted' : status === 'passed' ? 'Passed' : 'Completed'
        };
      case 'wrong_answer':
      case 'failed':
        return {
          color: 'text-red-600 bg-red-50',
          icon: XCircle,
          text: status === 'failed' ? 'Failed' : 'Wrong Answer'
        };
      case 'runtime_error':
        return {
          color: 'text-orange-600 bg-orange-50',
          icon: Code,
          text: 'Runtime Error'
        };
      case 'compilation_error':
        return {
          color: 'text-red-600 bg-red-50',
          icon: Code,
          text: 'Compilation Error'
        };
      case 'time_limit_exceeded':
        return {
          color: 'text-orange-600 bg-orange-50',
          icon: Timer,
          text: 'Time Limit Exceeded'
        };
      case 'pending':
      case 'not_attempted':
        return {
          color: 'text-blue-600 bg-blue-50',
          icon: Clock,
          text: status === 'not_attempted' ? 'Not Attempted' : 'Pending'
        };
      case 'in_progress':
        return {
          color: 'text-yellow-600 bg-yellow-50',
          icon: Clock,
          text: 'In Progress'
        };
      case 'submitted':
        return {
          color: 'text-indigo-600 bg-indigo-50',
          icon: Award,
          text: 'Submitted'
        };
      case 'time_expired':
        return {
          color: 'text-red-600 bg-red-50',
          icon: Timer,
          text: 'Time Expired'
        };
      default:
        return {
          color: 'text-gray-600 bg-gray-50',
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
            onClick={() => router.push('/dashboard/submissions')}
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard/submissions')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Submissions
          </button>
          <h1 className="text-2xl font-bold">Level Submission Details</h1>
        </div>

        {/* Submission Overview */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-2">Level & Category</p>
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
              <p className="text-sm text-gray-500 mb-2">Overall Status</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${overallStatus.color}`}>
                {OverallStatusIcon && <OverallStatusIcon className="h-4 w-4 mr-1" />}
                {overallStatus.text}
              </span>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-2">Submitted</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-indigo-600">
                {submission.completedProblems}/{submission.totalProblems}
              </p>
              <p className="text-sm text-gray-600">Problems Completed</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {submission.status === 'submitted' ? 'Completed' : 'In Progress'}
              </p>
              <p className="text-sm text-gray-600">Overall Status</p>
            </div>
          </div>
          
          {/* Simple Status - No Numbers */}
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium text-gray-700 mb-2">Individual Problem Results</p>
            <div className="text-sm text-gray-600">
              <p>Click on each problem below to see if it was passed or failed</p>
            </div>
          </div>
        </div>

        {/* Problems and Code */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Problem List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h3 className="font-semibold flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  Problems
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {submission.problemSubmissions?.map((ps, index) => {
                  // Use passFailStatus if available, otherwise fall back to status
                  const statusToShow = ps.submission?.passFailStatus || ps.submission?.status || 'pending';
                  const subStatus = getStatusStyle(statusToShow);
                  const SubStatusIcon = subStatus.icon;
                  const isSelected = selectedProblem?._id === ps._id;
                  
                  return (
                    <button
                      key={ps._id || index}
                      onClick={() => setSelectedProblem(ps)}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                        isSelected ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-medium text-gray-900">
                          Problem {ps.order || index + 1}
                        </h4>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${subStatus.color}`}>
                          {SubStatusIcon && <SubStatusIcon className="h-3 w-3 mr-1" />}
                          {subStatus.text}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {ps.problem?.title || 'N/A'}
                      </p>
                      {ps.submission && (
                        <div className="mt-2 flex justify-between text-xs text-gray-500">
                          <span>Status: {ps.submission.passFailStatus ? ps.submission.passFailStatus.charAt(0).toUpperCase() + ps.submission.passFailStatus.slice(1) : 'Pending'}</span>
                          <span>Language: {ps.submission.language}</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h3 className="font-semibold">
                  {selectedProblem?.problem?.title || 'Select a problem to view code'}
                </h3>
                {selectedProblem?.submission && (
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                    <span>Status: {selectedProblem.submission.passFailStatus ? selectedProblem.submission.passFailStatus.charAt(0).toUpperCase() + selectedProblem.submission.passFailStatus.slice(1) : 'Pending'}</span>
                    <span>Language: {selectedProblem.submission.language}</span>
                    <span>Execution Time: {selectedProblem.submission.executionTime || 0}ms</span>
                  </div>
                )}
              </div>
              
              {selectedProblem?.submission?.code ? (
                <div className="p-0">
                  <MonacoEditor
                    height="500px"
                    language={submission.programmingLanguage || 'javascript'}
                    value={selectedProblem.submission.code}
                    theme="vs-light"
                    options={{
                      readOnly: true,
                      fontSize: 14,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      wordWrap: 'on',
                      automaticLayout: true,
                    }}
                  />
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  {selectedProblem ? 'No code submitted for this problem' : 'Select a problem to view code'}
                </div>
              )}
              
              {/* Test Results */}
              {selectedProblem?.submission?.executionInfo && (
                <div className="p-4 border-t">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Execution Details</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Engine: {selectedProblem.submission.executionInfo.executionEngine}</p>
                    <p>Language: {selectedProblem.submission.executionInfo.language?.id || submission.programmingLanguage}</p>
                    {selectedProblem.submission.executionInfo.error && (
                      <p className="text-red-600">Error: {selectedProblem.submission.executionInfo.error}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}