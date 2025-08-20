import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Test from '@/models/Test';
import { getUserFromRequest, requireAdmin } from '@/lib/auth';

export async function GET(req, { params }) {
  await dbConnect();
  const { id } = await params;
  const test = await Test.findById(id);
  if (!test) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(test);
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
  const { title, description, collection, mcqs, language, category, duration, availableFrom, availableTo } = await req.json();
  const test = await Test.findByIdAndUpdate(
    id,
    { title, description, collection, mcqs, language, category, duration, availableFrom, availableTo },
    { new: true }
  );
  if (!test) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(test);
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
  const test = await Test.findByIdAndDelete(id);
  if (!test) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
} 