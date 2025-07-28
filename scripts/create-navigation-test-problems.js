const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://2kcartoonist:4dPA8Hm300E7UgoC@cluster0.zz7kzh7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Problem Schema (matching your current schema)
const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  output: { type: String, required: true },
  isHidden: { type: Boolean, default: false }
});

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['level1', 'level2', 'level3'], required: true },
  category: { type: String, required: true },
  programmingLanguage: { type: String, required: true },
  constraints: { type: String },
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],
  testCases: [testCaseSchema],
  starterCode: { type: String, required: true },
  solution: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

const Problem = mongoose.model('Problem', problemSchema);

// User Schema (simplified for the script)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ['admin', 'student'], default: 'student' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

// Test problems for navigation - organized by language, category, and level
const testProblems = [
  // JavaScript Math Level 1 problems
  {
    title: "Sum Two Numbers",
    description: "Write a function that takes two numbers and returns their sum.",
    difficulty: "level1",
    category: "Math",
    programmingLanguage: "javascript",
    constraints: "-10^9 <= a, b <= 10^9",
    examples: [
      { input: "a = 2, b = 3", output: "5", explanation: "2 + 3 = 5" }
    ],
    testCases: [
      { input: "2 3", output: "5" },
      { input: "-1 1", output: "0" },
      { input: "0 0", output: "0" }
    ],
    starterCode: `function sumTwoNumbers(a, b) {\n    // Your code here\n    return 0;\n}`,
    solution: `function sumTwoNumbers(a, b) {\n    return a + b;\n}`,
    tags: ["math", "javascript"]
  },
  {
    title: "Find Maximum",
    description: "Write a function that returns the maximum of two numbers.",
    difficulty: "level1",
    category: "Math",
    programmingLanguage: "javascript",
    constraints: "-10^9 <= a, b <= 10^9",
    examples: [
      { input: "a = 5, b = 3", output: "5", explanation: "max(5, 3) = 5" }
    ],
    testCases: [
      { input: "5 3", output: "5" },
      { input: "-1 -2", output: "-1" },
      { input: "0 0", output: "0" }
    ],
    starterCode: `function findMax(a, b) {\n    // Your code here\n    return 0;\n}`,
    solution: `function findMax(a, b) {\n    return a > b ? a : b;\n}`,
    tags: ["math", "javascript"]
  },
  {
    title: "Is Even Number",
    description: "Write a function that returns true if a number is even, false otherwise.",
    difficulty: "level1",
    category: "Math",
    programmingLanguage: "javascript",
    constraints: "-10^9 <= n <= 10^9",
    examples: [
      { input: "n = 2", output: "true", explanation: "2 is even." }
    ],
    testCases: [
      { input: "2", output: "true" },
      { input: "3", output: "false" },
      { input: "0", output: "true" }
    ],
    starterCode: `function isEven(n) {\n    // Your code here\n    return false;\n}`,
    solution: `function isEven(n) {\n    return n % 2 === 0;\n}`,
    tags: ["math", "javascript"]
  },
  {
    title: "Absolute Value",
    description: "Write a function that returns the absolute value of a number.",
    difficulty: "level1",
    category: "Math",
    programmingLanguage: "javascript",
    constraints: "-10^9 <= n <= 10^9",
    examples: [
      { input: "n = -5", output: "5", explanation: "Absolute value of -5 is 5." }
    ],
    testCases: [
      { input: "-5", output: "5" },
      { input: "3", output: "3" },
      { input: "0", output: "0" }
    ],
    starterCode: `function absoluteValue(n) {\n    // Your code here\n    return 0;\n}`,
    solution: `function absoluteValue(n) {\n    return n < 0 ? -n : n;\n}`,
    tags: ["math", "javascript"]
  },
  {
    title: "Square Number",
    description: "Write a function that returns the square of a number.",
    difficulty: "level1",
    category: "Math",
    programmingLanguage: "javascript",
    constraints: "-1000 <= n <= 1000",
    examples: [
      { input: "n = 4", output: "16", explanation: "4 squared is 16." }
    ],
    testCases: [
      { input: "4", output: "16" },
      { input: "-3", output: "9" },
      { input: "0", output: "0" }
    ],
    starterCode: `function square(n) {\n    // Your code here\n    return 0;\n}`,
    solution: `function square(n) {\n    return n * n;\n}`,
    tags: ["math", "javascript"]
  },

  // Python Math Level 1 problems
  {
    title: "Sum Two Numbers (Python)",
    description: "Write a function that takes two numbers and returns their sum.",
    difficulty: "level1",
    category: "Math",
    programmingLanguage: "python",
    constraints: "-10^9 <= a, b <= 10^9",
    examples: [
      { input: "a = 2, b = 3", output: "5", explanation: "2 + 3 = 5" }
    ],
    testCases: [
      { input: "2 3", output: "5" },
      { input: "-1 1", output: "0" },
      { input: "0 0", output: "0" }
    ],
    starterCode: `def sum_two_numbers(a, b):\n    # Your code here\n    pass`,
    solution: `def sum_two_numbers(a, b):\n    return a + b`,
    tags: ["math", "python"]
  },
  {
    title: "Find Maximum (Python)",
    description: "Write a function that returns the maximum of two numbers.",
    difficulty: "level1",
    category: "Math",
    programmingLanguage: "python",
    constraints: "-10^9 <= a, b <= 10^9",
    examples: [
      { input: "a = 5, b = 3", output: "5", explanation: "max(5, 3) = 5" }
    ],
    testCases: [
      { input: "5 3", output: "5" },
      { input: "-1 -2", output: "-1" },
      { input: "0 0", output: "0" }
    ],
    starterCode: `def find_max(a, b):\n    # Your code here\n    pass`,
    solution: `def find_max(a, b):\n    return max(a, b)`,
    tags: ["math", "python"]
  },
  {
    title: "Is Even Number (Python)",
    description: "Write a function that returns True if a number is even, False otherwise.",
    difficulty: "level1",
    category: "Math",
    programmingLanguage: "python",
    constraints: "-10^9 <= n <= 10^9",
    examples: [
      { input: "n = 2", output: "True", explanation: "2 is even." }
    ],
    testCases: [
      { input: "2", output: "True" },
      { input: "3", output: "False" },
      { input: "0", output: "True" }
    ],
    starterCode: `def is_even(n):\n    # Your code here\n    pass`,
    solution: `def is_even(n):\n    return n % 2 == 0`,
    tags: ["math", "python"]
  },

  // JavaScript String Level 1 problems
  {
    title: "Reverse String",
    description: "Write a function that takes a string and returns it reversed.",
    difficulty: "level1",
    category: "String",
    programmingLanguage: "javascript",
    constraints: "1 <= s.length <= 1000",
    examples: [
      { input: 's = "hello"', output: "olleh", explanation: 'Reverse of "hello" is "olleh".' }
    ],
    testCases: [
      { input: "hello", output: "olleh" },
      { input: "abc", output: "cba" },
      { input: "a", output: "a" }
    ],
    starterCode: `function reverseString(s) {\n    // Your code here\n    return "";\n}`,
    solution: `function reverseString(s) {\n    return s.split('').reverse().join('');\n}`,
    tags: ["string", "javascript"]
  },
  {
    title: "Count Characters",
    description: "Write a function that returns the length of a string.",
    difficulty: "level1",
    category: "String",
    programmingLanguage: "javascript",
    constraints: "1 <= s.length <= 1000",
    examples: [
      { input: 's = "hello"', output: "5", explanation: '"hello" has 5 characters.' }
    ],
    testCases: [
      { input: "hello", output: "5" },
      { input: "world", output: "5" },
      { input: "a", output: "1" }
    ],
    starterCode: `function countCharacters(s) {\n    // Your code here\n    return 0;\n}`,
    solution: `function countCharacters(s) {\n    return s.length;\n}`,
    tags: ["string", "javascript"]
  },
  {
    title: "First Character",
    description: "Write a function that returns the first character of a string.",
    difficulty: "level1",
    category: "String",
    programmingLanguage: "javascript",
    constraints: "1 <= s.length <= 1000",
    examples: [
      { input: 's = "hello"', output: "h", explanation: 'First character of "hello" is "h".' }
    ],
    testCases: [
      { input: "hello", output: "h" },
      { input: "world", output: "w" },
      { input: "a", output: "a" }
    ],
    starterCode: `function firstCharacter(s) {\n    // Your code here\n    return "";\n}`,
    solution: `function firstCharacter(s) {\n    return s[0];\n}`,
    tags: ["string", "javascript"]
  }
];

async function createNavigationTestProblems() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get admin user ID
    const admin = await User.findOne({ role: 'admin' });
    
    if (!admin) {
      console.log('No admin user found. Please run npm run create-admin first.');
      process.exit(1);
    }

    // Delete existing problems to avoid duplicates
    await Problem.deleteMany({});
    console.log('Cleared existing problems');

    // Create test problems with proper order
    for (const problemData of testProblems) {
      const problem = new Problem({
        ...problemData,
        createdBy: admin._id
      });
      await problem.save();
      console.log(`Created problem: ${problem.title} (${problem.programmingLanguage} - ${problem.category} - ${problem.difficulty})`);
    }

    console.log(`\nSuccessfully created ${testProblems.length} test problems for navigation!`);
    console.log('\nProblems organized by:');
    console.log('- JavaScript Math Level 1: 5 problems');
    console.log('- Python Math Level 1: 3 problems');  
    console.log('- JavaScript String Level 1: 3 problems');

  } catch (error) {
    console.error('Error creating navigation test problems:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createNavigationTestProblems();