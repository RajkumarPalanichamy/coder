/**
 * Per-tab record of the attempt a student currently has open.
 *
 * A submitted attempt is closed here the moment the server confirms it, which is what
 * stops the back button, a refresh, or a pasted URL from dropping the student back into
 * an answer sheet they have already handed in. It is a UX lock, not the security boundary:
 * submissions are append-only server-side, so a closed attempt can never be edited even if
 * this record is cleared by hand - the worst a student can do is start a fresh attempt.
 *
 * sessionStorage (not localStorage) on purpose: the lock should die with the tab, so a
 * student who closes the browser mid-attempt is not locked out of starting a new one.
 */
const KEY_PREFIX = 'test-attempt:';

export const ATTEMPT_IN_PROGRESS = 'in_progress';
export const ATTEMPT_CLOSED = 'closed';

const keyFor = (testId) => `${KEY_PREFIX}${testId}`;

// Private-mode browsers throw on any sessionStorage access, so every call is guarded.
function read(testId) {
  try {
    const raw = window.sessionStorage.getItem(keyFor(testId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(testId, value) {
  try {
    window.sessionStorage.setItem(keyFor(testId), JSON.stringify(value));
  } catch {
    /* storage unavailable - the server-side append-only guarantee still holds */
  }
}

export function getAttempt(testId) {
  return read(testId);
}

export function isAttemptClosed(testId) {
  return read(testId)?.status === ATTEMPT_CLOSED;
}

export function startAttempt(testId) {
  const attempt = {
    token: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    status: ATTEMPT_IN_PROGRESS,
    startedAt: Date.now()
  };
  write(testId, attempt);
  return attempt;
}

/** Marks the open attempt as handed in. Irreversible for the life of the tab. */
export function closeAttempt(testId, reason = 'manual') {
  const attempt = read(testId) || {};
  const closed = {
    ...attempt,
    status: ATTEMPT_CLOSED,
    closedAt: Date.now(),
    reason
  };
  write(testId, closed);
  return closed;
}

/** Clears the lock so the student can begin a new attempt. */
export function clearAttempt(testId) {
  try {
    window.sessionStorage.removeItem(keyFor(testId));
  } catch {
    /* nothing to clear */
  }
}
