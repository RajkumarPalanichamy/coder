import mongoose from 'mongoose';

/** Vercel / dashboards often paste values with wrapping quotes or stray newlines. */
function normalizeMongoUri(raw) {
  if (raw == null) return '';
  let u = String(raw).trim().replace(/\r\n|\r|\n/g, '');
  if (
    (u.startsWith('"') && u.endsWith('"')) ||
    (u.startsWith("'") && u.endsWith("'"))
  ) {
    u = u.slice(1, -1).trim();
  }
  // Whole .env line pasted into Vercel "value" (key is already MONGODB_URI there); allow repeats
  while (/^MONGODB_URI\s*=/i.test(u) || /^MONGO_URI\s*=/i.test(u)) {
    u = u.replace(/^MONGODB_URI\s*=\s*/i, '').replace(/^MONGO_URI\s*=\s*/i, '').trim();
  }
  return u;
}

function resolveMongoUri() {
  const u = normalizeMongoUri(
    process.env.MONGODB_URI || process.env.MONGO_URI
  );
  if (!u) {
    throw new Error(
      'MONGODB_URI is not set. Add it in Vercel → Settings → Environment Variables (name: MONGODB_URI), or use .env.local for local dev.'
    );
  }
  if (!u.startsWith('mongodb://') && !u.startsWith('mongodb+srv://')) {
    throw new Error(
      'MONGODB_URI must start with mongodb:// or mongodb+srv://. Remove extra quotes/spaces in Vercel env, or fix the value.'
    );
  }
  return u;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  const MONGODB_URI = resolveMongoUri();

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10_000,
      connectTimeoutMS: 10_000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
