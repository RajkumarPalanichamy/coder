const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://2kcartoonist:4dPA8Hm300E7UgoC@cluster0.zz7kzh7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// User Schema (simplified for the script)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true,   unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ['admin', 'student'], default: 'student' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin account already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Create admin account
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const admin = new User({
      username: 'admin',
      email: 'admin@codemaster.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    });

    await admin.save();
    console.log('Admin account created successfully!');
    console.log('Email: admin@codemaster.com');
    console.log('Password: admin123');
    console.log('Please change the password after first login.');

  } catch (error) {
    console.error('Error creating admin account:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createAdmin(); 