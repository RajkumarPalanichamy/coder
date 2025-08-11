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
  instructions: { type: String }, // Test instructions
  mcqs: [MCQSchema], // Embedded MCQs
  language: { type: String, required: true }, // Main programming language (Java, Python, etc.)
  category: { type: String, required: true }, // Subcategory (Basic Problems, Advanced Problems, etc.)
  level: { 
    type: String, 
    enum: ['level1', 'level2', 'level3'],
    required: true 
  }, // Difficulty level
  duration: { type: Number, default: 90 }, // Duration in minutes, default 90 minutes (1.5h)
  attempts: { type: Number, default: 1 }, // Number of attempts allowed
  questionCount: { type: Number, default: 10 }, // Number of questions in test
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  availableFrom: { type: Date },
  availableTo: { type: Date },
  isActive: { type: Boolean, default: true },
  tags: [{ type: String, trim: true }] // Additional tags for organization
}, { timestamps: true });

export default mongoose.models.Test || mongoose.model('Test', TestSchema); 