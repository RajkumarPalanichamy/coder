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
  difficulty: { type: String, enum: ['level1', 'level2', 'level3'], required: true },
  category: { type: String, required: true },
  programmingLanguage: { type: String, required: true },
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
    difficulty: "level1",
    category: "Arrays",
    programmingLanguage: "javascript",
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
    difficulty: "level1",
    category: "Math",
    programmingLanguage: "javascript",
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
    difficulty: "level1",
    category: "Stack",
    programmingLanguage: "javascript",
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
  },
  // Python sample problem
  {
    title: "Sum of Two Numbers",
    description: "Write a function that takes two integers and returns their sum.",
    difficulty: "level1",
    category: "Math",
    programmingLanguage: "python",
    constraints: "-10^9 <= a, b <= 10^9",
    examples: [
      { input: "a = 2, b = 3", output: "5", explanation: "2 + 3 = 5" },
      { input: "a = -1, b = 1", output: "0", explanation: "-1 + 1 = 0" }
    ],
    testCases: [
      { input: "2 3", output: "5" },
      { input: "-1 1", output: "0" },
      { input: "100 200", output: "300" }
    ],
    starterCode: `def sum_two_numbers(a, b):
    # Your code here
    pass`,
    solution: `def sum_two_numbers(a, b):
    return a + b`,
    tags: ["math", "python"]
  },
  {
    title: "Is Even",
    description: "Write a function that returns True if a number is even, False otherwise.",
    difficulty: "level1",
    category: "Math",
    programmingLanguage: "python",
    constraints: "-10^9 <= n <= 10^9",
    examples: [
      { input: "n = 2", output: "True", explanation: "2 is even." },
      { input: "n = 3", output: "False", explanation: "3 is odd." }
    ],
    testCases: [
      { input: "2", output: "True" },
      { input: "3", output: "False" },
      { input: "0", output: "True" }
    ],
    starterCode: `def is_even(n):
    # Your code here
    pass`,
    solution: `def is_even(n):
    return n % 2 == 0`,
    tags: ["math", "python"]
  },
  {
    title: "Reverse String",
    description: "Write a function that takes a string and returns it reversed.",
    difficulty: "level1",
    category: "String",
    programmingLanguage: "python",
    constraints: "1 <= s.length <= 1000",
    examples: [
      { input: 's = "hello"', output: "olleh", explanation: 'Reverse of "hello" is "olleh".' },
      { input: 's = "abc"', output: "cba", explanation: 'Reverse of "abc" is "cba".' }
    ],
    testCases: [
      { input: "hello", output: "olleh" },
      { input: "abc", output: "cba" },
      { input: "a", output: "a" }
    ],
    starterCode: `def reverse_string(s):
    # Your code here
    pass`,
    solution: `def reverse_string(s):
    return s[::-1]`,
    tags: ["string", "python"]
  },
  // Java sample problem
  {
    title: "Reverse String",
    description: "Write a function that takes a string and returns it reversed.",
    difficulty: "level1",
    category: "String",
    programmingLanguage: "java",
    constraints: "1 <= s.length <= 1000",
    examples: [
      { input: 's = "hello"', output: "olleh", explanation: 'Reverse of "hello" is "olleh".' },
      { input: 's = "abc"', output: "cba", explanation: 'Reverse of "abc" is "cba".' }
    ],
    testCases: [
      { input: "hello", output: "olleh" },
      { input: "abc", output: "cba" },
      { input: "a", output: "a" }
    ],
    starterCode: `public class Solution {
    public String reverseString(String s) {
        // Your code here
        return null;
    }
}`,
    solution: `public class Solution {
    public String reverseString(String s) {
        return new StringBuilder(s).reverse().toString();
    }
}`,
    tags: ["string", "java"]
  },
  // C++ sample problem
  {
    title: "Find Maximum",
    description: "Write a function that returns the maximum of two integers.",
    difficulty: "level1",
    category: "Math",
    programmingLanguage: "cpp",
    constraints: "-10^9 <= a, b <= 10^9",
    examples: [
      { input: "a = 5, b = 3", output: "5", explanation: "max(5, 3) = 5" },
      { input: "a = -1, b = -2", output: "-1", explanation: "max(-1, -2) = -1" }
    ],
    testCases: [
      { input: "5 3", output: "5" },
      { input: "-1 -2", output: "-1" },
      { input: "0 0", output: "0" }
    ],
    starterCode: `int findMax(int a, int b) {
    // Your code here
    return 0;
}`,
    solution: `int findMax(int a, int b) {
    return (a > b) ? a : b;
}`,
    tags: ["math", "cpp"]
  },
  // More diverse problems for different languages
  {
    title: "Sum of Two Numbers",
    description: "Write a method that takes two integers and returns their sum.",
    difficulty: "level1",
    category: "Math",
    programmingLanguage: "java",
    constraints: "-10^9 <= a, b <= 10^9",
    examples: [
      { input: "a = 2, b = 3", output: "5", explanation: "2 + 3 = 5" },
      { input: "a = -1, b = 1", output: "0", explanation: "-1 + 1 = 0" }
    ],
    testCases: [
      { input: "2 3", output: "5" },
      { input: "-1 1", output: "0" },
      { input: "100 200", output: "300" }
    ],
    starterCode: `public class Solution {
    public int sumTwoNumbers(int a, int b) {
        // Your code here
        return 0;
    }
}`,
    solution: `public class Solution {
    public int sumTwoNumbers(int a, int b) {
        return a + b;
    }
}`,
    tags: ["math", "java"]
  },
  {
    title: "Sum of Two Numbers",
    description: "Write a function that takes two integers and returns their sum.",
    difficulty: "level1",
    category: "Math",
    programmingLanguage: "cpp",
    constraints: "-10^9 <= a, b <= 10^9",
    examples: [
      { input: "a = 2, b = 3", output: "5", explanation: "2 + 3 = 5" },
      { input: "a = -1, b = 1", output: "0", explanation: "-1 + 1 = 0" }
    ],
    testCases: [
      { input: "2 3", output: "5" },
      { input: "-1 1", output: "0" },
      { input: "100 200", output: "300" }
    ],
    starterCode: `int sumTwoNumbers(int a, int b) {
    // Your code here
    return 0;
}`,
    solution: `int sumTwoNumbers(int a, int b) {
    return a + b;
}`,
    tags: ["math", "cpp"]
  },
  {
    title: "Sum of Two Numbers",
    description: "Write a function that takes two numbers and returns their sum.",
    difficulty: "level1",
    category: "Math",
    programmingLanguage: "javascript",
    constraints: "-10^9 <= a, b <= 10^9",
    examples: [
      { input: "a = 2, b = 3", output: "5", explanation: "2 + 3 = 5" },
      { input: "a = -1, b = 1", output: "0", explanation: "-1 + 1 = 0" }
    ],
    testCases: [
      { input: "2 3", output: "5" },
      { input: "-1 1", output: "0" },
      { input: "100 200", output: "300" }
    ],
    starterCode: `function sumTwoNumbers(a, b) {
    // Your code here
    return 0;
}`,
    solution: `function sumTwoNumbers(a, b) {
    return a + b;
}`,
    tags: ["math", "javascript"]
  },
  // Level 2 problems
  {
    title: "Longest Word",
    description: "Given a string, return the longest word in the string.",
    difficulty: "level2",
    category: "String",
    programmingLanguage: "javascript",
    constraints: "1 <= s.length <= 1000",
    examples: [
      { input: 's = "I love programming"', output: "programming", explanation: '"programming" is the longest word.' },
      { input: 's = "a ab abc"', output: "abc", explanation: '"abc" is the longest word.' }
    ],
    testCases: [
      { input: "I love programming", output: "programming" },
      { input: "a ab abc", output: "abc" },
      { input: "hello world", output: "hello" }
    ],
    starterCode: `function longestWord(s) {
    // Your code here
    return "";
}`,
    solution: `function longestWord(s) {
    return s.split(' ').reduce((a, b) => a.length >= b.length ? a : b, "");
}`,
    tags: ["string", "javascript"]
  },
  // Level 3 problems
  {
    title: "Subarray Sum Equals K",
    description: "Given an array of integers and an integer k, return the total number of continuous subarrays whose sum equals to k.",
    difficulty: "level3",
    category: "Array",
    programmingLanguage: "javascript",
    constraints: "1 <= nums.length <= 2 * 10^4\n-1000 <= nums[i] <= 1000\n-10^7 <= k <= 10^7",
    examples: [
      { input: "nums = [1,1,1], k = 2", output: "2", explanation: "There are two subarrays [1,1] that sum to 2." },
      { input: "nums = [1,2,3], k = 3", output: "2", explanation: "[1,2] and [3] sum to 3." }
    ],
    testCases: [
      { input: "[1,1,1]\n2", output: "2" },
      { input: "[1,2,3]\n3", output: "2" },
      { input: "[1,-1,0]\n0", output: "3" }
    ],
    starterCode: `function subarraySum(nums, k) {
    // Your code here
    return 0;
}`,
    solution: `function subarraySum(nums, k) {
    let count = 0, sum = 0;
    const map = new Map([[0, 1]]);
    for (let num of nums) {
        sum += num;
        count += map.get(sum - k) || 0;
        map.set(sum, (map.get(sum) || 0) + 1);
    }
    return count;
}`,
    tags: ["array", "javascript"]
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
      console.log(`Created problem: ${problem.title} (${problem.programmingLanguage})`);
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