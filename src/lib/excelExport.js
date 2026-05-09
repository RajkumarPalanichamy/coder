import * as XLSX from 'xlsx';

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

/** Problem API populates `user`; test API populates `student`. */
function formatStudentName(submission) {
  const p = submission.student || submission.user;
  if (!p) return 'Unknown';
  const first = p.firstName?.trim?.() || '';
  const last = p.lastName?.trim?.() || '';
  const combined = `${first} ${last}`.trim();
  if (combined) return combined;
  if (p.name) return String(p.name);
  if (p.email) return String(p.email);
  return 'Unknown';
}

function formatTitle(submission) {
  return submission.problem?.title || submission.test?.title || 'Unknown';
}

function rowProblem(submission) {
  const exec =
    submission.executionTime != null && submission.executionTime !== ''
      ? `${submission.executionTime} ms`
      : '';
  const mem =
    submission.memoryUsed != null && submission.memoryUsed !== ''
      ? `${submission.memoryUsed} MB`
      : '';
  return {
    Type: 'Problem',
    Student: formatStudentName(submission),
    Title: formatTitle(submission),
    Status: submission.status || '',
    Score: `${submission.score ?? 0}%`,
    Date: formatDate(submission.submittedAt),
    Language: submission.language || '',
    'Execution Time': exec,
    Memory: mem,
    'Time Taken': '',
    'Pass Rate': '',
  };
}

function rowTest(submission) {
  const passRate =
    submission.totalQuestions > 0
      ? `${Math.round((submission.correctAnswers / submission.totalQuestions) * 100)}%`
      : '0%';
  const timeTaken =
    submission.timeTaken != null
      ? `${Math.floor(submission.timeTaken / 60)}m ${submission.timeTaken % 60}s`
      : '';
  const totalScore = submission.totalQuestions ?? 0;
  return {
    Type: 'Test',
    Student: formatStudentName(submission),
    Title: formatTitle(submission),
    Status: submission.status || 'Completed',
    Score: `${submission.correctAnswers ?? 0}/${totalScore} (${submission.score ?? 0}%)`,
    Date: formatDate(submission.submittedAt),
    Language: submission.language || 'multiple_choice',
    'Execution Time': '',
    Memory: '',
    'Time Taken': timeTaken,
    'Pass Rate': passRate,
  };
}

/**
 * @param {Array} submissions
 * @param {string} fileName
 * @param {'problem' | 'test' | 'level' | 'mixed'} submissionType — use 'mixed' when filter is "All" (rows have .type)
 */
export const exportSubmissionsToExcel = (
  submissions,
  fileName = 'submissions.xlsx',
  submissionType = 'problem'
) => {
  try {
    let excelData = [];

    if (submissionType === 'mixed') {
      excelData = submissions.map((sub) =>
        sub.type === 'test' ? rowTest(sub) : rowProblem(sub)
      );
    } else if (submissionType === 'problem') {
      excelData = submissions.map(rowProblem);
    } else if (submissionType === 'test') {
      excelData = submissions.map(rowTest);
    } else if (submissionType === 'level') {
      excelData = submissions.map((submission) => ({
        Type: 'Level',
        Student: submission.studentName || 'Unknown',
        Title: `Level ${submission.level || 'Unknown'}`,
        Status: submission.completed ? 'Completed' : 'In Progress',
        Score: submission.totalScore || 0,
        Date: formatDate(submission.completedAt || submission.createdAt),
        'Problems Solved': `${submission.solvedProblems || 0}/${submission.totalProblems || 0}`,
        'Pass Rate':
          submission.totalProblems > 0
            ? `${Math.round((submission.solvedProblems / submission.totalProblems) * 100)}%`
            : '0%',
      }));
    }

    if (excelData.length === 0) {
      alert('No submissions to export');
      return false;
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    const maxWidth = 50;
    const colWidths = {};
    const headers = Object.keys(excelData[0] || {});

    headers.forEach((key, index) => {
      const column = XLSX.utils.encode_col(index);
      const values = [key, ...excelData.map((row) => String(row[key] || ''))];
      const maxLength = Math.max(...values.map((val) => val.length), 4);
      colWidths[column] = Math.min(maxLength + 2, maxWidth);
    });

    ws['!cols'] = Object.keys(colWidths).map((col) => ({ wch: colWidths[col] }));

    XLSX.utils.book_append_sheet(wb, ws, 'Submissions');

    XLSX.writeFile(wb, fileName);

    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return false;
  }
};

export const exportSelectedSubmissionsToExcel = (
  allSubmissions,
  selectedIds,
  fileName = 'selected_submissions.xlsx',
  submissionType = 'problem'
) => {
  const idSet = new Set(selectedIds.map((id) => String(id)));
  const selectedSubmissions = allSubmissions.filter((submission) =>
    idSet.has(String(submission._id))
  );

  if (selectedSubmissions.length === 0) {
    alert('No submissions selected for export');
    return false;
  }

  return exportSubmissionsToExcel(selectedSubmissions, fileName, submissionType);
};
