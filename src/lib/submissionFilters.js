/** The test, problem or level a submission belongs to. */
export function assessmentTitle(submission) {
  return submission.problem?.title || submission.test?.title || submission.level || '';
}

/** Search the person and assessment fields used by all three submission APIs. */
export function matchesSubmission(submission, query = '', status = 'all', assessment = 'all') {
  const person = submission.student || submission.user || {};
  const searchable = [person.firstName, person.lastName, person.username, person.email,
    submission.studentName, submission.problem?.title, submission.test?.title,
    submission.level, submission.category, submission.programmingLanguage];
  const text = searchable.filter(Boolean).join(' ').toLowerCase();
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return words.every(word => text.includes(word)) &&
    (status === 'all' || submission.status === status) &&
    (assessment === 'all' || assessmentTitle(submission) === assessment);
}
