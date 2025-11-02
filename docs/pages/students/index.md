# Student Directory (`/students`)

## Overview
The students page manages the tutor’s roster, combining Supabase-backed CRUD operations with filtering tools and at-a-glance metrics.

## Data lifecycle
- Fetches all students for the authenticated tutor on mount via Supabase, storing both the raw list and a filtered subset for search results.
- Re-applies the search filter whenever the query string or student collection changes, matching against name, email, or phone.
- Exposes `fetchStudents` for downstream components so updates propagate after mutations.

## Metrics & insights
- Computes total, active, and inactive student counts along with the average hourly rate for active students, surfacing each in a summary card grid.

## Table management
- Wraps the directory in a card that supplies a debounced search box and renders a skeleton list while Supabase data is loading.
- Delegates row rendering and inline actions to `<StudentsTable />`, passing edit handlers and a refresh callback.

## Student form modal
- Controls a `<StudentForm />` sheet/dialog for both creation and editing. Opening the form populates `editingStudent` when applicable.
- Closes and resets the form state after successful submissions, then re-fetches the student list to keep the table in sync.

## Error handling
- Shows destructive toasts when data fetching fails, while logging errors to the console for debugging.
