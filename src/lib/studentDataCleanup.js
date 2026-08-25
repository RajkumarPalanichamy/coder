import mongoose from 'mongoose';
// Relative, extension-qualified imports so plain-Node maintenance scripts can
// reuse this module alongside the Next.js runtime.
import User from '../models/User.js';
import Submission, { LevelSubmission } from '../models/Submission.js';
import StudentTestSubmission from '../models/StudentTestSubmission.js';
import MCQSubmission from '../models/MCQSubmission.js';

/**
 * Every collection that stores data owned by a student, and the field that
 * points back at the owning user. Deleting a student must clear all of these.
 * Content collections (Problem/Test/MCQ) are intentionally absent: their
 * `createdBy` points at the authoring admin, not at a student.
 */
export const STUDENT_OWNED_MODELS = [
  { key: 'submissions', model: Submission, field: 'user' },
  { key: 'levelSubmissions', model: LevelSubmission, field: 'user' },
  { key: 'testSubmissions', model: StudentTestSubmission, field: 'student' },
  { key: 'mcqSubmissions', model: MCQSubmission, field: 'student' },
];

/**
 * Permanently removes every trace of a student: all progress, submissions and
 * results first, then the account itself. Children go first so that a failure
 * part-way through leaves the account in place and the delete can be retried.
 * Runs in a transaction when the deployment supports one (replica set/Atlas).
 *
 * @returns {Promise<Object>} per-collection deleted counts, plus `user`
 */
export async function deleteStudentAndAllData(userId) {
  const runDeletes = async (session) => {
    const opts = session ? { session } : {};
    const counts = {};
    for (const { key, model, field } of STUDENT_OWNED_MODELS) {
      const { deletedCount } = await model.deleteMany({ [field]: userId }, opts);
      counts[key] = deletedCount || 0;
    }
    const { deletedCount } = await User.deleteOne({ _id: userId }, opts);
    counts.user = deletedCount || 0;
    return counts;
  };

  let session;
  try {
    session = await mongoose.startSession();
    let counts;
    await session.withTransaction(async () => {
      counts = await runDeletes(session);
    });
    return counts;
  } catch (error) {
    if (!isTransactionUnsupported(error)) throw error;
    // Standalone mongod: fall back to sequential deletes (children first).
    return runDeletes(null);
  } finally {
    if (session) await session.endSession();
  }
}

function isTransactionUnsupported(error) {
  const message = String(error?.message || '');
  return (
    error?.code === 20 || // IllegalOperation
    /Transaction numbers are only allowed on a replica set/i.test(message) ||
    /transactions are not supported/i.test(message)
  );
}

/**
 * Drops rows whose owning user no longer exists. Mongoose `populate` leaves the
 * ref as `null` when the referenced document is gone, so any such row belongs to
 * a deleted account and must never reach a listing or an export.
 *
 * @param {Array} docs   populated, lean documents
 * @param {string} field the populated owner path — 'user' or 'student'
 */
export function dropOrphanedDocs(docs, field) {
  if (!Array.isArray(docs)) return [];
  return docs.filter((doc) => doc?.[field] && typeof doc[field] === 'object');
}

/** Ids of all accounts that still exist — use to pre-filter paginated queries. */
export async function getExistingUserIds() {
  return User.distinct('_id');
}
