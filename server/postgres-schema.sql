-- ============================================================================
-- BRANCH ASECA DANGACHUA — PostgreSQL schema (for managed Postgres deployments)
-- The running app uses SQLite (better-sqlite3) with auto-seed for zero-config
-- Render hosting. This file is the equivalent PostgreSQL DDL if you provision
-- Render Postgres: create the database from this file, then run the seed
-- (the TypeScript seed in server/src/db.ts maps table-for-table).
-- Row-Level Security notes: enable RLS on student identity tables and create
-- policies keyed on the JWT claim school_id for multi-school isolation.
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer',
  school_id BIGINT,
  phone TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS schools (
  id BIGSERIAL PRIMARY KEY,
  code TEXT,
  name TEXT NOT NULL,
  ol_chiki_name TEXT,
  type TEXT DEFAULT 'Ol-Itun Ashra',
  village TEXT, po TEXT, ps TEXT, district TEXT, pin TEXT, state TEXT DEFAULT 'Odisha',
  headmaster TEXT, phone TEXT, email TEXT,
  affiliation_no TEXT, affiliation_date TEXT, established TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS students (
  id BIGSERIAL PRIMARY KEY,
  school_id BIGINT NOT NULL REFERENCES schools(id),
  admission_no TEXT, roll_no TEXT,
  name TEXT NOT NULL, name_odia TEXT, name_santali TEXT,
  dob DATE, gender TEXT, blood_group TEXT, photo TEXT,
  aadhaar TEXT, aadhaar_doc TEXT,
  father_name TEXT, father_aadhaar TEXT,
  mother_name TEXT, mother_aadhaar TEXT,
  guardian_name TEXT, guardian_mobile TEXT,
  village TEXT, block TEXT, district TEXT, state TEXT, pin TEXT,
  category TEXT, caste_doc TEXT,
  academic_year TEXT, class TEXT, section TEXT,
  admission_date DATE, previous_school TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_students_school ON students(school_id);
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
-- Example RLS policy (set app.current_school_id per request from JWT):
-- CREATE POLICY school_isolation ON students
--   USING (school_id = current_setting('app.current_school_id', true)::bigint
--          OR current_setting('app.role', true) IN ('super_admin','admin'));

CREATE TABLE IF NOT EXISTS teachers (
  id BIGSERIAL PRIMARY KEY, school_id BIGINT NOT NULL REFERENCES schools(id),
  name TEXT NOT NULL, designation TEXT, qualification TEXT,
  phone TEXT, email TEXT, aadhaar TEXT, subject_spec TEXT,
  join_date DATE, status TEXT DEFAULT 'active', photo TEXT
);
CREATE TABLE IF NOT EXISTS staff (
  id BIGSERIAL PRIMARY KEY, school_id BIGINT NOT NULL REFERENCES schools(id),
  name TEXT NOT NULL, designation TEXT, phone TEXT,
  join_date DATE, status TEXT DEFAULT 'active', duties TEXT
);
CREATE TABLE IF NOT EXISTS smc_members (
  id BIGSERIAL PRIMARY KEY, school_id BIGINT NOT NULL REFERENCES schools(id),
  sl_no INT, name TEXT NOT NULL, father_name TEXT,
  designation TEXT, mobile TEXT, signature_status TEXT DEFAULT 'pending'
);
CREATE TABLE IF NOT EXISTS subjects (
  id BIGSERIAL PRIMARY KEY, school_id BIGINT DEFAULT 0,
  name TEXT NOT NULL, code TEXT, class_level TEXT,
  paper_group TEXT, max_marks INT DEFAULT 100, is_active BOOLEAN DEFAULT TRUE
);
CREATE TABLE IF NOT EXISTS exams (
  id BIGSERIAL PRIMARY KEY, school_id BIGINT NOT NULL REFERENCES schools(id),
  name TEXT NOT NULL, session TEXT, standard TEXT,
  exam_center TEXT, center_code TEXT, exam_date DATE, status TEXT DEFAULT 'published'
);
CREATE TABLE IF NOT EXISTS exam_results (
  id BIGSERIAL PRIMARY KEY, exam_id BIGINT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  student_id BIGINT, roll_no TEXT, student_name TEXT, mother_name TEXT, father_name TEXT, dob DATE,
  mil1 INT, mil2 INT, mil3 INT, mil4 INT, odia INT, english INT,
  total INT, result TEXT, grade TEXT
);
CREATE TABLE IF NOT EXISTS attendance (
  id BIGSERIAL PRIMARY KEY, school_id BIGINT NOT NULL, student_id BIGINT NOT NULL,
  date DATE NOT NULL, status TEXT NOT NULL, note TEXT,
  UNIQUE(student_id, date)
);
CREATE TABLE IF NOT EXISTS teacher_attendance (
  id BIGSERIAL PRIMARY KEY, school_id BIGINT NOT NULL, teacher_id BIGINT NOT NULL,
  date DATE NOT NULL, status TEXT NOT NULL, note TEXT,
  UNIQUE(teacher_id, date)
);
CREATE TABLE IF NOT EXISTS timetable (
  id BIGSERIAL PRIMARY KEY, school_id BIGINT NOT NULL,
  class TEXT, section TEXT, day TEXT, period INT, start_time TEXT, end_time TEXT,
  subject TEXT, teacher TEXT
);
CREATE TABLE IF NOT EXISTS hostels (
  id BIGSERIAL PRIMARY KEY, school_id BIGINT NOT NULL,
  name TEXT NOT NULL, type TEXT, warden TEXT, capacity INT DEFAULT 0, occupied INT DEFAULT 0
);
CREATE TABLE IF NOT EXISTS hostel_allocations (
  id BIGSERIAL PRIMARY KEY, hostel_id BIGINT NOT NULL,
  room_no TEXT, student_id BIGINT, student_name TEXT, bed TEXT,
  check_in DATE, status TEXT DEFAULT 'boarding'
);
CREATE TABLE IF NOT EXISTS books (
  id BIGSERIAL PRIMARY KEY, school_id BIGINT NOT NULL,
  title TEXT NOT NULL, author TEXT, isbn TEXT, category TEXT,
  copies INT DEFAULT 1, available INT DEFAULT 1, pdf_file TEXT
);
CREATE TABLE IF NOT EXISTS book_issues (
  id BIGSERIAL PRIMARY KEY, book_id BIGINT NOT NULL,
  member_type TEXT, member_id BIGINT, member_name TEXT,
  issue_date DATE, due_date DATE, return_date DATE, status TEXT DEFAULT 'issued'
);
CREATE TABLE IF NOT EXISTS notices (
  id BIGSERIAL PRIMARY KEY, school_id BIGINT DEFAULT 0,
  title TEXT NOT NULL, body TEXT, category TEXT, priority TEXT DEFAULT 'normal',
  date DATE DEFAULT CURRENT_DATE, attachment TEXT, audience TEXT DEFAULT 'all'
);
CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY, school_id BIGINT DEFAULT 0,
  title TEXT NOT NULL, description TEXT, date DATE, venue TEXT, category TEXT
);
CREATE TABLE IF NOT EXISTS media (
  id BIGSERIAL PRIMARY KEY, title TEXT, file_path TEXT, type TEXT, size BIGINT,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS cms_pages (
  id BIGSERIAL PRIMARY KEY, slug TEXT UNIQUE NOT NULL, title TEXT, blocks JSONB,
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY, user_id BIGINT, username TEXT,
  action TEXT, entity TEXT, detail TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
