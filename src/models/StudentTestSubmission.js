import mongoose from 'mongoose';

const StudentTestSubmissionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  answers: [{ type: Number, required: true }], // index of selected options
  score: { type: Number, required: true },
  submittedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.StudentTestSubmission || mongoose.model('StudentTestSubmission', StudentTestSubmissionSchema); 