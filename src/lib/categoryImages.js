import { normalizeBrandKey } from './brandLogos';

/**
 * Illustrations for test categories, used by TestCategoryCard. Distinct from
 * brandLogos.js (which covers the company/language collection cards one step
 * up) - this covers the category cards inside the generic Aptitude/Technical/
 * Quantitative/Verbal collections seeded by scripts/migrate-existing-tests.js.
 */

const CATEGORY_IMAGES = [
  { image: '/img/Quantitative-aptitude.jpeg', words: ['quantitative', 'mathematics', 'math', 'numerical', 'statistics', 'arithmetic'] },
  { image: '/img/Verbal-ability.jpeg', words: ['verbal', 'english', 'grammar', 'comprehension', 'vocabulary', 'writing'] },
  { image: '/img/Logical-reasoning.jpeg', words: ['logical reasoning', 'analytical reasoning', 'logical'] },
  { image: '/img/Reasoning-ability.jpeg', words: ['reasoning', 'problem solving'] },
];

const TECHNICAL_IMAGES = [
  '/img/Technical-Assesment-1.jpeg',
  '/img/Technical-Assesment-2.jpeg',
  '/img/Technical-Assesment-3.jpeg',
];

const TECHNICAL_KEYWORDS = [
  'javascript', 'python', 'java', 'c++', 'c#', 'web development',
  'database', 'algorithms', 'data structures', 'oops', 'software engineering', 'system design',
];

/** Stable pick so the same category always lands on the same technical image. */
function hashPick(key, list) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return list[hash % list.length];
}

export function resolveCategoryImage(category, collection) {
  const key = normalizeBrandKey(category);
  const collectionKey = normalizeBrandKey(collection);

  for (const entry of CATEGORY_IMAGES) {
    if (key && entry.words.some((word) => key === word || key.includes(word))) return entry.image;
  }

  if (collectionKey === 'technical' || (key && TECHNICAL_KEYWORDS.some((word) => key === word || key.includes(word)))) {
    return hashPick(key || collectionKey, TECHNICAL_IMAGES);
  }
  if (collectionKey === 'quantitative') return '/img/Quantitative-aptitude.jpeg';
  if (collectionKey === 'verbal') return '/img/Verbal-ability.jpeg';
  if (collectionKey === 'aptitude') return '/img/Reasoning-ability.jpeg';

  return null;
}
