# Sign Up (`/auth/sign-up`)

## Overview
The sign-up page onboards new tutors by creating Supabase accounts via email/password or Google OAuth. It collects basic profile information and ensures data consistency before hitting the authentication API.

## Registration workflow
- Maintains controlled inputs for full name, email, password, and repeated password, requiring all fields before submission.
- Validates locally that the name is not blank and that both password fields match; failing checks surface descriptive error text without contacting Supabase.
- Calls `supabase.auth.signUp` with the collected credentials, attaching default profile metadata (`full_name`, `age`, `country`) and a redirect URL for email confirmation.
- On success, navigates to `/auth/sign-up-success` so the user can follow the verification instructions.

## Google onboarding
- Provides a Google OAuth button connected to `supabase.auth.signInWithOAuth`, mirroring the redirect behaviour of the email sign-up flow.
- Disables the button and displays "Redirecting..." while Supabase processes the OAuth request.

## UX considerations
- Uses the shared authentication card layout with Derno branding, field labels, and helper text.
- Keeps error copy inline with the form for quick correction and prevents duplicate submissions via the `isLoading` guard.
- Adds a footer link directing already-registered users to the login page.
