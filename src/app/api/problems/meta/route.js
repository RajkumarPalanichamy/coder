import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';

export async function GET() {
  try {
    await connectDB();

    // Get all unique languages
    const languages = await Problem.distinct('programmingLanguage', { isActive: true });
    
    // Get problem count for each language
    const languagesWithCounts = await Promise.all(
      languages.map(async (language) => {
        const count = await Problem.countDocuments({ 
          programmingLanguage: language, 
          isActive: true 
        });
        
        // Get unique categories for this language
        const categories = await Problem.distinct('category', { 
          programmingLanguage: language,
          isActive: true 
        });

        // Get level distribution for this language
        const levelStats = await Problem.aggregate([
          { 
            $match: { 
              programmingLanguage: language,
              isActive: true 
            } 
          },
          {
            $group: {
              _id: '$difficulty',
              count: { $sum: 1 },
              totalPoints: { $sum: '$points' }
            }
          },
          {
            $project: {
              level: '$_id',
              count: 1,
              totalPoints: 1,
              _id: 0
            }
          }
        ]);

        return { 
          language, 
          count, 
          categories: categories.length,
          categoriesList: categories,
          levels: levelStats
        };
      })
    );

    // Get all unique categories
    const categories = await Problem.distinct('category', { isActive: true });
    
    // Get categories with counts and supported languages
    const categoriesWithDetails = await Promise.all(
      categories.map(async (category) => {
        const count = await Problem.countDocuments({ 
          category, 
          isActive: true 
        });

        const supportedLanguages = await Problem.distinct('programmingLanguage', { 
          category,
          isActive: true 
        });

        // Get level distribution for this category
        const levelStats = await Problem.aggregate([
          { 
            $match: { 
              category,
              isActive: true 
            } 
          },
          {
            $group: {
              _id: '$difficulty',
              count: { $sum: 1 }
            }
          },
          {
            $project: {
              level: '$_id',
              count: 1,
              _id: 0
            }
          }
        ]);

        return { 
          category, 
          count, 
          supportedLanguages,
          levels: levelStats
        };
      })
    );

    // Get all unique common names (collections)
    const commonNames = await Problem.distinct('commonName', { 
      isActive: true,
      commonName: { $ne: null, $ne: '' }
    });

    // Get common names with details
    const commonNamesWithDetails = await Promise.all(
      commonNames.map(async (commonName) => {
        const count = await Problem.countDocuments({ 
          commonName, 
          isActive: true 
        });

        const supportedLanguages = await Problem.distinct('programmingLanguage', { 
          commonName,
          isActive: true 
        });

        const supportedCategories = await Problem.distinct('category', { 
          commonName,
          isActive: true 
        });

        return { 
          commonName, 
          count, 
          supportedLanguages,
          supportedCategories
        };
      })
    );

    // Get overall statistics
    const totalProblems = await Problem.countDocuments({ isActive: true });
    
    const difficultyStats = await Problem.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 },
          totalPoints: { $sum: '$points' }
        }
      },
      {
        $project: {
          level: '$_id',
          count: 1,
          totalPoints: 1,
          _id: 0
        }
      },
      { $sort: { level: 1 } }
    ]);

    return NextResponse.json({ 
      languages: languagesWithCounts,
      categories: categoriesWithDetails,
      commonNames: commonNamesWithDetails,
      statistics: {
        totalProblems,
        totalLanguages: languages.length,
        totalCategories: categories.length,
        totalCollections: commonNames.length,
        difficultyDistribution: difficultyStats
      },
      // Legacy format for backward compatibility
      languagesList: languages,
      categoriesList: categories
    });
  } catch (error) {
    console.error('Error fetching problem meta:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}