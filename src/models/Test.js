import mongoose from 'mongoose';

const TestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  mcqs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MCQ', required: true }],
  language: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  availableFrom: { type: Date },
  availableTo: { type: Date },
}, { timestamps: true });

export default mongoose.models.Test || mongoose.model('Test', TestSchema); 