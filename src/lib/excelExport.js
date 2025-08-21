import * as XLSX from 'xlsx';

/**
 * Format date for Excel export
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
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
    hour12: false
  });
};

/**
 * Export submissions to Excel file
 * @param {Array} submissions - Array of submission objects
 * @param {string} fileName - Name of the Excel file to download
 * @param {string} submissionType - Type of submission ('problem', 'test', 'level')
 */
export const exportSubmissionsToExcel = (submissions, fileName = 'submissions.xlsx', submissionType = 'problem') => {
  try {
    // Prepare data based on submission type
    let excelData = [];

    if (submissionType === 'problem') {
      excelData = submissions.map(submission => ({
        'Type': 'Problem',
        'Student': submission.student?.name || 'Unknown',
        'Title': submission.problem?.title || 'Unknown',
        'Status': submission.status,
        'Score': submission.score || 0,
        'Date': formatDate(submission.submittedAt),
        'Language': submission.language || '',
        'Execution Time': submission.executionTime || '',
        'Memory': submission.memory || ''
      }));
    } else if (submissionType === 'test') {
      excelData = submissions.map(submission => ({
        'Type': 'Test',
        'Student': submission.student?.name || 'Unknown',
        'Title': submission.test?.title || 'Unknown',
        'Status': submission.status || 'Completed',
        'Score': `${submission.score || 0}/${submission.totalScore || 0}`,
        'Date': formatDate(submission.submittedAt),
        'Time Taken': submission.timeTaken ? `${Math.floor(submission.timeTaken / 60)}m ${submission.timeTaken % 60}s` : '',
        'Pass Rate': submission.totalQuestions > 0 ? `${Math.round((submission.correctAnswers / submission.totalQuestions) * 100)}%` : '0%'
      }));
    } else if (submissionType === 'level') {
      excelData = submissions.map(submission => ({
        'Type': 'Level',
        'Student': submission.studentName || 'Unknown',
        'Title': `Level ${submission.level || 'Unknown'}`,
        'Status': submission.completed ? 'Completed' : 'In Progress',
        'Score': submission.totalScore || 0,
        'Date': formatDate(submission.completedAt || submission.createdAt),
        'Problems Solved': `${submission.solvedProblems || 0}/${submission.totalProblems || 0}`,
        'Pass Rate': submission.totalProblems > 0 ? `${Math.round((submission.solvedProblems / submission.totalProblems) * 100)}%` : '0%'
      }));
    }

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Auto-size columns
    const maxWidth = 50;
    const colWidths = {};
    
    // Calculate column widths based on content
    Object.keys(excelData[0] || {}).forEach((key, index) => {
      const column = XLSX.utils.encode_col(index);
      const values = [key, ...excelData.map(row => String(row[key] || ''))];
      const maxLength = Math.max(...values.map(val => val.length));
      colWidths[column] = Math.min(maxLength + 2, maxWidth);
    });

    ws['!cols'] = Object.keys(colWidths).map(col => ({ wch: colWidths[col] }));

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Submissions');

    // Generate Excel file and trigger download
    XLSX.writeFile(wb, fileName);

    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return false;
  }
};

/**
 * Export selected submissions to Excel
 * @param {Array} allSubmissions - All submissions
 * @param {Array} selectedIds - Array of selected submission IDs
 * @param {string} fileName - Name of the Excel file
 * @param {string} submissionType - Type of submission
 */
export const exportSelectedSubmissionsToExcel = (allSubmissions, selectedIds, fileName = 'selected_submissions.xlsx', submissionType = 'problem') => {
  const selectedSubmissions = allSubmissions.filter(submission => 
    selectedIds.includes(submission._id || submission.id)
  );
  
  if (selectedSubmissions.length === 0) {
    alert('No submissions selected for export');
    return false;
  }

  return exportSubmissionsToExcel(selectedSubmissions, fileName, submissionType);
};