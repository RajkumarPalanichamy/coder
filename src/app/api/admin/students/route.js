import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request) {
  try {
    await connectDB();
    
    const students = await User.find({ role: 'student' })
      .select('-password')
      .sort({ createdAt: -1 });

    return NextResponse.json({ students });

  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { username, email, password, firstName, lastName } = body;

    // Validate required fields
    if (!username || !email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { status: 400 }
      );
    }

    // Create new student
    const student = new User({
      username,
      email,
      password,
      firstName,
      lastName,
      role: 'student'
    });

    await student.save();

    // Remove password from response
    const studentResponse = {
      _id: student._id,
      username: student.username,
      email: student.email,
      firstName: student.firstName,
      lastName: student.lastName,
      role: student.role,
      isActive: student.isActive,
      createdAt: student.createdAt
    };

    return NextResponse.json(
      { 
        message: 'Student created successfully',
        student: studentResponse
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 