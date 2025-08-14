import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const rawDifficulty = searchParams.get('difficulty');
    const rawCategory = searchParams.get('category');
    const rawSearch = searchParams.get('search');
    const rawLanguage = searchParams.get('language');
    const rawCommonName = searchParams.get('commonName');
    const includePoints = searchParams.get('includePoints') === 'true';
    const includeTiming = searchParams.get('includeTiming') === 'true';
    const limit = parseInt(searchParams.get('limit')) || 50;
    const page = parseInt(searchParams.get('page')) || 1;

    // Decode URL-encoded parameters to handle special characters
    const difficulty = rawDifficulty ? decodeURIComponent(rawDifficulty) : null;
    const category = rawCategory ? decodeURIComponent(rawCategory) : null;
    const search = rawSearch ? decodeURIComponent(rawSearch) : null;
    const language = rawLanguage ? decodeURIComponent(rawLanguage) : null;
    const commonName = rawCommonName ? decodeURIComponent(rawCommonName) : null;

    // Build query
    let query = { isActive: true };

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (language) {
      query.programmingLanguage = language;
    }

    if (commonName) {
      query.commonName = commonName;
    }

    // Select fields based on request parameters
    let selectFields = '-solution -testCases';
    if (includePoints) {
      selectFields += ' points';
    }
    if (includeTiming) {
      selectFields += ' levelTiming';
    }

    // Execute query with pagination
    const problems = await Problem.find(query)
      .select(selectFields)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    // Get total count for pagination
    const totalCount = await Problem.countDocuments(query);

    // Group problems by level if requested
    const groupByLevel = searchParams.get('groupByLevel') === 'true';
    let groupedProblems = null;

    if (groupByLevel && language && category) {
      groupedProblems = await Problem.aggregate([
        {
          $match: {
            programmingLanguage: language,
            category: category,
            isActive: true
          }
        },
        {
          $group: {
            _id: '$difficulty',
            problems: { 
              $push: {
                _id: '$_id',
                title: '$title',
                difficulty: '$difficulty',
                points: '$points',
                levelTiming: '$levelTiming',
                createdAt: '$createdAt'
              }
            },
            count: { $sum: 1 },
            totalPoints: { $sum: '$points' }
          }
        },
        {
          $project: {
            level: '$_id',
            problems: 1,
            count: 1,
            totalPoints: 1,
            _id: 0
          }
        },
        {
          $sort: { level: 1 }
        }
      ]);
    }

    const response = {
      problems,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1,
        limit
      },
      filters: {
        difficulty,
        category,
        language,
        commonName,
        search
      }
    };

    if (groupedProblems) {
      response.groupedByLevel = groupedProblems;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching problems:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 