require('./load-env');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ['admin', 'student'], default: 'student' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

const TEST_EMAIL = 'teststudent@codemaster.com';
const TEST_USERNAME = 'teststudent';
const TEST_PASSWORD = 'Test@1234';

async function createTestStudent() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ $or: [{ email: TEST_EMAIL }, { username: TEST_USERNAME }] });
    if (existing) {
      console.log('Test student already exists:', existing.email);
      console.log('Email:', TEST_EMAIL);
      console.log('Password: (unchanged - use the one originally set)');
      return;
    }

    const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 12);

    const student = new User({
      username: TEST_USERNAME,
      email: TEST_EMAIL,
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'Student',
      role: 'student'
    });

    await student.save();
    console.log('Test student account created successfully!');
    console.log('Email:', TEST_EMAIL);
    console.log('Password:', TEST_PASSWORD);
  } catch (error) {
    console.error('Error creating test student account:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createTestStudent();
