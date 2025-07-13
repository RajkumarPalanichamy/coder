import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function POST() {
  try {
    console.log('🔄 Resetting Submission schema...');
    
    await connectDB();
    
    // Drop the existing Submission collection
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    if (collections.find(col => col.name === 'submissions')) {
      await db.dropCollection('submissions');
      console.log('✅ Dropped existing submissions collection');
    }
    
    // Clear the model from mongoose cache
    delete mongoose.models.Submission;
    console.log('✅ Cleared Submission model from cache');
    
    return NextResponse.json({
      message: 'Submission schema reset successful',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Schema reset failed:', error);
    return NextResponse.json({
      error: 'Schema reset failed',
      details: error.message
    }, { status: 500 });
  }
} 