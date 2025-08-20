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
