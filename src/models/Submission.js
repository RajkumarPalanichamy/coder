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
    validate: {
      validator: function(v) {
        const supportedLanguages = ['javascript', 'python', 'java', 'cpp', 'c', 'rust', 'go', 'kotlin'];
        return supportedLanguages.includes(v);
      },
      message: 'Language not supported in real-time execution system'
    }
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
  },
  executionInfo: {
    problemType: {
      type: String,
      enum: ['array_with_param', 'array', 'matrix', 'string', 'two_numbers', 'single_number', 'multiple_numbers', 'multiline', 'custom', 'unknown']
    },
    language: {
      id: Number,
      extension: String,
      compiler: String
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    totalTestCases: Number,
    passedTestCases: Number,
    executionEngine: {
      type: String,
      enum: ['judge0', 'mock', 'fallback'],
      default: 'judge0'
    },
    error: String,
    type: String
  },
  performanceMetrics: {
    submissionTime: Date,
    validationTime: Date,
    executionDuration: Number, // milliseconds
    queueTime: Number, // milliseconds
    totalProcessingTime: Number // milliseconds
  },
  isRealTime: {
    type: Boolean,
    default: true
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Enhanced indexes for real-time queries
submissionSchema.index({ user: 1, problem: 1 });
submissionSchema.index({ user: 1, submittedAt: -1 });
submissionSchema.index({ status: 1, submittedAt: -1 });
submissionSchema.index({ 'executionInfo.problemType': 1 });
submissionSchema.index({ 'executionInfo.executionEngine': 1 });
submissionSchema.index({ language: 1, status: 1 });
submissionSchema.index({ isRealTime: 1, submittedAt: -1 });

// Real-time methods
submissionSchema.methods.updateExecutionInfo = function(executionInfo) {
  this.executionInfo = { ...this.executionInfo, ...executionInfo };
  this.version += 1;
  return this.save();
};

submissionSchema.methods.markAsProcessed = function(metrics) {
  this.performanceMetrics = metrics;
  this.version += 1;
  return this.save();
};

// Static methods for real-time analytics
submissionSchema.statics.getRealTimeStats = function(userId = null) {
  const match = userId ? { user: userId, isRealTime: true } : { isRealTime: true };
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          status: '$status',
          language: '$language',
          problemType: '$executionInfo.problemType'
        },
        count: { $sum: 1 },
        avgScore: { $avg: '$score' },
        avgExecutionTime: { $avg: '$executionTime' },
        avgProcessingTime: { $avg: '$performanceMetrics.totalProcessingTime' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

submissionSchema.statics.getLanguagePerformance = function() {
  return this.aggregate([
    { $match: { isRealTime: true, status: 'accepted' } },
    {
      $group: {
        _id: '$language',
        totalSubmissions: { $sum: 1 },
        avgExecutionTime: { $avg: '$executionTime' },
        avgScore: { $avg: '$score' },
        successRate: { 
          $avg: { 
            $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] 
          } 
        }
      }
    },
    { $sort: { totalSubmissions: -1 } }
  ]);
};

const Submission = mongoose.models.Submission || mongoose.model('Submission', submissionSchema);

export default Submission; 