# Monthly Earnings Page - Database Integration

## Summary
Updated the Monthly Earnings page to fetch real data from the Supabase database instead of using hardcoded data. The calendar now displays only the actual days of the selected month, with empty cells for alignment.

## Changes Made

### 1. Added Database Integration
- Added imports for Supabase client (`createClient`, `requireAuthUser`)
- Added `useEffect` hook to fetch sessions from the database when the component mounts or when the month changes
- Added toast notifications for error handling

### 2. Dynamic Student Colors
- Replaced hardcoded `STUDENT_STYLES` with a dynamic `STUDENT_COLOR_PALETTE` array
- Created `studentColorMap` state to dynamically assign colors to students based on their order
- Students are now assigned colors dynamically as they appear in the data

### 3. Data Fetching Logic
The page now:
- Fetches tutoring sessions from the `tutoring_sessions` table
- Joins with the `students` table to get student names
- Filters sessions by the current user's ID (multi-tenant support)
- Filters sessions by the selected month's date range (ONLY actual month days, no padding)
- Groups sessions by date for calendar display

### 4. Calendar Display
- **Shows only actual month days**: No more padding days from previous/next months
- Empty cells are displayed at the start/end of weeks for proper alignment
- Calendar respects Monday as the first day of the week
- Empty cells have a subtle dashed border to distinguish them from actual days

### 4. Updated Types
- Removed hardcoded `MONTHLY_DATA` constant
- Updated `SessionEntry` type to include:
  - `student: string` (instead of limited type)
  - `studentId: string` (for unique identification)
  - `durationHours: number`
  - `amount: number`

### 5. Loading State
- Added `isLoading` state
- Shows "Loading monthly earnings..." message while data is being fetched

### 6. Earnings by Student
- Updated calculation to work with dynamic student list from database
- Sorts students by total earnings (highest to lowest)
- Only shows students with earnings > 0

## Database Query
The page queries:
```sql
SELECT 
  id, 
  date, 
  duration_minutes, 
  total_amount, 
  is_cancelled, 
  student_id,
  students.name
FROM tutoring_sessions
JOIN students ON tutoring_sessions.student_id = students.id
WHERE 
  user_id = [current_user_id]
  AND date >= [first_day_of_month]
  AND date <= [last_day_of_month]
ORDER BY date
```

**Note**: The query only fetches sessions for the actual month being displayed, not including any padding days from adjacent months.

## Features Maintained
- ✅ Calendar view with weeks starting on Monday
- ✅ Color-coded sessions by student
- ✅ Duration display for each session
- ✅ Weekly earnings summary
- ✅ Total monthly earnings
- ✅ Earnings breakdown by student
- ✅ Month navigation (previous/next buttons)
- ✅ Responsive layout

## New Features
- ✅ Real-time data from database
- ✅ Multi-tenant support (filters by user_id)
- ✅ Dynamic student color assignment
- ✅ Loading state
- ✅ Error handling with toast notifications
- ✅ Automatic refresh when changing months
