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

// Remove MCQ model and schema, embed MCQs directly in Test

const mcqSubSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOption: { type: Number, required: true },
}, { _id: true });

const testSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  mcqs: [mcqSubSchema], // Embedded MCQs
  language: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  availableFrom: { type: Date },
  availableTo: { type: Date },
}, { timestamps: true });
const Test = mongoose.models.Test || mongoose.model('Test', testSchema);

const languageMCQs = {
  javascript: [
    { question: 'What is the output of console.log(typeof null)?', options: ['object', 'null', 'undefined', 'number'], correctOption: 0 },
    { question: 'Which method converts a JSON string to a JavaScript object?', options: ['JSON.parse()', 'JSON.stringify()', 'parseJSON()', 'toObject()'], correctOption: 0 },
    { question: 'Which keyword declares a block-scoped variable?', options: ['var', 'let', 'const', 'both let and const'], correctOption: 3 },
    { question: 'What is the result of 0 == "0" in JavaScript?', options: ['true', 'false', 'TypeError', 'undefined'], correctOption: 0 },
    { question: 'Which array method returns the first element that matches a condition?', options: ['find()', 'filter()', 'map()', 'forEach()'], correctOption: 0 },
  ],
  python: [
    { question: 'What is the output of print(2 ** 3)?', options: ['5', '6', '8', '9'], correctOption: 2 },
    { question: 'Which keyword is used to define a function in Python?', options: ['function', 'def', 'fun', 'define'], correctOption: 1 },
    { question: 'What is the output of print(type([]))?', options: ['<class "list">', '<type "list">', 'list', 'array'], correctOption: 0 },
    { question: 'Which method adds an item to the end of a list?', options: ['add()', 'append()', 'insert()', 'push()'], correctOption: 1 },
    { question: 'What is the result of 5 // 2 in Python?', options: ['2.5', '2', '3', '2.0'], correctOption: 1 },
  ],
  java: [
    { question: 'Which keyword is used to inherit a class in Java?', options: ['extends', 'implements', 'inherits', 'instanceof'], correctOption: 0 },
    { question: 'What is the size of int in Java?', options: ['2 bytes', '4 bytes', '8 bytes', 'Depends on system'], correctOption: 1 },
    { question: 'Which method is the entry point of a Java program?', options: ['start()', 'main()', 'run()', 'init()'], correctOption: 1 },
    { question: 'Which collection does not allow duplicate elements?', options: ['List', 'Set', 'Map', 'Queue'], correctOption: 1 },
    { question: 'What is the output of System.out.println(3 + "4")?', options: ['7', '34', 'Error', 'None'], correctOption: 1 },
  ],
  cpp: [
    { question: 'Which of the following is not a C++ data type?', options: ['int', 'float', 'real', 'char'], correctOption: 2 },
    { question: 'What is the output of cout << 5 / 2;?', options: ['2.5', '2', '2.0', 'Error'], correctOption: 1 },
    { question: 'Which symbol is used for single-line comments in C++?', options: ['//', '/*', '#', '--'], correctOption: 0 },
    { question: 'Which header file is required for std::cout?', options: ['<iostream>', '<stdio.h>', '<conio.h>', '<stdlib.h>'], correctOption: 0 },
    { question: 'What is the extension of C++ source files?', options: ['.c', '.cpp', '.java', '.py'], correctOption: 1 },
  ],
  c: [
    { question: 'Which function is used to print output in C?', options: ['print()', 'printf()', 'cout', 'echo'], correctOption: 1 },
    { question: 'What is the size of float in C?', options: ['2 bytes', '4 bytes', '8 bytes', 'Depends on system'], correctOption: 1 },
    { question: 'Which symbol is used for preprocessor directives?', options: ['#', '//', '@', '%'], correctOption: 0 },
    { question: 'Which header file is required for printf?', options: ['<stdio.h>', '<conio.h>', '<iostream>', '<stdlib.h>'], correctOption: 0 },
    { question: 'What is the extension of C source files?', options: ['.c', '.cpp', '.java', '.py'], correctOption: 0 },
  ]
};

const languages = Object.keys(languageMCQs);
const questionCounts = [10, 15, 20];

function generateMCQs(count, lang) {
  const base = languageMCQs[lang];
  const mcqs = [];
  let idx = 0;
  for (let i = 1; i <= count; i++) {
    const q = base[idx % base.length];
    mcqs.push({
      question: q.question + ` [${lang.toUpperCase()} Q${i}]`,
      options: q.options,
      correctOption: q.correctOption,
    });
    idx++;
  }
  return mcqs;
}

async function createSampleTests() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('No admin user found. Please run create-admin first.');
      process.exit(1);
    }
    let testNum = 1;
    for (const lang of languages) {
      for (let t = 0; t < 2; t++) {
        const qCount = questionCounts[(testNum - 1) % questionCounts.length];
        const mcqs = generateMCQs(qCount, lang);
        const now = new Date();
        const availableFrom = new Date(now.getTime() + t * 24 * 60 * 60 * 1000); // today or tomorrow
        const availableTo = new Date(availableFrom.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days window
        const test = new Test({
          title: `Sample ${lang.charAt(0).toUpperCase() + lang.slice(1)} Test ${t + 1}`,
          description: `A sample test for ${lang} with ${qCount} questions.`,
          mcqs: mcqs,
          language: lang,
          createdBy: admin._id,
          availableFrom,
          availableTo
        });
        await test.save();
        console.log(`Created test: ${test.title} with ${qCount} ${lang} questions.`);
        testNum++;
      }
    }
    console.log('Successfully created language-specific sample tests!');
  } catch (err) {
    console.error('Error creating sample tests:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createSampleTests(); 