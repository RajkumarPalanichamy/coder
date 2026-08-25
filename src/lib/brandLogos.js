/**
 * Central registry for the artwork shown on language / collection cards.
 *
 * Every card in the app (problem languages, test collections, admin listings)
 * resolves its logo through `resolveBrand`, so a name only has to be registered
 * once. Three kinds of entry exist:
 *
 *   - language: programming languages, keeping the existing devicon artwork.
 *   - company : one specific logo per company (Zoho, Accenture, ...).
 *   - college : every college shares ONE common logo; the college's own name is
 *               what distinguishes it inside that shared interface.
 *
 * Adding a company logo:
 *   1. drop the artwork in `public/logos/companies/<slug>.svg`
 *   2. point that company's entry below at it with
 *      `logo: '/logos/companies/<slug>.svg'`
 * A company registered without a `logo` renders a brand-coloured monogram tile,
 * so its tests stay recognisable until real artwork is supplied.
 */

export const COLLEGE_LOGO = '/logos/college.svg';

const DEVICON = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons';

// --- Programming languages --------------------------------------------------

const LANGUAGES = {
  javascript: { label: 'JavaScript', logo: DEVICON + '/javascript/javascript-original.svg', accent: '#f7df1e', gradient: 'from-yellow-400 to-yellow-600', border: 'border-yellow-200 hover:border-yellow-300' },
  typescript: { label: 'TypeScript', logo: DEVICON + '/typescript/typescript-original.svg', accent: '#3178c6', gradient: 'from-blue-400 to-blue-600', border: 'border-blue-200 hover:border-blue-300' },
  python: { label: 'Python', logo: DEVICON + '/python/python-original.svg', accent: '#3776ab', gradient: 'from-blue-400 to-blue-600', border: 'border-blue-200 hover:border-blue-300' },
  java: { label: 'Java', logo: DEVICON + '/java/java-original.svg', accent: '#e76f00', gradient: 'from-red-400 to-red-600', border: 'border-red-200 hover:border-red-300' },
  cpp: { label: 'C++', logo: '/c.svg', accent: '#00599c', gradient: 'from-blue-500 to-blue-700', border: 'border-blue-200 hover:border-blue-300' },
  csharp: { label: 'C#', logo: '/c--4.svg', accent: '#68217a', gradient: 'from-purple-500 to-purple-700', border: 'border-purple-200 hover:border-purple-300' },
  c: { label: 'C', logo: '/c-1.svg', accent: '#5c6bc0', gradient: 'from-gray-500 to-gray-700', border: 'border-gray-200 hover:border-gray-300' },
  go: { label: 'Go', logo: DEVICON + '/go/go-original.svg', accent: '#00add8', gradient: 'from-cyan-500 to-cyan-700', border: 'border-cyan-200 hover:border-cyan-300' },
  rust: { label: 'Rust', logo: DEVICON + '/rust/rust-plain.svg', accent: '#dea584', gradient: 'from-orange-500 to-orange-700', border: 'border-orange-200 hover:border-orange-300' },
  kotlin: { label: 'Kotlin', logo: DEVICON + '/kotlin/kotlin-original.svg', accent: '#7f52ff', gradient: 'from-violet-500 to-violet-700', border: 'border-violet-200 hover:border-violet-300' },
  php: { label: 'PHP', logo: DEVICON + '/php/php-original.svg', accent: '#777bb4', gradient: 'from-indigo-400 to-indigo-600', border: 'border-indigo-200 hover:border-indigo-300' },
  ruby: { label: 'Ruby', logo: DEVICON + '/ruby/ruby-original.svg', accent: '#cc342d', gradient: 'from-red-400 to-red-600', border: 'border-red-200 hover:border-red-300' },
  swift: { label: 'Swift', logo: DEVICON + '/swift/swift-original.svg', accent: '#f05138', gradient: 'from-orange-400 to-orange-600', border: 'border-orange-200 hover:border-orange-300' },
  sql: { label: 'SQL', logo: DEVICON + '/mysql/mysql-original.svg', accent: '#00758f', gradient: 'from-sky-500 to-sky-700', border: 'border-sky-200 hover:border-sky-300' },
  html: { label: 'HTML', logo: DEVICON + '/html5/html5-original.svg', accent: '#e34f26', gradient: 'from-orange-400 to-orange-600', border: 'border-orange-200 hover:border-orange-300' },
  css: { label: 'CSS', logo: DEVICON + '/css3/css3-original.svg', accent: '#1572b6', gradient: 'from-blue-400 to-blue-600', border: 'border-blue-200 hover:border-blue-300' },
  bash: { label: 'Bash', logo: DEVICON + '/bash/bash-original.svg', accent: '#4eaa25', gradient: 'from-green-500 to-green-700', border: 'border-green-200 hover:border-green-300' },
};

