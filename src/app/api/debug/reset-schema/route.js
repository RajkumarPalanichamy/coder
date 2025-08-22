import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Submission, { LevelSubmission } from '@/models/Submission';

export async function POST(request) {
  try {
    await connectDB();
    
    // First, let's try to migrate existing data to add passFailStatus field
    try {
      // Check if the passFailStatus field exists in the collection
      const sampleSubmission = await Submission.findOne();
      if (sampleSubmission && !('passFailStatus' in sampleSubmission)) {
        // Field doesn't exist, add it to all submissions
        const updateResult = await Submission.updateMany(
          {},
          { $set: { passFailStatus: 'not_attempted' } }
        );
        
        return NextResponse.json({ 
          success: true, 
          message: `Added passFailStatus field to ${updateResult.modifiedCount} existing submissions.`,
          migratedSubmissions: updateResult.modifiedCount
        });
      }
      
      // Update all existing submissions to have passFailStatus field
      const updateResult = await Submission.updateMany(
        { passFailStatus: { $exists: false } },
        { $set: { passFailStatus: 'not_attempted' } }
      );
      
      // Update all existing level submissions
      const levelUpdateResult = await LevelSubmission.updateMany(
        {},
        { $set: { updatedAt: new Date() } }
      );
      
      return NextResponse.json({ 
        success: true, 
        message: `Database migration completed successfully. Updated ${updateResult.modifiedCount} submissions.`,
        migratedSubmissions: updateResult.modifiedCount,
        updatedLevelSubmissions: levelUpdateResult.modifiedCount
      });
      
    } catch (migrationError) {
      // Drop existing collections
      await Submission.collection.drop();
      await LevelSubmission.collection.drop();
      
      // Create new collections with updated schema
      await Submission.createCollection();
      await LevelSubmission.createCollection();
      
      return NextResponse.json({ 
        success: true, 
        message: 'Database schema reset successfully. All data has been cleared and new schema applied.' 
      });
    }
    
  } catch (error) {
    console.error('Error resetting schema:', error);
    return NextResponse.json(
      { error: 'Failed to reset schema', details: error.message },
      { status: 500 }
    );
  }
} 