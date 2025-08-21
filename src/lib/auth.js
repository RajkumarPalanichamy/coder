import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function getUserFromRequest(request) {
  try {
    console.log('AUTH: getUserFromRequest called');
    console.log('AUTH: Request method:', request.method);
    console.log('AUTH: Request URL:', request.url);
    
    // Get token from cookies
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      console.log('AUTH: No token found in cookies');
      console.log('AUTH: Available cookies:', request.cookies.getAll());
      console.log('AUTH: Cookie header:', request.headers.get('cookie'));
      return null;
    }
    
    console.log('AUTH: Token found, attempting to verify');
    console.log('AUTH: JWT_SECRET being used:', JWT_SECRET);
    
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
    console.error('AUTH: Full error:', error);
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
