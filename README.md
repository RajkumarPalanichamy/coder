# Competitive Programming Platform

A competitive programming platform similar to LeetCode and CodeChef, built with Next.js, MongoDB, and real code execution capabilities.

## Features

- 🔥 **Real Code Execution**: Execute code in multiple languages using Judge0 CE API
- 🏆 **Competitive Programming**: LeetCode-style problems with hidden test cases
- 📊 **Performance Metrics**: Execution time and memory usage tracking
- 👥 **User Management**: Student and admin roles with authentication
- 📝 **Problem Management**: Create, edit, and manage coding problems
- 🧪 **Test Management**: MCQ tests with automated scoring
- 📈 **Analytics**: Submission tracking and performance analytics

## Supported Languages

- JavaScript (Node.js)
- Python 3
- Java 8
- C++ 17
- C

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd coder
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

### 3. Configure Judge0 API

1. **Register for Judge0 CE API**:
   - Go to [Judge0 CE on RapidAPI](https://rapidapi.com/judge0-official/api/judge0-ce)
   - Subscribe to a plan
   - Get your API key

2. **Update Environment Variables**:
   ```bash
   # In .env.local
   JUDGE0_API_KEY=your_rapidapi_key_here
   JUDGE0_URL=https://judge0-ce.p.rapidapi.com
   ```

### 4. Database Setup

Configure your MongoDB connection:
```bash
# In .env.local
MONGODB_URI=mongodb://localhost:27017/competitive_programming
# OR use MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

### 5. Authentication Setup

Set up JWT secrets:
```bash
# In .env.local
JWT_SECRET=your_super_secret_jwt_key_here
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

### 6. Initialize Sample Data

Run the setup scripts to create sample problems and admin user:

```bash
# Create admin user
node scripts/create-admin.js

# Create sample problems
node scripts/create-sample-problems.js

# Create sample MCQs
node scripts/create-sample-mcqs.js

# Create sample tests
node scripts/create-sample-tests.js
```

### 7. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Usage

### For Students
1. Register an account
2. Browse available problems
3. Write and test code against sample test cases
4. Submit solutions for evaluation against all test cases
5. Track your progress and submissions

### For Administrators
1. Login with admin credentials
2. Create and manage programming problems
3. Set up test cases (both visible and hidden)
4. Create MCQ tests
5. Monitor student submissions and performance

## API Quotas and Limits

The Judge0 CE API includes:
- Limited API calls per month (depends on your RapidAPI plan)
- 5-second execution time limit
- 256MB memory limit

For production use, consider upgrading to a paid plan for higher quotas.

## Code Execution Flow

1. Student writes code in the web editor
2. Code is tested against sample (visible) test cases
3. Upon submission, code runs against all test cases (including hidden ones)
4. Results include:
   - Pass/fail status for each test case
   - Execution time and memory usage
   - Compilation errors or runtime errors
   - Final score based on test cases passed

## Technologies Used

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, NextAuth.js
- **Code Execution**: Judge0 CE API via RapidAPI
- **Deployment**: Vercel (recommended)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

---

Built with ❤️ for competitive programming enthusiasts
