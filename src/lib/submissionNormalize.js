/**
 * Shared normalisation for values written to the Submission model.
 *
 * The Submission schema validates `language` against a fixed list and requires a
 * non-empty `code`. Auto-submitted work (time expiry) routinely carries neither -
 * a student may never have opened a question - so both are coerced here instead
 * of letting the save throw and silently lose the attempt.
 */

// Mirrors the enum in the Submission schema's language validator
const SUPPORTED_SUBMISSION_LANGUAGES = [
  'javascript',
  'python',
  'java',
  'cpp',
  'c',
  'rust',
  'go',
  'kotlin'
];

const LANGUAGE_ALIASES = {
  js: 'javascript',
  'node': 'javascript',
  'nodejs': 'javascript',
  'node.js': 'javascript',
  typescript: 'javascript',
  ts: 'javascript',
  py: 'python',
  python3: 'python',
  'c++': 'cpp',
  'cpp programming': 'cpp',
  'c++ programming': 'cpp',
  'c programming': 'c',
  'embedded c programming': 'c',
  'embedded c': 'c',
  golang: 'go'
};

export const EMPTY_CODE_PLACEHOLDER = '// No code submitted';

export function normalizeSubmissionLanguage(language, fallback = 'javascript') {
  if (!language) return fallback;

  const key = String(language).toLowerCase().trim();

  if (SUPPORTED_SUBMISSION_LANGUAGES.includes(key)) return key;
  if (LANGUAGE_ALIASES[key]) return LANGUAGE_ALIASES[key];

  return fallback;
}

export function normalizeSubmissionCode(code) {
  if (typeof code !== 'string' || code.trim() === '') {
    return EMPTY_CODE_PLACEHOLDER;
  }
  return code;
}

export { SUPPORTED_SUBMISSION_LANGUAGES };
