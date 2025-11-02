# Demo Sessions (`/demo/sessions`)

## Overview
Demonstrates the session history experience using mock data, allowing visitors to explore filtering and payment toggles without persisting changes to Supabase.

## Data & filtering
- Mirrors the demo context session list into local state for rendering.
- Recalculates the filtered list whenever the search query or mock data set changes, matching on student name or subject.

## Metrics
- Calculates totals for completed sessions, paid sessions, cumulative revenue (paid only), and pending amount (unpaid only) and presents them in summary cards.

## Table interactions
- Renders the complete session table with student, subject, date, duration, amount, payment status, and action controls.
- Provides a “Mark Paid/Mark Unpaid” toggle button that updates the demo context via `updateSession` and fires toasts to acknowledge the change.
- Displays a badge for payment status, including styling for cancelled sessions.

## Notifications & layout
- Keeps layout consistency through `<DemoSidebar />` and `<PageHeader />`.
- Includes `<Toaster />` to show toast feedback from payment toggles and validation messages.
