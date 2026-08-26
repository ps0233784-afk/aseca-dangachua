-- ============================================================
-- BRANCH ASECA DANGACHUA — Multi-School ERP
-- SQLite schema (better-sqlite3)
-- ============================================================

PRAGMA foreign_keys = ON;

-- ---------- Organization ----------
CREATE TABLE IF NOT EXISTS organizations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL DEFAULT 'BRANCH ASECA DANGACHUA',
  short_name TEXT DEFAULT 'ASECA',
  tagline TEXT DEFAULT 'Education • Culture • Community',
  logo TEXT,
  favicon TEXT,
  hero_image TEXT,
  address TEXT,
  village TEXT,
  block TEXT,
  district TEXT,
  state TEXT DEFAULT 'Odisha',
  pincode TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  established_year INTEGER,
  about TEXT,
  mission TEXT,
  vision TEXT,
  footer_text TEXT,
  social JSON,               -- {facebook, twitter, instagram, youtube}
  theme JSON,                -- {primary, secondary, accent, radius, font, darkDefault}
  brand_colors JSON,         -- editable palette
  stats_overrides JSON,      -- optional manual overrides for landing stats
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ---------- Schools ----------
CREATE TABLE IF NOT EXISTS schools (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL DEFAULT 1,
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  school_id TEXT,            -- human friendly ID
  logo TEXT,
  photo TEXT,
  address TEXT,
  village TEXT,
  block TEXT,
  district TEXT,
  cluster TEXT,
  pincode TEXT,
  phone TEXT,
  email TEXT,
  principal_name TEXT,
  school_type TEXT DEFAULT 'High School',
  medium TEXT DEFAULT 'Odia',
  established_year INTEGER,
  status TEXT DEFAULT 'active',       -- active | disabled | archived
  description TEXT,
  latitude REAL,
  longitude REAL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ---------- Academic Years ----------
CREATE TABLE IF NOT EXISTS academic_years (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL DEFAULT 1,
  name TEXT NOT NULL,
  start_date TEXT,
  end_date TEXT,
  is_current INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active'
);

-- ---------- Classes / Sections / Subjects ----------
CREATE TABLE IF NOT EXISTS classes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL DEFAULT 1,
  name TEXT NOT NULL,
  code TEXT,
  order_index INTEGER DEFAULT 0,
  default_capacity INTEGER DEFAULT 40
);

CREATE TABLE IF NOT EXISTS sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  school_id INTEGER NOT NULL,
  class_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  room TEXT,
  capacity INTEGER DEFAULT 40,
  class_teacher_id INTEGER,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS subjects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL DEFAULT 1,
  name TEXT NOT NULL,
  code TEXT,
  full_marks INTEGER DEFAULT 100,
  pass_marks INTEGER DEFAULT 33,
  theory_marks INTEGER DEFAULT 100,
  practical_marks INTEGER DEFAULT 0,
  subject_type TEXT DEFAULT 'core',    -- core | language | elective | activity
  color TEXT DEFAULT '#1a56db'
);

CREATE TABLE IF NOT EXISTS class_subjects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  class_id INTEGER NOT NULL,
  subject_id INTEGER NOT NULL,
  UNIQUE(class_id, subject_id)
);

-- ---------- Roles & Permissions ----------
CREATE TABLE IF NOT EXISTS roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL DEFAULT 1,
  key TEXT UNIQUE NOT NULL,            -- super_admin, org_admin, school_admin, principal, teacher, accountant, librarian, staff, student, parent
  name TEXT NOT NULL,
  description TEXT,
  permissions JSON,                    -- { "module": ["view","create","update","delete"] }
  is_system INTEGER DEFAULT 0,
  editable INTEGER DEFAULT 1
);

-- ---------- Users ----------
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL DEFAULT 1,
  school_id INTEGER,
  role_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  username TEXT UNIQUE,
  email TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  phone TEXT,
  avatar TEXT,
  gender TEXT,
  language TEXT DEFAULT 'en',
  theme TEXT DEFAULT 'system',
  status TEXT DEFAULT 'active',
  last_login TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- ---------- Students ----------
CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL DEFAULT 1,
  school_id INTEGER NOT NULL,
  user_id INTEGER,
  student_id TEXT UNIQUE,
  admission_no TEXT,
  roll_no TEXT,
  name TEXT NOT NULL,
  name_odia TEXT,
  name_santali TEXT,
  photo TEXT,
  dob TEXT,
  gender TEXT,
  blood_group TEXT,
  father_name TEXT,
  mother_name TEXT,
  guardian_name TEXT,
  guardian_relation TEXT,
  mobile TEXT,
  email TEXT,
  address TEXT,
  village TEXT,
  block TEXT,
  district TEXT,
  pincode TEXT,
  category TEXT DEFAULT 'General',
  aadhaar TEXT,                        -- protected field
  current_class_id INTEGER,
  current_section_id INTEGER,
  academic_year_id INTEGER,
  admission_date TEXT,
  previous_school TEXT,
  status TEXT DEFAULT 'active',        -- active | alumni | transferred | archived
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (school_id) REFERENCES schools(id)
);

-- ---------- Guardians ----------
CREATE TABLE IF NOT EXISTS guardians (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL DEFAULT 1,
  user_id INTEGER,
  name TEXT NOT NULL,
  relation TEXT,
  mobile TEXT,
  email TEXT,
  address TEXT,
  occupation TEXT
);

CREATE TABLE IF NOT EXISTS student_guardians (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  guardian_id INTEGER NOT NULL,
  is_primary INTEGER DEFAULT 0,
  UNIQUE(student_id, guardian_id)
);

-- ---------- Staff ----------
CREATE TABLE IF NOT EXISTS staff (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL DEFAULT 1,
  school_id INTEGER,
  user_id INTEGER,
  employee_id TEXT UNIQUE,
  name TEXT NOT NULL,
  photo TEXT,
  qualification TEXT,
  designation TEXT,
  staff_type TEXT DEFAULT 'teaching', -- teaching | non-teaching
  department TEXT,
  subject_ids JSON,
  joining_date TEXT,
  mobile TEXT,
  email TEXT,
  address TEXT,
  gender TEXT,
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now'))
);

-- ---------- Attendance ----------
CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL DEFAULT 1,
  school_id INTEGER,
  person_type TEXT NOT NULL,           -- student | staff
  person_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL,                -- present | absent | late | half_day | leave
  period TEXT,
  remark TEXT,
  marked_by INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(person_type, person_id, date)
);

-- ---------- Exams ----------
CREATE TABLE IF NOT EXISTS exams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL DEFAULT 1,
  name TEXT NOT NULL,
  exam_type TEXT,                      -- weekly | unit | half_yearly | annual | pre_test | custom
  academic_year_id INTEGER,
  start_date TEXT,
  end_date TEXT,
  publish_date TEXT,
  status TEXT DEFAULT 'draft',         -- draft | scheduled | published | results_published | locked
  created_by INTEGER,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS exam_classes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  exam_id INTEGER NOT NULL,
  class_id INTEGER NOT NULL,
  UNIQUE(exam_id, class_id)
);

CREATE TABLE IF NOT EXISTS exam_subjects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  exam_id INTEGER NOT NULL,
  class_id INTEGER NOT NULL,
  subject_id INTEGER NOT NULL,
  full_marks INTEGER DEFAULT 100,
  pass_marks INTEGER DEFAULT 33,
  exam_date TEXT,
  UNIQUE(exam_id, class_id, subject_id)
);

-- ---------- Marks & Results ----------
CREATE TABLE IF NOT EXISTS marks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL DEFAULT 1,
  exam_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  subject_id INTEGER NOT NULL,
  theory_marks REAL,
  practical_marks REAL,
  total REAL,
  grade TEXT,
  status TEXT DEFAULT 'draft',         -- draft | submitted | locked
  entered_by INTEGER,
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(exam_id, student_id, subject_id)
);

