# Level and Category-Based Submission System

## Overview

The level and category-based submission system allows students to attempt multiple problems in a batch session, organized by difficulty level, category, and programming language. This feature provides a more structured and comprehensive assessment approach.

## Key Features

### For Students

1. **Level-Based Problem Sets**
   - Problems organized by difficulty levels (Level 1, 2, 3)
   - Category-specific problem sets (e.g., Arrays, Strings, Dynamic Programming)
   - Language-specific challenges

2. **Timed Sessions**
   - Each level session has a time limit
   - Timer runs for the entire session, not individual problems
   - Auto-submission when time expires
   - Progress tracking during the session

3. **Navigation and Progress**
   - Navigate freely between problems during the session
   - Real-time progress tracking
   - Code auto-saves as you work
   - Visual indicators for answered/unanswered problems

4. **Submission Process**
   - Submit all problems at once or when time expires
   - Individual problem testing available
   - Comprehensive results summary

### For Admins

1. **Level Submission Management**
   - View all level submissions in a dedicated tab
   - Filter by level, category, language, and status
   - Detailed submission analytics

2. **Student Progress Tracking**
   - Monitor individual student performance
   - View problem-by-problem breakdown
   - Track time usage and completion rates

3. **Statistics Dashboard**
   - Total level submissions count
   - Success rates by level and category
   - Performance metrics

## Technical Implementation

### Data Models

#### LevelSubmission Schema
```javascript
{
  user: ObjectId,
  level: 'level1' | 'level2' | 'level3',
  category: String,
  programmingLanguage: String,
  problemSubmissions: [{
    problem: ObjectId,
    submission: ObjectId,
    order: Number
  }],
  status: 'in_progress' | 'completed' | 'time_expired' | 'submitted',
  startTime: Date,
  submitTime: Date,
  timeAllowed: Number (seconds),
  timeUsed: Number (seconds),
  totalProblems: Number,
  completedProblems: Number,
  totalScore: Number,
  totalPoints: Number,
  submissionSummary: {
    accepted: Number,
    wrongAnswer: Number,
    timeLimit: Number,
    runtimeError: Number,
    compilationError: Number,
    pending: Number
  }
}
```

#### Updated Submission Schema
```javascript
{
  // ... existing fields ...
  levelSubmission: ObjectId,
  isLevelSubmission: Boolean,
  levelInfo: {
    level: String,
    category: String,
    programmingLanguage: String,
    submissionOrder: Number
  }
}
```

### API Routes

#### Student Routes

1. **Start Level Session**
   - `POST /api/submissions/level`
   - Creates a new level submission session
   - Returns session ID and time allowed

2. **Get Level Problems**
   - `GET /api/problems/levels/[level]?language=&category=`
   - Returns problems for the specified level, language, and category

3. **Submit All Problems**
   - `POST /api/problems/levels/[level]/submit`
   - Submits all problems in the level session
   - Processes and scores each submission

4. **Get Level Submission Details**
   - `GET /api/submissions/level/[id]`
   - Returns detailed information about a level submission

#### Admin Routes

1. **View All Level Submissions**
   - `GET /api/admin/submissions/level`
   - Supports filtering and pagination
   - Returns comprehensive submission data

2. **Delete Level Submission**
   - `DELETE /api/admin/submissions/level?id=[submissionId]`
   - Removes a level submission

### UI Components

#### Student Side

1. **Level Selection Page** (`/dashboard/problems`)
   - Language selection cards
   - Category selection after language
   - Level selection after category

2. **Level Problems Page** (`/dashboard/problems/level/[level]`)
   - Problem navigation
   - Code editor with language selection
   - Timer display
   - Submit all button
   - Progress tracking

3. **Submissions Page** (`/dashboard/submissions`)
   - Filter for level vs individual submissions
   - Detailed view for each level submission
   - Problem-by-problem breakdown

#### Admin Side

1. **Admin Submissions Page** (`/admin/submissions`)
   - Tabbed interface for individual and level submissions
   - Comprehensive table view
   - Filtering and sorting options

2. **Level Submission Details** (`/admin/submissions/level/[id]`)
   - Student information
   - Progress summary
   - Individual problem results
   - Code viewing capability

3. **Dashboard Updates**
   - New stats card for level submissions
   - Enhanced statistics tracking

## Usage Guide

### For Students

1. **Starting a Level Session**
   - Navigate to Problems page
   - Select programming language
   - Choose problem category
   - Select difficulty level
   - Click "Start Level Session"

2. **During the Session**
   - Write code for each problem
   - Use "Run Code" to test against examples
   - Navigate between problems using Previous/Next buttons
   - Monitor time remaining in the header
   - Submit all problems when ready or let timer auto-submit

3. **Viewing Results**
   - Go to Submissions page
   - Filter by "Levels" to see level submissions
   - Click on a submission to view detailed results
   - Review code and scores for each problem

### For Admins

1. **Monitoring Level Submissions**
   - Access Admin Submissions page
   - Click "Level Submissions" tab
   - Use filters to find specific submissions
   - Click "View Details" for comprehensive breakdown

2. **Analyzing Performance**
   - Check dashboard for level submission statistics
   - Review success rates and completion times
   - Identify problem areas for student support

## Best Practices

1. **Problem Organization**
   - Ensure consistent difficulty within each level
   - Group related problems by category
   - Provide clear problem descriptions

2. **Time Management**
   - Set appropriate time limits based on problem count and difficulty
   - Consider 5-10 minutes per Level 1 problem
   - 10-15 minutes per Level 2 problem
   - 15-20 minutes per Level 3 problem

3. **Scoring**
   - Points awarded based on problem difficulty
   - Partial credit for test cases passed
   - Overall percentage calculated from total points

## Future Enhancements

1. **Analytics Dashboard**
   - Detailed performance analytics
   - Comparative analysis across levels
   - Student progress tracking over time

2. **Leaderboards**
   - Level-specific leaderboards
   - Category rankings
   - Time-based achievements

3. **Practice Mode**
   - Untimed practice sessions
   - Hints and solution viewing
   - Step-by-step problem solving

4. **Batch Problem Creation**
   - Admin tools for creating problem sets
   - Template-based problem generation
   - Bulk import functionality