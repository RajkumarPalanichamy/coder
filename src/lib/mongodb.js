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
  return u;
}

const MONGODB_URI = normalizeMongoUri(
  process.env.MONGODB_URI || process.env.MONGO_URI
);

if (!MONGODB_URI) {
  throw new Error(
    'MONGODB_URI is not set. Add it in Vercel → Settings → Environment Variables (name: MONGODB_URI), or use .env.local for local dev.'
  );
}

if (
  !MONGODB_URI.startsWith('mongodb://') &&
  !MONGODB_URI.startsWith('mongodb+srv://')
) {
  throw new Error(
    'MONGODB_URI must start with mongodb:// or mongodb+srv://. Remove extra quotes/spaces in Vercel env, or fix the value.'
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // Fail fast on Vercel/serverless (default ~30s blocks the function past its limit)
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