# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/2c8fe269-548f-4dc8-b7fb-8e5b38e9b423

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/2c8fe269-548f-4dc8-b7fb-8e5b38e9b423) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/2c8fe269-548f-4dc8-b7fb-8e5b38e9b423) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Authentication (Google Only)

This app supports only Google sign-in for both admin and students.

- No email/password login.
- No student self-registration.
- Admin access is granted only when the Google email is in `VITE_ADMIN_GOOGLE_EMAILS`.

### How login works in this project

1. User clicks **Continue with Google** on `/app`.
2. App calls Supabase OAuth with `redirectTo`:
   - `VITE_AUTH_REDIRECT_URL` if set
   - otherwise fallback: `${window.location.origin}/app`
3. After successful OAuth callback, app resolves role:
   - email in admin allowlist => `admin`
   - else must match an admitted record in `students` table => `user`
4. App upserts/refreshes `user_profiles` for session continuity.

---

## `Error 400: redirect_uri_mismatch` (Access blocked) — Full Fix

If Google shows:

- **Access blocked: This app’s request is invalid**
- **Error 400: redirect_uri_mismatch**

then your OAuth redirect URL configuration is mismatched between Google Cloud and Supabase.

### Important: 3 different URLs involved

1. **Google Authorized redirect URI** (Google Cloud)
   - Must be Supabase callback URL.
2. **Supabase Redirect URLs** (Supabase Auth URL config)
   - Must include your app route (`/app`).
3. **Frontend redirectTo URL** (this app)
   - Should point to deployed `/app` route.

Google validates only #1 exactly.

---

## Production setup checklist (exact order)

### 1) Google Cloud OAuth client
Open: **Google Cloud → APIs & Services → Credentials → OAuth 2.0 Client ID (Web application)**

Set:
- **Authorized JavaScript origins**
  - `https://<your-domain>`
- **Authorized redirect URIs**
  - `https://aorpjttyeulrzitvpjkr.supabase.co/auth/v1/callback`

✅ Do not use `/app` in Google redirect URI.

### 2) Supabase Google provider
Open: **Supabase → Authentication → Providers → Google**

- Enable provider
- Paste Google OAuth client ID/secret
- Save

### 3) Supabase URL configuration
Open: **Supabase → Authentication → URL Configuration**

- **Site URL**: `https://<your-domain>`
- **Redirect URLs** must include:
  - `https://<your-domain>/app`

### 4) Frontend env vars (Vercel/Netlify)
Set these in hosting environment:

```env
VITE_ADMIN_GOOGLE_EMAILS=mihirj010105@gmail.com,prasad16th@gmail.com
VITE_AUTH_REDIRECT_URL=https://<your-domain>/app
```

Redeploy after saving env vars.

### 5) Database migration
Run migration so this table exists in production:
- `public.user_profiles`

Migration file in repo:
- `supabase/migrations/20260214000100_add_user_profiles_for_auth.sql`

### 6) Clear stale deploy/session state
- Redeploy latest commit
- If needed: **Clear build cache and redeploy**
- Test in incognito

---

## Why you are seeing this now

If your Google page fails before returning to your app, it means callback mismatch (Google-side config) and not a frontend React bug.

Common mistakes:
- Wrong Supabase project ref in Google callback URL
- Trailing slash mismatch
- Old test domain in Google OAuth client
- Missing production `/app` in Supabase Redirect URLs
- Missing `VITE_AUTH_REDIRECT_URL` in deployed environment

---

## Quick diagnosis matrix

- Fails on Google page with `redirect_uri_mismatch`
  - Fix Google Authorized redirect URI (must be Supabase callback)
- Google login succeeds but app denies admin
  - Check `VITE_ADMIN_GOOGLE_EMAILS`
- Works local but fails production
  - Check production origin + redirect + env vars

---

## Build stability guard added

To prevent broken `LoginPanel.tsx` deployments (like accidental imports inserted inside a function body), build now runs a prebuild integrity script:

- `scripts/verify-loginpanel-integrity.mjs`

This fails early if:
- imports are found outside the top import block
- merge conflict markers are present

---

## Useful commands

```bash
# from project directory
npm install
npm run build

# optional check for unresolved merge markers
rg -n "^(<<<<<<<|=======|>>>>>>>)" src README.md supabase
```
## Authentication (Email + Google)

This project now uses Supabase Auth for **student** and **admin** authentication:

- Email/password sign-in and registration.
- Google OAuth sign-in/registration.
- Role-aware profile storage in `public.user_profiles`.

### Required Supabase setup

1. In Supabase Dashboard → **Authentication → Providers → Google**, enable Google and configure:
   - Client ID
   - Client Secret
2. Add redirect URL:
   - `https://<your-domain>/app`
   - `http://localhost:4173/app` (for local testing)
3. Run Supabase migration to create `public.user_profiles` and RLS policies.

### How role assignment works

- In **Register** mode, user chooses role (`admin` or `student`) before account creation.
- For Google OAuth registration, selected role is cached locally and persisted after OAuth callback.
- Role and basic profile data are saved to `public.user_profiles`.
