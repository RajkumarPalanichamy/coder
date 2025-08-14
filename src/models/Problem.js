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
    default: 1000 // milliseconds for execution
  },
  memoryLimit: {
    type: Number,
    default: 128 // MB
  },
  // Individual problem timing (set by admin) - in minutes
  problemTimeAllowed: {
    type: Number,
    required: true,
    default: function() {
      // Default timing based on difficulty if not set by admin
      return this.difficulty === 'level1' ? 5 : this.difficulty === 'level2' ? 8 : 12;
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