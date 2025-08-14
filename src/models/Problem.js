import mongoose from 'mongoose';

const testCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    required: true
  },
  output: {
    type: String,
    required: true
  },
  isHidden: {
    type: Boolean,
    default: false
  }
});

// New schema for level timing information
const levelTimingSchema = new mongoose.Schema({
  level: {
    type: String,
    enum: ['level1', 'level2', 'level3'],
    required: true
  },
  timeAllowed: {
    type: Number,
    required: true,
    default: 3600 // Default 1 hour in seconds
  },
  description: {
    type: String,
    default: ''
  }
});

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['level1', 'level2', 'level3'],
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  programmingLanguage: {
    type: String,
    required: true,
    trim: true
  },
  // Common name/collection name (e.g., "TCS Problems", "LeetCode Style", etc.)
  commonName: {
    type: String,
    trim: true,
    default: ''
  },
  constraints: {
    type: String
  },
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],
  testCases: [testCaseSchema],
  starterCode: {
    type: String,
    required: true
  },
  solution: {
    type: String
  },
  timeLimit: {
    type: Number,
    default: 1000 // milliseconds
  },
  memoryLimit: {
    type: Number,
    default: 128 // MB
  },
  // Level-specific timing information
  levelTiming: {
    type: levelTimingSchema,
    default: function() {
      return {
        level: this.difficulty,
        timeAllowed: this.difficulty === 'level1' ? 1800 : this.difficulty === 'level2' ? 2700 : 3600, // 30, 45, 60 minutes
        description: `Time allowed for ${this.difficulty} problems`
      };
    }
  },
  // Points/score for solving this problem
  points: {
    type: Number,
    default: function() {
      return this.difficulty === 'level1' ? 10 : this.difficulty === 'level2' ? 20 : 30;
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for better search performance
problemSchema.index({ title: 'text', description: 'text', category: 'text' });
problemSchema.index({ difficulty: 1, category: 1, isActive: 1 });
problemSchema.index({ programmingLanguage: 1, category: 1, difficulty: 1 });
problemSchema.index({ commonName: 1, programmingLanguage: 1 });

const Problem = mongoose.models.Problem || mongoose.model('Problem', problemSchema);

export default Problem; 