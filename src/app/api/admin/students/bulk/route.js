import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

const MAX_BATCH_SIZE = 1000;

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { students, password } = body;

    if (!Array.isArray(students) || students.length === 0) {
      return NextResponse.json({ error: 'No students provided' }, { status: 400 });
    }
    if (students.length > MAX_BATCH_SIZE) {
      return NextResponse.json(
        { error: `Batch too large - send at most ${MAX_BATCH_SIZE} students per request` },
        { status: 400 }
      );
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'A password of at least 6 characters is required' }, { status: 400 });
    }

    // One password for the whole batch, so it's hashed once and reused -
    // hashing per-row would make lakh-scale imports far too slow.
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const invalidRows = [];
    const docs = [];
    const seenInBatch = new Set();

    students.forEach((row) => {
      const firstName = (row.firstName || '').trim();
      const lastName = (row.lastName || '').trim();
      const email = (row.email || '').trim().toLowerCase();

      if (!firstName || !lastName || !email) {
        invalidRows.push({ email, reason: 'Missing required field' });
        return;
      }
      if (seenInBatch.has(email)) {
        invalidRows.push({ email, reason: 'Duplicate email within batch' });
        return;
      }
      seenInBatch.add(email);
      docs.push({
        username: email,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'student',
      });
    });

    let insertedCount = 0;
    const duplicates = [];

    if (docs.length > 0) {
      try {
        const result = await User.insertMany(docs, { ordered: false });
        insertedCount = result.length;
      } catch (bulkError) {
        const writeErrors = bulkError.writeErrors || [];
        if (writeErrors.length === 0) {
          throw bulkError;
        }
        insertedCount = bulkError.insertedDocs?.length ?? Math.max(docs.length - writeErrors.length, 0);
        writeErrors.forEach((writeError) => {
          const raw = writeError.err || writeError;
          const failedDoc = raw.op || {};
          duplicates.push({
            email: failedDoc.email || '',
            reason: raw.code === 11000 ? 'Email already exists' : raw.errmsg || 'Insert failed',
          });
        });
      }
    }

    return NextResponse.json({
      insertedCount,
      duplicateCount: duplicates.length,
      invalidCount: invalidRows.length,
      duplicates,
      invalidRows,
    });
  } catch (error) {
    console.error('Error bulk creating students:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
