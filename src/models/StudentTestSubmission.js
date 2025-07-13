import mongoose from 'mongoose';

const StudentTestSubmissionSchema = new mongoose.Schema({
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  test: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Test', 
    required: true 
  },
  answers: [{ 
    type: Number, 
    required: true 
  }], // index of selected options
  score: { 
    type: Number, 
    required: true,
    min: 0,
    max: 100
  },
  totalQuestions: { 
    type: Number, 
    required: true 
  },
  correctAnswers: { 
    type: Number, 
    required: true 
  },
  status: {
    type: String,
    enum: ['completed', 'in_progress', 'submitted', 'failed'],
    default: 'submitted'
  },
  timeTaken: { 
    type: Number, // in seconds
    default: 0 
  },
  submittedAt: { 
    type: Date, 
    default: Date.now 
  },
  performanceMetrics: {
    accuracy: { 
      type: Number, 
      min: 0, 
      max: 100 
    },
    timePerQuestion: { 
      type: Number, 
      default: 0 
    }
  },
  language: {
    type: String,
    default: 'multiple_choice'
  }
}, { 
  timestamps: true 
});

// Add indexes for performance
StudentTestSubmissionSchema.index({ student: 1, test: 1, submittedAt: -1 });
StudentTestSubmissionSchema.index({ score: -1 });
StudentTestSubmissionSchema.index({ status: 1 });

// Method to calculate performance metrics
StudentTestSubmissionSchema.methods.calculatePerformance = function() {
  this.performanceMetrics = {
    accuracy: (this.correctAnswers / this.totalQuestions) * 100,
    timePerQuestion: this.timeTaken / this.totalQuestions
  };
  return this.save();
};

// Static method for getting test performance stats
StudentTestSubmissionSchema.statics.getTestPerformanceStats = function(testId) {
  return this.aggregate([
    { $match: { test: testId } },
    {
      $group: {
        _id: null,
        averageScore: { $avg: '$score' },
        totalSubmissions: { $sum: 1 },
        highestScore: { $max: '$score' },
        lowestScore: { $min: '$score' }
      }
    }
  ]);
};

export default mongoose.models.StudentTestSubmission || mongoose.model('StudentTestSubmission', StudentTestSubmissionSchema); 