const LANGUAGE_ALIASES = {
  js: 'javascript',
  node: 'javascript',
  nodejs: 'javascript',
  'node js': 'javascript',
  ts: 'typescript',
  py: 'python',
  python3: 'python',
  'core java': 'java',
  'java programming': 'java',
  'c++': 'cpp',
  'c plus plus': 'cpp',
  'cpp programming': 'cpp',
  'c++ programming': 'cpp',
  'c#': 'csharp',
  'c sharp': 'csharp',
  'c programming': 'c',
  'embedded c': 'c',
  'embedded c programming': 'c',
  golang: 'go',
  shell: 'bash',
  mysql: 'sql',
  'my sql': 'sql',
};

// --- Companies --------------------------------------------------------------
// `match` lists extra names that resolve to the same company, so a collection
// called "Zoho Technical Test" still picks up the Zoho logo.

const COMPANIES = {
  zoho: { label: 'Zoho', logo: '/logos/companies/zoho.svg', accent: '#e42527', gradient: 'from-red-500 to-amber-500', border: 'border-red-200 hover:border-red-300' },
  accenture: { label: 'Accenture', logo: '/logos/companies/accenture.svg', accent: '#a100ff', gradient: 'from-purple-500 to-violet-700', border: 'border-purple-200 hover:border-purple-300' },
  tcs: { label: 'TCS', accent: '#0070ad', gradient: 'from-sky-600 to-blue-800', border: 'border-sky-200 hover:border-sky-300', match: ['tata consultancy services', 'tata consultancy'] },
  infosys: { label: 'Infosys', accent: '#007cc3', gradient: 'from-sky-500 to-blue-700', border: 'border-sky-200 hover:border-sky-300' },
  wipro: { label: 'Wipro', accent: '#341c53', gradient: 'from-violet-600 to-purple-800', border: 'border-violet-200 hover:border-violet-300' },
  cognizant: { label: 'Cognizant', accent: '#1c4ed8', gradient: 'from-blue-500 to-indigo-700', border: 'border-blue-200 hover:border-blue-300' },
  capgemini: { label: 'Capgemini', accent: '#0070ad', gradient: 'from-cyan-600 to-blue-700', border: 'border-cyan-200 hover:border-cyan-300' },
  hcl: { label: 'HCLTech', accent: '#0f6bb2', gradient: 'from-blue-500 to-blue-700', border: 'border-blue-200 hover:border-blue-300', match: ['hcltech', 'hcl technologies'] },
  techmahindra: { label: 'Tech Mahindra', accent: '#e4002b', gradient: 'from-red-500 to-rose-700', border: 'border-red-200 hover:border-red-300', match: ['tech mahindra'] },
  ibm: { label: 'IBM', accent: '#0f62fe', gradient: 'from-blue-600 to-indigo-800', border: 'border-blue-200 hover:border-blue-300' },
  amazon: { label: 'Amazon', accent: '#ff9900', gradient: 'from-amber-500 to-orange-600', border: 'border-amber-200 hover:border-amber-300', match: ['aws'] },
  microsoft: { label: 'Microsoft', accent: '#0078d4', gradient: 'from-sky-500 to-blue-700', border: 'border-sky-200 hover:border-sky-300' },
  google: { label: 'Google', accent: '#4285f4', gradient: 'from-blue-500 to-emerald-500', border: 'border-blue-200 hover:border-blue-300' },
  deloitte: { label: 'Deloitte', accent: '#86bc25', gradient: 'from-lime-500 to-green-700', border: 'border-lime-200 hover:border-lime-300' },
  freshworks: { label: 'Freshworks', accent: '#ff5722', gradient: 'from-orange-500 to-red-600', border: 'border-orange-200 hover:border-orange-300' },
};

// --- Fallback presentation --------------------------------------------------

const COLLEGE_STYLE = {
  logo: COLLEGE_LOGO,
  accent: '#4f46e5',
  gradient: 'from-indigo-500 to-indigo-700',
  border: 'border-indigo-200 hover:border-indigo-300',
};

