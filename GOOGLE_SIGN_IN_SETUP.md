# Google Sign-In Setup Guide

To get "Sign in with Google" working 100%, you need to ensure your Supabase project is correctly configured. Even with the code fixes I just applied, the feature will not work without these settings.

## 1. Configure Google Cloud Platform (GCP)

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project or select your existing one.
3.  Navigate to **APIs & Services > OAuth consent screen**.
    *   Select **External** and click **Create**.
    *   Fill in the required fields (App name, User support email, Developer contact information).
    *   Click **Save and Continue**.
4.  Navigate to **APIs & Services > Credentials**.
    *   Click **Create Credentials** and select **OAuth client ID**.
    *   Application type: **Web application**.
    *   Name: `Supabase Auth` (or similar).
    *   **Authorized JavaScript origins**:
        *   Add your local development URL: `http://localhost:5173`
        *   Add your production URL (if you have one).
    *   **Authorized redirect URIs**:
        *   You need to get this from your Supabase dashboard (see next section). It usually looks like: `https://<your-project-ref>.supabase.co/auth/v1/callback`
    *   Click **Create**.
    *   **Copy the Client ID and Client Secret**. You will need these for Supabase.

## 2. Configure Supabase Authentication

1.  Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Select your project.
3.  Navigate to **Authentication > Providers**.
4.  Find **Google** and click to expand/enable it.
5.  **Toggle "Enable Sign in with Google" to ON.**
6.  Paste the **Client ID** and **Client Secret** you copied from Google Cloud.
7.  **Copy the "Callback URL (for OAuth)"** shown here.
    *   Go back to your Google Cloud Console > Credentials > Your OAuth Client.
    *   Paste this URL into the **Authorized redirect URIs** field if you haven't already.
8.  Click **Save** in Supabase.

## 3. Configure Redirect URLs in Supabase

1.  In your Supabase Dashboard, go to **Authentication > URL Configuration**.
2.  **Site URL**: Set this to your production URL (or `http://localhost:5173` for development).
3.  **Redirect URLs**:
    *   Add `http://localhost:5173/*`
    *   Add `http://localhost:5173/select-user-type`
    *   **CRITICAL**: Add your Vercel URL: `https://roster-up.vercel.app/*`
    *   **CRITICAL**: Add `https://roster-up.vercel.app/select-user-type`
4.  Click **Save**.

## 4. Verify Environment Variables in Vercel

1.  Go to your Vercel Project Settings > Environment Variables.
2.  Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set correctly.
3.  **Redeploy** your application if you change these variables.

## 5. Verify the Fix

1.  **Deploy the latest code changes to Vercel.**
2.  Go to the Login page on Vercel.
3.  Click "Sign in with Google".
4.  You should be redirected to Google to sign in.
5.  After signing in, you should be redirected back to `/select-user-type`.
6.  **Crucially**, the page should now wait for your session to load instead of immediately kicking you back to the login page.

> [!IMPORTANT]
> If you are still experiencing issues, check the browser console for any error messages from Supabase or Google.

## 6. Customize "Choose an account to continue to..." Text

If your Google Sign-In screen says "Choose an account to continue to **hnaqmskjbsrltdcvinai.supabase.co**" and you want it to say **RosterUp**:

1.  Go to [Google Cloud Console](https://console.cloud.google.com/).
2.  Navigate to **APIs & Services > OAuth consent screen**.
3.  Click **Edit App**.
4.  **App name**: Change this to `RosterUp`.
5.  **User support email**: Select your email.
6.  **App logo**: (Optional) Upload your logo to make it look professional.
7.  **Application home page**: Enter `https://roster-up.vercel.app`.
8.  **Authorized domains**: Add `roster-up.vercel.app`.
9.  Click **Save and Continue**.

**Note:** The "continue to..." text usually reflects the **App Name**. However, Google might still show the domain URL in small text or if the app is unverified. To completely remove the Supabase URL from the address bar during the redirect loop, you would need to set up a **Custom Domain** in Supabase (e.g., `auth.rosterup.com`), which is a paid add-on. But changing the **App Name** in Google Cloud is free and fixes the main text.
