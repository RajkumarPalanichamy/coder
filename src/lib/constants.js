// Programming Languages
export const PROGRAMMING_LANGUAGES = {
  javascript: {
    label: 'JavaScript',
    extension: '.js',
    defaultTemplate: 'function solution() {\n  // Write your code here\n}',
    multiParamTemplate: 'function solution(param1, param2) {\n  // Write your code here\n}',
    judge0Id: 63 // Node.js ID in Judge0
  },
  python: {
    label: 'Python',
    extension: '.py',
    defaultTemplate: 'def solution():\n    # Write your code here\n    pass',
    multiParamTemplate: 'def solution(param1, param2):\n    # Write your code here\n    pass',
    judge0Id: 71 // Python 3 ID in Judge0
  },
  java: {
    label: 'Java',
    extension: '.java',
    defaultTemplate: 'class Solution {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}',
    multiParamTemplate: 'class Solution {\n    public static void solution(int param1, int param2) {\n        // Write your code here\n    }\n}',
    judge0Id: 62 // Java ID in Judge0
  },
  cpp: {
    label: 'C++',
    extension: '.cpp',
    defaultTemplate: '#include <iostream>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    void solution() {\n        // Write your code here\n    }\n};',
    multiParamTemplate: '#include <iostream>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    void solution(int param1, int param2) {\n        // Write your code here\n    }\n};',
    judge0Id: 54 // C++ ID in Judge0
  },
  c: {
    label: 'C',
    extension: '.c',
    defaultTemplate: '#include <stdio.h>\n\nvoid solution() {\n    // Write your code here\n}',
    multiParamTemplate: '#include <stdio.h>\n\nvoid solution(int param1, int param2) {\n    // Write your code here\n}',
    judge0Id: 50 // C ID in Judge0
  }
};

// Difficulty Levels
export const DIFFICULTY_LEVELS = {
  easy: { label: 'Easy', color: 'green' },
  medium: { label: 'Medium', color: 'yellow' },
  hard: { label: 'Hard', color: 'red' }
}; 