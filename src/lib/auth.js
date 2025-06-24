import jwt from 'jsonwebtoken';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Extract user from request (supports both API Route and Middleware header)
export async function getUserFromRequest(req) {
  // Try cookies (for API routes)
  let token;
  if (req.cookies && typeof req.cookies.get === 'function') {
    token = req.cookies.get('token')?.value;
  }
  // Try headers (for internal API calls)
  if (!token && req.headers && req.headers.get) {
    token = req.headers.get('authorization')?.replace('Bearer ', '') ||
            req.headers.get('token');
  }
  if (!token) throw new Error('Unauthorized');
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch {
    throw new Error('Unauthorized');
  }
  // Optionally fetch user from DB if needed
  return {
    _id: decoded.userId,
    email: decoded.email,
    role: decoded.role,
    username: decoded.username,
  };
}

// Throws if not admin
export function requireAdmin(user) {
  if (!user || user.role !== 'admin') throw new Error('Forbidden');
}

// Throws if not student
export function requireStudent(user) {
  if (!user || user.role !== 'student') throw new Error('Forbidden');
} 