import mongoose from 'mongoose';

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zenithcode');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Problem schema
const problemSchema = new mongoose.Schema({
  title: String,
  description: String,
  difficulty: String,
  category: String,
  programmingLanguage: String,
  constraints: String,
  examples: [{ input: String, output: String, explanation: String }],
  testCases: [{ input: String, output: String, isHidden: Boolean }],
  starterCode: String,
  solution: String,
  timeLimit: Number,
  memoryLimit: Number,
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tags: [String]
}, { timestamps: true });

const Problem = mongoose.models.Problem || mongoose.model('Problem', problemSchema);

const debugCppProblems = async () => {
  await connectDB();
  
  console.log('=== DEBUGGING C++ PROBLEMS ===');
  
  // Check all unique programming languages
  console.log('\n1. All unique programming languages in database:');
  const allLanguages = await Problem.distinct('programmingLanguage');
  console.log(allLanguages);
  
  // Check problems with different C++ variants
  console.log('\n2. Problems with "C++" (exact):');
  const cppProblems = await Problem.find({ programmingLanguage: 'C++' });
  console.log(`Found: ${cppProblems.length} problems`);
  cppProblems.forEach(p => console.log(`  - ${p.title} (${p.programmingLanguage}, ${p.category}, ${p.difficulty})`));
  
  console.log('\n3. Problems with "cpp" (normalized):');
  const cppNormalizedProblems = await Problem.find({ programmingLanguage: 'cpp' });
  console.log(`Found: ${cppNormalizedProblems.length} problems`);
  cppNormalizedProblems.forEach(p => console.log(`  - ${p.title} (${p.programmingLanguage}, ${p.category}, ${p.difficulty})`));
  
  console.log('\n4. Problems with "c++" (lowercase):');
  const cppLowerProblems = await Problem.find({ programmingLanguage: 'c++' });
  console.log(`Found: ${cppLowerProblems.length} problems`);
  cppLowerProblems.forEach(p => console.log(`  - ${p.title} (${p.programmingLanguage}, ${p.category}, ${p.difficulty})`));
  
  // Test the aggregation that the API uses
  console.log('\n5. Language aggregation (what API uses):');
  const languageStats = await Problem.aggregate([
    { $group: { _id: '$programmingLanguage', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
  console.log(languageStats);
  
  // Test categories for cpp language
  console.log('\n6. Categories for "cpp" language:');
  const cppCategories = await Problem.distinct('category', { programmingLanguage: 'cpp' });
  console.log(cppCategories);
  
  // Test levels for cpp language and a specific category (if exists)
  if (cppCategories.length > 0) {
    console.log(`\n7. Levels for "cpp" language and "${cppCategories[0]}" category:`);
    const cppLevels = await Problem.distinct('difficulty', { 
      programmingLanguage: 'cpp', 
      category: cppCategories[0] 
    });
    console.log(cppLevels);
  }
  
  mongoose.connection.close();
};

debugCppProblems().catch(console.error);