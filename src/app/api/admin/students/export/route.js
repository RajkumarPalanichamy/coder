import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = (searchParams.get('search') || '').trim();

    const filter = { role: 'student' };
    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ firstName: regex }, { lastName: regex }, { email: regex }];
    }

    const students = await User.find(filter).select('-password').sort({ createdAt: -1 }).lean();

    const rows = students.map((student) => ({
      Name: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
      Email: student.email || '',
      Status: student.isActive ? 'Active' : 'Inactive',
      'Joined Date': student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A',
      'Last Login': student.lastLogin ? new Date(student.lastLogin).toLocaleDateString() : 'N/A',
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(
      rows.length > 0 ? rows : [{ Name: '', Email: '', Status: '', 'Joined Date': '', 'Last Login': '' }]
    );
    ws['!cols'] = [{ wch: 24 }, { wch: 32 }, { wch: 10 }, { wch: 14 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Students');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const fileName = `students_${new Date().toISOString().split('T')[0]}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting students:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
