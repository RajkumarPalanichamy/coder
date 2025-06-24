# CodeMaster - LeetCode-like Coding Platform

A comprehensive coding platform built with Next.js and MongoDB Atlas, featuring admin and student dashboards for managing coding problems and tracking progress.

## Features

### For Students
- Browse and solve coding problems
- Multiple programming language support (JavaScript, Python, Java, C++, C)
- Real-time code submission and testing
- Progress tracking and statistics
- View submission history and scores

### For Admins
- Create and manage student accounts
- Create, edit, and delete coding problems
- Monitor student progress and submissions
- Dashboard with comprehensive statistics
- Problem management with test cases

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas
- **Authentication**: JWT with HTTP-only cookies
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation

## Prerequisites

- Node.js 18+ 
- MongoDB Atlas account
- npm or yarn package manager

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd coder
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/codemaster?retryWrites=true&w=majority

# JWT Secret for authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Next.js Environment
NODE_ENV=development
```

### 3. MongoDB Atlas Setup

1. Create a MongoDB Atlas account at [mongodb.com](https://mongodb.com)
2. Create a new cluster
3. Create a database user with read/write permissions
4. Get your connection string and replace it in `.env.local`
5. Whitelist your IP address in Network Access

### 4. Create Admin Account

After setting up the database, you'll need to create an admin account. You can do this by:

1. First registering a regular account
2. Manually updating the user role in MongoDB to 'admin'
3. Or using the registration API with role: 'admin'

### 5. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/           # Authentication endpoints
│   │   ├── admin/          # Admin-only endpoints
│   │   ├── problems/       # Problem management
│   │   ├── submissions/    # Submission handling
│   │   └── user/           # User-specific endpoints
│   ├── admin/              # Admin dashboard pages
│   ├── dashboard/          # Student dashboard
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   └── problems/           # Problem solving pages
├── lib/
│   └── mongodb.js          # Database connection
├── models/
│   ├── User.js             # User model
│   ├── Problem.js          # Problem model
│   └── Submission.js       # Submission model
└── middleware.js           # Authentication middleware
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Admin Endpoints
- `GET /api/admin/students` - Get all students
- `POST /api/admin/students` - Create new student
- `DELETE /api/admin/students/[id]` - Delete student
- `GET /api/admin/problems` - Get all problems
- `POST /api/admin/problems` - Create new problem
- `DELETE /api/admin/problems/[id]` - Delete problem
- `GET /api/admin/stats` - Get admin dashboard stats

### Student Endpoints
- `GET /api/problems` - Get available problems
- `GET /api/problems/[id]` - Get specific problem
- `GET /api/submissions` - Get user submissions
- `POST /api/submissions` - Submit solution
- `GET /api/user/stats` - Get user statistics

## Usage

### For Admins

1. **Login** to the admin dashboard
2. **Manage Students**: Create, edit, or delete student accounts
3. **Create Problems**: Add new coding problems with test cases
4. **Monitor Progress**: View student submissions and statistics

### For Students

1. **Register** or login to your account
2. **Browse Problems**: View available coding challenges
3. **Solve Problems**: Write and submit your solutions
4. **Track Progress**: Monitor your performance and scores

## Code Execution

The current implementation includes a basic submission system. For production use, you should implement:

1. **Code Execution Engine**: Use services like Judge0, Sphere Engine, or AWS Lambda
2. **Security**: Sandbox code execution to prevent malicious code
3. **Rate Limiting**: Prevent abuse of the submission system
4. **Test Case Validation**: Proper input/output validation

## Security Features

- JWT-based authentication with HTTP-only cookies
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- Protected API routes

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the GitHub repository.
