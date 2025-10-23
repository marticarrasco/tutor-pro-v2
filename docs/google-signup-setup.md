# Google Sign Up Configuration Guide

This guide walks through everything you need to configure Google OAuth so that users can sign up (and subsequently sign in) to Derno via their Google account.

## Prerequisites

- Access to the [Google Cloud Console](https://console.cloud.google.com/)
- Access to the [Supabase dashboard](https://supabase.com/)
- The ability to update environment variables for the deployed environments (local `.env` files, hosting platform secrets, etc.)

## 1. Create OAuth credentials in Google Cloud

1. Open the Google Cloud Console and select the project that should own the OAuth credentials (or create a new project).
2. Navigate to **APIs & Services → OAuth consent screen** and configure the consent screen:
   - Choose **External** for user type (unless the app is only used within your organization).
   - Provide the required application information (name, support email, developer contact information).
   - Add any authorized domains that you will use (e.g. `localhost`, your staging domain, production domain).
   - Save the consent screen configuration.
3. Still under **APIs & Services**, go to **Credentials** → **Create Credentials** → **OAuth client ID**.
4. Choose **Web application** as the application type.
5. Set a recognizable **Name** (e.g. `Derno Supabase OAuth`).
6. Under **Authorized JavaScript origins**, add:
   - `http://localhost:3000` (for local development)
   - Any other domains where the application will be hosted (e.g. `https://staging.example.com`, `https://app.example.com`).
7. Under **Authorized redirect URIs**, add the Supabase OAuth callback URL for each environment:
   - `http://localhost:3000/auth/v1/callback`
   - `https://<your-supabase-project-ref>.supabase.co/auth/v1/callback`
   - Add additional callback URLs for each custom domain Supabase is configured to handle.
8. Click **Create** and note the generated **Client ID** and **Client secret**.

## 2. Enable Google as a provider in Supabase

1. Open your project in the Supabase dashboard.
2. Navigate to **Authentication → Providers**.
3. Locate **Google** in the list and click to configure it.
4. Paste the **Client ID** and **Client secret** from the Google Cloud Console.
5. Ensure the provider is marked as **Enabled**.
6. Save the configuration.

## 3. Configure environment variables

Add or update the following variables wherever your application runs:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/
```

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` should already be present if Supabase email/password auth is working.
- `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` is used to tell Supabase where to redirect users after the Google OAuth flow completes. Use the appropriate base URL for each environment (e.g. `https://app.example.com/`).

Update hosting platform secrets (Vercel, Netlify, etc.) to include the same variables for non-local environments.

## 4. Test the Google sign up flow locally

1. Ensure your `.env.local` (or chosen local env file) contains the variables above.
2. Start the development server:

   ```bash
   pnpm dev
   ```

3. Visit `http://localhost:3000/auth/sign-up` and click **Continue with Google**.
4. Complete the Google consent prompt and verify you are redirected back to the app.
5. Confirm that the new Supabase user shows up in the **Authentication → Users** tab.

## 5. Test in staging/production

1. Deploy the updated code and configuration.
2. Visit the hosted sign up page and perform the Google OAuth flow.
3. Confirm the redirect URL matches the expected environment.
4. Validate that the created user has the expected profile information (name and email) inside Supabase.

## 6. Optional: Map Google profile data

If you need to sync profile fields (e.g. avatar, given name) into your application tables, create a Supabase [Auth Hook](https://supabase.com/docs/guides/auth/auth-hooks) or edge function that listens for `user_created` events and stores the additional metadata.

---

Once the steps above are complete, Google sign up will be fully operational for the application.
