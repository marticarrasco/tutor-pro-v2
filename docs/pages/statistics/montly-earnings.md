# Monthly Earnings (`/statistics/montly-earnings`)

## Overview
The monthly earnings view visualises tutoring activity for a single calendar month, mapping each session onto a calendar grid and summarising revenue totals by week and by student.

## Data loading
- Tracks the currently selected month and fetches all tutoring sessions within that month for the authenticated tutor.
- Joins each session with its student record, filtering out cancellations and grouping sessions by ISO date for calendar rendering.
- Assigns deterministic colours to students so entries remain visually consistent across the grid.

## Calendar construction
- Builds a Monday-first calendar matrix via `useMemo`, inserting placeholder cells for leading/trailing days outside the current month.
- For each day cell, lists the sessions delivered along with duration (in hours) and student name, styled using the allocated colour class.

## Summaries & insights
- Computes weekly earnings totals by summing day-level revenue, exposing the breakdown in a side panel.
- Aggregates revenue per student and filters out zero totals to highlight active earners.
- Displays the total monthly earnings and offers previous/next month buttons to navigate the dataset.

## Loading state
- Shows a skeleton layout with a descriptive message until session data for the current month has been retrieved.
