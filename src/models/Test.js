import mongoose from 'mongoose';

const MCQSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOption: { type: Number, required: true },
  // Add more fields if needed
}, { _id: true });

const TestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  mcqs: [MCQSchema], // Embedded MCQs
  language: { type: String },
  category: { type: String, required: true }, // Added category field for organizing tests
  duration: { type: Number, default: 60 }, // Duration in minutes, default 60 minutes
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  availableFrom: { type: Date },
  availableTo: { type: Date },
}, { timestamps: true });

export default mongoose.models.Test || mongoose.model('Test', TestSchema); 