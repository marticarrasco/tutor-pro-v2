# Dashboard (`/`)

## Overview
The dashboard page provides the authenticated tutor with a consolidated view of daily operations. It manages authentication gating, loads the latest tutoring data from Supabase, and surfaces actionable cards for session logging, schedule monitoring, payment tracking, and revenue insights. Unauthenticated visitors are redirected to the marketing landing experience instead of the dashboard content.

## Page-level behaviour
- Sets the document title and description using the `useDocumentTitle` and `useDocumentMeta` hooks for SEO friendliness.
- Tracks the mounted state to prevent hydration flashes, and listens for Supabase auth events to populate the logged-in user context.
- Blocks rendering behind two loading layers: an initial spinner while auth state is confirmed, and a skeleton dashboard while data queries are in flight.
- Falls back to the `<LandingPage />` component when no authenticated user is present.

## Data loading & state
- Maintains dedicated state slices for today’s scheduled classes, recent tutoring sessions, student directory, unpaid balances, and per-student revenue totals.
- Bundles five async loaders—`fetchTodayData`, `fetchStudents`, `fetchRecentSessions`, `fetchPendingPayments`, and `fetchMonthlyRevenue`—and executes them in parallel through `fetchAllData` once the user session is confirmed.
- Each loader uses the Supabase browser client plus `requireAuthUser` to scope queries to the active tutor.
  - Today’s classes merge `scheduled_classes` rows with same-day `tutoring_sessions` to derive `pending`, `completed`, or `cancelled` statuses.
  - Recent sessions pull the 20 most recent tutoring records together with student names.
  - Pending payments and monthly revenue group unpaid or current-month sessions by student, calculating totals and counts before sorting for display prominence.
- Resets all derived state back to empty collections when the user signs out.

## Session logging workflow
- Exposes a "Log a Session" card with controlled inputs for student selection, date picking (via popover calendar), and duration entry.
- Validates that all fields are populated before proceeding; missing fields trigger a destructive toast.
- On submission, looks up the selected student to capture their hourly rate, converts the provided hours into minutes, and persists a new `tutoring_sessions` row with unpaid status and blank notes.
- Surfaces destructive toasts on Supabase insert failures and success toasts that include the student name on completion.
- Resets the form, rehydrates the default date, and triggers a refresh of the recent sessions feed after a successful insert. A spinner badge replaces the submit label while the mutation is pending.

## Interface composition
- Wraps the layout in `SidebarProvider` / `SidebarInset` and renders `<AppSidebar />` for navigation.
- Shows the `<PageHeader />` with a time-of-day greeting, swapping between sun and moon icons depending on the current hour and the user’s stored full name.
- Renders the following dashboard sections with responsive grid layouts:
  - `<TodaySchedule />` populated by `todayClasses` with a manual refresh callback.
  - `<PendingPayments />` and `<MonthlyRevenue />` cards driven by their respective aggregates.
  - `<RecentActivity />` timeline for the latest tutoring sessions.
- Provides animated skeleton placeholders for every card, list row, and header while `isLoading` is true, giving visual feedback before actual content arrives.

## Error handling & notifications
- Wraps all Supabase interactions in `try/catch` blocks and uses the toast hook to broadcast both destructive and success notifications.
- Logs detailed diagnostic information (including Supabase error metadata) to the console to aid debugging without disrupting the UI.
