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

This project uses a **single Google login flow** for both admin and students.

- No email/password auth.
- No separate student/admin login panels.
- Admin panel access is controlled only by Google email allowlist.

### Production Supabase setup (for deployed project)

#### 1) Enable Google provider in Supabase
1. Open **Supabase Dashboard → Authentication → Providers → Google**.
2. Enable Google provider.
3. Paste your Google OAuth **Client ID** and **Client Secret**.
4. Save.

#### 2) Configure Google Cloud OAuth correctly
1. Open **Google Cloud Console → APIs & Services → Credentials**.
2. Create (or edit) an **OAuth 2.0 Client ID** (Web application).
3. Add **Authorized redirect URI** exactly as shown in Supabase:
   - `https://<PROJECT-REF>.supabase.co/auth/v1/callback`
4. Add **Authorized JavaScript origin**:
   - `https://<your-production-domain>`
5. Publish OAuth consent screen if required.

#### 3) Configure Supabase URL settings
In **Supabase → Authentication → URL Configuration**:
- **Site URL** = `https://<your-production-domain>`
- **Redirect URLs** include:
  - `https://<your-production-domain>/app`

#### 4) Set production frontend env var (critical)
In your hosting provider (Vercel/Netlify/etc), set:

- `VITE_ADMIN_GOOGLE_EMAILS=mihirj010105@gmail.com,prasad16th@gmail.com`

If multiple admins:

- `VITE_ADMIN_GOOGLE_EMAILS=mihirj010105@gmail.com,prasad16th@gmail.com`

> Admin access works **only** for emails in this variable.

#### 5) Apply database migration in production
Run your Supabase migration so `public.user_profiles` exists with RLS policies.

### Role assignment in production

- If signed-in Google email is in `VITE_ADMIN_GOOGLE_EMAILS` → user becomes **admin** and can access admin panel.
- Else app checks admitted `students` table by `username` matching full Google email or prefix before `@`.
- If no admitted student match exists → login is rejected.

### Example for your account
Set production env for your admins exactly:

- `VITE_ADMIN_GOOGLE_EMAILS=mihirj010105@gmail.com,prasad16th@gmail.com`

Then redeploy the frontend so the new env is used.


### Vercel build error: `mode is not defined` in `LoginPanel.tsx`

If Vercel shows an error pointing to:

```tsx
{mode === "signin" ? "Sign in with Email or Google" : "Register as Student or Admin"}
```

that means Vercel is building an older commit with obsolete login-panel code.

Fix steps:
1. Ensure your deployed branch contains the current Google-only `LoginPanel` (no `mode` variable).
2. In Vercel, redeploy the latest commit (or click **Clear build cache and redeploy**).
3. Confirm project root is `mihir-classes-hub-pro-main (4)` if this monorepo root is connected.
4. Run local verification before pushing: `npm run build`.


### Vercel build error: `Unexpected "{"` in `LoginPanel.tsx`

If Vercel logs show an `import ...` line inside `handleGoogleSignIn` (for example at line 33), your deployed branch contains a corrupted `LoginPanel.tsx` file.

Fix steps:
1. Replace `src/components/LoginPanel.tsx` with a clean file that has all imports only at the top of the file.
2. Verify there are no merge artifacts: `rg -n "^(<<<<<<<|=======|>>>>>>>)" src`.
3. Run local build: `npm run build`.
4. Push the fixed commit and redeploy from that commit.
5. If Vercel still fails, use **Clear build cache and redeploy**.


## Google Sign-In `redirect_uri_mismatch` (Detailed Fix Guide)

If you see this on Google login:

- **Access blocked: This app’s request is invalid**
- **Error 400: redirect_uri_mismatch**

it means the OAuth callback URL configured in **Google Cloud** does not exactly match what **Supabase** is using.

### Why this happens

Google validates the OAuth callback URL with exact-string matching. A small difference breaks login:
- wrong project ref,
- http vs https,
- trailing slash mismatch,
- old domain still configured,
- callback configured as `/app` instead of Supabase callback.

### The 3 URLs you must understand

1. **Google Authorized redirect URI** (in Google Cloud)
   - Must be Supabase callback:
   - `https://aorpjttyeulrzitvpjkr.supabase.co/auth/v1/callback`
2. **Supabase Redirect URL** (in Supabase URL Configuration)
   - Your frontend route after auth, for example:
   - `https://<your-domain>/app`
3. **Frontend redirectTo** (from app code)
   - Should also be your app route, for example:
   - `https://<your-domain>/app`

> Google checks #1. Supabase and your app use #2/#3.

### Exact production checklist (do in this order)

#### Step 1: Google Cloud Console
Go to **Google Cloud → APIs & Services → Credentials → OAuth 2.0 Client ID (Web app)** and configure:

- **Authorized JavaScript origins**:
  - `https://<your-domain>`
- **Authorized redirect URIs**:
  - `https://aorpjttyeulrzitvpjkr.supabase.co/auth/v1/callback`

Do **not** put `/app` here.

#### Step 2: Supabase Auth Provider
Go to **Supabase → Authentication → Providers → Google**:
- Enable Google provider.
- Paste the same Google OAuth Client ID and Client Secret.
- Save.

#### Step 3: Supabase URL Configuration
Go to **Supabase → Authentication → URL Configuration**:
- **Site URL**: `https://<your-domain>`
- **Redirect URLs** include:
  - `https://<your-domain>/app`

#### Step 4: Frontend environment variables (Vercel)
In Vercel project settings, set:

```env
VITE_ADMIN_GOOGLE_EMAILS=mihirj010105@gmail.com,prasad16th@gmail.com
VITE_AUTH_REDIRECT_URL=https://<your-domain>/app
```

Then redeploy.

#### Step 5: Clear stale deployment/cache
- Redeploy latest commit.
- If still failing, run **Clear build cache and redeploy** in Vercel.
- Open login in an incognito window to avoid stale auth cookies.

### Local development settings (optional)
If you test locally too, add both local and production entries:

- **Google Authorized JavaScript origin**:
  - `http://localhost:4173`
- **Supabase Redirect URLs**:
  - `http://localhost:4173/app`

> Google redirect URI remains Supabase callback (`.../auth/v1/callback`), not localhost callback.

### Fast diagnosis table

- **Message: `redirect_uri_mismatch` immediately on Google page**
  - Root cause: Google Cloud Authorized redirect URI is wrong.
- **Google login succeeds, then app says unauthorized**
  - Root cause: account not in `VITE_ADMIN_GOOGLE_EMAILS` and no admitted student match.
- **Works locally, fails on deployed domain**
  - Root cause: missing production domain in origins/redirects or missing `VITE_AUTH_REDIRECT_URL`.

### One-minute verification commands

```bash
# Ensure clean build locally before deploy
npm run build

# Optional: verify no merge conflict artifacts remain
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
