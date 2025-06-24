const mongoose = require('mongoose');

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

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://2kcartoonist:4dPA8Hm300E7UgoC@cluster0.zz7kzh7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Problem Schema (simplified for the script)
const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  output: { type: String, required: true },
  isHidden: { type: Boolean, default: false }
});

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  category: { type: String, required: true },
  constraints: { type: String, required: true },
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
  tags: [{ type: String }]
});

const Problem = mongoose.model('Problem', problemSchema);

// Sample problems
const sampleProblems = [
  {
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    difficulty: "easy",
    category: "Arrays",
    constraints: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
        explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
      }
    ],
    testCases: [
      { input: "[2,7,11,15]\n9", output: "[0,1]" },
      { input: "[3,2,4]\n6", output: "[1,2]" },
      { input: "[3,3]\n6", output: "[0,1]" }
    ],
    starterCode: `function twoSum(nums, target) {
    // Your code here
}`,
    solution: `function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}`,
    tags: ["hash-table", "array"]
  },
  {
    title: "Palindrome Number",
    description: "Given an integer x, return true if x is a palindrome, and false otherwise.",
    difficulty: "easy",
    category: "Math",
    constraints: "-2^31 <= x <= 2^31 - 1",
    examples: [
      {
        input: "x = 121",
        output: "true",
        explanation: "121 reads as 121 from left to right and from right to left."
      },
      {
        input: "x = -121",
        output: "false",
        explanation: "From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome."
      }
    ],
    testCases: [
      { input: "121", output: "true" },
      { input: "-121", output: "false" },
      { input: "10", output: "false" }
    ],
    starterCode: `function isPalindrome(x) {
    // Your code here
}`,
    solution: `function isPalindrome(x) {
    if (x < 0) return false;
    const str = x.toString();
    return str === str.split('').reverse().join('');
}`,
    tags: ["math"]
  },
  {
    title: "Valid Parentheses",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: 1) Open brackets must be closed by the same type of brackets. 2) Open brackets must be closed in the correct order. 3) Every close bracket has a corresponding open bracket of the same type.",
    difficulty: "easy",
    category: "Stack",
    constraints: "1 <= s.length <= 10^4\ns consists of parentheses only '()[]{}'",
    examples: [
      {
        input: 's = "()"',
        output: "true",
        explanation: "Simple valid case."
      },
      {
        input: 's = "([)]"',
        output: "false",
        explanation: "Brackets are not closed in the correct order."
      }
    ],
    testCases: [
      { input: '"()"', output: "true" },
      { input: '"()[]{}"', output: "true" },
      { input: '"(]"', output: "false" },
      { input: '"([)]"', output: "false" }
    ],
    starterCode: `function isValid(s) {
    // Your code here
}`,
    solution: `function isValid(s) {
    const stack = [];
    const pairs = {
        ')': '(',
        '}': '{',
        ']': '['
    };
    
    for (let char of s) {
        if (char in pairs) {
            if (stack.pop() !== pairs[char]) {
                return false;
            }
        } else {
            stack.push(char);
        }
    }
    
    return stack.length === 0;
}`,
    tags: ["stack", "string"]
  }
];

async function createSampleProblems() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get admin user ID
    const User = mongoose.model('User');
    const admin = await User.findOne({ role: 'admin' });
    
    if (!admin) {
      console.log('No admin user found. Please run npm run create-admin first.');
      process.exit(1);
    }

    // Check if problems already exist
    const existingProblems = await Problem.countDocuments();
    if (existingProblems > 0) {
      console.log(`${existingProblems} problems already exist in the database.`);
      process.exit(0);
    }

    // Create sample problems
    for (const problemData of sampleProblems) {
      const problem = new Problem({
        ...problemData,
        createdBy: admin._id
      });
      await problem.save();
      console.log(`Created problem: ${problem.title}`);
    }

    console.log(`Successfully created ${sampleProblems.length} sample problems!`);

  } catch (error) {
    console.error('Error creating sample problems:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createSampleProblems(); 