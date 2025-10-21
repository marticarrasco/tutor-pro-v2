# Derno Product Overview

## Product mission
Derno is a tutor-facing operations hub that consolidates scheduling, student management, payment tracking, analytics, and personal account settings into a single web experience. The application is built with Next.js and client-side React components, styled with the shared UI system in `components/ui`, and persists data in Supabase (PostgreSQL) with row-level security so each tutor only sees their own records.

## Core application surfaces

### Landing and onboarding
- The marketing-style landing experience (`components/landing/landing-page.tsx`) introduces the product, highlights benefits, and funnels visitors to the login or sign-up flows with clear calls to action and social proof statistics.【F:components/landing/landing-page.tsx†L1-L150】
- Authentication is handled through Supabase email/password flows with dedicated pages for login, sign-up, and post-registration confirmation messaging, including validation and redirect handling.【F:app/auth/login/page.tsx†L1-L85】【F:app/auth/sign-up/page.tsx†L1-L101】【F:app/auth/sign-up-success/page.tsx†L1-L33】
- Authenticated routing utilities (`createClient`, `requireAuthUser`) guard every data-fetching action, ensuring that all queries include the current user’s ID before touching Supabase tables.【F:app/page.tsx†L66-L157】【F:components/sessions/session-form.tsx†L62-L86】

### Global shell and navigation
- The `AppSidebar` component renders persistent navigation for Home, Students, Sessions, Schedule, and Statistics, along with a footer section that exposes theme switching and account controls (profile, logout).【F:components/app-sidebar.tsx†L1-L140】
- Shared layout wrappers (`SidebarProvider`, `SidebarInset`) are used across every page to keep content aligned within the shell, while `AppSidebar` reacts to Supabase auth events to show the current user or login CTA.

### Today dashboard (home page)
- **Session logging:** A “Log a Session” card lets tutors choose a student, pick a date via the popover calendar, enter fractional hours, and submit to create a `tutoring_sessions` record with validation, Supabase insertion, toasts, and automatic refresh of the dashboard widgets.【F:app/page.tsx†L180-L279】
- **Today’s schedule:** The `TodaySchedule` component reconciles recurring `scheduled_classes` with any logged sessions for the current day, surfaces status (pending/completed/cancelled), allows logging a session directly, bulk-marking outstanding payments, and launching a cancellation dialog that records zero-value cancelled sessions with attribution and notes.【F:app/page.tsx†L72-L156】【F:components/today/today-schedule.tsx†L1-L196】【F:components/today/cancel-session-dialog.tsx†L1-L87】
- **Pending payments:** Tutors see aggregated unpaid balances per student with quick actions to inspect outstanding sessions or mark all as paid, backed by filtered Supabase updates.【F:app/page.tsx†L320-L374】【F:components/today/pending-payments.tsx†L1-L167】
- **Monthly revenue:** Current-month revenue is grouped by student and ordered by earnings, giving quick insight into top clients.【F:app/page.tsx†L374-L414】
- **Recent activity:** The bottom panel lists the five most recent sessions, including payment state, cancellation flags, and notes for rapid context.【F:app/page.tsx†L256-L318】

### Students workspace
- Tutors can browse, search, and filter students, with key metrics (total, active, inactive counts, average rate) calculated client-side.【F:app/students/page.tsx†L1-L132】
- CRUD operations are handled through the `StudentForm` dialog, which supports create and update with Supabase persistence, user scoping, and toggling an `is_active` flag while capturing email/phone/hourly rate data.【F:components/students/student-form.tsx†L1-L153】
- Deletion is confirmed through an alert dialog, removing student records and cascading associated sessions/classes.【F:components/students/students-table.tsx†L1-L130】

### Sessions log
- A grid of KPIs (session count, revenue, unpaid amount, teaching hours) summarizes overall performance, while filters support searching by student/date/notes and isolating paid vs. unpaid sessions.【F:app/sessions/page.tsx†L1-L186】
- The `SessionsTable` provides inline actions to toggle payment status, edit entries, and delete with confirmation; cancelled sessions are clearly badged and excluded from payment toggles.【F:components/sessions/sessions-table.tsx†L1-L206】
- The `SessionForm` dialog supports both creating and editing sessions, including calendar selection, duration adjustments in quarter-hour increments, automatic total calculation, notes, and payment toggles. Unique-session-per-day enforcement is surfaced via Supabase error handling.【F:components/sessions/session-form.tsx†L1-L228】
- An `ExportDialog` allows tutors to pull CSV reports or generate printable invoices over a chosen date range, with optional student filters and paid/unpaid segmentation.【F:components/export/export-dialog.tsx†L1-L215】【F:lib/export-utils.tsx†L1-L207】

### Recurring schedule management
- The schedule page displays total/active classes, weekly teaching hours, and distinct active students before presenting both calendar and list views of weekly recurring classes.【F:app/schedule/page.tsx†L1-L176】【F:app/schedule/page.tsx†L176-L264】
- `WeeklyCalendar` renders each weekday column with class tiles that expose edit/delete actions, highlighting inactive entries; `ScheduleTable` offers sortable rows with activation toggles and destructive actions gated by confirmations.【F:components/schedule/weekly-calendar.tsx†L1-L87】【F:components/schedule/schedule-table.tsx†L1-L205】
- `ScheduleForm` lets tutors assign students to days, pick start times, set durations (auto-converted to minutes), and toggle activity state, reusing the active student list pulled from Supabase.【F:components/schedule/schedule-form.tsx†L1-L206】

