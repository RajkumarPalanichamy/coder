import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  try {
    await connectDB();
    
    const { students } = await request.json();
    
    if (!students || !Array.isArray(students)) {
      return NextResponse.json(
        { error: 'Invalid students data' },
        { status: 400 }
      );
    }

    let imported = 0;
    let skipped = 0;
    const errors = [];

    for (const studentData of students) {
      try {
        // Check if email already exists
        const existingUser = await User.findOne({ email: studentData.email });
        if (existingUser) {
          skipped++;
          continue;
        }

        // Check if username already exists, generate unique if needed
        let username = studentData.username;
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
          username = `${studentData.username}_${Date.now()}`;
        }

        const newStudent = new User({
          firstName: studentData.firstName,
          lastName: studentData.lastName,
          email: studentData.email,
          username: username,
          password: studentData.password,
          phoneNumber: studentData.phoneNumber,
          dateOfBirth: studentData.dateOfBirth,
          gender: studentData.gender,
          about: studentData.about,
          role: 'student'
        });

        await newStudent.save();
        imported++;
      } catch (error) {
        errors.push(`Failed to import ${studentData.email}: ${error.message}`);
        skipped++;
      }
    }

    return NextResponse.json({
      imported,
      skipped,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}