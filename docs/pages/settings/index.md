# Account Settings (`/settings`)

## Overview
The settings page lets tutors manage profile metadata stored in Supabase Auth and the companion `profiles` table while surfacing read-only account details.

## Data loading
- Retrieves the current Supabase user on mount, seeding local state for `fullName` and `email` and toggling a skeleton UI until the call resolves.

## Profile updates
- Submits form changes through `supabase.auth.updateUser`, persisting the trimmed full name alongside default metadata values.
- Upserts the same data into the `profiles` table (with deterministic `id`, `email`, timestamps) to keep the profile row in sync.
- Guards against submissions when the user is missing or the name input is blank, raising a descriptive toast error in each case.

## Feedback & state
- Shows a destructive toast when any Supabase call fails and a success toast after a profile update completes.
- Disables the submit button while an update is in progress to prevent duplicate requests.

## Account summary
- Renders a second card that displays the user ID (truncated), account creation date, and last sign-in timestamp derived from the Supabase user object.