CREATE TABLE IF NOT EXISTS results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL DEFAULT 1,
  exam_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  total_marks REAL,
  max_marks REAL,
  percentage REAL,
  grade TEXT,
  result_status TEXT,                  -- pass | fail | absent
  rank INTEGER,
  remarks TEXT,
  published_at TEXT,
  UNIQUE(exam_id, student_id)
);

-- ---------- Grading Rules ----------
CREATE TABLE IF NOT EXISTS grading_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL DEFAULT 1,
  min_percent REAL NOT NULL,
  max_percent REAL NOT NULL,
  grade TEXT NOT NULL,
  remark TEXT,
  is_pass INTEGER DEFAULT 1,
  order_index INTEGER DEFAULT 0
);

-- ---------- Fees ----------
CREATE TABLE IF NOT EXISTS fee_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL DEFAULT 1,
  name TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS fee_structures (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL DEFAULT 1,
  school_id INTEGER,
  class_id INTEGER,
  category_id INTEGER NOT NULL,
  academic_year_id INTEGER,
  amount REAL DEFAULT 0,
  due_date TEXT
);

CREATE TABLE IF NOT EXISTS fee_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL DEFAULT 1,
  student_id INTEGER NOT NULL,
  structure_id INTEGER,
  amount REAL DEFAULT 0,
  paid REAL DEFAULT 0,
  discount REAL DEFAULT 0,
  due_date TEXT,
  status TEXT DEFAULT 'pending',       -- pending | partial | paid | waived
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL DEFAULT 1,
  student_id INTEGER NOT NULL,
  fee_assignment_id INTEGER,
  amount REAL NOT NULL,
  method TEXT,
  reference TEXT,
  payment_date TEXT,
  received_by INTEGER,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ---------- Hostel ----------
CREATE TABLE IF NOT EXISTS hostels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL DEFAULT 1,
  school_id INTEGER,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'boys',            -- boys | girls
  address TEXT,
  warden_id INTEGER,
  total_rooms INTEGER DEFAULT 0,
  total_beds INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS hostel_rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hostel_id INTEGER NOT NULL,
  room_no TEXT NOT NULL,
  beds INTEGER DEFAULT 4
);

CREATE TABLE IF NOT EXISTS hostel_allocations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL DEFAULT 1,
  hostel_id INTEGER NOT NULL,
  room_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  from_date TEXT,
  to_date TEXT,
  fee REAL DEFAULT 0,
  status TEXT DEFAULT 'active'
);

-- ---------- Library ----------
CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  author TEXT,
  publisher TEXT,
  isbn TEXT,
  category TEXT,
  copies_total INTEGER DEFAULT 1,
  copies_available INTEGER DEFAULT 1,
  rack_no TEXT,
  added_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS library_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL DEFAULT 1,
  book_id INTEGER NOT NULL,
  person_type TEXT DEFAULT 'student',
  person_id INTEGER NOT NULL,
  issue_date TEXT,
  due_date TEXT,
  return_date TEXT,
  fine REAL DEFAULT 0,
  status TEXT DEFAULT 'issued'         -- issued | returned | overdue
);

-- ---------- Notices & Events ----------
CREATE TABLE IF NOT EXISTS notices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  body TEXT,
  category TEXT DEFAULT 'General',
  target_type TEXT DEFAULT 'all',      -- all | school | class | user
  target_ids JSON,
  attachment TEXT,
  priority TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'draft',         -- draft | published | scheduled | expired | archived
  publish_at TEXT,
  expire_at TEXT,
  created_by INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Cultural',    -- Cultural | Sports | Meeting | Holiday | Training | Community
  event_date TEXT,
  start_time TEXT,
  end_time TEXT,
  venue TEXT,
  image TEXT,
  status TEXT DEFAULT 'published',
  created_by INTEGER,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ---------- Managing Body ----------
CREATE TABLE IF NOT EXISTS managing_body (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL DEFAULT 1,
  name TEXT NOT NULL,
  designation TEXT,
  photo TEXT,
  bio TEXT,
  order_index INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active'
);