const ASSESSMENT_STYLE = {
  accent: '#f97316',
  gradient: 'from-orange-500 to-amber-700',
  border: 'border-orange-200 hover:border-orange-300',
};

const COLLEGE_KEYWORDS = [
  'college', 'university', 'institute', 'institution', 'school',
  'polytechnic', 'academy', 'campus', 'vidyalaya',
];

/** Lowercase and strip punctuation so "C++ Programming" and "c++  programming" match. */
export function normalizeBrandKey(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[._/\\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Words of a name, used for whole-word company matching. */
function tokens(key) {
  return key.replace(/[^a-z0-9+# ]/g, ' ').split(/\s+/).filter(Boolean);
}

export function isProgrammingLanguage(name) {
  const key = normalizeBrandKey(name);
  if (!key) return false;
  return Boolean(LANGUAGES[key] || LANGUAGES[LANGUAGE_ALIASES[key]]);
}

export function isCollege(name) {
  const key = normalizeBrandKey(name);
  if (!key) return false;
  return COLLEGE_KEYWORDS.some(word => key.includes(word));
}

/**
 * The company registered for this name, or null. The whole name is matched
 * first, then any registered name appearing as a whole word, so that
 * "Zoho Technical Test" resolves to Zoho.
 */
export function findCompany(name) {
  const key = normalizeBrandKey(name);
  if (!key) return null;

  const entries = Object.entries(COMPANIES);
  const namesFor = (slug, company) => [slug, normalizeBrandKey(company.label), ...(company.match || [])];

  for (const [slug, company] of entries) {
    if (namesFor(slug, company).includes(key)) return { slug, ...company };
  }

  const words = tokens(key);
  for (const [slug, company] of entries) {
    const hit = namesFor(slug, company).some((candidate) => {
      const parts = tokens(candidate);
      if (parts.length === 0) return false;
      if (parts.length === 1) return words.includes(parts[0]);
      // Multi-word names ("tata consultancy services") match as a phrase.
      return key.includes(parts.join(' '));
    });
    if (hit) return { slug, ...company };
  }

  return null;
}

/**
 * Display name: languages get their canonical casing, everything else keeps the
 * name as entered (title-cased when it arrives all lowercase).
 */
export function formatBrandName(name) {
  if (!name) return '';
  const key = normalizeBrandKey(name);
  const language = LANGUAGES[key] || LANGUAGES[LANGUAGE_ALIASES[key]];
  if (language) return language.label;

  return String(name)
    .split(' ')
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(' ');
}

/** Up to two initials, used when no artwork is registered. */
export function getMonogram(name) {
  const words = tokens(normalizeBrandKey(name));
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/**
 * Resolve everything a card needs in order to render a name.
 * @returns {{kind: 'language'|'company'|'college'|'assessment', label: string,
 *            typeLabel: string, logo?: string, accent: string, gradient: string,
 *            border: string, monogram: string}}
 */
export function resolveBrand(name) {
  const key = normalizeBrandKey(name);
  const monogram = getMonogram(name);

  const language = LANGUAGES[key] || LANGUAGES[LANGUAGE_ALIASES[key]];
  if (language) {
    return { kind: 'language', typeLabel: 'Programming Language', monogram, ...language };
  }

  const company = findCompany(name);
  if (company) {
    return {
      kind: 'company',
      // Keep the name as entered so "Zoho Aptitude" stays distinguishable from
      // "Zoho Technical" while both share the same logo.
      label: formatBrandName(name),
      typeLabel: company.label + ' Assessment',
      monogram,
      logo: company.logo,
      accent: company.accent,
      gradient: company.gradient,
      border: company.border,
    };
  }

  if (isCollege(name)) {
    // One common college logo; the college's name is what identifies it.
    return { kind: 'college', label: formatBrandName(name), typeLabel: 'College', monogram, ...COLLEGE_STYLE };
  }

  return { kind: 'assessment', label: formatBrandName(name), typeLabel: 'Assessment', monogram, ...ASSESSMENT_STYLE };
}

/** Back-compat helper for cards that only need the old type label. */
export function getBrandTypeLabel(name) {
  return resolveBrand(name).typeLabel;
}

export { LANGUAGES, COMPANIES, COLLEGE_KEYWORDS };
