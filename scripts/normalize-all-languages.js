require('./load-env');
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://2kcartoonist:4dPA8Hm300E7UgoC@cluster0.zz7kzh7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

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

async function migrate() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const problemsCollection = db.collection('problems');

    const problems = await problemsCollection.find({}).toArray();
    console.log(`Checking ${problems.length} problems...`);

    let updatedCount = 0;
    for (const p of problems) {
      if (!p.programmingLanguage) continue;
      
      const rawLang = p.programmingLanguage;
      const langLower = rawLang.toLowerCase().trim();
      const normalized = mapping[langLower] || langLower;
      
      if (rawLang !== normalized) {
        await problemsCollection.updateOne(
          { _id: p._id },
          { $set: { programmingLanguage: normalized } }
        );
        console.log(`Updated problem "${p.title}" (ID: ${p._id}): "${rawLang}" -> "${normalized}"`);
        updatedCount++;
      }
    }

    console.log(`Migration complete. Updated ${updatedCount} problems.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
