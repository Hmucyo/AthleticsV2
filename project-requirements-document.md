# Project Requirements Document

## Overview
AFSP is a sports performance app that connects athletes, coaches, and admins to facilitate program enrollment, exercise tracking, coaching, custom program requests, and secure communication—all in one platform.

## User Journey
- First, the athlete signs up via email and fills in basic info (name, age, biometrics, injury history).
- Then, they browse available programs (filter: type, coach, duration), select a program, choose type (virtual/in-person/hybrid), enrollment duration, and input equipment access.
- After that, they review program details, accept agreement, and complete payment (credit card). Contract is generated and sent to admin for PDF approval/download.
- Upon enrollment, daily exercises populate their dashboard. Athletes can message others; first-time messages require acceptance by the receiver. Athletes may submit custom program requests if no program fits, which go to admin for review.
- Coaches see assigned programs, manage group chats, update exercises, and coordinate sessions (with calendar links). Admins manage contracts, approve custom programs, and moderate messaging groups.
- Completion: Athlete finishes program, receives summary, and can re-enroll or choose new programs.

## Technical Notes (Brief)
React Native frontend, Node.js/Express backend, PostgreSQL DB, Stripe for payments, PDF generation library.

## Change Management
Create CHANGELOG.md in root. All source files need header: // IMPORTANT: Before modifying this file, please update CHANGELOG.md with a summary of your changes.

# AI Tool Instructions

- Always check CHANGELOG.md before making changes.
- Document all changes with date and category (Added, Changed, Fixed, Removed).
- Include the standard header comment in all source files.
- Briefly explain what changed and why in CHANGELOG.md.

---

# Extended PRD

## 1. Problem & Purpose
Athletes, coaches, and admins at AFSP need a unified platform to streamline program selection, enrollment, training delivery, and communication. The app solves the fragmentation of fitness management, enabling efficient digital workflows for all parties.

## 2. User Types
- Admin: Creates/edits programs and exercises, approves custom requests, manages contracts/groups.
- Coach: Runs assigned programs, interacts with athletes, manages group chats, assigns exercises.
- Athlete: Signs up, enrolls in programs, customizes requests, follows exercises, communicates.

## 3. Core User Journeys
1. Athlete Registration & Enrollment:
   1. Athlete signs up, provides profile, biometrics, injury/medical info.
   2. Browses/filter programs, selects, chooses type (virtual/in-person/hybrid), duration.
   3. Inputs equipment access (if virtual/custom), answers health questions.
   4. Accepts agreement, completes payment (monthly, duration selected).
   5. Receives program access, daily exercises populate dashboard.
2. Custom Program Request:
   1. Athlete can't find a suitable program, selects "Customize".
   2. Fills out specific needs/goals, equipment, biometrics.
   3. Submission goes to admin for review and program creation.
3. Communication:
   1. Athlete/coach/admin can search users, send message.
   2. First message to new user requires receiver's acceptance.
   3. Group chats for each program (coach creates), global group (admin controls lock/unlock).
4. Coach Program Management:
   1. Coach views assigned programs, athletes, and exercise lists.
   2. Schedules sessions, adds/assigns exercises, manages calendar (with virtual session links).

## 4. Key Features
- Athlete registration and profile (MVP)
- Program marketplace and filtering (MVP)
- Program enrollment with contract signing and payment (MVP)
- Daily exercise dashboard for athletes (MVP)
- Custom program request flow (MVP)
- In-app messaging with acceptance flow (MVP)
- Group chat per program, global group (MVP)
- PDF contract generation & download (MVP)
- Coach calendar and session management (MVP)
- Coach ability to add/assign exercises (MVP)
- Admin approval for custom programs (MVP)
- Coach metrics dashboard (nice-to-have)

## 5. Data Model
- Users (Athletes, Coaches, Admins)
- Programs (has many Exercises, assigned to one Coach, many Athletes enroll)
- Exercises (belongs to Programs, can be assigned to individuals)
- Contracts (one per enrollment, stored as PDF)
- Messages (sender, receiver, status: pending/accepted)
- GroupChats (per program, global)
- Payments (linked to enrollments)

## 6. Tech Stack Preferences
- Frontend: React Native (cross-platform mobile)
- Backend: Node.js/Express
- Database: PostgreSQL
- Payments: Stripe
- PDF: Node PDFKit or similar
- Flexible for hosting (AWS/Azure/GCP acceptable)

## 7. Auth & Permissions
| Role    | View Programs | Enroll/Pay | Create/Edit Programs | Assign Exercises | Approve Custom | Group Chat | Download Contracts |
|---------|--------------|------------|---------------------|------------------|---------------|------------|-------------------|
| Admin   | Yes          | No         | Yes                 | Yes              | Yes           | Yes        | Yes               |
| Coach   | Yes          | No         | Only own            | Own athletes     | No            | Yes        | No                |
| Athlete | Yes          | Yes        | No                  | No               | Request only  | Yes        | Yes               |

## 8. Integrations
- Stripe for payment processing
- Video call links (external platform, e.g., Zoom/Google Meet, entered by coach)
- PDF generation (for contracts)
- Email (for notifications, onboarding)

## 9. Non-Functional Requirements
- Mobile responsive (React Native for iOS+Android)
- Secure data handling (GDPR/medical compliance if required)
- Uptime: 99.5%
- Data encrypted at rest and in transit
- Scalable to 10,000+ athletes/coaches
- Role-based access control
- Audit logging for admin actions
- PDF downloads must be reliable/correct
- Group chats must support 1000+ users
- All source files must have header: // IMPORTANT: Before modifying this file, please update CHANGELOG.md with a summary of your changes.