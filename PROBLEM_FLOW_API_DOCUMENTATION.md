# Problem Flow API Documentation

This document describes the complete API flow for problems, similar to the existing test flow, with language, category, and level structure plus timing and submission functionality.

## Overview

The problem flow follows this hierarchy:
1. **Languages** (Programming Languages) - Collections of problems
2. **Categories** - Within each language (e.g., "TCS Problems", "Array Problems")
3. **Levels** - Within each category (level1, level2, level3)
4. **Problems** - Individual coding problems within each level
5. **Timed Submissions** - Submit all problems of a level within time limits

## API Endpoints

### 1. Problem Collections (Languages)

#### GET `/api/problems/collections`
Get all programming languages with problem counts.

**Response:**
```json
[
  {
    "language": "JavaScript",
    "count": 25,
    "problems": [
      {
        "_id": "...",
        "title": "Two Sum",
        "difficulty": "level1",
        "category": "Arrays"
      }
    ]
  }
]
```

### 2. Problem Categories

#### GET `/api/problems/categories?language={language}`
Get all categories for a specific programming language.

**Parameters:**
- `language` (required): Programming language name

**Response:**
```json
{
  "categories": [
    {
      "category": "Arrays",
      "count": 10
    },
    {
      "category": "TCS Problems",
      "count": 15
    }
  ]
}
```

### 3. Problem Levels

#### GET `/api/problems/levels?language={language}&category={category}`
Get all levels for a specific language and category combination.

**Parameters:**
- `language` (required): Programming language name
- `category` (required): Category name

**Response:**
```json
{
  "levels": [
    {
      "level": "level1",
      "count": 5
    },
    {
      "level": "level2", 
      "count": 3
    },
    {
      "level": "level3",
      "count": 2
    }
  ]
}
```

### 4. Level Problems with Timing

#### GET `/api/problems/levels/{level}?language={language}&category={category}`
Get all problems for a specific level with timing information.

**Parameters:**
- `level` (path): level1, level2, or level3
- `language` (query, required): Programming language name
- `category` (query, required): Category name

**Response:**
```json
{
  "level": "level1",
  "language": "JavaScript",
  "category": "Arrays",
  "problems": [
    {
      "_id": "...",
      "title": "Two Sum",
      "description": "Find two numbers that add up to target",
      "difficulty": "level1",
      "starterCode": "function twoSum(nums, target) {\n    // Your code here\n}",
      "examples": [...],
      "constraints": "...",
      "points": 10
    }
  ],
  "totalProblems": 5,
  "levelTiming": {
    "level": "level1",
    "timeAllowed": 1800,
    "description": "Time allowed for level1 problems"
  },
  "totalTime": 1800,
  "totalPoints": 50,
  "instructions": "Complete all 5 problems within 30 minutes"
}
```

### 5. Level Submission Management

#### POST `/api/submissions/level`
Start a new level submission session (starts timer).

**Request Body:**
```json
{
  "level": "level1",
  "language": "JavaScript",
  "category": "Arrays"
}
```

**Response:**
```json
{
  "success": true,
  "levelSubmission": {
    "_id": "...",
    "level": "level1",
    "category": "Arrays",
    "programmingLanguage": "JavaScript",
    "status": "in_progress",
    "startTime": "2024-01-01T00:00:00Z",
    "timeAllowed": 1800,
    "totalProblems": 5,
    "totalPoints": 50
  },
  "message": "Level level1 session started. You have 30 minutes to complete 5 problems."
}
```

#### GET `/api/submissions/level`
Get user's level submissions with filtering and pagination.

**Query Parameters:**
- `level`: Filter by level
- `language`: Filter by programming language
- `category`: Filter by category
- `status`: Filter by status
- `limit`: Items per page (default: 10)
- `page`: Page number (default: 1)

### 6. Individual Problem Submission within Level

#### POST `/api/submissions/level/{levelSubmissionId}/problem`
Submit a single problem within an active level session.

**Request Body:**
```json
{
  "problemId": "...",
  "code": "function twoSum(nums, target) { return [0, 1]; }",
  "language": "javascript"
}
```

