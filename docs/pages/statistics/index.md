# Performance Analytics (`/statistics`)

## Overview
The statistics page aggregates Supabase tutoring data into actionable dashboards. It pairs headline KPIs with interactive charts that can be filtered by time period per widget.

## Core state & periods
- Tracks overall stats (revenue, sessions, hours, active students, unpaid amount, average rate) alongside specialised datasets for revenue, student performance, payments, time analysis, cancellations, and session durations.
- Maintains an independent `ChartPeriod` state for each visualisation, enabling mixed time windows across widgets.

## Data fetchers
- `fetchOverallStats` summarises all sessions and active students to compute aggregate KPIs plus unpaid balance and average rate.
- `fetchRevenueData` groups tutoring sessions by month within the chosen period to chart revenue and session counts.
- `fetchStudentStats` joins students with their sessions, filters by date range, and derives totals, hours, average durations, and recurrence frequency per student.
- `fetchPaymentData` partitions sessions into paid/unpaid buckets, calculates amounts, and builds a per-student unpaid leaderboard.
- `fetchWeeklyData` produces a day-by-day series (up to 31 days) of hours taught and session counts for the selected period.
- `fetchCancellationData` analyses cancellation rates overall, by canceller, and by student.
- `fetchSessionDurationData` collects non-cancelled session durations for histogram-style display.
- `fetchStudents` seeds the student list used across export and per-student analytics.

## Interactions
- The page header links to the Monthly Earnings view, exposes the export dialog, and presents the KPI cards summarising the tutor’s business health.
- Each chart component receives its dataset, the active period, and a callback that updates the period state and refetches fresh data on user selection.

## Error handling
- Displays destructive toasts when top-level fetches fail and logs detailed errors for debugging, while secondary fetchers log issues to the console.
