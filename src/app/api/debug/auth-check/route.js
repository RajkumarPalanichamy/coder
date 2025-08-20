import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request) {
  // Check what headers the middleware is setting
  const headers = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  // Check for token in cookies
  const token = request.cookies.get('token')?.value;
  
  let decodedToken = null;
  let tokenError = null;
  
  if (token) {
    try {
      decodedToken = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      tokenError = error.message;
    }
  }

  return NextResponse.json({
    hasToken: !!token,
    tokenError,
    decodedToken,
    headers: {
      'user-id': request.headers.get('user-id'),
      'user-role': request.headers.get('user-role'),
      'user-email': request.headers.get('user-email'),
    },
    allHeaders: headers,
    cookies: {
      token: !!token
    }
  });
}
