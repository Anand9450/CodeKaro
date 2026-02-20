# Vercel Deployment Instructions

## 1. Environment Variables (CRITICAL)

For the application to work on Vercel, you **MUST** add the following Environment Variables in your Vercel Project Settings.

1.  Go to your Vercel Dashboard -> Select Project -> **Settings** -> **Environment Variables**.
2.  Add the following keys (copy values from your local `apps/backend/.env` file):

    *   `SUPABASE_URL`
    *   `SUPABASE_ANON_KEY`
    *   `SUPABASE_SERVICE_ROLE_KEY`
    *   `JWT_SECRET` (Ensure this is set to a secure random string)

    *Note: You do not need `PORT` or `MONGO_URI`.*

## 2. Deploying Changes

Since you are using Git, simply push the latest changes to your repository to trigger a new deployment.

```bash
git push origin main
```

## 3. Database Verification

The database has already been seeded with the "Problem of the Day" and popular problems.
- **Problem of the Day**: "Special Binary String" (or similar daily problem).
- **Practice Problems**: 20+ Data Structure & Algorithm problems.

## 4. Frontend Configuration

The frontend is configured to use `/api` as the backend URL via `vercel.json` rewrites.
- Ensure `VITE_API_URL` is meant to be empty or `/api` in your frontend code (which it is by default fallback).
- You typically do **not** need to set `VITE_API_URL` in Vercel Env Vars if using the Monorepo structure defined in `vercel.json`.

## 5. Troubleshooting Deployment

If deployment fails:
1.  Check **Vercel Logs** (Functions tab) for backend errors.
2.  If you see "Supabase not configured", double-check the Environment Variables in Vercel.
3.  If the frontend shows "Loading...", check the Network tab in Browser DevTools. A 500 error on `/api/problems/daily` usually indicates missing server-side Env Vars.
