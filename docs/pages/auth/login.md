# Login (`/auth/login`)

## Overview
The login page authenticates returning tutors through Supabase email/password credentials or Google OAuth. It provides inline validation, branded visuals, and status messaging to guide the sign-in flow.

## Authentication flows
- Captures email and password inputs with controlled state and requires both fields before submission.
- Calls `supabase.auth.signInWithPassword`, passing a redirect URL so Supabase can route back to the dashboard after verification.
- Routes the user to the dashboard (`/`) and triggers a client-side refresh when credentials succeed.
- Offers a "Continue with Google" button wired to `supabase.auth.signInWithOAuth` for social login, sharing the same redirect target as the email flow.

## Error & loading handling
- Tracks loading states separately for password login and Google OAuth, disabling the relevant buttons while a request is underway.
- Displays descriptive error text beneath the form whenever Supabase returns an authentication error.
- Shows a Google logo SVG while the OAuth button is idle and swaps labels to “Redirecting…” during the provider hand-off.

## Layout & UX
- Wraps the content in a centered card featuring the Derno logo, hero message, and labelled form inputs.
- Includes a footer link that navigates to the sign-up page for new users.
