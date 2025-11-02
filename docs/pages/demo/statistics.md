# Demo Statistics (`/demo/statistics`)

## Overview
Provides a static analytics showcase driven by the demo context, highlighting how revenue and workload metrics appear once real data is connected.

## Metrics & aggregates
- Calculates total revenue from paid demo sessions, total hours taught (excluding cancellations), average hourly rate (revenue ÷ hours), and total completed sessions.
- Builds per-student summaries detailing sessions, hours, and revenue, sorted by highest earner.
- Breaks down payment status counts and pending totals, plus hours taught by subject area.

## Presentation
- Uses the same KPI card grid, “Revenue by Student” list, payment overview, and subject breakdown cards as the production analytics page so visitors can preview the layout.
- Incorporates `<DemoSidebar />`, `<PageHeader />`, and `<Toaster />` for consistent navigation and notification handling across the demo experience.
