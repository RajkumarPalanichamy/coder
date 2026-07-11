// Helpers for keeping test "collection" names free of case-variant duplicates
// (e.g. "Gnanamani College" vs "Gnanamani college" should be one collection).

// Escape a string so it can be used literally inside a RegExp.
export function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// If a collection with the same name already exists (ignoring case), return its
// existing casing so we reuse it instead of creating a case-variant duplicate.
// Otherwise return the provided name (trimmed). Empty names fall back to 'General'.
export async function resolveCanonicalCollection(TestModel, name) {
  const trimmed = String(name || '').trim();
  if (!trimmed) return 'General';

  const existing = await TestModel.findOne({
    collection: { $regex: `^${escapeRegex(trimmed)}$`, $options: 'i' },
  })
    .sort({ createdAt: 1 })
    .select('collection')
    .lean();

  return existing?.collection || trimmed;
}
