import connectDB from '../src/lib/mongodb.js';
import User from '../src/models/User.js';
import { STUDENT_OWNED_MODELS } from '../src/lib/studentDataCleanup.js';

// One-time cleanup: purge progress, submissions and results left behind by
// accounts that were deleted before deletion cascaded to their data. Such rows
// otherwise keep surfacing in admin listings, filters and Excel exports.
//
//   node --require ./scripts/load-env.js scripts/cleanup-orphaned-user-data.js --dry-run
//   node --require ./scripts/load-env.js scripts/cleanup-orphaned-user-data.js

const dryRun = process.argv.includes('--dry-run');

async function cleanupOrphanedUserData() {
  await connectDB();
  console.log(`Connected to database${dryRun ? ' (DRY RUN — nothing will be deleted)' : ''}`);

  const existingUserIds = await User.distinct('_id');
  console.log(`${existingUserIds.length} accounts still exist\n`);

  let grandTotal = 0;

  for (const { key, model, field } of STUDENT_OWNED_MODELS) {
    // Orphaned = owner missing entirely, or pointing at an account that is gone.
    const orphanQuery = {
      $or: [
        { [field]: { $nin: existingUserIds } },
        { [field]: { $exists: false } },
      ],
    };

    const orphans = await model.find(orphanQuery).select(`_id ${field}`).lean();
    if (orphans.length === 0) {
      console.log(`${key}: clean`);
      continue;
    }

    const byOwner = new Map();
    for (const doc of orphans) {
      const owner = doc[field] ? String(doc[field]) : '(no owner)';
      byOwner.set(owner, (byOwner.get(owner) || 0) + 1);
    }

    console.log(`${key}: ${orphans.length} orphaned document(s)`);
    for (const [owner, count] of [...byOwner].sort((a, b) => b[1] - a[1])) {
      console.log(`   deleted user ${owner} -> ${count} document(s)`);
    }

    if (!dryRun) {
      const { deletedCount } = await model.deleteMany(orphanQuery);
      console.log(`   deleted ${deletedCount}`);
    }
    grandTotal += orphans.length;
  }

  console.log(
    `\n${dryRun ? 'Would delete' : 'Deleted'} ${grandTotal} orphaned document(s) in total.`
  );
  process.exit(0);
}

cleanupOrphanedUserData().catch((error) => {
  console.error('Cleanup failed:', error);
  process.exit(1);
});
