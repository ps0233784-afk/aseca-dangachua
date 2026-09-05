import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const DB_PATH = path.join(DATA_DIR, 'aseca.db');

let sqlDb: SqlJsDatabase;
let initialized = false;

// Wrapper to provide a familiar API
class DbWrapper {
  private _db!: SqlJsDatabase;
  private _saveTimer: NodeJS.Timeout | null = null;

  async init() {
    const SQL = await initSqlJs();
    if (fs.existsSync(DB_PATH)) {
      const buffer = fs.readFileSync(DB_PATH);
      this._db = new SQL.Database(buffer);
    } else {
      this._db = new SQL.Database();
    }
    sqlDb = this._db;
    initialized = true;
    this.scheduleSave();
  }

  scheduleSave() {
    if (this._saveTimer) return;
    this._saveTimer = setTimeout(() => {
      this._saveTimer = null;
      try {
        const data = this._db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(DB_PATH, buffer);
      } catch (e) {
        console.error('[db] Save error:', e);
      }
    }, 500);
  }

  save() {
    try {
      const data = this._db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(DB_PATH, buffer);
    } catch (e) {
      console.error('[db] Save error:', e);
    }
  }

  exec(sql: string) {
    this._db.run(sql);
    this.scheduleSave();
  }

  prepare(sql: string) {
    const self = this;
    return {
      run(...params: any[]) {
        self._db.run(sql, params.length === 1 && Array.isArray(params[0]) ? params[0] : params);
        self.scheduleSave();
        const lastId = (self._db.exec("SELECT last_insert_rowid() as id")[0]?.values[0][0]) as number;
        return { lastInsertRowid: lastId };
      },
      get(...params: any[]): any {
        const stmt = self._db.prepare(sql);
        if (params.length > 0) {
          stmt.bind(params.length === 1 && Array.isArray(params[0]) ? params[0] : params);
        }
        if (stmt.step()) {
          const row = stmt.getAsObject();
          stmt.free();
          return row;
        }
        stmt.free();
        return undefined;
      },
      all(...params: any[]): any[] {
        const stmt = self._db.prepare(sql);
        if (params.length > 0) {
          stmt.bind(params.length === 1 && Array.isArray(params[0]) ? params[0] : params);
        }
        const results: any[] = [];
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
      },
    };
  }

  get raw() {
    return this._db;
  }
}

export const db = new DbWrapper();