-- ---------- Gallery ----------
CREATE TABLE IF NOT EXISTS albums (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL DEFAULT 1,
  name TEXT NOT NULL,
  cover TEXT,
  description TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS gallery (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL DEFAULT 1,
  album_id INTEGER,
  title TEXT,
  image TEXT NOT NULL,
  category TEXT DEFAULT 'school',      -- school | students | cultural | sports | community | education
  caption TEXT,
  is_public INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ---------- Achievements ----------
CREATE TABLE IF NOT EXISTS achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Academic',    -- Academic | Student | Sports | Cultural | Activity
  image TEXT,
  achievement_date TEXT,
  is_public INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ---------- Culture Content ----------
CREATE TABLE IF NOT EXISTS culture_content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL DEFAULT 1,
  section_key TEXT UNIQUE,             -- language | olchiki | literature | festivals | knowledge | resources | history
  title TEXT,
  body TEXT,
  image TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ---------- Timetable ----------
CREATE TABLE IF NOT EXISTS timetable_periods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL DEFAULT 1,
  school_id INTEGER,
  name TEXT,                           -- e.g. "Period 1"
  start_time TEXT,
  end_time TEXT,
  order_index INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS timetable (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL DEFAULT 1,
  school_id INTEGER,
  class_id INTEGER,
  section_id INTEGER,
  day INTEGER,                         -- 1..7 (Mon..Sun)
  period_id INTEGER,
  subject_id INTEGER,
  teacher_id INTEGER,
  room TEXT
);

-- ---------- Documents ----------
CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL DEFAULT 1,
  owner_type TEXT NOT NULL,            -- student | staff | school
  owner_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  doc_type TEXT,
  file_path TEXT,
  file_size INTEGER,
  is_sensitive INTEGER DEFAULT 0,
  uploaded_by INTEGER,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ---------- Certificates ----------
CREATE TABLE IF NOT EXISTS certificates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL DEFAULT 1,
  student_id INTEGER,
  certificate_no TEXT,
  type TEXT DEFAULT 'bonafide',        -- bonafide | transfer | character | study | participation | custom
  title TEXT,
  content JSON,
  issue_date TEXT,
  issued_by INTEGER,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ---------- Notifications ----------
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL DEFAULT 1,
  user_id INTEGER NOT NULL,
  title TEXT,
  body TEXT,
  type TEXT DEFAULT 'info',
  link TEXT,
  is_read INTEGER DEFAULT 0,
  is_important INTEGER DEFAULT 0,
  is_archived INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ---------- Audit Logs ----------
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL DEFAULT 1,
  user_id INTEGER,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id INTEGER,
  details JSON,
  ip TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ---------- Settings ----------
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL DEFAULT 1,
  key TEXT NOT NULL,
  value JSON,
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(org_id, key)
);

-- ---------- Sessions ----------
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT UNIQUE NOT NULL,
  jti TEXT UNIQUE,
  ip TEXT,
  user_agent TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  expires_at TEXT,
  last_active TEXT
);

-- ---------- Password Resets ----------
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TEXT,
  used INTEGER DEFAULT 0
);

-- ---------- Indexes ----------
CREATE INDEX IF NOT EXISTS idx_students_school ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(current_class_id);
CREATE INDEX IF NOT EXISTS idx_students_name ON students(name);
CREATE INDEX IF NOT EXISTS idx_attendance_person ON attendance(person_type, person_id, date);
CREATE INDEX IF NOT EXISTS idx_marks_exam ON marks(exam_id, student_id);
CREATE INDEX IF NOT EXISTS idx_marks_student ON marks(student_id);
CREATE INDEX IF NOT EXISTS idx_results_exam ON results(exam_id);
CREATE INDEX IF NOT EXISTS idx_notices_status ON notices(status);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_users_school ON users(school_id);
CREATE INDEX IF NOT EXISTS idx_staff_school ON staff(school_id);
CREATE INDEX IF NOT EXISTS idx_timetable_class ON timetable(school_id, class_id, section_id, day);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_fees_student ON fee_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_student ON payments(student_id);
