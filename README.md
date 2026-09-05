# BRANCH ASECA DANGACHUA

**branchasecadangachua.org** · Multi-school ERP · Santali / Ol Chiki learning · public cultural website

BRANCH ASECA DANGACHUA is a single connected product with three experiences:

- **Public website** — an Indigenous Odisha-inspired, accessible website for schools, heritage, notices and community resources.
- **ERP workspace** — authenticated, school-scoped administration for organization, schools, people, students, academic records and content operations.
- **Santali language tools** — `/dictionary` and `/olchiki-lab`, with source/verification workflows and real audio playback when an editor configures an audio URL.

The implementation preserves the existing React/Express architecture and extends it instead of replacing working modules.

## Stack

- React 18 + TypeScript + React Router
- Tailwind CSS + Vite
- Node.js + Express + TypeScript
- SQL.js SQLite-compatible persistent database adapter (writes `data/aseca.db`; the schema is intentionally relational and the adapter can be replaced by PostgreSQL/Prisma in deployment)
- bcrypt password hashing, JWT sessions, Multer upload validation, audit logging

## Quick start

```bash
cp .env.example .env
npm run install:all
npm run db:seed
npm run build
npm start
```

Open `http://localhost:4000`.

### Development

```bash
npm run dev:server   # Express on :4000
npm run dev:client   # Vite on :5173, /api and /uploads proxied to :4000
```

Vite binds to `0.0.0.0` for hosted previews. The Express server also binds to `0.0.0.0`.

## Demo accounts

All demo/sample content is clearly labelled in editorial and learning workflows. Replace it before publishing authentic biography, language, cultural or school content.

| Role | Email | Password |
| --- | --- | --- |
| Super Admin | `superadmin@aseca.org` | `admin@123` |
| Organization Admin | `orgadmin@aseca.org` | `admin@123` |
| School Admin | `schooladmin@aseca.org` | `admin@123` |
| Principal | `principal@aseca.org` | `school@123` |
| Teacher | `teacher@aseca.org` | `school@123` |

## Public routes

- `/` — premium homepage and connected website sections
- `/about`, `/schools`, `/managing-body`, `/contact`
- `/pandit-raghunath-murmu` — source-aware heritage profile
- `/dictionary` — five-script searchable dictionary with verification/source display
- `/olchiki-lab` — LEARN, LISTEN, MATCH, PRACTICE, QUIZ and REVIEW learning modes

## ERP routes

- `/app` — role-aware dashboard
- `/app/schools`, `/app/students`, `/app/teachers`, `/app/staff`, `/app/users`
- `/app/dictionary` — CRUD and verification workflow for dictionary editorial records
- `/app/media` — validated central media library for images, PDF, Office documents, audio and video
- `/app/page-builder` — CMS homepage blocks, visibility, order, copy and design configuration
- `/app/workspace/:module` — connected operations workspaces for academic years, classes, subjects, attendance, exams, timetable, library, documents, certificates, notices, events, gallery, managing body, culture, resources, Ol Chiki Lab, reports, audit logs, notifications and settings

## API surface

Public:

- `GET /api/health`
- `GET /api/schools`
- `GET /api/public/managing-body`
- `GET /api/public/historical/:slug`
- `GET /api/public/dictionary?q=&category=`
- `GET /api/public/olchiki/letters`
- `GET /api/public/olchiki/lessons`
- `GET /api/public/culture`, `/api/public/resources`, `/api/public/notices`, `/api/public/events`

Authenticated:

- `POST /api/auth/login`, `GET /api/auth/me`
- `POST /api/auth/change-password`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`
- `GET/POST/PUT /api/schools`, `/api/students`, `/api/teachers`, `/api/staff`, `/api/users`
- `GET /api/dashboard/stats`
- `GET /api/academic-years`, `/api/classes`, `/api/subjects`
- `GET/POST/PUT/DELETE /api/dictionary/entries`
- `GET /api/pages`, `PUT /api/pages/:id`, `PUT /api/page-blocks/:id`
- `GET /api/media`, `POST /api/media` (multipart `file`), `DELETE /api/media/:id`
- `GET /api/audit-logs`

All authenticated requests use `Authorization: Bearer <token>`. Protected record endpoints apply role and school scope checks. Student Aadhaar/ID values are masked for non-authorized roles.

## Data model

`server/src/db.ts` contains the normalized schema and forward migrations for:

- organization, schools, academic years, classes, sections, subjects, enrollments
- users, roles, permissions, user roles, password reset tokens, audit logs, notifications
- students, guardians-ready student fields, teachers, staff, attendance and teacher attendance
- exams, exam subjects, marks, grading rules, results-ready academic structures, timetables
- books, library transactions, documents, certificates, media
- notices, events, gallery, achievements, managing body
- pages, page sections, page blocks, site settings
- source-aware historical profiles, timeline, contributions, images, documents and references
- dictionary entries/categories/examples/synonyms/antonyms/audio
- Ol Chiki letters, audio, lessons, words, exercises, quizzes, questions, progress and achievements

There is deliberately **no fee, payment, payment gateway or hostel module**.

## Security notes

- Passwords are bcrypt hashes; plaintext passwords are not stored.
- JWTs are signed from `JWT_SECRET` and inactive accounts are rejected.
- Password reset tokens are stored hashed, expire after 30 minutes and are single-use. In development the token is returned to support local demo setup; production must connect an email/SMS provider without putting credentials in source.
- School-scoped users cannot widen list queries or write records into another school.
- Uploads use an allowlist, a 15 MB limit, generated filenames and centralized media metadata. Store protected documents behind authenticated storage in production rather than exposing them through the public upload mount.
- Student identity values are masked for non-admin roles.
- CRUD, login, content, media and editorial changes are written to `audit_logs`.
- Use a strong random `JWT_SECRET`, HTTPS, secure reverse-proxy headers, a production PostgreSQL adapter and managed object storage for deployment.

## Environment

```dotenv
DATABASE_URL="file:./dev.db"
JWT_SECRET="replace-with-a-long-random-secret"
PORT=4000
NODE_ENV=development
UPLOAD_DIR=./uploads
```

`DATABASE_URL` is retained for deployment compatibility; the current SQL.js adapter uses `DATA_DIR` when supplied and defaults to `./data`.

## Quality checks

```bash
npm run build --prefix server
npm run build --prefix client
npm run db:seed
```

Before production publishing, verify all historical, cultural and Santali language records with the organization, attach references and replace every `DEMO DATA` record, image and placeholder audio item.