/* ============================ SCHEMA ============================ */
export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS organization (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, ol_chiki_name TEXT, tagline TEXT,
      ho_address TEXT, bo_address TEXT, ho_reg_no TEXT, bo_reg_no TEXT,
      phone TEXT, email TEXT, website TEXT, logo TEXT, favicon TEXT,
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS schools (
      id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, code TEXT UNIQUE NOT NULL, name TEXT NOT NULL,
      ol_chiki_name TEXT, address TEXT, village TEXT, po TEXT, ps TEXT, block TEXT, cluster TEXT,
      district TEXT, pin TEXT, state TEXT DEFAULT 'Odisha', phone TEXT, email TEXT, principal TEXT,
      logo TEXT, photo TEXT, established_year INTEGER, type TEXT DEFAULT 'Ol-Itun Ashra',
      medium TEXT DEFAULT 'Santali', affiliation_no TEXT, affiliation_date TEXT,
      status TEXT DEFAULT 'active', created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS academic_years (
      id TEXT PRIMARY KEY, school_id TEXT NOT NULL, name TEXT NOT NULL, start_date TEXT, end_date TEXT,
      is_active INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')), UNIQUE(school_id, name)
    );
    CREATE TABLE IF NOT EXISTS classes (
      id TEXT PRIMARY KEY, school_id TEXT NOT NULL, name TEXT NOT NULL, display_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS sections (
      id TEXT PRIMARY KEY, class_id TEXT NOT NULL, name TEXT NOT NULL, room TEXT, capacity INTEGER,
      class_teacher_id TEXT, UNIQUE(class_id, name)
    );
    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY, academic_year_id TEXT NOT NULL, name TEXT NOT NULL, odia_name TEXT,
      santali_name TEXT, ol_chiki_name TEXT, code TEXT, full_marks INTEGER DEFAULT 100,
      pass_marks INTEGER DEFAULT 33, theory_marks INTEGER DEFAULT 100, practical_marks INTEGER DEFAULT 0,
      type TEXT DEFAULT 'Theory', display_order INTEGER DEFAULT 0, status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS class_subjects (id TEXT PRIMARY KEY, class_id TEXT NOT NULL, subject_id TEXT NOT NULL, UNIQUE(class_id, subject_id));
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, organization_id TEXT, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL, phone TEXT, photo TEXT, role TEXT DEFAULT 'viewer',
      school_id TEXT, status TEXT DEFAULT 'active', last_login_at TEXT,
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY, school_id TEXT NOT NULL, section_id TEXT, student_id TEXT, admission_no TEXT,
      roll_no TEXT, name TEXT NOT NULL, ol_chiki_name TEXT, odia_name TEXT, dob TEXT, gender TEXT,
      blood_group TEXT, photo TEXT, aadhaar TEXT, father_name TEXT, father_aadhaar TEXT, mother_name TEXT,
      mother_aadhaar TEXT, guardian_name TEXT, guardian_mobile TEXT, village TEXT, block TEXT,
      district TEXT, state TEXT DEFAULT 'Odisha', pin TEXT, category TEXT, admission_date TEXT,
      previous_school TEXT, status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS teachers (
      id TEXT PRIMARY KEY, school_id TEXT NOT NULL, employee_id TEXT, name TEXT NOT NULL, photo TEXT,
      dob TEXT, gender TEXT, qualification TEXT, subject_spec TEXT, designation TEXT, joining_date TEXT,
      phone TEXT, email TEXT, address TEXT, aadhaar TEXT, status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS staff_members (
      id TEXT PRIMARY KEY, school_id TEXT NOT NULL, name TEXT NOT NULL, designation TEXT, phone TEXT,
      join_date TEXT, duties TEXT, status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS smc_members (
      id TEXT PRIMARY KEY, school_id TEXT NOT NULL, sl_no INTEGER, name TEXT NOT NULL, father_name TEXT,
      designation TEXT, responsibility TEXT, biography TEXT, qualification TEXT, experience TEXT,
      photo TEXT, mobile TEXT, email TEXT, school_org TEXT, display_order INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active', signature_status TEXT DEFAULT 'pending', is_public INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY, student_id TEXT NOT NULL, date TEXT NOT NULL, status TEXT NOT NULL, note TEXT,
      UNIQUE(student_id, date)
    );
    CREATE TABLE IF NOT EXISTS teacher_attendance (
      id TEXT PRIMARY KEY, teacher_id TEXT NOT NULL, date TEXT NOT NULL, status TEXT NOT NULL, note TEXT,
      UNIQUE(teacher_id, date)
    );
    CREATE TABLE IF NOT EXISTS exams (
      id TEXT PRIMARY KEY, school_id TEXT NOT NULL, academic_year_id TEXT, name TEXT NOT NULL,
      type TEXT DEFAULT 'Annual', session TEXT, exam_date TEXT, publish_date TEXT,
      status TEXT DEFAULT 'draft', created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS exam_subjects (
      id TEXT PRIMARY KEY, exam_id TEXT NOT NULL, subject_id TEXT NOT NULL,
      full_marks INTEGER DEFAULT 100, pass_marks INTEGER DEFAULT 33, UNIQUE(exam_id, subject_id)
    );
    CREATE TABLE IF NOT EXISTS marks (
      id TEXT PRIMARY KEY, exam_id TEXT NOT NULL, student_id TEXT NOT NULL, subject_id TEXT NOT NULL,
      obtained INTEGER DEFAULT 0, practical INTEGER DEFAULT 0, status TEXT DEFAULT 'draft',
      UNIQUE(exam_id, student_id, subject_id)
    );
    CREATE TABLE IF NOT EXISTS grading_rules (
      id TEXT PRIMARY KEY, grade TEXT NOT NULL, min_percent REAL NOT NULL, max_percent REAL NOT NULL,
      remark TEXT, display_order INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS timetables (
      id TEXT PRIMARY KEY, school_id TEXT NOT NULL, day TEXT NOT NULL, period INTEGER NOT NULL,
      start_time TEXT, end_time TEXT, subject TEXT, teacher TEXT, room TEXT
    );
    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY, school_id TEXT NOT NULL, title TEXT NOT NULL, author TEXT, isbn TEXT,
      publisher TEXT, category TEXT, rack TEXT, copies INTEGER DEFAULT 1, available INTEGER DEFAULT 1,
      cover_image TEXT, pdf_file TEXT, description TEXT,
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS library_transactions (
      id TEXT PRIMARY KEY, book_id TEXT NOT NULL, student_id TEXT NOT NULL, issue_date TEXT,
      due_date TEXT, return_date TEXT, fine REAL DEFAULT 0, status TEXT DEFAULT 'issued'
    );
    CREATE TABLE IF NOT EXISTS notices (
      id TEXT PRIMARY KEY, school_id TEXT NOT NULL, title TEXT NOT NULL, body TEXT,
      category TEXT DEFAULT 'General', priority TEXT DEFAULT 'normal', date TEXT, expiry_date TEXT,
      audience TEXT DEFAULT 'all', status TEXT DEFAULT 'published', attachment TEXT,
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY, school_id TEXT NOT NULL, title TEXT NOT NULL, description TEXT, date TEXT,
      end_date TEXT, venue TEXT, category TEXT,
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS gallery_items (
      id TEXT PRIMARY KEY, title TEXT, description TEXT, file_url TEXT NOT NULL, file_type TEXT DEFAULT 'image',
      album TEXT, display_order INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY, school_id TEXT NOT NULL, title TEXT NOT NULL, description TEXT, photo TEXT,
      category TEXT, type TEXT DEFAULT 'student', date TEXT, display_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY, student_id TEXT, title TEXT NOT NULL, file_url TEXT NOT NULL, file_type TEXT,
      category TEXT, description TEXT, status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS certificates (
      id TEXT PRIMARY KEY, student_id TEXT NOT NULL, type TEXT NOT NULL, data TEXT, pdf_url TEXT,
      issued_date TEXT, created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS hostels (
      id TEXT PRIMARY KEY, school_id TEXT NOT NULL, name TEXT NOT NULL, type TEXT DEFAULT 'Boys',
      capacity INTEGER DEFAULT 0, occupied INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY, title TEXT, file_url TEXT NOT NULL, file_type TEXT, file_size INTEGER DEFAULT 0,
      category TEXT, status TEXT DEFAULT 'active', created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS pages (
      id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, title TEXT, sections TEXT,
      display_order INTEGER DEFAULT 0, status TEXT DEFAULT 'published',
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS page_sections (
      id TEXT PRIMARY KEY, page_slug TEXT, block_type TEXT, title TEXT, content TEXT,
      config TEXT DEFAULT '{}', display_order INTEGER DEFAULT 0, is_visible INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS site_settings (id TEXT PRIMARY KEY, key TEXT UNIQUE NOT NULL, value TEXT);
    CREATE TABLE IF NOT EXISTS dictionary_categories (
      id TEXT PRIMARY KEY, name TEXT UNIQUE NOT NULL, display_order INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS dictionary_entries (
      id TEXT PRIMARY KEY, category_id TEXT, word TEXT NOT NULL, ol_chiki TEXT, roman TEXT,
      odia TEXT, hindi TEXT, english TEXT, pronunciation TEXT, part_of_speech TEXT, definition TEXT,
      example TEXT, synonyms TEXT, antonyms TEXT, related_words TEXT, audio_url TEXT, source TEXT,
      verified INTEGER DEFAULT 0, status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS olchiki_letters (
      id TEXT PRIMARY KEY, character TEXT NOT NULL, name TEXT NOT NULL, roman TEXT,
      sound_url TEXT, example_word TEXT, meaning TEXT, image_url TEXT,
      display_order INTEGER DEFAULT 0, status TEXT DEFAULT 'active'
    );
    CREATE TABLE IF NOT EXISTS olchiki_lessons (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT, cover_image TEXT,
      difficulty TEXT DEFAULT 'beginner', age_group TEXT, display_order INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active', letters TEXT, exercises TEXT, quiz TEXT,
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS olchiki_progress (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, lesson_id TEXT NOT NULL,
      score INTEGER DEFAULT 0, completed INTEGER DEFAULT 0, updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, lesson_id)
    );
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY, user_id TEXT, username TEXT, action TEXT, entity TEXT, detail TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY, user_id TEXT, title TEXT NOT NULL, body TEXT, type TEXT DEFAULT 'info',
      is_read INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS historical_profiles (
      id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, name TEXT NOT NULL, ol_chiki_name TEXT,
      photo TEXT, summary TEXT, biography TEXT, contributions TEXT, timeline TEXT, sources TEXT,
      status TEXT DEFAULT 'published', created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS culture_content (
      id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL, body TEXT, category TEXT,
      photo TEXT, sources TEXT, display_order INTEGER DEFAULT 0, status TEXT DEFAULT 'published',
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS educational_resources (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT, file_url TEXT, link TEXT,
      category TEXT, type TEXT DEFAULT 'document', display_order INTEGER DEFAULT 0,
      status TEXT DEFAULT 'published', created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS enrollments (
      id TEXT PRIMARY KEY, academic_year_id TEXT, class_id TEXT, section_id TEXT,
      student_id TEXT NOT NULL, roll_no TEXT, created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(academic_year_id, student_id)
    );
  `);

  // Create indexes
  try {
    db.exec('CREATE INDEX IF NOT EXISTS idx_students_school ON students(school_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_teachers_school ON teachers(school_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id, date)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_notices_school ON notices(school_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at)');
  } catch (e) { /* Indexes may already exist */ }

  db.save();
}

/* ============================ HELPERS ============================ */
export function maskAadhaar(aadhaar?: string | null): string {
  if (!aadhaar) return '';
  const digits = String(aadhaar).replace(/\D/g, '');
  if (digits.length < 12) return aadhaar as string;
  return 'XXXX-XXXX-' + digits.slice(8, 12);
}

export function generateId(): string {
  return crypto.randomBytes(16).toString('hex');
}
