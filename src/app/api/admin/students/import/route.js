import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    await connectDB();
    
    const { students } = await request.json();
    
    if (!students || !Array.isArray(students)) {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }

    let imported = 0;
    let failed = 0;
    const errors = [];

    for (const student of students) {
      try {
        // Validate required fields
        if (!student.email || !student.username || !student.password) {
          errors.push(`Missing required fields for ${student.email || 'unknown'}`);
          failed++;
          continue;
        }

        // Check if password matches confirm password
        if (student.password !== student.confirmPassword) {
          errors.push(`Password mismatch for ${student.email}`);
          failed++;
          continue;
        }

        // Check if user already exists
        const existingUser = await User.findOne({
          $or: [
            { email: student.email },
            { username: student.username }
          ]
        });

        if (existingUser) {
          errors.push(`User already exists: ${student.email}`);
          failed++;
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(student.password, 10);

        // Create new user
        await User.create({
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          username: student.username,
          password: hashedPassword,
          role: 'student',
          isActive: student.isActive !== undefined ? student.isActive : true
        });

        imported++;
      } catch (err) {
        errors.push(`Failed to create user ${student.email}: ${err.message}`);
        failed++;
      }
    }

    return NextResponse.json({
      imported,
      failed,
      total: students.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}