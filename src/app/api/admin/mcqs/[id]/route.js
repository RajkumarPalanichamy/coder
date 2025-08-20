import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MCQ from '@/models/MCQ';
import { getUserFromRequest, requireAdmin } from '@/lib/auth';

export async function GET(req, { params }) {
  await dbConnect();
  const { id } = await params;
  const mcq = await MCQ.findById(id);
  if (!mcq) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(mcq);
}

export async function PUT(req, { params }) {
  await dbConnect();
  const user = await getUserFromRequest(req);
  
  try {
    requireAdmin(user);
  } catch (error) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  
  const { id } = await params;
  const { question, options, correctOption, language, test } = await req.json();
  const mcq = await MCQ.findByIdAndUpdate(
    id,
    { question, options, correctOption, language, test },
    { new: true }
  );
  if (!mcq) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(mcq);
}

export async function DELETE(req, { params }) {
  await dbConnect();
  const user = await getUserFromRequest(req);
  
  try {
    requireAdmin(user);
  } catch (error) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  
  const { id } = await params;
  const mcq = await MCQ.findByIdAndDelete(id);
  if (!mcq) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
} 