**Response:**
```json
{
  "success": true,
  "submission": {
    "_id": "...",
    "problem": "...",
    "status": "pending",
    "submittedAt": "2024-01-01T00:05:00Z",
    "levelInfo": {
      "level": "level1",
      "category": "Arrays",
      "programmingLanguage": "JavaScript",
      "submissionOrder": 1
    }
  },
  "levelSubmission": {
    "_id": "...",
    "totalSubmissions": 1,
    "timeUsed": 300,
    "timeRemaining": 1500
  },
  "message": "Problem submitted successfully"
}
```

#### GET `/api/submissions/level/{levelSubmissionId}/problem`
Get all problem submissions for a level session with current status.

**Response:**
```json
{
  "levelSubmission": {
    "_id": "...",
    "level": "level1",
    "status": "in_progress",
    "timeUsed": 300,
    "timeRemaining": 1500,
    "totalProblems": 5,
    "submittedProblems": 2,
    "completedProblems": 1,
    "totalScore": 80,
    "submissionSummary": {
      "accepted": 1,
      "wrongAnswer": 0,
      "pending": 1
    },
    "problemSubmissions": [...]
  },
  "timeExpired": false,
  "canSubmit": true
}
```

### 7. Batch Level Submission

#### POST `/api/problems/levels/{level}/submit`
Submit all problems of a level at once.

**Request Body:**
```json
{
  "language": "JavaScript",
  "category": "Arrays",
  "problemSubmissions": [
    {
      "problemId": "...",
      "code": "function twoSum(nums, target) { return [0, 1]; }",
      "submissionLanguage": "javascript"
    }
  ]
}
```

#### GET `/api/problems/levels/{level}/submit?language={language}&category={category}`
Check status of batch level submission.

### 8. Enhanced Problem Listing

#### GET `/api/problems`
Enhanced problem listing with new features.

**Query Parameters:**
- `language`: Filter by programming language
- `category`: Filter by category
- `difficulty`: Filter by difficulty level
- `commonName`: Filter by common name/collection
- `search`: Text search
- `includePoints`: Include points information
- `includeTiming`: Include timing information
- `groupByLevel`: Group results by difficulty level
- `limit`: Items per page
- `page`: Page number

### 9. Enhanced Metadata

#### GET `/api/problems/meta`
Get comprehensive metadata about all problems.

**Response:**
```json
{
  "languages": [
    {
      "language": "JavaScript",
      "count": 25,
      "categories": 3,
      "categoriesList": ["Arrays", "Strings", "TCS Problems"],
      "levels": [
        {
          "level": "level1",
          "count": 10,
          "totalPoints": 100
        }
      ]
    }
  ],
  "categories": [
    {
      "category": "Arrays",
      "count": 15,
      "supportedLanguages": ["JavaScript", "Python"],
      "levels": [...]
    }
  ],
  "commonNames": [
    {
      "commonName": "TCS Problems",
      "count": 20,
      "supportedLanguages": ["JavaScript", "Python"],
      "supportedCategories": ["Arrays", "Strings"]
    }
  ],
  "statistics": {
    "totalProblems": 100,
    "totalLanguages": 5,
    "totalCategories": 10,
    "totalCollections": 3,
    "difficultyDistribution": [...]
  }
}
```

## Data Models

### Problem Model Updates
- Added `commonName` field for collection names (e.g., "TCS Problems")
- Added `levelTiming` with time limits for each level
- Added `points` field for scoring
- Enhanced indexing for better performance

### New LevelSubmission Model
- Tracks batch submissions for entire levels
- Manages timing and scoring
- Links to individual problem submissions
- Provides submission summaries and statistics

### Enhanced Submission Model
- Added level-based submission fields
- Links to parent level submission
- Tracks submission order within level
- Enhanced performance metrics

## Usage Flow

1. **Browse Languages**: Get all available programming languages
2. **Select Category**: Choose a category within the language
3. **Choose Level**: Pick a difficulty level (level1, level2, level3)
4. **Start Session**: Begin timed level submission session
5. **View Problems**: Get all problems for the level with timing info
6. **Submit Solutions**: Submit individual problems within time limit
7. **Track Progress**: Monitor submission status and time remaining
8. **Complete Level**: Finish all problems or time expires

## Time Management

- **Level 1**: 30 minutes (1800 seconds)
- **Level 2**: 45 minutes (2700 seconds)  
- **Level 3**: 60 minutes (3600 seconds)

Sessions automatically expire when time limit is reached. Users can submit individual problems or batch submit all at once.

## Authentication

All submission endpoints require authentication via NextAuth session. Users can only access their own submissions and level sessions.