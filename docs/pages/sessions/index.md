# Session History (`/sessions`)

## Overview
The sessions page surfaces the tutor’s historical lessons, combining analytics, rich filtering, inline editing, and export tooling.

## Data lifecycle
- Fetches all `tutoring_sessions` for the logged-in tutor on mount, joining each row with the student name.
- Stores the payload in `sessions` and applies search plus payment-state filters to produce `filteredSessions` for rendering.
- Recomputes the filtered list whenever the search query, payment filter, or source data change.

## Metrics & analytics
- Calculates totals for session count (with cancelled breakdown), revenue earned, unpaid balance (excluding cancelled sessions), and total teaching hours.
- Displays each metric inside a summary card at the top of the page.

## Filtering & table management
- Provides a select control to toggle among All/Paid/Unpaid sessions, automatically excluding cancelled lessons when a payment filter is active.
- Includes a search input that matches on student name, notes, or date substrings.
- Renders a loading placeholder until data arrives, then delegates row rendering and actions to `<SessionsTable />`.

## Session creation & editing
- Opens `<SessionForm />` for both new entries and edits via `showForm` and `editingSession` state.
- Refreshes the Supabase data after form submissions and resets editing state when the dialog closes.

## Exporting
- Injects `<ExportDialog />` into the header actions, deriving a unique student list from the current session data to power CSV exports.

## Error handling
- Surfaces destructive toasts if Supabase queries fail and keeps the console logging for diagnostics.
