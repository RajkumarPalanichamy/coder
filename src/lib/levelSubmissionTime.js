export function getLevelTimeUsed(levelSubmission, now = new Date()) {
  const timeAllowed = levelSubmission.timeAllowed || 0;

  if (!levelSubmission.startTime) {
    return Math.min(levelSubmission.timeUsed || 0, timeAllowed);
  }

  const startTime = new Date(levelSubmission.startTime);
  const endTime = levelSubmission.submitTime
    ? new Date(levelSubmission.submitTime)
    : now;
  const elapsed = Math.floor((endTime - startTime) / 1000);

  return Math.min(Math.max(0, elapsed), timeAllowed);
}

export function getLevelEffectiveStatus(levelSubmission, now = new Date()) {
  if (levelSubmission.status !== 'in_progress' || !levelSubmission.startTime) {
    return levelSubmission.status;
  }

  const startTime = new Date(levelSubmission.startTime);
  const elapsed = Math.floor((now - startTime) / 1000);

  if (elapsed >= levelSubmission.timeAllowed) {
    return 'time_expired';
  }

  return levelSubmission.status;
}

export function formatDuration(seconds) {
  const total = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
