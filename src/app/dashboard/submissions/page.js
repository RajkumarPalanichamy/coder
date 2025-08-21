'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Code, 
  FileText,
  BookOpen,
  Trophy,
  Target,
  Timer,
  Award
} from 'lucide-react';

function SubmissionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submissions, setSubmissions] = useState([]);
  const [levelSubmissions, setLevelSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState(searchParams.get('type') || 'all');

  useEffect(() => {
    fetchSubmissions();
    fetchLevelSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/submissions', {
        credentials: 'include'
      });
      const data = await response.json();

      if (response.ok) {
        console.log('Fetched submissions:', data.submissions);
        setSubmissions(data.submissions || []);
      } else {
        console.error('Failed to fetch submissions:', data);
        setError(data.error || 'Failed to fetch submissions');
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError('Network error. Please try again.');
    }
  };

  const fetchLevelSubmissions = async () => {
    try {
      const response = await fetch('/api/submissions/level', {
        credentials: 'include'
      });
      const data = await response.json();

      if (response.ok) {
        console.log('Fetched level submissions:', data.levelSubmissions);
        setLevelSubmissions(data.levelSubmissions || []);
      } else {
        console.error('Error fetching level submissions:', data);
      }
    } catch (err) {
      console.error('Error fetching level submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Status styling helper
  const getStatusStyle = (status) => {
    switch (status) {
      case 'accepted':
      case 'completed':
        return {
          color: 'text-green-600 bg-green-50',
          icon: CheckCircle,
          text: 'Completed'
        };
      case 'wrong_answer':
        return {
          color: 'text-red-600 bg-red-50',
          icon: XCircle,
          text: 'Wrong Answer'
        };
      case 'runtime_error':
        return {
          color: 'text-orange-600 bg-orange-50',
          icon: Code,
          text: 'Runtime Error'
        };
      case 'pending':
      case 'in_progress':
        return {
          color: 'text-blue-600 bg-blue-50',
          icon: Clock,
          text: status === 'in_progress' ? 'In Progress' : 'Pending'
        };
      case 'time_expired':
        return {
          color: 'text-red-600 bg-red-50',
          icon: Timer,
          text: 'Time Expired'
        };
      case 'submitted':
        return {
          color: 'text-indigo-600 bg-indigo-50',
          icon: Award,
          text: 'Submitted'
        };
      default:
        return {
          color: 'text-gray-600 bg-gray-50',
          icon: FileText,
          text: status.replace('_', ' ')
        };
    }
  };

  // Navigate to details
  const handleDetailsClick = (submission) => {
    if (submission.type === 'problem') {
      router.push(`/problems/${submission.problem?._id}`);
    } else if (submission.type === 'test') {
      router.push(`/dashboard/tests/${submission.test?._id}`);
    }
  };

  // Navigate to level submission details
  const handleLevelDetailsClick = (levelSubmission) => {
    router.push(`/dashboard/submissions/level/${levelSubmission._id}`);
  };

  // Filter submissions
  const getFilteredData = () => {
    let filteredSubmissions = [];
    let filteredLevelSubmissions = [];

    if (filter === 'all' || filter === 'individual') {
      filteredSubmissions = submissions.filter(submission => {
        if (filter === 'all') return true;
        return submission.type === 'problem' || submission.type === 'test';
      });
    }

    if (filter === 'all' || filter === 'level') {
      filteredLevelSubmissions = levelSubmissions;
    }

    return { filteredSubmissions, filteredLevelSubmissions };
  };

  const { filteredSubmissions, filteredLevelSubmissions } = getFilteredData();

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => {
            fetchSubmissions();
            fetchLevelSubmissions();
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Submissions</h1>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'all' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('level')}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center transition ${
              filter === 'level' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Target className="h-4 w-4 mr-2" /> Levels
          </button>
          <button
            onClick={() => setFilter('individual')}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center transition ${
              filter === 'individual' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <BookOpen className="h-4 w-4 mr-2" /> Individual
          </button>
        </div>
      </div>
      
      {filteredLevelSubmissions.length === 0 && filteredSubmissions.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-600 mb-4">No submissions yet.</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => router.push('/dashboard/problems')}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Go to Problems
            </button>
            <button
              onClick={() => router.push('/dashboard/tests')}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Go to Tests
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Level Submissions */}
          {filteredLevelSubmissions.map((levelSubmission) => {
            const StatusIcon = getStatusStyle(levelSubmission.status).icon;
            const statusStyle = getStatusStyle(levelSubmission.status);
            
            return (
              <div 
                key={levelSubmission._id} 
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow border-l-4 border-indigo-500"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-indigo-500" />
                    <h3 
                      className="text-lg font-semibold text-gray-800 cursor-pointer hover:text-indigo-600"
                      onClick={() => handleLevelDetailsClick(levelSubmission)}
                    >
                      {levelSubmission.level.toUpperCase()} - {levelSubmission.programmingLanguage} - {levelSubmission.category}
                    </h3>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600">
                      Level Submission
                    </span>
                  </div>
                  <span 
                    className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle.color}`}
                  >
                    <StatusIcon className="h-4 w-4 inline-block mr-1 -mt-1" />
                    {statusStyle.text}
                  </span>
                </div>
                
                <div className="grid grid-cols-4 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Problems:</span>
                    <p>{levelSubmission.completedProblems}/{levelSubmission.totalProblems}</p>
                  </div>
                  <div>
                    <span className="font-medium">Score:</span>
                    <p className={`font-bold ${
                      levelSubmission.totalScore === 100 
                        ? 'text-green-600' 
                        : levelSubmission.totalScore > 50 
                        ? 'text-yellow-600' 
                        : 'text-red-600'
                    }`}>
                      {levelSubmission.totalScore || 0}%
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Time Used:</span>
                    <p>{formatTime(levelSubmission.timeUsed || 0)} / {formatTime(levelSubmission.timeAllowed)}</p>
                  </div>
                  <div>
                    <span className="font-medium">Submitted:</span>
                    <p>{new Date(levelSubmission.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                {/* Summary */}
                {levelSubmission.submissionSummary && (
                  <div className="mt-3 flex space-x-4 text-xs">
                    {levelSubmission.submissionSummary.accepted > 0 && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                        ✓ {levelSubmission.submissionSummary.accepted} Accepted
                      </span>
                    )}
                    {levelSubmission.submissionSummary.wrongAnswer > 0 && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded">
                        ✗ {levelSubmission.submissionSummary.wrongAnswer} Wrong
                      </span>
                    )}
                    {levelSubmission.submissionSummary.pending > 0 && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        ⏳ {levelSubmission.submissionSummary.pending} Pending
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Individual Submissions */}
          {filteredSubmissions.map((submission) => {
            // Determine title and icon based on submission type
            const title = submission.type === 'problem' 
              ? submission.problem?.title 
              : submission.test?.title || 'Unknown';
            const TypeIcon = submission.type === 'problem' ? BookOpen : Trophy;
            
            const StatusIcon = getStatusStyle(submission.status).icon;
            const statusStyle = getStatusStyle(submission.status);
            
            return (
              <div 
                key={submission._id} 
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2">
                    <TypeIcon className="h-5 w-5 text-gray-500" />
                    <h3 
                      className="text-lg font-semibold text-gray-800 cursor-pointer hover:text-indigo-600"
                      onClick={() => handleDetailsClick(submission)}
                    >
                      {title}
                    </h3>
                    <span 
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        submission.type === 'problem' 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'bg-green-50 text-green-600'
                      }`}
                    >
                      {submission.type}
                    </span>
                  </div>
                  <span 
                    className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle.color}`}
                  >
                    <StatusIcon className="h-4 w-4 inline-block mr-1 -mt-1" />
                    {statusStyle.text}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Language:</span>
                    <p className="capitalize">{submission.type === 'problem' ? submission.language : 'Multiple Choice'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Score:</span>
                    <p className={`font-bold ${
                      submission.score === 100 
                        ? 'text-green-600' 
                        : submission.score > 50 
                        ? 'text-yellow-600' 
                        : 'text-red-600'
                    }`}>
                      {submission.score}%
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Submitted:</span>
                    <p>{new Date(submission.submittedAt).toLocaleString()}</p>
                  </div>
                  {submission.type === 'test' && (
                    <>
                      <div>
                        <span className="font-medium">Total Questions:</span>
                        <p>{submission.totalQuestions}</p>
                      </div>
                      <div>
                        <span className="font-medium">Correct Answers:</span>
                        <p>{submission.correctAnswers}</p>
                      </div>
                      <div>
                        <span className="font-medium">Time Taken:</span>
                        <p>{submission.timeTaken} seconds</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function StudentSubmissionsPage() {
  return (
    <Suspense fallback={
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    }>
      <SubmissionsContent />
    </Suspense>
  );
} 