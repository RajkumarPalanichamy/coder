import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StudentTestSubmission from '@/models/StudentTestSubmission';

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    await StudentTestSubmission.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Submission deleted' });
  } catch (error) {
    console.error('Error deleting test submission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 