import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Test from '../../../../models/Test';

export async function GET(req, context) {
  const { params } = context;
  await dbConnect();
  const { id } = await params;
  const test = await Test.findById(id).populate('mcqs');
  if (!test) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(test);
} 