# Changelog

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
