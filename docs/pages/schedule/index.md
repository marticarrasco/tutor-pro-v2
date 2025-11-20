# Weekly Schedule (`/schedule`)

## Overview
The schedule page manages recurring classes, allowing tutors to view their week in calendar or list format, edit entries, and remove obsolete bookings.

## Data management
- Loads all `scheduled_classes` for the authenticated tutor on mount, joining each row with the associated student name.
- Normalises the Supabase payload into `scheduledClasses` state for reuse across the calendar, table, and summary metrics.
- Provides `fetchScheduledClasses` so child components refresh the parent state after mutations.

## Metrics & insights
- Derives total class count, active class count, cumulative weekly hours (minutes ÷ 60), and the number of unique students with active bookings.

## Views & interactions
- Renders two tabs:
  - **Calendar View** uses `<WeeklyCalendar />` to visualise recurring lessons grouped by weekday. Edit and delete handlers are passed through so interactions bubble back to this page.
  - **List View** displays `<ScheduleTable />`, delivering edit callbacks and a refresh hook for CRUD operations performed in the table.
- Shows a loading message inside each tab until the Supabase query completes.

## Class creation & editing
- Tapping “Add Class” or editing a row opens `<ScheduleForm />`, with the `editingClass` state determining whether the dialog pre-populates.
- Closing the form resets editing state; successful submissions trigger a full re-fetch.

## Deletion flow
- Selecting delete opens an `AlertDialog` that confirms the targeted student, weekday, and start time.
- `handleConfirmDelete` removes the class via Supabase, displays a toast on success, refreshes the schedule list, and clears the pending deletion state.
