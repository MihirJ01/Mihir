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

## Authentication (Email + Google)

This project now uses Supabase Auth for **student** and **admin** authentication:

- Student login only via admin-provided `username` + `password` from `students` table.
- Admin email/password sign-in and registration.
- Admin Google OAuth sign-in/registration.
- Role-aware admin profile storage in `public.user_profiles`.

### Required Supabase setup

1. In Supabase Dashboard → **Authentication → Providers → Google**, enable Google and configure:
   - Client ID
   - Client Secret
2. Add redirect URL:
   - `https://<your-domain>/app`
   - `http://localhost:4173/app` (for local testing)
3. Run Supabase migration to create `public.user_profiles` and RLS policies.

### How role assignment works

- Students cannot self-register; they must use credentials created by admins during admission.
- Admin registration/sign-in can use email/password or Google OAuth.
- Admin profile data is saved to `public.user_profiles`.
