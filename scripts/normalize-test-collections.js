import connectDB from '../src/lib/mongodb.js';
import Test from '../src/models/Test.js';

// One-time migration: merge collections that differ only by case
// (e.g. "Gnanamani College" and "Gnanamani college") into a single collection.
// The earliest-created casing wins as the canonical name.
async function normalizeTestCollections() {
  try {
    await connectDB();
    console.log('Connected to database');

    // Oldest first, so the first casing we see for each name becomes canonical.
    const tests = await Test.find({}).sort({ createdAt: 1 }).select('collection createdAt');
    console.log(`Scanning ${tests.length} tests...`);

    const canonicalByKey = new Map(); // lowercased name -> canonical casing
    for (const t of tests) {
      const raw = (t.collection || 'General').trim();
      const key = raw.toLowerCase();
      if (!canonicalByKey.has(key)) canonicalByKey.set(key, raw);
    }

    let updated = 0;
    for (const t of tests) {
      const raw = (t.collection || 'General').trim();
      const canon = canonicalByKey.get(raw.toLowerCase());
      if (t.collection !== canon) {
        await Test.updateOne({ _id: t._id }, { $set: { collection: canon } });
        console.log(`  "${t.collection}" -> "${canon}"`);
        updated++;
      }
    }

    console.log(`Migration completed. Updated ${updated} tests.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

normalizeTestCollections();
