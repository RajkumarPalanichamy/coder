import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true,
    enum: ['javascript', 'python', 'java', 'cpp', 'c']
  },
  status: {
    type: String,
    enum: ['accepted', 'wrong_answer', 'time_limit_exceeded', 'runtime_error', 'compilation_error', 'pending'],
    default: 'pending'
  },
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  executionTime: {
    type: Number, // milliseconds
    default: 0
  },
  memoryUsed: {
    type: Number, // MB
    default: 0
  },
  testCasesPassed: {
    type: Number,
    default: 0
  },
  totalTestCases: {
    type: Number,
    default: 0
  },
  errorMessage: {
    type: String,
    default: ''
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
submissionSchema.index({ user: 1, problem: 1 });
submissionSchema.index({ user: 1, submittedAt: -1 });
submissionSchema.index({ status: 1, submittedAt: -1 });

const Submission = mongoose.models.Submission || mongoose.model('Submission', submissionSchema);

export default Submission; 