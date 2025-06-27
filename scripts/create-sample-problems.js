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
  },
  // Python sample problem
  {
    title: "Sum of Two Numbers (Python)",
    description: "Write a function that takes two integers and returns their sum.",
    difficulty: "easy",
    category: "Math",
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
    starterCode: `def sum_two_numbers(a, b):\n    # Your code here\n    pass`,
    solution: `def sum_two_numbers(a, b):\n    return a + b`,
    tags: ["math", "python"]
  },
  {
    title: "Is Even (Python)",
    description: "Write a function that returns True if a number is even, False otherwise.",
    difficulty: "easy",
    category: "Math",
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
    starterCode: `def is_even(n):\n    # Your code here\n    pass`,
    solution: `def is_even(n):\n    return n % 2 == 0`,
    tags: ["math", "python"]
  },
  {
    title: "Reverse String (Python)",
    description: "Write a function that takes a string and returns it reversed.",
    difficulty: "easy",
    category: "String",
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
    starterCode: `def reverse_string(s):\n    # Your code here\n    pass`,
    solution: `def reverse_string(s):\n    return s[::-1]`,
    tags: ["string", "python"]
  },
  // Java sample problem
  {
    title: "Reverse String (Java)",
    description: "Write a function that takes a string and returns it reversed.",
    difficulty: "easy",
    category: "String",
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
    starterCode: `public class Solution {\n    public String reverseString(String s) {\n        // Your code here\n        return null;\n    }\n}`,
    solution: `public class Solution {\n    public String reverseString(String s) {\n        return new StringBuilder(s).reverse().toString();\n    }\n}`,
    tags: ["string", "java"]
  },
  // C++ sample problem
  {
    title: "Find Maximum (C++)",
    description: "Write a function that returns the maximum of two integers.",
    difficulty: "easy",
    category: "Math",
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
    starterCode: `int findMax(int a, int b) {\n    // Your code here\n    return 0;\n}`,
    solution: `int findMax(int a, int b) {\n    return (a > b) ? a : b;\n}`,
    tags: ["math", "cpp"]
  },
  // --- Java Problems ---
  {
    title: "Sum of Two Numbers (Java)",
    description: "Write a method that takes two integers and returns their sum.",
    difficulty: "easy",
    category: "Math",
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
    starterCode: `public class Solution {\n    public int sumTwoNumbers(int a, int b) {\n        // Your code here\n        return 0;\n    }\n}`,
    solution: `public class Solution {\n    public int sumTwoNumbers(int a, int b) {\n        return a + b;\n    }\n}`,
    tags: ["math", "java"]
  },
  {
    title: "Is Even (Java)",
    description: "Write a method that returns true if a number is even, false otherwise.",
    difficulty: "easy",
    category: "Math",
    constraints: "-10^9 <= n <= 10^9",
    examples: [
      { input: "n = 2", output: "true", explanation: "2 is even." },
      { input: "n = 3", output: "false", explanation: "3 is odd." }
    ],
    testCases: [
      { input: "2", output: "true" },
      { input: "3", output: "false" },
      { input: "0", output: "true" }
    ],
    starterCode: `public class Solution {\n    public boolean isEven(int n) {\n        // Your code here\n        return false;\n    }\n}`,
    solution: `public class Solution {\n    public boolean isEven(int n) {\n        return n % 2 == 0;\n    }\n}`,
    tags: ["math", "java"]
  },
  {
    title: "Reverse String (Java)",
    description: "Write a method that takes a string and returns it reversed.",
    difficulty: "easy",
    category: "String",
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
    starterCode: `public class Solution {\n    public String reverseString(String s) {\n        // Your code here\n        return null;\n    }\n}`,
    solution: `public class Solution {\n    public String reverseString(String s) {\n        return new StringBuilder(s).reverse().toString();\n    }\n}`,
    tags: ["string", "java"]
  },
  // --- C++ Problems ---
  {
    title: "Sum of Two Numbers (C++)",
    description: "Write a function that takes two integers and returns their sum.",
    difficulty: "easy",
    category: "Math",
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
    starterCode: `int sumTwoNumbers(int a, int b) {\n    // Your code here\n    return 0;\n}`,
    solution: `int sumTwoNumbers(int a, int b) {\n    return a + b;\n}`,
    tags: ["math", "cpp"]
  },
  {
    title: "Is Even (C++)",
    description: "Write a function that returns true if a number is even, false otherwise.",
    difficulty: "easy",
    category: "Math",
    constraints: "-10^9 <= n <= 10^9",
    examples: [
      { input: "n = 2", output: "true", explanation: "2 is even." },
      { input: "n = 3", output: "false", explanation: "3 is odd." }
    ],
    testCases: [
      { input: "2", output: "true" },
      { input: "3", output: "false" },
      { input: "0", output: "true" }
    ],
    starterCode: `bool isEven(int n) {\n    // Your code here\n    return false;\n}`,
    solution: `bool isEven(int n) {\n    return n % 2 == 0;\n}`,
    tags: ["math", "cpp"]
  },
  {
    title: "Reverse String (C++)",
    description: "Write a function that takes a string and returns it reversed.",
    difficulty: "easy",
    category: "String",
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
    starterCode: `std::string reverseString(std::string s) {\n    // Your code here\n    return "";\n}`,
    solution: `std::string reverseString(std::string s) {\n    std::reverse(s.begin(), s.end());\n    return s;\n}`,
    tags: ["string", "cpp"]
  },
  // --- JavaScript Problems ---
  {
    title: "Sum of Two Numbers (JavaScript)",
    description: "Write a function that takes two numbers and returns their sum.",
    difficulty: "easy",
    category: "Math",
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
    starterCode: `function sumTwoNumbers(a, b) {\n    // Your code here\n    return 0;\n}`,
    solution: `function sumTwoNumbers(a, b) {\n    return a + b;\n}`,
    tags: ["math", "javascript"]
  },
  {
    title: "Is Even (JavaScript)",
    description: "Write a function that returns true if a number is even, false otherwise.",
    difficulty: "easy",
    category: "Math",
    constraints: "-10^9 <= n <= 10^9",
    examples: [
      { input: "n = 2", output: "true", explanation: "2 is even." },
      { input: "n = 3", output: "false", explanation: "3 is odd." }
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
    title: "Reverse String (JavaScript)",
    description: "Write a function that takes a string and returns it reversed.",
    difficulty: "easy",
    category: "String",
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
    starterCode: `function reverseString(s) {\n    // Your code here\n    return "";\n}`,
    solution: `function reverseString(s) {\n    return s.split('').reverse().join('');\n}`,
    tags: ["string", "javascript"]
  },
  {
    title: "Find Maximum (JavaScript)",
    description: "Return the maximum of two numbers.",
    difficulty: "easy",
    category: "Math",
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
    starterCode: `function findMax(a, b) {\n    // Your code here\n    return 0;\n}`,
    solution: `function findMax(a, b) {\n    return a > b ? a : b;\n}`,
    tags: ["math", "javascript"]
  },
  {
    title: "Longest Word (JavaScript)",
    description: "Given a string, return the longest word in the string.",
    difficulty: "medium",
    category: "String",
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
    starterCode: `function longestWord(s) {\n    // Your code here\n    return "";\n}`,
    solution: `function longestWord(s) {\n    return s.split(' ').reduce((a, b) => a.length >= b.length ? a : b, "");\n}`,
    tags: ["string", "javascript"]
  },
  {
    title: "Subarray Sum Equals K (JavaScript)",
    description: "Given an array of integers and an integer k, return the total number of continuous subarrays whose sum equals to k.",
    difficulty: "hard",
    category: "Array",
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
    starterCode: `function subarraySum(nums, k) {\n    // Your code here\n    return 0;\n}`,
    solution: `function subarraySum(nums, k) {\n    let count = 0, sum = 0;\n    const map = new Map([[0, 1]]);\n    for (let num of nums) {\n        sum += num;\n        count += map.get(sum - k) || 0;\n        map.set(sum, (map.get(sum) || 0) + 1);\n    }\n    return count;\n}`,
    tags: ["array", "javascript"]
  },
  // --- Python Problems ---
  {
    title: "Find Maximum (Python)",
    description: "Return the maximum of two numbers.",
    difficulty: "easy",
    category: "Math",
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
    starterCode: `def find_max(a, b):\n    # Your code here\n    pass`,
    solution: `def find_max(a, b):\n    return max(a, b)`,
    tags: ["math", "python"]
  },
  {
    title: "Longest Word (Python)",
    description: "Given a string, return the longest word in the string.",
    difficulty: "medium",
    category: "String",
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
    starterCode: `def longest_word(s):\n    # Your code here\n    pass`,
    solution: `def longest_word(s):\n    return max(s.split(), key=len)`,
    tags: ["string", "python"]
  },
  {
    title: "Subarray Sum Equals K (Python)",
    description: "Given an array of integers and an integer k, return the total number of continuous subarrays whose sum equals to k.",
    difficulty: "hard",
    category: "Array",
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
    starterCode: `def subarray_sum(nums, k):\n    # Your code here\n    pass`,
    solution: `def subarray_sum(nums, k):\n    count = 0\n    sum_ = 0\n    d = {0: 1}\n    for num in nums:\n        sum_ += num\n        count += d.get(sum_ - k, 0)\n        d[sum_] = d.get(sum_, 0) + 1\n    return count`,
    tags: ["array", "python"]
  },
  // --- Java Problems ---
  {
    title: "Find Maximum (Java)",
    description: "Return the maximum of two numbers.",
    difficulty: "easy",
    category: "Math",
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
    starterCode: `public class Solution {\n    public int findMax(int a, int b) {\n        // Your code here\n        return 0;\n    }\n}`,
    solution: `public class Solution {\n    public int findMax(int a, int b) {\n        return Math.max(a, b);\n    }\n}`,
    tags: ["math", "java"]
  },
  {
    title: "Longest Word (Java)",
    description: "Given a string, return the longest word in the string.",
    difficulty: "medium",
    category: "String",
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
    starterCode: `public class Solution {\n    public String longestWord(String s) {\n        // Your code here\n        return null;\n    }\n}`,
    solution: `public class Solution {\n    public String longestWord(String s) {\n        String[] words = s.split(" ");\n        String longest = "";\n        for (String word : words) {\n            if (word.length() > longest.length()) longest = word;\n        }\n        return longest;\n    }\n}`,
    tags: ["string", "java"]
  },
  {
    title: "Subarray Sum Equals K (Java)",
    description: "Given an array of integers and an integer k, return the total number of continuous subarrays whose sum equals to k.",
    difficulty: "hard",
    category: "Array",
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
    starterCode: `public class Solution {\n    public int subarraySum(int[] nums, int k) {\n        // Your code here\n        return 0;\n    }\n}`,
    solution: `public class Solution {\n    public int subarraySum(int[] nums, int k) {\n        int count = 0, sum = 0;\n        Map<Integer, Integer> map = new HashMap<>();\n        map.put(0, 1);\n        for (int num : nums) {\n            sum += num;\n            count += map.getOrDefault(sum - k, 0);\n            map.put(sum, map.getOrDefault(sum, 0) + 1);\n        }\n        return count;\n    }\n}`,
    tags: ["array", "java"]
  },
  // --- C++ Problems ---
  {
    title: "Find Maximum (C++)",
    description: "Return the maximum of two numbers.",
    difficulty: "easy",
    category: "Math",
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
    starterCode: `int findMax(int a, int b) {\n    // Your code here\n    return 0;\n}`,
    solution: `int findMax(int a, int b) {\n    return (a > b) ? a : b;\n}`,
    tags: ["math", "cpp"]
  },
  {
    title: "Longest Word (C++)",
    description: "Given a string, return the longest word in the string.",
    difficulty: "medium",
    category: "String",
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
    starterCode: `std::string longestWord(std::string s) {\n    // Your code here\n    return "";\n}`,
    solution: `std::string longestWord(std::string s) {\n    std::istringstream iss(s);\n    std::string word, longest;\n    while (iss >> word) {\n        if (word.length() > longest.length()) longest = word;\n    }\n    return longest;\n}`,
    tags: ["string", "cpp"]
  },
  {
    title: "Subarray Sum Equals K (C++)",
    description: "Given an array of integers and an integer k, return the total number of continuous subarrays whose sum equals to k.",
    difficulty: "hard",
    category: "Array",
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
    starterCode: `int subarraySum(std::vector<int>& nums, int k) {\n    // Your code here\n    return 0;\n}`,
    solution: `int subarraySum(std::vector<int>& nums, int k) {\n    int count = 0, sum = 0;\n    std::unordered_map<int, int> map;\n    map[0] = 1;\n    for (int num : nums) {\n        sum += num;\n        count += map[sum - k];\n        map[sum]++;\n    }\n    return count;\n}`,
    tags: ["array", "cpp"]
  },
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