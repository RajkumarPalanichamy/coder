# Test Collections Migration Instructions

## Issue
You're getting a 500 Internal Server Error when creating tests because we added a new `collection` field to the Test model, but existing tests don't have this field.

## Quick Fix Options

### Option 1: Run Migration Script (Recommended)
This will automatically update all existing tests with appropriate collection values:

```bash
# Navigate to your project directory
cd /workspace

# Run the migration script
node scripts/migrate-existing-tests.js
```

This script will:
- Find all tests without a collection field
- Automatically assign collections based on category (e.g., JavaScript → Technical, Reasoning → Aptitude)
- Update your database

### Option 2: Manual Database Update (Alternative)
If you prefer to manually update your tests, you can run this MongoDB query:

```javascript
// Connect to your MongoDB database and run:
db.tests.updateMany(
  { collection: { $exists: false } },
  { $set: { collection: "General" } }
);
```

### Option 3: Start Fresh (If you don't have important test data)
If you don't have important test data and want to start fresh:

```bash
# Add sample tests with collections
node scripts/add-sample-collection-tests.js
```

## What Changed
1. Added `collection` field to Test model
2. Updated API routes to handle collections
3. Modified admin and student interfaces to show Collection → Categories → Tests flow
4. Updated TestForm to include collection selection

## After Migration
Once you run the migration:
1. Your existing tests will have collection assignments
2. The 500 error will be resolved
3. You can create new tests with the collection field
4. Both admin and student interfaces will show the new hierarchical flow

## Verification
After running the migration, you can verify it worked by:
1. Visiting `/admin/tests` - you should see collections instead of categories first
2. Creating a new test - the form should include a Collection field
3. No more 500 errors when saving tests

## Collections Created
The migration will organize your tests into these collections:
- **Technical**: Programming languages, databases, algorithms
- **Aptitude**: Reasoning, problem-solving
- **Quantitative**: Mathematics, statistics
- **Verbal**: English, grammar, comprehension
- **General Knowledge**: World facts, current affairs
- **General**: Default for unmatched categories