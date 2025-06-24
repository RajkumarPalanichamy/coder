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
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  constraints: {
    type: String,
    required: true
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
    type: String,
    required: true
  },
  timeLimit: {
    type: Number,
    default: 1000 // milliseconds
  },
  memoryLimit: {
    type: Number,
    default: 128 // MB
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

const Problem = mongoose.models.Problem || mongoose.model('Problem', problemSchema);

export default Problem; 