import mongoose from 'mongoose';

// Connection URI - update this with your MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zenith-portal';

// Test schema
const TestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  mcqs: [mongoose.Schema.Types.Mixed],
  language: { type: String },
  collection: { type: String, default: 'General' },
  category: { type: String, required: true },
  duration: { type: Number, default: 60 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  availableFrom: { type: Date },
  availableTo: { type: Date },
}, { timestamps: true });

const Test = mongoose.models.Test || mongoose.model('Test', TestSchema);

// Mapping of categories to collections
const categoryToCollectionMap = {
  // Technical categories
  'javascript': 'Technical',
  'python': 'Technical',
  'java': 'Technical',
  'c++': 'Technical',
  'c#': 'Technical',
  'web development': 'Technical',
  'database': 'Technical',
  'algorithms': 'Technical',
  'data structures': 'Technical',
  'oops': 'Technical',
  'software engineering': 'Technical',
  'system design': 'Technical',
  
  // Aptitude categories
  'reasoning': 'Aptitude',
  'logical reasoning': 'Aptitude',
  'analytical reasoning': 'Aptitude',
  'problem solving': 'Aptitude',
  
  // Quantitative categories
  'mathematics': 'Quantitative',
  'math': 'Quantitative',
  'numerical': 'Quantitative',
  'statistics': 'Quantitative',
  'arithmetic': 'Quantitative',
  
  // Verbal categories
  'english': 'Verbal',
  'grammar': 'Verbal',
  'comprehension': 'Verbal',
  'vocabulary': 'Verbal',
  'writing': 'Verbal',
  
  // General Knowledge categories
  'general knowledge': 'General Knowledge',
  'current affairs': 'General Knowledge',
  'history': 'General Knowledge',
  'geography': 'General Knowledge',
  'science': 'General Knowledge',
  'world facts': 'General Knowledge',
};

function mapCategoryToCollection(category) {
  if (!category) return 'General';
  
  const lowerCategory = category.toLowerCase();
  
  // Check for exact match first
  if (categoryToCollectionMap[lowerCategory]) {
    return categoryToCollectionMap[lowerCategory];
  }
  
  // Check for partial matches
  for (const [key, collection] of Object.entries(categoryToCollectionMap)) {
    if (lowerCategory.includes(key) || key.includes(lowerCategory)) {
      return collection;
    }
  }
  
  // Default fallback
  return 'General';
}

async function migrateExistingTests() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all tests that don't have a collection field or have it empty
    const testsToUpdate = await Test.find({
      $or: [
        { collection: { $exists: false } },
        { collection: null },
        { collection: '' }
      ]
    });

    console.log(`Found ${testsToUpdate.length} tests to migrate`);

    if (testsToUpdate.length === 0) {
      console.log('No tests need migration. All tests already have collection field.');
      return;
    }

    let updated = 0;
    let failed = 0;

    for (const test of testsToUpdate) {
      try {
        const collection = mapCategoryToCollection(test.category);
        
        await Test.findByIdAndUpdate(test._id, { 
          collection: collection 
        });
        
        console.log(`✅ Updated test "${test.title}" - Category: "${test.category}" → Collection: "${collection}"`);
        updated++;
      } catch (error) {
        console.error(`❌ Failed to update test "${test.title}":`, error.message);
        failed++;
      }
    }

    console.log('\n🎉 Migration completed!');
    console.log(`✅ Successfully updated: ${updated} tests`);
    if (failed > 0) {
      console.log(`❌ Failed to update: ${failed} tests`);
    }

    // Show summary of collections created
    const collections = await Test.aggregate([
      {
        $group: {
          _id: "$collection",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    console.log('\n📊 Collection summary:');
    collections.forEach(col => {
      console.log(`  - ${col._id}: ${col.count} tests`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
migrateExistingTests();