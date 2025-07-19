import connectDB from '../src/lib/mongodb.js';
import Problem from '../src/models/Problem.js';

async function migrateLanguageField() {
  try {
    await connectDB();
    console.log('Connected to database');

    // Find all problems that have the old 'language' field
    const problems = await Problem.find({ language: { $exists: true } });
    console.log(`Found ${problems.length} problems with old 'language' field`);

    for (const problem of problems) {
      // Copy language value to programmingLanguage
      problem.programmingLanguage = problem.language;
      
      // Remove the old language field
      problem.language = undefined;
      
      // Save the updated problem
      await problem.save();
      console.log(`Migrated problem: ${problem.title}`);
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateLanguageField(); 