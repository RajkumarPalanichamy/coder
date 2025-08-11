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
    required: false,  // Making it optional since we'll use subcategory
    trim: true
  },
  programmingLanguage: {
    type: String,
    required: true,
    trim: true
  },
  subcategory: {
    type: String,
    required: true,
    trim: true,
    default: 'Basic Problems'  // Default subcategory
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
problemSchema.index({ title: 'text', description: 'text', category: 'text', subcategory: 'text' });
problemSchema.index({ difficulty: 1, programmingLanguage: 1, subcategory: 1, isActive: 1 });

const Problem = mongoose.models.Problem || mongoose.model('Problem', problemSchema);

export default Problem; 