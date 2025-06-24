import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const student = await User.findById(params.id).select('-password');
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
    const body = await request.json();
    const student = await User.findById(params.id);
    if (!student || student.role !== 'student') {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    student.username = body.username;
    student.email = body.email;
    student.firstName = body.firstName;
    student.lastName = body.lastName;
    student.isActive = body.isActive;
    await student.save();
    return NextResponse.json({ message: 'Student updated successfully', student });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const student = await User.findById(params.id);
    if (!student || student.role !== 'student') {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    await student.deleteOne();
    return NextResponse.json({ message: 'Student deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 