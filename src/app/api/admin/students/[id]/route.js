import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { deleteStudentAndAllData } from '@/lib/studentDataCleanup';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const student = await User.findById(id).select('-password');
    if (!student || student.role !== 'student') {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    return NextResponse.json({ student });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const student = await User.findById(id);
    if (!student || student.role !== 'student') {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    student.username = body.username || body.email;
    student.email = body.email;
    student.firstName = body.firstName;
    student.lastName = body.lastName;
    student.isActive = body.isActive;
    if (body.password && body.password.length >= 6) {
      student.password = body.password;
    }
    await student.save();
    return NextResponse.json({ message: 'Student updated successfully', student });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const student = await User.findById(id);
    if (!student || student.role !== 'student') {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Permanently remove the account together with all of its progress,
    // submissions and results — nothing may survive to show up in listings,
    // filters or exports.
    const deleted = await deleteStudentAndAllData(student._id);

    return NextResponse.json({
      message: 'Student and all associated data deleted successfully',
      deleted,
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
