# 🏥 IMHS Clinical Education Portal - Admin Panel Documentation

> **Complete System Reference Guide**: Architecture, Pages, UI Layout, Workflows, Modals, and API Endpoints for the Institute of Medicine & Health Sciences (IMHS) Administration Control Panel.

---

## 📌 Executive Table of Contents
1. [Overview & Security Architecture](#1-overview--security-architecture)
2. [Navigation & Layout System](#2-navigation--layout-system)
3. [Main Executive Dashboard (`/admin`)](#3-main-executive-dashboard-admin)
4. [Course Catalog & Management (`/admin/courses`)](#4-course-catalog--management-admincourses)
5. [Interactive Curriculum Builder & Course Settings (`/admin/courses/[id]/edit`)](#5-interactive-curriculum-builder--course-settings-admincoursesidedit)
6. [Course Instructors & Announcements Engine](#6-course-instructors--announcements-engine)
7. [Student Directory & Account Control (`/admin/students`)](#7-student-directory--account-control-adminstudents)
8. [Student Profile, Enrollment & Password Control (`/admin/students/[id]`)](#8-student-profile-enrollment--password-control-adminstudentsid)
9. [Inquiries & Admissions Desk (`/admin/inquiries`)](#9-inquiries--admissions-desk-admininquiries)
10. [Complete Admin API Endpoints Reference](#10-complete-admin-api-endpoints-reference)

---

## 1. Overview & Security Architecture

The **IMHS Admin Control Panel** is an executive-level administration portal designed for academic coordinators, faculty managers, and system administrators at the Institute of Medicine & Health Sciences.

### Key Security & Access Enforcement:
- **Role-Based Access Control (RBAC)**: Enforced via `NextAuth.js` and Next.js `middleware.ts`. Only users with `role: "ADMIN"` can access any `/admin/*` routes or `/api/admin/*` REST endpoints.
- **Automatic Session Verification**: Unauthenticated users attempting to open `/admin` are immediately redirected to `/login?callbackUrl=/admin`. Non-admin users are redirected to the student dashboard (`/dashboard`).
- **Audit Logging & Rate Limiting**: All sensitive administrative actions (password resets, account freezing, course deletions) pass through rate-limited API handlers with sanitization.

---

## 2. Navigation & Layout System

- **Layout File**: [`app/admin/layout.tsx`](file:///c:/Users/User/Downloads/IMHS/app/admin/layout.tsx)
- **Navigation Component**: [`components/admin/AdminNav.tsx`](file:///c:/Users/User/Downloads/IMHS/components/admin/AdminNav.tsx)

```
┌────────────────────────────────────────────────────────────────────────┐
│ 🏥 IMHS ADMIN   [Dashboard]  [Courses]  [Students]  [Inquiries]  (Logout) │
└────────────────────────────────────────────────────────────────────────┘
```

### UI & Layout Features:
1. **Glassmorphism Header**: Fixed top navigation bar with `backdrop-blur-md bg-surface/90` styling and subtle borders (`border-chart-grid`).
2. **Active Navigation Indicators**: Highlights the current active section with a glowing teal pill background (`bg-clinical-teal/10 text-clinical-teal`).
3. **Mobile Drawer Menu**: Fully responsive slide-out menu with smooth backdrop blur for tablet and smartphone views.
4. **Quick Portal Switcher**: Button allowing administrators to preview the live student portal or return to marketing pages with a single click.

---

## 3. Main Executive Dashboard (`/admin`)

- **Page Route**: `app/admin/page.tsx`

### Key Performance Indicator (KPI) Cards:
- **Total Enrolled Students**: Active student accounts registered in the database.
- **Published Courses & Programs**: Count of active clinical, pharmaceutical, and pathology programs.
- **Course Inquiries & Leads**: Incoming student applications requiring coordinator review.
- **Total Video Modules & Lessons**: Total Vimeo & Drive clinical lecture assets.

### Workspace Sections:
1. **Quick Action Panel**: Buttons for *Create New Course*, *Add New Student*, and *View Recent Inquiries*.
2. **Recent Course Inquiries**: Live table of the 5 newest student applications with direct WhatsApp launch buttons.
3. **Active Programs Status**: Overview table displaying program titles, price (LKR), published status, and student count.

---

## 4. Course Catalog & Management (`/admin/courses`)

- **Page Route**: `app/admin/courses/page.tsx`
- **Client Component**: [`components/admin/AdminCoursesClient.tsx`](file:///c:/Users/User/Downloads/IMHS/components/admin/AdminCoursesClient.tsx)

### Workflows & Actions:
- **Search & Filter**: Search courses by title, category, or slug in real time.
- **Course Status Badges**:
  - `PUBLISHED`: Green badge indicating visibility on public course pages.
  - `DRAFT`: Amber badge indicating hidden/unpublished state.
- **Course Actions Menu**:
  - ✏️ **Edit Course Details / Builder**: Opens the course curriculum editor.
  - 👁️ **Preview Course**: Opens the public course landing page.
  - ⚡ **Toggle Publish**: Instantly publish or unpublish the program.
  - 🗑️ **Delete Course**: Modal confirmation prompt to remove the course and associated chapters.

---

## 5. Interactive Curriculum Builder & Course Settings (`/admin/courses/[id]/edit`)

- **Page Route**: `app/admin/courses/[id]/edit/page.tsx`
- **Client Component**: [`components/admin/CourseBuilderClient.tsx`](file:///c:/Users/User/Downloads/IMHS/components/admin/CourseBuilderClient.tsx)

```
┌────────────────────────────────────────────────────────────────────────┐
│ COURSE CURRICULUM BUILDER                                               │
├───────────────────────────────────┬────────────────────────────────────┤
│ 📂 Chapter 01: Pharmacokinetics   │ 📹 Add Lesson to Chapter           │
│   ├── Lesson 01: Drug Absorption  │    ├── Title: IV Infusion Kinetics │
│   └── Lesson 02: Bioavailability  │    └── Vimeo ID: 999797525/e1a3ade   │
### 1. Course Details & Metadata Tab:
- **Basic Info**: Title, Slug, Description, Category (e.g. *Modern Pharmacy (SLMC Registration)*, *Pharmaceutical Manufacturing*, *Forensic Pharmacy*).
- **Pricing & Access**: Price (LKR), Original Price (for discount badges), Validity Period (*Lifetime Access*, *1 Year Access*).
- **Total Video Modules & Lessons**: Total HD Video & Drive clinical lecture assets.

---

## 5. Course & Curriculum Builder Architecture

```
Course
 └── Chapters (Ordered)
      └── Lessons (Ordered)
           ├── Type: VIDEO (HD Video Stream ID)
           ├── Type: DOCUMENT (Google Drive File ID / PDF)
           └── Type: QUIZ (Interactive Assessment)
```

### Course Builder Data Model
```
Chapter
 ├── id, title, order
 └── lessons:
      ├── Lesson 01: Pharmacology Overview  │    └── Video Stream ID: 76979871
      └── Lesson 02: Bioavailability        │    └── Video Stream ID: 999797525/e1a3ade
```

### Key Workflow Principles
- **Lesson Types**: `VIDEO` (Domain-locked HD video lectures) or `DOCUMENT` (PDF / Google Drive case files).
- **Video Integration**: Supports standard video IDs as well as private unlisted hash URLs (e.g. `999797525/e1a3adefb3`).
- **Google Drive Integration**: Extracts file IDs from shared Google Drive links for seamless document previews.

---

## 6. Course Instructors & Announcements Engine

### A. Assigning Course Instructors (Lecturers)
Administrators can assign senior consultants and university lecturers to individual courses.
- **Management Panel**: Located inside [`components/admin/CourseBuilderClient.tsx`](file:///c:/Users/User/Downloads/IMHS/components/admin/CourseBuilderClient.tsx) under the **Instructors Tab**.
- **Display Location**: Selected instructors render prominently on the public course page under **"Course Instructors"**.

### B. Course Announcements Engine
Administrators can post official course announcements that appear directly in the student's **Course Syllabus & Player**.
- **Format Capabilities**: Formatted like WhatsApp messages with link formatting, bold text `*text*`, line breaks, and timestamped badges.
- **Security & Scope**: Announcements are **strictly visible only to enrolled students** who have active access to that specific course.

---

## 7. Student Directory & Account Control (`/admin/students`)

- **Page Route**: `app/admin/students/page.tsx`
- **Client Component**: [`components/admin/StudentDirectoryClient.tsx`](file:///c:/Users/User/Downloads/IMHS/components/admin/StudentDirectoryClient.tsx)

### Features & Workflows:
- **Student Search**: Instantly search students by Name, Email, Student ID (`IMHS/2026/...`), or Phone number.
- **Account Status Filter**:
  - `ACTIVE`: Normal portal access enabled.
  - `FROZEN`: Account suspended by admin; student cannot log in to dashboard.
- **Add New Student (`/admin/students/new`)**:
  - Form fields: Full Name, Email Address, Student ID, Phone Number, Password.
  - Instantly provisions credentials for immediate student login.

---

## 8. Student Profile, Enrollment & Password Control (`/admin/students/[id]`)

- **Page Route**: `app/admin/students/[id]/page.tsx`
- **Client Component**: [`components/admin/StudentDetailClient.tsx`](file:///c:/Users/User/Downloads/IMHS/components/admin/StudentDetailClient.tsx)

```
┌────────────────────────────────────────────────────────────────────────┐
│ STUDENT PROFILE: IMHS/2026/1042                                        │
├───────────────────────────────────┬────────────────────────────────────┤
│ 👤 Personal Information           │ 🎓 Active Course Enrollments      │
│    Name: Chamari Perera           │    ├── Modern Pharmacy - Batch 10  │
│    Email: chamari@gmail.com       │    └── [ Grant New Course Access ]  │
│    Status: [ ACTIVE ]             │                                    │
├───────────────────────────────────┼────────────────────────────────────┤
│ 🔑 Admin Password Reset           │ ⚠️ Account Suspension             │
│    [ Set New Password ]           │    [ Freeze Account Access ]       │
└───────────────────────────────────┴────────────────────────────────────┘
```

### Key Administrative Actions:
1. **Grant / Revoke Course Access**:
   - Select any course program from a dropdown to enroll the student instantly.
   - Click *Revoke Access* to remove an enrollment.
2. **Admin Password Reset**:
   - Directly set a new password for any student without needing their old password.
   - Automatic password hash generation using bcrypt.
3. **Freeze / Unfreeze Account**:
   - Toggle account status between `ACTIVE` and `FROZEN` to enforce payment compliance or administrative holds.

---

## 9. Inquiries & Admissions Desk (`/admin/inquiries`)

- **Page Route**: `app/admin/inquiries/page.tsx`
- **Client Component**: [`components/admin/AdminInquiriesClient.tsx`](file:///c:/Users/User/Downloads/IMHS/components/admin/AdminInquiriesClient.tsx)

### Features & Workflows:
- **Lead Capture Management**: Displays all student inquiries submitted via WhatsApp lead forms or web forms.
- **Status Lifecycle**: `PENDING` ➔ `CONTACTED` ➔ `ENROLLED` ➔ `CLOSED`.
- **One-Click WhatsApp Coordinator Launcher**: Clicking the WhatsApp icon pre-fills a personalized message with the student's name and requested course title directly in WhatsApp Web/App.

---

## 10. Complete Admin API Endpoints Reference

| HTTP Method | Route Endpoint | Purpose / Function |
| :--- | :--- | :--- |
| `GET` | `/api/admin/courses` | Fetch all courses with chapter & student count |
| `POST` | `/api/admin/courses` | Create a new course program |
| `PUT` | `/api/admin/courses/[id]` | Update course details, pricing, cover image, status |
| `DELETE` | `/api/admin/courses/[id]` | Delete a course program |
| `GET` | `/api/admin/courses/[id]/builder` | Fetch course curriculum (chapters & lessons) |
| `POST` | `/api/admin/courses/[id]/builder` | Save/update full curriculum structure |
| `GET` | `/api/admin/courses/[id]/announcements` | Fetch course announcements |
| `POST` | `/api/admin/courses/[id]/announcements` | Add a new course announcement |
| `POST` | `/api/admin/courses/[id]/instructors` | Assign/unassign lecturers for a course |
| `GET` | `/api/admin/students` | Fetch student directory with filter parameters |
| `POST` | `/api/admin/students` | Create new student user record |
| `GET` | `/api/admin/students/[id]` | Fetch detailed student profile & enrollments |
| `POST` | `/api/admin/students/[id]/enrollments` | Grant course access to student |
| `DELETE` | `/api/admin/students/[id]/enrollments` | Revoke course access from student |
| `POST` | `/api/admin/students/[id]/reset-password` | Admin reset student password |
| `PUT` | `/api/admin/inquiries/[id]` | Update inquiry status (Pending/Enrolled/Closed) |
| `DELETE` | `/api/admin/inquiries/[id]` | Remove inquiry lead record |

---

> **Document Version**: 2.5 (Production Ready)  
> **Target Framework**: Next.js 16 (App Router) + Prisma ORM + NextAuth.js  
> **Institute**: Institute of Medicine & Health Sciences (IMHS), Sri Lanka.
