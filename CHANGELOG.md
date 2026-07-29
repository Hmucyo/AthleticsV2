# Changelog

## 2026-07-18

- Replaced mock in-memory auth with Supabase Auth (email/password) and persisted sessions.
- Added Supabase Postgres tables for profiles, athletes, and journal entries with Row Level Security.
- Wired login, athlete signup, coach provisioning, athlete profiles, and journal CRUD to the database.
- Added setup/seed scripts for schema application and the original demo users (admin, coach, athlete).
- Switched Tailwind from the hanging Vite plugin to PostCSS so local `dev`/`build` can start.
- Wired athlete Profile to the signed-in user with persistent saves; improved signup/confirm and role-free login.
- Journal media now uploads to Supabase Storage; mock programs/messages/dashboard clearly labeled as demo.
- Added Vercel config for Vite production deploys (SPA rewrites to `dist`).
- Replaced AFSP logo asset and added a mobile hamburger sidebar with responsive admin grids.
- Added admin exercise Assign flow for programs or athletes (with day picker), program exercise lists, and an athlete training calendar for daily assigned work.
- Expanded athlete Training Calendar (week strip, upcoming days, completion tracking) and wired Programs to live admin program/exercise lists.
- Athlete week strip is now range-selectable (week/month/3/6 months) with horizontal scroll; duplicate month calendar removed.
- Removed the athlete Upcoming panel from the training dashboard.
- Simplified athlete header to Training/Progress tabs; moved Today/Next into the week strip controls.
- Week range button shows month + week-start day when viewing a week other than the current one.
- Upgraded messaging to a shared role-aware store (accept/decline, New Message, coach inbox, mobile list/detail) while keeping the current chat UI goals.
- Fixed group chat sync so messages persist immediately and appear for all roles viewing the same Global/Program thread.
- Added **Requires Weights** on exercise create/edit; athletes can optionally log lbs/kg before marking weighted work complete (suggested, not required).
- Tightened phone/laptop layout padding and grids across coach, programs, journal, and profile views.

## 2026-06-12

- Added a role-based authentication entry flow with athlete self-signup and role-specific sign-in.
- Replaced manual role switching in the sidebar with authenticated session details and logout behavior.
- Added admin controls to provision coach logins and create athlete profiles linked to existing athlete accounts.
- Added dedicated admin sidebar modules for Coaches, Athletes, Exercises, and Programs.
- Moved `Create Coach Login` and `Create Athlete Profile` actions into Coaches and Athletes modules respectively.
- Added exercise and program listing modules with add-new actions for both libraries.
- Added the official AFSP logo asset to the app shell and login page branding.
- Updated the browser tab branding with the AFSP logo favicon and official app title.
- Added admin messaging module with user search, direct/group conversations, pending request acceptance, and global group lock controls.
- Added admin exercise workflow with required name/description/media input, clickable exercise cards, and image/video demonstration detail view with optional external video link.
- Added athlete journal module supporting text, voice uploads, image/video uploads, and mixed-media journal entries.
- Added admin athlete search and privileged journal review panel so admins can select an athlete and view all of that athlete's journal entries.
- Added edit/delete actions for athlete journal entries and admin exercise items.
- Added file type and file size validation messaging for journal and exercise uploads.
- Condensed the Admin Exercise form into an expandable `Add Exercise` action with create/edit mode support.
