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
  inputType: {
    type: String,
    enum: ['string', 'number', 'array_number', 'array_string', 'matrix_number', 'matrix_string', 'boolean', 'object', 'multiple_params'],
    default: 'string'
  },
  outputType: {
    type: String,
    enum: ['string', 'number', 'array_number', 'array_string', 'matrix_number', 'matrix_string', 'boolean', 'object'],
    default: 'string'
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
    required: true,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },
  category: {
    type: String,
    required: true,
    enum: ['javascript', 'python', 'java', 'cpp', 'c'],
    default: 'javascript'
  },
  constraints: {
    type: String,
    required: true
  },
  examples: [{
    input: {
      type: String,
      required: true
    },
    output: {
      type: String,
      required: true
    },
    explanation: String,
    inputType: {
      type: String,
      required: true,
      enum: ['string', 'number', 'array_number', 'array_string', 'matrix_number', 'matrix_string', 'boolean', 'object', 'multiple_params'],
      default: 'string'
    },
    outputType: {
      type: String,
      required: true,
      enum: ['string', 'number', 'array_number', 'array_string', 'matrix_number', 'matrix_string', 'boolean', 'object'],
      default: 'string'
    }
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
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for better search performance
problemSchema.index({ title: 'text', description: 'text', category: 'text' });
problemSchema.index({ difficulty: 1, category: 1, isActive: 1 });
problemSchema.index({ tags: 1 });

const Problem = mongoose.models.Problem || mongoose.model('Problem', problemSchema);

export default Problem; 