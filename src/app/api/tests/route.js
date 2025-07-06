import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Test from '../../../models/Test';

export async function GET(req) {
  await dbConnect();
  const tests = await Test.find({}).populate('mcqs');
  return NextResponse.json(tests);
} 