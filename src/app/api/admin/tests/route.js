import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Test from '@/models/Test';
import { getUserFromRequest, requireAdmin } from '@/lib/auth';

export async function GET(req) {
  try {
    await dbConnect();
    
    // Check authentication
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is admin
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const language = searchParams.get('language');
    const category = searchParams.get('category');
    const level = searchParams.get('level');
    
    // Build filter based on provided parameters
    const filter = { isActive: true };
    if (language) filter.language = language;
    if (category) filter.category = category;
    if (level) filter.level = level;
    
    const tests = await Test.find(filter).sort({ createdAt: -1 });
    return NextResponse.json({ tests });
  } catch (error) {
    console.error('Error fetching tests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    
    const user = await getUserFromRequest(req);
    requireAdmin(user);
    
    const { 
      title, 
      description, 
      instructions,
      mcqs, 
      language, 
      category, 
      level,
      duration, 
      attempts,
      questionCount,
      availableFrom, 
      availableTo,
      tags
    } = await req.json();
    
    if (!title || !language || !category || !level || !mcqs || !Array.isArray(mcqs) || mcqs.length === 0) {
      return NextResponse.json({ 
        error: 'Title, language, category, level, and MCQs are required' 
      }, { status: 400 });
    }

    // Validate level
    if (!['level1', 'level2', 'level3'].includes(level)) {
      return NextResponse.json({ 
        error: 'Level must be level1, level2, or level3' 
      }, { status: 400 });
    }
    
    const test = await Test.create({
      title,
      description,
      instructions,
      mcqs,
      language,
      category,
      level,
      duration: duration || 90,
      attempts: attempts || 1,
      questionCount: questionCount || 10,
      createdBy: user._id,
      availableFrom,
      availableTo,
      tags: tags || []
    });
    
    return NextResponse.json(test);
  } catch (error) {
    console.error('Error creating test:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 