### Analytics suite
- The statistics dashboard aggregates overall metrics (revenue, sessions, hours, active students, average rate, unpaid amount) and orchestrates chart data loads with configurable date ranges per chart.【F:app/statistics/page.tsx†L1-L196】
- `RevenueChart` plots monthly revenue, supports period selection, and opens drill-down dialogs with student and weekly breakdowns for any bar clicked.【F:components/statistics/revenue-chart.tsx†L1-L150】
- `StudentPerformance` lists per-student revenue, session count, hours, average session length, frequency, and renders a vertical bar chart of lifetime value with active/inactive badges.【F:components/statistics/student-performance.tsx†L1-L107】
- `PaymentOverview` visualizes paid vs. unpaid balances and outstanding debt by student via pie and horizontal bar charts.【F:components/statistics/payment-overview.tsx†L1-L117】
- `TimeAnalysis` charts hours taught per weekday and summarizes total, average, and peak teaching time.【F:components/statistics/time-analysis.tsx†L1-L68】
- `CancellationAnalysis` dissects who cancels sessions and per-student cancellation rates using pie and bar charts.【F:components/statistics/cancellation-analysis.tsx†L1-L111】
- `SessionDurationChart` builds a distribution histogram and summary stats (average, median, max) for lesson length.【F:components/statistics/session-duration-chart.tsx†L1-L111】

### Settings and utilities
- The settings page lets tutors update their full name metadata, view immutable email/account identifiers, and review account creation/sign-in timestamps with skeleton loading states.【F:app/settings/page.tsx†L1-L108】
- Supporting/testing utilities include a calendar playground and button style test pages to validate UI components without touching production data.【F:app/test-calendar/page.tsx†L1-L96】【F:app/debug-button/page.tsx†L1-L48】

## Data model and persistence
Supabase (PostgreSQL) stores multi-tenant data with row-level security to isolate tutors.

### `students`
- Columns: `id` (UUID PK), `user_id` (FK to `auth.users`), `name`, `email`, `phone`, `hourly_rate`, `is_active`, `created_at`, `updated_at`. A composite unique constraint on `(id, user_id)` prevents cross-tenant collisions.【F:scripts/001_create_tables.sql†L1-L15】
- Indexes speed lookups by `user_id` and `is_active` while policies restrict CRUD access to matching `user_id`.【F:scripts/001_create_tables.sql†L45-L64】

### `tutoring_sessions`
- Columns: `id`, `user_id`, `student_id`, `date`, `duration_minutes`, `hourly_rate`, computed `total_amount` (zeroed when `is_cancelled`), `is_paid`, `notes`, `is_cancelled`, `cancelled_by`, `cancellation_reason`, timestamp metadata, and a unique `(student_id, date, user_id)` constraint to avoid duplicate daily entries per tutor.【F:scripts/001_create_tables.sql†L15-L35】
- Foreign key `tutoring_sessions_student_fk` enforces membership within the tutor’s roster. Indexes support filtering by user/date, student/date, and payment status.【F:scripts/001_create_tables.sql†L15-L44】

### `scheduled_classes`
- Columns: `id`, `user_id`, `student_id`, `day_of_week` (0–6), `start_time`, `duration_minutes`, `is_active`, timestamps. A composite foreign key ties each class to the tutor’s student record.【F:scripts/001_create_tables.sql†L35-L44】
- Indices facilitate queries by tutor/day and student, and RLS mirrors the students table policies.【F:scripts/001_create_tables.sql†L45-L74】

### Security and tenancy
- Row-level security is enabled on every table with policies that only allow CRUD operations when `auth.uid() = user_id`, ensuring tutors can operate exclusively on their own data.【F:scripts/001_create_tables.sql†L45-L74】
- Additional migration scripts add `user_id` scoping, clean up foreign keys, and keep indexes aligned with per-user queries.【F:scripts/006_add_user_scoping.sql†L1-L61】【F:scripts/007_fix_duplicate_foreign_keys.sql†L1-L12】

### Seed data
- `scripts/002_seed_sample_data.sql` populates demo records for the earliest Supabase user, creating students, scheduled classes across weekdays, and historical sessions with varied payment statuses and notes for quick onboarding or demos.【F:scripts/002_seed_sample_data.sql†L1-L74】

## Extensibility notes
- Export utilities centralize CSV generation, invoice markup, and Supabase export filters for reuse across modules.【F:lib/export-utils.tsx†L1-L207】
- Shared types in `types/statistics.ts` define the analytics shapes consumed across charts, keeping client computations consistent.【F:types/statistics.ts†L1-L36】
- UI primitives (toasts, dialogs, tables, badges) provide consistent feedback loops across modules, while the `ThemeToggle` in the sidebar allows light/dark personalization.
