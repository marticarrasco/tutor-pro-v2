# TutorPro: Grow a thriving tutoring business

## Why tutors choose TutorPro
- **Stay booked and organized.** Recurring schedules, real-time daily agendas, and instant session logging keep every lesson accounted for.【F:app/page.tsx†L180-L279】【F:components/schedule/weekly-calendar.tsx†L1-L87】
- **Get paid on time.** Live pending-balance dashboards, one-click "Pay All" actions, and printable invoices make collections effortless.【F:components/today/pending-payments.tsx†L1-L167】【F:components/export/export-dialog.tsx†L1-L215】
- **See the full picture.** Beautiful analytics expose revenue trends, student lifetime value, cancellations, and teaching time so you can scale with confidence.【F:components/statistics/revenue-chart.tsx†L1-L150】【F:components/statistics/student-performance.tsx†L1-L107】【F:components/statistics/cancellation-analysis.tsx†L1-L111】

## Signature capabilities
### All-in-one daily cockpit
Your home screen greets you with today’s classes, recent activity, and a lightning-fast log form. Capture a session in seconds, mark a last-minute cancellation with context, or reconcile outstanding payments without ever leaving the dashboard.【F:app/page.tsx†L66-L318】【F:components/today/cancel-session-dialog.tsx†L1-L87】

### Student CRM built for tutors
Maintain rich profiles with rates, contact info, and active status. Segment by engagement, edit or archive in a snap, and always know who’s ready for their next lesson.【F:app/students/page.tsx†L1-L132】【F:components/students/student-form.tsx†L1-L153】

### Effortless scheduling
Design your perfect week with recurring classes, drag-precise times, and hour tracking. Flip between calendar and list views, toggle pauses for vacations, and trust that your live dashboard will always reflect the plan.【F:app/schedule/page.tsx†L1-L264】【F:components/schedule/schedule-form.tsx†L1-L206】

### Revenue intelligence
Dive into month-by-month earnings, spot your most valuable students, analyze outstanding balances, and understand teaching load patterns. Every chart includes intuitive period controls and drill-down insights so you can make data-backed decisions.【F:app/statistics/page.tsx†L1-L196】【F:components/statistics/payment-overview.tsx†L1-L117】【F:components/statistics/time-analysis.tsx†L1-L68】

### Seamless payments & paperwork
Switch sessions between paid/unpaid, download polished CSV reports, or print branded invoices in a couple of clicks. TutorPro turns payment admin into a single workflow you actually enjoy using.【F:components/sessions/sessions-table.tsx†L1-L206】【F:lib/export-utils.tsx†L1-L207】

### Built-in trust & security
Powered by Supabase, every record is securely scoped to your account with enterprise-grade row level security. Automatic audit timestamps, cancellation attribution, and calculated totals keep your books precise without spreadsheets.【F:scripts/001_create_tables.sql†L1-L74】【F:components/sessions/session-form.tsx†L1-L228】

## Smooth onboarding
- Launch from a polished landing page, sign up in moments, and verify through email with guided confirmation messaging.【F:components/landing/landing-page.tsx†L1-L150】【F:app/auth/sign-up/page.tsx†L1-L101】【F:app/auth/sign-up-success/page.tsx†L1-L33】
- Sample data scripts can pre-fill your workspace so you can explore TutorPro’s power immediately in demos or trials.【F:scripts/002_seed_sample_data.sql†L1-L74】

## Ready to grow?
TutorPro replaces scattered calendars, spreadsheets, and manual invoices with a single command center. Log in, light up your dashboard, and give every student the organized, professional experience they deserve.
