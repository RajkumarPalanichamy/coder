import mongoose from 'mongoose';

const MCQSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOption: { type: Number, required: true }, // index of correct option
  language: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' }, // reference to test set
}, { timestamps: true });

export default mongoose.models.MCQ || mongoose.model('MCQ', MCQSchema); 