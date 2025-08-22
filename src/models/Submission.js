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
    enum: ['accepted', 'wrong_answer', 'time_limit_exceeded', 'runtime_error', 'compilation_error', 'pending', 'passed', 'failed', 'not_attempted'],
    default: 'pending'
  },
  // Add pass/fail status for level submissions
  passFailStatus: {
    type: String,
    enum: ['passed', 'failed', 'not_attempted'],
    default: 'not_attempted'
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
  // Level-based submission fields
  levelSubmission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LevelSubmission',
    default: null
  },
  isLevelSubmission: {
    type: Boolean,
    default: false
  },
  levelInfo: {
    level: {
      type: String,
      enum: ['level1', 'level2', 'level3', null],
      default: null
    },
    category: {
      type: String,
      default: null
    },
    programmingLanguage: {
      type: String,
      default: null
    },
    submissionOrder: {
      type: Number,
      default: 0
    }
  },
  executionInfo: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      problemType: 'unknown',
      language: {
        id: 0,
        extension: '',
        compiler: ''
      },
      timestamp: Date.now(),
      totalTestCases: 0,
      passedTestCases: 0,
      executionEngine: 'fallback',
      error: '',
      type: 'fallback'
    }
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

// New schema for level-based batch submissions
const levelSubmissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  level: {
    type: String,
    enum: ['level1', 'level2', 'level3'],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  programmingLanguage: {
    type: String,
    required: true
  },
  // Individual problem submissions
  problemSubmissions: [{
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      required: true
    },
    submission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      required: true
    },
    order: {
      type: Number,
      required: true
    }
  }],
  // Overall level submission status
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'time_expired', 'submitted'],
    default: 'in_progress'
  },
  // Timing information
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  submitTime: {
    type: Date
  },
  timeAllowed: {
    type: Number, // seconds
    required: true
  },
  timeUsed: {
    type: Number, // seconds
    default: 0
  },
  // Scoring information
  totalProblems: {
    type: Number,
    required: true
  },
  completedProblems: {
    type: Number,
    default: 0
  },
  // Remove all scoring fields completely
  // totalScore: { type: Number, default: 0 },
  // totalPoints: { type: Number, default: 0 },
  // Submission metadata
  isCompleted: {
    type: Boolean,
    default: false
  },
  submissionSummary: {
    accepted: { type: Number, default: 0 },
    wrongAnswer: { type: Number, default: 0 },
    timeLimit: { type: Number, default: 0 },
    runtimeError: { type: Number, default: 0 },
    compilationError: { type: Number, default: 0 },
    pending: { type: Number, default: 0 }
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
submissionSchema.index({ levelSubmission: 1, isLevelSubmission: 1 });
submissionSchema.index({ 'levelInfo.level': 1, 'levelInfo.category': 1 });

// Level submission indexes
levelSubmissionSchema.index({ user: 1, level: 1, category: 1, programmingLanguage: 1 });
levelSubmissionSchema.index({ user: 1, createdAt: -1 });
levelSubmissionSchema.index({ status: 1, createdAt: -1 });

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

// Level submission methods
levelSubmissionSchema.methods.updateSubmissionSummary = function() {
  // This method should be called after all individual submissions are processed
  return this.populate('problemSubmissions.submission').then(() => {
    const summary = {
      accepted: 0,
      wrongAnswer: 0,
      timeLimit: 0,
      runtimeError: 0,
      compilationError: 0,
      pending: 0
    };

    let completedProblems = 0;

    this.problemSubmissions.forEach(ps => {
      if (ps.submission) {
        // Count completed problems (any status other than not_attempted)
        if (ps.submission.passFailStatus && ps.submission.passFailStatus !== 'not_attempted') {
          completedProblems++;
        }

        // Keep existing status summary for backward compatibility
        switch (ps.submission.status) {
          case 'accepted':
          case 'passed':
            summary.accepted++;
            break;
          case 'wrong_answer':
          case 'failed':
            summary.wrongAnswer++;
            break;
          case 'time_limit_exceeded':
            summary.timeLimit++;
            break;
          case 'runtime_error':
            summary.runtimeError++;
            break;
          case 'compilation_error':
            summary.compilationError++;
            break;
          default:
            summary.pending++;
        }
      }
    });

    this.submissionSummary = summary;
    // Remove passFailSummary counting
    // this.passFailSummary = passFailSummary;
    this.completedProblems = completedProblems;
    this.version = (this.version || 0) + 1;
    
    return this.save();
  });
};

levelSubmissionSchema.methods.calculateTimeUsed = function() {
  if (this.submitTime) {
    this.timeUsed = Math.floor((this.submitTime - this.startTime) / 1000);
  } else {
    this.timeUsed = Math.floor((new Date() - this.startTime) / 1000);
  }
  return this.timeUsed;
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
const LevelSubmission = mongoose.models.LevelSubmission || mongoose.model('LevelSubmission', levelSubmissionSchema);

export default Submission;
export { LevelSubmission }; 