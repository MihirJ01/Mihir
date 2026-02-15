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
