const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://2kcartoonist:4dPA8Hm300E7UgoC@cluster0.zz7kzh7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  role: String,
  isActive: Boolean,
  createdAt: Date
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

const mcqSchema = new mongoose.Schema({
  question: String,
  options: [String],
  correctOption: Number,
  language: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
const MCQ = mongoose.models.MCQ || mongoose.model('MCQ', mcqSchema);

const sampleMCQs = [
  {
    question: 'What is the capital of France?',
    options: ['Berlin', 'London', 'Paris', 'Madrid'],
    correctOption: 2,
    language: 'English',
  },
  {
    question: 'Which language runs in a web browser?',
    options: ['Java', 'C', 'Python', 'JavaScript'],
    correctOption: 3,
    language: 'English',
  },
  {
    question: 'What does CSS stand for?',
    options: ['Central Style Sheets', 'Cascading Style Sheets', 'Cascading Simple Sheets', 'Cars SUVs Sailboats'],
    correctOption: 1,
    language: 'English',
  },
  {
    question: 'Who developed the theory of relativity?',
    options: ['Isaac Newton', 'Albert Einstein', 'Galileo Galilei', 'Nikola Tesla'],
    correctOption: 1,
    language: 'English',
  },
];

async function createSampleMCQs() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('No admin user found. Please run create-admin first.');
      process.exit(1);
    }
    for (const mcqData of sampleMCQs) {
      const exists = await MCQ.findOne({ question: mcqData.question });
      if (exists) continue;
      const mcq = new MCQ({ ...mcqData, createdBy: admin._id });
      await mcq.save();
      console.log('Inserted:', mcq.question);
    }
    console.log('Sample MCQs inserted.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

createSampleMCQs(); 