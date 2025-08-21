import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function getUserFromRequest(request) {
  try {
    // Get token from cookies
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      console.log('AUTH: No token found in cookies');
      return null;
    }
    
    // Verify and decode token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('AUTH: Token decoded successfully:', decoded);
    
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      username: decoded.username
    };
  } catch (error) {
    console.error('AUTH: Token verification failed:', error.message);
    return null;
  }
}

export function requireAdmin(user) {
  if (!user || user.role !== 'admin') {
    throw new Error('Admin access required');
  }
}

export function requireStudent(user) {
  if (!user || user.role !== 'student') {
    throw new Error('Student access required');
  }
}

export async function verifyAuth(request, requireAdminRole = false) {
  const user = getUserFromRequest(request);
  
  if (!user) {
    return { isValid: false, user: null };
  }
  
  if (requireAdminRole && user.role !== 'admin') {
    return { isValid: false, user: null };
  }
  
  // Ensure consistent user object structure
  return { 
    isValid: true, 
    user: {
      ...user,
      id: user.userId, // Add id field for compatibility
      userId: user.userId
    }
  };
}
