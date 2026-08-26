# BRANCH ASECA DANGACHUA
### Multi-School ERP + Public Website — Education • Culture • Community

A complete, production-ready **multi-school management platform** with a beautiful
Santali-heritage-inspired **public landing website** and a **secure ERP/admin portal**,
both driven by the same database.

---

## 1. What is included

### Public Website (`/`)
- Cinematic hero with editable floating statistics, brand badge and CTA buttons
- About (mission / vision / values), Managing Body (11 editable members)
- Searchable school directory, Santali Culture section (7 editable topics)
- Animated statistics counters, latest Notices & Events, Achievements, Gallery (albums + lightbox)
- **Result Search** (by Roll No / Student ID / Admission No) with subject-wise marks,
  total, percentage, grade, pass/fail status and **QR result verification**
- Final CTA and a rich footer (org info, quick links, schools, services, contact, social, legal)
- Light/Dark mode + language selector: **English · Odia · Hindi · Santali · Ol Chiki**

### Secure ERP Portal (`/login` → `/app`)
- Role-based access with **10 roles** (Super Admin, Org Admin, School Admin, Principal,
  Teacher, Accountant, Librarian, Staff, Student, Parent)
- **Super Admin dashboard** (schools, students, staff, attendance, fees, exams, results + charts)
- School dashboard (auto-scoped) and a dedicated **Student/Parent portal**
- **Schools** (CRUD, archive/restore, statistics, school switcher), **Academic years**
- **Students** (full CRUD, search/filter, transfer/promote/archive, **Excel import/export**
  with validation, documents, 9-tab profile, ID card)
- **Teachers & Staff** (profiles, subject allocation, staff types)
- **Academics** (classes, sections, subjects, class↔subject mapping)
- **Attendance** (daily, bulk, 5 statuses, class/date filters, mobile-friendly tap UI)
- **Exams & Results** (unlimited exams, subject config, bulk marks entry, auto
  total/percentage/grade/rank, publish & lock, configurable grading rules)
- **Report Cards** (preview / print / PDF), **Timetable**, **Fees** (structures, dues,
  payments, receipts), **Hostel** (rooms, beds, allocation), **Library** (books, issue/return, fines)
- **Notices** (draft/publish/schedule/expire) & **Events** → auto-published on the website
- **Documents**, **Certificates** (bonafide/transfer/character/study/participation PDFs),
  **ID Cards** (photo + QR, bulk print)
- **Reports & analytics** (charts + Excel export), **Global search**, **Notification center**
- **Users, Roles & Permissions** (editable permission matrix), **Audit logs**, **Settings**
  (organisation, branding/colours/logo, grading rules, languages, notifications)

### Public ↔ ERP connection
The landing page reads live data. When an administrator edits organisation info,
school details, managing body, notices, events, gallery, achievements or Santali-culture
content inside the ERP, the public website updates **immediately** — one system, two faces.

---

## 2. Tech stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | React 18 + TypeScript + Vite + Tailwind CSS + Recharts + lucide-react |
| Backend   | Node.js + Express (modular routes) |
| Database  | SQLite via better-sqlite3 (WAL mode, indexed, FK-enforced) |
| Auth      | JWT (session-tracked) + bcrypt password hashing |
| PDFs      | PDFKit (report cards, certificates) |
| QR codes  | `qrcode` (ID cards, result verification) |
| Import/Export | SheetJS (xlsx) |

The whole app is served as a single deployable unit: Express serves the built SPA and
`/api/*` from the same origin (no CORS complexity, works behind one proxy).

---

## 3. Running the project

```bash
cd erp
npm install
npm run seed      # (optional) recreate the demo database
npm run serve     # builds the frontend and starts the server
```

- Public website: `http://localhost:8080/`
- ERP login:     `http://localhost:8080/login`
- Development mode: `npm run dev` (Vite on :5173 proxies `/api` to :8080)

### Demo credentials (password for all: `Admin@123`)

| Username     | Role             | Scope |
|--------------|------------------|-------|
| `superadmin` | Super Admin      | All schools |
| `orgadmin`   | Organisation Admin | All schools |
| `schooladmin`| School Admin     | High School (SCH-001) |
| `principal`  | Principal        | High School |
| `sumitra` / `chaitanya` / `phula` | Teacher | School 1/1/2 |
| `accountant` | Accountant       | School 1 |
| `librarian`  | Librarian        | School 1 |
| `staff`      | Staff            | School 1 |
| `birsa`      | Student          | STU-1001 |
| `parent`     | Parent/Guardian  | 2 children |

---

## 4. Architecture

```
erp/
├── server/                 # Express + SQLite backend
│   ├── index.js            # app entry, static serving, uploads, QR, route mounting
│   ├── schema.sql          # full relational schema (40+ tables, indexes, FKs)
│   ├── seed.js             # realistic fictional demo data (safe to re-run)
│   ├── db.js               # better-sqlite3 connection + helpers
│   ├── auth.js             # JWT, bcrypt, sessions, role permission presets
│   ├── middleware.js       # requireAuth, requirePermission, school scoping, audit
│   ├── reportcard.js       # PDFKit report card + certificate builders
│   └── routes/             # auth, schools, academics, students, staff, attendance,
│                           # exams, fees, library, hostel, timetable, content, admin, public
├── src/
│   ├── lib/                # api client, i18n (en/od/hi/sat/olc), formatting, hooks
│   ├── contexts/           # Auth, Theme, Brand (live org/branding/stats)
│   ├── components/         # ui primitives, charts, public + app layouts
│   └── pages/
│       ├── public/         # Home, Schools, About, ManagingBody, Culture, Notices,
│       │                   # Events, Gallery, Results, Contact
│       ├── auth/           # Login, Forgot/Reset password
│       └── app/            # ~30 ERP modules
└── data/                   # SQLite DB + uploaded media (persisted)
```

**Core data model:** Organization → Schools → Academic Years → Classes → Sections →
Subjects → Students (→ Guardians) → Enrollments → Attendance → Exams → Marks → Results
→ Report Cards → Fees → Payments → Hostel → Library → Notices → Events → Documents →
Certificates → Timetable → Notifications → Gallery → Audit Logs → Settings.

---

## 5. Security & privacy

- Passwords hashed with **bcrypt** (never stored in plain text)
- JWT sessions persisted & revocable (logout, "sign out other devices")
- Server-side **permission checks** on every protected route
- **School-level data isolation** (non-org roles only see their school's data)
- Aadhaar/sensitive fields never returned on public endpoints
- File upload allow-list + 10 MB limit; protected documents flagged sensitive
- **Audit log** for logins, student changes, marks, results, fees, notices, users, permissions
- Input validation & SQL parameterisation throughout

---

## 6. Demo data

3 schools · 48 students · 10 staff · 11 managing-body members · 3 exams with computed
results & ranks · fee structures/payments · 2 hostels with rooms & allocations · 8 books
with transactions · notices, events, achievements, gallery albums and cultural content.
Everything is editable/deletable from the ERP.

*All names, people and data are fictional examples for demonstration.*
