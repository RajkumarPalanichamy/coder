import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    const problem = await Problem.findById(id);
    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }
    return NextResponse.json({ problem });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    const body = await request.json();
    const problem = await Problem.findById(id);
    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    // Normalize language name for consistency
    const normalizeLanguage = (lang) => {
      if (!lang) return '';
      const langLower = lang.toLowerCase().trim();
      const mapping = {
        'c++': 'cpp',
        'c#': 'csharp',
        'javascript': 'javascript',
        'python': 'python',
        'java': 'java',
        'c': 'c',
        'go': 'go',
        'rust': 'rust',
        'kotlin': 'kotlin',
        'typescript': 'typescript',
        'php': 'php',
        'ruby': 'ruby',
        'swift': 'swift'
      };
      return mapping[langLower] || langLower;
    };

    problem.title = body.title;
    problem.description = body.description;
    problem.difficulty = body.difficulty;
    problem.category = body.category;
    problem.programmingLanguage = normalizeLanguage(body.language || body.programmingLanguage);
    problem.constraints = body.constraints;
    problem.starterCode = body.starterCode;
    problem.solution = body.solution;
    problem.tags = body.tags;
    problem.isActive = body.isActive;
    problem.examples = body.examples;
    problem.testCases = body.testCases;
    await problem.save();
    return NextResponse.json({ message: 'Problem updated successfully', problem });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    const problem = await Problem.findById(id);
    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }
    await problem.deleteOne();
    return NextResponse.json({ message: 'Problem deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 