import * as XLSX from 'xlsx';
import { formatStudentName } from './formatStudentName';

function formatDateOnly(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatTimeOnly(date) {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function formatTitle(submission) {
  return submission.problem?.title || submission.test?.title || 'Unknown';
}

function rowProblem(submission) {
  return {
    Student: formatStudentName(submission),
    Title: formatTitle(submission),
    Status: submission.status || '',
    Score: `${submission.score ?? 0}%`,
    Date: formatDateOnly(submission.submittedAt),
    Time: formatTimeOnly(submission.submittedAt),
    Language: submission.language || '',
    'Time Taken': '',
  };
}

function rowTest(submission) {
  const timeTaken =
    submission.timeTaken != null
      ? `${Math.floor(submission.timeTaken / 60)}m ${submission.timeTaken % 60}s`
      : '';
  const totalScore = submission.totalQuestions ?? 0;
  return {
    Student: formatStudentName(submission),
    Title: formatTitle(submission),
    Status: submission.status || 'Completed',
    Score: `${submission.correctAnswers ?? 0}/${totalScore} (${submission.score ?? 0}%)`,
    Date: formatDateOnly(submission.submittedAt),
    Time: formatTimeOnly(submission.submittedAt),
    Language: submission.language || 'multiple_choice',
    'Time Taken': timeTaken,
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
        Date: formatDateOnly(submission.completedAt || submission.createdAt),
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

export const downloadStudentImportTemplate = (fileName = 'student_import_template.xlsx') => {
  try {
    const sampleRows = [
      { 'First Name': 'Aditi', 'Last Name': 'Sharma', 'Email': 'aditi.sharma@example.com' },
      { 'First Name': 'Rahul', 'Last Name': 'Verma', 'Email': 'rahul.verma@example.com' },
    ];

    const wb = XLSX.utils.book_new();

    const ws = XLSX.utils.json_to_sheet(sampleRows);
    ws['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 32 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Students');

    const instructions = [
      { Instructions: 'Fill one row per student below. Keep the header row exactly as-is.' },
      { Instructions: 'Required columns: First Name, Last Name, Email.' },
      { Instructions: 'Each email must be unique - rows with an email already in use are skipped automatically.' },
      { Instructions: "Don't add a Password column - a common temporary password is set on the upload screen and applied to every student in this file." },
      { Instructions: 'Students can change their password anytime from their own profile page.' },
      { Instructions: 'Large files (tens of thousands of rows) upload in automatic batches - keep the browser tab open until it finishes.' },
    ];
    const wsInfo = XLSX.utils.json_to_sheet(instructions);
    wsInfo['!cols'] = [{ wch: 95 }];
    XLSX.utils.book_append_sheet(wb, wsInfo, 'Instructions');

    XLSX.writeFile(wb, fileName);
    return true;
  } catch (error) {
    console.error('Error generating student import template:', error);
    return false;
  }
};

export const exportBulkImportReport = (rows, fileName = 'bulk_import_report.xlsx') => {
  try {
    if (!rows || rows.length === 0) return false;

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{ wch: 8 }, { wch: 34 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Skipped Rows');
    XLSX.writeFile(wb, fileName);
    return true;
  } catch (error) {
    console.error('Error exporting bulk import report:', error);
    return false;
  }
};

export const exportStudentsToExcel = (students, fileName = 'students.xlsx') => {
  try {
    const excelData = students.map((student) => ({
      Name: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
      Email: student.email || '',
      Status: student.isActive ? 'Active' : 'Inactive',
      'Joined Date': student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A',
      'Last Login': student.lastLogin ? new Date(student.lastLogin).toLocaleDateString() : 'N/A',
    }));

    if (excelData.length === 0) {
      alert('No students to export');
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

    XLSX.utils.book_append_sheet(wb, ws, 'Students');

    XLSX.writeFile(wb, fileName);

    return true;
  } catch (error) {
    console.error('Error exporting students to Excel:', error);
    return false;
  }
};

