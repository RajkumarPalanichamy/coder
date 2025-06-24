import mongoose from 'mongoose';

const MCQSubmissionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [{
    mcq: { type: mongoose.Schema.Types.ObjectId, ref: 'MCQ', required: true },
    selected: { type: Number, required: true }
  }],
  score: { type: Number, required: true },
  submittedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.MCQSubmission || mongoose.model('MCQSubmission', MCQSubmissionSchema); 