import mongoose from 'mongoose';

// Connection URI - update this with your MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zenith-portal';

// Test schema (same as in your model)
const MCQSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOption: { type: Number, required: true },
}, { _id: true });

const TestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  mcqs: [MCQSchema],
  language: { type: String },
  collection: { type: String, required: true },
  category: { type: String, required: true },
  duration: { type: Number, default: 60 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  availableFrom: { type: Date },
  availableTo: { type: Date },
}, { timestamps: true });

const Test = mongoose.models.Test || mongoose.model('Test', TestSchema);

const sampleTests = [
  {
    title: "JavaScript Fundamentals",
    description: "Test your knowledge of JavaScript basics",
    collection: "Technical",
    category: "JavaScript",
    language: "JavaScript",
    duration: 45,
    mcqs: [
      {
        question: "What is the correct way to declare a variable in JavaScript?",
        options: ["var x = 5;", "variable x = 5;", "v x = 5;", "declare x = 5;"],
        correctOption: 0
      },
      {
        question: "Which method is used to add an element to the end of an array?",
        options: ["push()", "pop()", "shift()", "unshift()"],
        correctOption: 0
      }
    ]
  },
  {
    title: "Python Data Structures",
    description: "Test your understanding of Python data structures",
    collection: "Technical",
    category: "Python",
    language: "Python",
    duration: 60,
    mcqs: [
      {
        question: "Which of the following is NOT a mutable data type in Python?",
        options: ["List", "Dictionary", "Set", "Tuple"],
        correctOption: 3
      },
      {
        question: "What method is used to add an item to a set?",
        options: ["append()", "add()", "insert()", "push()"],
        correctOption: 1
      }
    ]
  },
  {
    title: "Logical Reasoning",
    description: "Test your logical thinking abilities",
    collection: "Aptitude",
    category: "Reasoning",
    language: "English",
    duration: 30,
    mcqs: [
      {
        question: "If all roses are flowers and some flowers are red, which statement is definitely true?",
        options: ["All roses are red", "Some roses are red", "No roses are red", "Some roses may be red"],
        correctOption: 3
      },
      {
        question: "In a sequence: 2, 6, 12, 20, 30, ?, what is the next number?",
        options: ["40", "42", "44", "46"],
        correctOption: 1
      }
    ]
  },
  {
    title: "Basic Mathematics",
    description: "Test your mathematical skills",
    collection: "Quantitative",
    category: "Mathematics",
    language: "English",
    duration: 45,
    mcqs: [
      {
        question: "What is 15% of 200?",
        options: ["25", "30", "35", "40"],
        correctOption: 1
      },
      {
        question: "If x + 5 = 12, what is the value of x?",
        options: ["6", "7", "8", "9"],
        correctOption: 1
      }
    ]
  },
  {
    title: "English Grammar",
    description: "Test your English grammar knowledge",
    collection: "Verbal",
    category: "Grammar",
    language: "English",
    duration: 30,
    mcqs: [
      {
        question: "Which sentence is grammatically correct?",
        options: ["He don't like pizza", "He doesn't likes pizza", "He doesn't like pizza", "He not like pizza"],
        correctOption: 2
      },
      {
        question: "What is the past tense of 'go'?",
        options: ["goed", "went", "gone", "going"],
        correctOption: 1
      }
    ]
  },
  {
    title: "General Knowledge Quiz",
    description: "Test your general knowledge",
    collection: "General Knowledge",
    category: "World Facts",
    language: "English",
    duration: 20,
    mcqs: [
      {
        question: "What is the capital of Australia?",
        options: ["Sydney", "Melbourne", "Canberra", "Perth"],
        correctOption: 2
      },
      {
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correctOption: 1
      }
    ]
  }
];

async function addSampleTests() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create a dummy admin user ID (you'll need to replace this with an actual admin user ID)
    const dummyAdminId = new mongoose.Types.ObjectId();
    console.log('Using dummy admin ID:', dummyAdminId);

    // Add tests
    for (const testData of sampleTests) {
      const test = new Test({
        ...testData,
        createdBy: dummyAdminId
      });
      
      await test.save();
      console.log(`✅ Added test: ${test.title} (${test.collection} -> ${test.category})`);
    }

    console.log('\n🎉 Successfully added all sample tests!');
    console.log('\nTest Collections created:');
    console.log('- Technical (JavaScript, Python)');
    console.log('- Aptitude (Reasoning)');
    console.log('- Quantitative (Mathematics)');
    console.log('- Verbal (Grammar)');
    console.log('- General Knowledge (World Facts)');

  } catch (error) {
    console.error('❌ Error adding sample tests:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
addSampleTests();