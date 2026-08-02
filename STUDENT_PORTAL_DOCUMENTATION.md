# IMHS Student Portal - Complete UI & Functional Architecture Documentation

This document provides a comprehensive technical and design breakdown of the **IMHS Student Clinical Learning Portal** (`/dashboard`). It details every page, layout component, interactive workflow, video/document player state, and support integration built into the student experience.

---

## Table of Contents
1. [Portal Architecture & Access Control](#1-portal-architecture--access-control)
2. [Global Navigation Shell (`StudentPortalNav`)](#2-global-navigation-shell-studentportalnav)
3. [Student Dashboard Page (`/dashboard`)](#3-student-dashboard-page-dashboard)
4. [Course Player & Video Viewer (`/dashboard/courses/[slug]`)](#4-course-player--video-viewer-dashboardcoursesslug)
5. [Student Profile & Security Page (`/dashboard/profile`)](#5-student-profile--security-page-dashboardprofile)
6. [WhatsApp Support & Account Status Handling](#6-whatsapp-support--account-status-handling)

---

## 1. Portal Architecture & Access Control

### 🔐 Authentication & Session Guard
- **Role Requirement**: Accessible by authenticated users with role `STUDENT` or `ADMIN`.
- **Layout Route Guard**: Protected at the server component layer in `app/dashboard/layout.tsx`. If no valid `NextAuth` session exists, the user is redirected immediately to `/login`.
- **Admin Switcher**: Admins viewing the student portal see an express **Admin Console** badge button in the header allowing one-click return to executive management.

---

## 2. Global Navigation Shell (`StudentPortalNav`)

The student shell uses a fixed top header (`sticky top-0 z-40`) with a medical teal top accent line.

```
┌────────────────────────────────────────────────────────────────────────┐
│ [IMHS Logo] Student Portal │  My Courses  Profile  (Admin)  │ [Dr. K ▾] │
└────────────────────────────────────────────────────────────────────────┘
```

### Key Elements:
- **Brand Identity**: Official IMHS Logo linked to `/dashboard` with a `STUDENT PORTAL` badge.
- **Nav Tabs**:
  - `My Courses` (`/dashboard`) - Highlighted when viewing catalog or course player.
  - `Profile` (`/dashboard/profile`) - Account security and Reg ID details.
- **User Avatar Menu**: Displays student initials in a teal circle with a dropdown containing:
  - Account Email & Student Reg ID badge.
  - Quick link to Profile.
  - **Sign Out** button (clears session and redirects to `/login`).
- **Mobile Drawer Menu**: On mobile viewports (`< md`), a hamburger icon triggers a smooth slide-down navigation drawer with all links and sign-out options.

---

## 3. Student Dashboard Page (`/dashboard`)

The main entry point for logged-in students. Displays candidate metrics, overall progress, and enrolled course program cards.

### 3.1 Student Hero Banner
- **Personalized Greeting**: Displays candidate name (e.g. `Welcome back, Kavindu! 👋`) and uppercase badge `IMHS CLINICAL CANDIDATE`.
- **Initials Avatar**: Large candidate avatar circle initialized with candidate name initials.
- **Metric Cards Row**:
  - **Enrolled**: Total count of active/enrolled courses.
  - **Lessons Done**: Total count of completed lessons across all enrolled courses.
  - **Overall Progress**: Dynamic percentage ring calculated across all enrolled syllabus modules.

### 3.2 Overall Curriculum Progress Bar
A full-width visual progress bar displaying total percentage completion with a **Vital Line** pulse animation for an active clinical feeedback look.

### 3.3 Course Cards Grid (`Enrolled Programs`)
Each enrolled course renders as a responsive card with the following states and metadata:

```
┌────────────────────────────────────────────────────────────────────────┐
│ [Course Cover Image]                                                   │
│ Category Badge | Lifetime Access                                       │
│ Diploma in Healthcare & Medical Laboratory Technology                  │
│                                                                        │
│ Progress: ██████████░░░░░░░ 65% (13 / 20 Lessons)                      │
│ ────────────────────────────────────────────────────────────────────── │
│ [ ▶ Continue Learning ]                            [ 📄 Syllabus ]      │
└────────────────────────────────────────────────────────────────────────┘
```

#### Card Components:
1. **Cover Image**: Displays custom course cover or high-resolution clinical stock image fallback.
2. **Category & Validity Badges**: Displays category (e.g. `Modern Pharmacy`, `MLT`) and access validity (e.g. `Lifetime Access`).
3. **Course Progress Bar**: Real-time ratio of completed lessons vs total course lessons.
4. **Action Buttons**:
   - `Continue Learning` - Deep-links to the exact first incomplete lesson in `/dashboard/courses/[slug]`.
   - `Completed` (Badge) - Shown when 100% of lessons are checked off.

#### 🔒 Frozen Course Access Card Handling
If an administrator marks a student's enrollment status as `FROZEN`:
- The course card receives a frosted overlay and lock badge.
- The `Continue Learning` button changes to **"Access Frozen - Contact Administration"**.
- Clicking opens a pre-formatted **WhatsApp link** directly to IMHS administration for quick fee/access resolution.

---

## 4. Course Player & Video Viewer (`/dashboard/courses/[slug]`)

The core learning environment where students watch video lectures and view PDF reference materials.

```
┌──────────────────────────────────────┬─────────────────────────────────┐
│ ◄ Back to Dashboard                  │  Chapter 01: Pharmacy Prep      │
├──────────────────────────────────────┼─────────────────────────────────┤
│                                      │  [✓] 1.1 Intro to Pharmacology  │
│          VIMEO HD PLAYER             │  [▶] 1.2 Drug Classification    │
│                 or                   │  [ ] 1.3 Dosage Calculations    │
│         PDF DOCUMENT VIEWING STAGE   │                                 │
│                                      │  Chapter 02: Clinical Lab Tech  │
│                                      │  [ ] 2.1 Blood Transfusion      │
├──────────────────────────────────────┴─────────────────────────────────┤
│ [ ◄ Previous Lesson ]   [ ✓ Mark Completed ]   [ Next Lesson ► ]        │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.1 Layout Structure (Split Screen)
- **Desktop**: 2-column layout. Main Stage (70% width) + Syllabus Accordion Sidebar (30% width).
- **Mobile**: Collapsible top drawer for syllabus chapters + sticky bottom action bar.

### 4.2 Main Stage Player (`CoursePlayerClient.tsx`)

#### A. Video Player (Vimeo HD Integration)
- Renders HD Vimeo video via responsive iframe with parameters `autoplay=0&title=0&byline=0`.
- Aspect ratio fixed at 16:9 for responsive viewing across desktop, tablet, and mobile.
- Support for Vimeo hash parameters (e.g. `76979871?h=abc1234`) for private unlisted video security.

#### B. Document / PDF Viewer (Google Drive Integration)
- When a lesson type is `DOCUMENT` or contains a `driveFileId`:
- Embeds a clean PDF reader stage with zoom and full-screen controls.
- Companion PDF downloads available for video lessons with reference files attached.

### 4.3 Syllabus Sidebar & Navigation Accordion
- **Chapters**: Organized in order (`Chapter 01`, `Chapter 02`, etc.) with expand/collapse toggles.
- **Lesson Rows**:
  - Displays icon type (`📹 Video` or `📄 Document`).
  - Completed lessons display a green checkmark `[✓]`.
  - Active lesson highlighted in teal border.
  - Displays lesson duration/type.

### 4.4 Completion & Navigation Toolbar
Located directly beneath the main stage:
- **Previous Lesson**: Navigates to the preceding lesson in sequence.
- **Mark Complete Toggle**:
  - Clicking `Mark as Completed` triggers an immediate API request to `/api/student/lessons/[id]/complete`.
  - Instantly updates global progress state, checks off the item in the sidebar, and advances progress bars.
  - Button toggles to `✓ Completed (Click to undo)`.
- **Next Lesson**: Advances to the next lesson automatically once complete.

### 4.5 Course Announcements & Faculty Tabs
Below the player, students can switch between tabs:
- **Announcements**: Broadcast notices posted by admins (batch schedules, exam dates, revision links).
- **Course Faculty**: Instructor profiles with photos, titles, and clinical bio summaries.

---

## 5. Student Profile & Security Page (`/dashboard/profile`)

The profile page (`/dashboard/profile`) allows candidates to review registration records and update security credentials.

```
┌────────────────────────────────────────────────────────────────────────┐
│ CANDIDATE REGISTRATION RECORD                                          │
│ Name: Dr. Kavindu Perera                                               │
│ Registration ID: IMPH4131 (Official SLMC Candidate ID)                 │
│ Email: candidate@example.com                                          │
│ Phone: +94 77 123 4567                                                 │
├────────────────────────────────────────────────────────────────────────┤
│ CHANGE SECURITY PASSWORD                                               │
│ Current Password:  [ ************ ]                                   │
│ New Password:      [ ************ ]                                   │
│ Confirm Password:  [ ************ ]                                   │
│ [ Update Password ]                                                    │
└────────────────────────────────────────────────────────────────────────┘
```

### Key Sections:
1. **Reg ID & Candidate Details**: Read-only display of official Registration ID (e.g. `IMPH4131`), email, and registered WhatsApp number.
2. **Password Change**: Form with current password verification and strength validation. Calls `/api/student/profile/password`.
3. **Active Enrolled Programs**: Summary list of active course access grants.

---

## 6. WhatsApp Support & Account Status Handling

To match Sri Lankan student preferences, deep-linked WhatsApp support buttons are placed in key workflows:
- **Support Button**: Present in dashboard footer and course views.
- **Frozen Account Resolution**: Generates pre-filled WhatsApp messages with candidate Reg ID and course name for instant admin clearance.
