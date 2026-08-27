import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const DB_PATH = path.join(DATA_DIR, 'aseca.db');

export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/* ============================ SCHEMA ============================ */
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer',
  school_id INTEGER,
  phone TEXT,
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS schools (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT,
  name TEXT NOT NULL,
  ol_chiki_name TEXT,
  type TEXT DEFAULT 'Ol-Itun Ashra',
  village TEXT, po TEXT, ps TEXT, district TEXT, pin TEXT, state TEXT DEFAULT 'Odisha',
  headmaster TEXT, phone TEXT, email TEXT,
  affiliation_no TEXT, affiliation_date TEXT, established TEXT,
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  school_id INTEGER NOT NULL,
  admission_no TEXT, roll_no TEXT,
  name TEXT NOT NULL, name_odia TEXT, name_santali TEXT,
  dob TEXT, gender TEXT, blood_group TEXT, photo TEXT,
  aadhaar TEXT, aadhaar_doc TEXT,
  father_name TEXT, father_aadhaar TEXT,
  mother_name TEXT, mother_aadhaar TEXT,
  guardian_name TEXT, guardian_mobile TEXT,
  village TEXT, block TEXT, district TEXT, state TEXT, pin TEXT,
  category TEXT, caste_doc TEXT,
  academic_year TEXT, class TEXT, section TEXT,
  admission_date TEXT, previous_school TEXT,
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS teachers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  school_id INTEGER NOT NULL,
  name TEXT NOT NULL, designation TEXT, qualification TEXT,
  phone TEXT, email TEXT, aadhaar TEXT, subject_spec TEXT,
  join_date TEXT, status TEXT DEFAULT 'active', photo TEXT
);
CREATE TABLE IF NOT EXISTS staff (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  school_id INTEGER NOT NULL,
  name TEXT NOT NULL, designation TEXT, phone TEXT,
  join_date TEXT, status TEXT DEFAULT 'active', duties TEXT
);
CREATE TABLE IF NOT EXISTS smc_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  school_id INTEGER NOT NULL,
  sl_no INTEGER, name TEXT NOT NULL, father_name TEXT,
  designation TEXT, mobile TEXT, signature_status TEXT DEFAULT 'pending'
);
CREATE TABLE IF NOT EXISTS subjects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  school_id INTEGER DEFAULT 0,
  name TEXT NOT NULL, code TEXT, class_level TEXT,
  paper_group TEXT, max_marks INTEGER DEFAULT 100, is_active INTEGER DEFAULT 1
);
CREATE TABLE IF NOT EXISTS exams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  school_id INTEGER NOT NULL,
  name TEXT NOT NULL, session TEXT, standard TEXT,
  exam_center TEXT, center_code TEXT, exam_date TEXT, status TEXT DEFAULT 'published'
);
CREATE TABLE IF NOT EXISTS exam_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  exam_id INTEGER NOT NULL,
  student_id INTEGER,
  roll_no TEXT, student_name TEXT, mother_name TEXT, father_name TEXT, dob TEXT,
  mil1 INTEGER, mil2 INTEGER, mil3 INTEGER, mil4 INTEGER,
  odia INTEGER, english INTEGER,
  total INTEGER, result TEXT, grade TEXT
);
CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  school_id INTEGER NOT NULL, student_id INTEGER NOT NULL,
  date TEXT NOT NULL, status TEXT NOT NULL, note TEXT,
  UNIQUE(student_id, date)
);
CREATE TABLE IF NOT EXISTS teacher_attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  school_id INTEGER NOT NULL, teacher_id INTEGER NOT NULL,
  date TEXT NOT NULL, status TEXT NOT NULL, note TEXT,
  UNIQUE(teacher_id, date)
);
CREATE TABLE IF NOT EXISTS timetable (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  school_id INTEGER NOT NULL, class TEXT, section TEXT,
  day TEXT, period INTEGER, start_time TEXT, end_time TEXT,
  subject TEXT, teacher TEXT
);
CREATE TABLE IF NOT EXISTS hostels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  school_id INTEGER NOT NULL, name TEXT NOT NULL,
  type TEXT, warden TEXT, capacity INTEGER DEFAULT 0, occupied INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS hostel_allocations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hostel_id INTEGER NOT NULL, room_no TEXT, student_id INTEGER,
  student_name TEXT, bed TEXT, check_in TEXT, status TEXT DEFAULT 'boarding'
);
CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  school_id INTEGER NOT NULL, title TEXT NOT NULL, author TEXT,
  isbn TEXT, category TEXT, copies INTEGER DEFAULT 1, available INTEGER DEFAULT 1,
  pdf_file TEXT
);
CREATE TABLE IF NOT EXISTS book_issues (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER NOT NULL, member_type TEXT, member_id INTEGER, member_name TEXT,
  issue_date TEXT, due_date TEXT, return_date TEXT, status TEXT DEFAULT 'issued'
);
CREATE TABLE IF NOT EXISTS notices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  school_id INTEGER DEFAULT 0, title TEXT NOT NULL, body TEXT,
  category TEXT, priority TEXT DEFAULT 'normal',
  date TEXT DEFAULT (date('now')), attachment TEXT, audience TEXT DEFAULT 'all'
);
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  school_id INTEGER DEFAULT 0, title TEXT NOT NULL, description TEXT,
  date TEXT, venue TEXT, category TEXT
);
CREATE TABLE IF NOT EXISTS media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT, file_path TEXT, type TEXT, size INTEGER,
  uploaded_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS cms_pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL, title TEXT, blocks TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER, username TEXT, action TEXT, entity TEXT, detail TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
`);

/* ============================ HELPERS ============================ */
export function gradeFor(m: { mil1: number; mil2: number; mil3: number; mil4: number; odia: number; english: number }) {
  const vals = [m.mil1, m.mil2, m.mil3, m.mil4, m.odia, m.english].map((v) => Number(v) || 0);
  const total = vals.reduce((a, b) => a + b, 0);
  const PASS = 30;
  const failedPaper = vals.some((v) => v < PASS);
  const pct = (total / 600) * 100;
  let grade = 'F';
  if (!failedPaper) {
    if (pct >= 80) grade = 'A+';
    else if (pct >= 70) grade = 'A';
    else if (pct >= 60) grade = 'B';
    else if (pct >= 50) grade = 'C';
    else if (pct >= 40) grade = 'D';
    else if (pct >= 33) grade = 'E';
  }
  const result = failedPaper || pct < 33 ? 'FAIL' : 'PASS';
  return { total, result, grade, pct: Math.round(pct * 10) / 10 };
}

export function maskAadhaar(a?: string | null) {
  if (!a) return '';
  const digits = a.replace(/\D/g, '');
  if (digits.length < 12) return a;
  return 'XXXX-XXXX-' + digits.slice(8, 12);
}

/* ============================ SEED ============================ */
function seed() {
  const count = (db.prepare('SELECT COUNT(*) c FROM users').get() as any).c;
  if (count > 0) return;

  const hash = (p: string) => bcrypt.hashSync(p, 10);
  const insUser = db.prepare(`INSERT INTO users (name,email,password_hash,role,school_id,phone) VALUES (?,?,?,?,?,?)`);
  insUser.run('ASECA Central Administrator', 'admin@aseca.org', hash('admin@123'), 'super_admin', null, '9000000001');
  insUser.run('Branch Officer — Dangachua', 'branch@aseca.org', hash('branch@123'), 'admin', 1, '9000000002');
  insUser.run('Bhagaban Murmu (Headmaster)', 'bhagaban@aseca.org', hash('school@123'), 'principal', 1, '9000000003');
  insUser.run('Shyamsundar Majhi (Teacher)', 'teacher@aseca.org', hash('school@123'), 'teacher', 1, '9000000004');
  insUser.run('Ramdulari Murmu (Lady Teacher)', 'ramdulari@aseca.org', hash('school@123'), 'teacher', 1, '9000000005');

  const insSchool = db.prepare(`INSERT INTO schools
    (code,name,ol_chiki_name,type,village,po,ps,district,pin,state,headmaster,phone,email,affiliation_no,affiliation_date,established,status)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  insSchool.run('HH-OIA-026', 'HANS HANSLI OL-ITUN ASHRA, DANGACHUA', 'ᱦᱟᱸᱥ ᱦᱟᱸᱥᱞᱤ ᱚᱞ ᱤᱴᱩᱱ ᱟᱥᱨᱟ, ᱫᱟᱸᱜᱩᱣᱟᱹ', 'Ol-Itun Ashra',
    'Dangachua', 'Bidyadharpur', 'Soso', 'Kendujhar', '758078', 'Odisha',
    'Bhagaban Murmu', '9430000001', 'hanshansli@aseca.org', 'ASECA/OIA/2026/026', '2026-01-15', '1998', 'active');
  insSchool.run('SK-OIA-027', 'SIDA KANHU OL-ITUN ASHRA, HARADABADI', 'ᱥᱤᱫᱚ ᱠᱟᱹᱱᱦᱩ ᱚᱞ ᱤᱴᱩᱱ ᱟᱥᱨᱟ, ᱦᱟᱲᱟᱫᱟᱵᱟᱹᱰᱤ', 'Ol-Itun Ashra',
    'Haradabadi', 'Hadagarh', 'Soso', 'Kendujhar', '758023', 'Odisha',
    'Dukhabandhu Murmu', '9430000002', 'sidakanhu@aseca.org', 'ASECA/OIA/2026/027', '2026-02-02', '2003', 'active');
  insSchool.run('MB-OIA-028', 'MARANG BURU OL-ITUN ASHRA, BINAPATIA', 'ᱢᱟᱨᱟᱝ ᱵᱩᱨᱩ ᱚᱞ ᱤᱴᱩᱱ ᱟᱥᱨᱟ, ᱵᱤᱱᱟᱯᱟᱴᱤᱭᱟᱹ', 'Ol-Itun Ashra',
    'Binapatia', 'Bidyadharpur', 'Soso', 'Kendujhar', '758078', 'Odisha',
    'Kisun Majhi', '9430000003', 'marangburu@aseca.org', 'ASECA/OIA/2026/028', '2026-02-20', '2010', 'renewal_due');

  /* ---- SMC seed (11 members per school) ---- */
  const insSmc = db.prepare(`INSERT INTO smc_members (school_id,sl_no,name,father_name,designation,mobile,signature_status) VALUES (?,?,?,?,?,?,?)`);
  const smc: Record<number, [string, string, string, string][]> = {
    1: [
      ['Kisun Majhi', 'Late Rupa Majhi', 'Chairman', '9430100001'],
      ['Surendra Murmu', 'Gopinath Murmu', 'Secretary', '9430100002'],
      ['Surendra Majhi', 'Bada Majhi', 'Treasurer', '9430100003'],
      ['Bhagaban Murmu', 'Mohan Murmu', 'Headmaster', '9430100004'],
      ['Shyamsundar Majhi', 'Kalia Majhi', 'Asst. Teacher', '9430100005'],
      ['Ramdulari Murmu', 'Suku Murmu', 'Lady Teacher', '9430100006'],
      ['Bhagaban Murmu', 'Chaitan Murmu', 'Executive Member', '9430100007'],
      ['Khelaram Murmu', 'Dhana Murmu', 'Executive Member', '9430100008'],
      ['Ranku Beshra', 'Luku Beshra', 'Executive Member', '9430100009'],
      ['Balaram Marandi', 'Siba Marandi', 'Executive Member', '9430100010'],
      ['Sanjay Murmu', 'Raghunath Murmu', 'Executive Member', '9430100011'],
    ],
    2: [
      ['Khelaram Kisku', 'Late Soma Kisku', 'Chairman', '9430200001'],
      ['Sankhei Kisku', 'Mangu Kisku', 'Secretary', '9430200002'],
      ['Rupei Hansdah', 'Chandu Hansdah', 'Treasurer', '9430200003'],
      ['Dukhabandhu Murmu', 'Rama Murmu', 'Headmaster', '9430200004'],
      ['Raisen Murmu', 'Pandu Murmu', 'Asst. Teacher', '9430200005'],
      ['Sabita Majhi', 'Benu Majhi', 'Lady Teacher', '9430200006'],
      ['Sukadev Hansdah', 'Jaga Hansdah', 'Executive Member', '9430200007'],
      ['Deepu Soren', 'Tala Soren', 'Executive Member', '9430200008'],
      ['Deba Murmu', 'Kartik Murmu', 'Executive Member', '9430200009'],
      ['Kalandi Soren', 'Moti Soren', 'Executive Member', '9430200010'],
      ['Sankarsan Murmu', 'Hadu Murmu', 'Executive Member', '9430200011'],
    ],
    3: [
      ['Nimbai Murmu', 'Late Chandra Murmu', 'Chairman', '9430300001'],
      ['Kuna Hembram', 'Sanu Hembram', 'Secretary', '9430300002'],
      ['Mohan Murmu', 'Dula Murmu', 'Treasurer', '9430300003'],
      ['Kisun Majhi', 'Rupa Majhi', 'Headmaster', '9430300004'],
      ['Laxman Tudu', 'Baya Tudu', 'Asst. Teacher', '9430300005'],
      ['Radhika Soren', 'Phula Soren', 'Lady Teacher', '9430300006'],
      ['Rencha Marandi', 'Gandha Marandi', 'Executive Member', '9430300007'],
      ['Charan Tudu', 'Mangka Tudu', 'Executive Member', '9430300008'],
      ['Ashok Soren', 'Durga Soren', 'Executive Member', '9430300009'],
      ['Bikram Hembram', 'Sundar Hembram', 'Executive Member', '9430300010'],
      ['Bagharai Murmu', 'Kanda Murmu', 'Executive Member', '9430300011'],
    ],
  };
  for (const [sid, members] of Object.entries(smc)) {
    members.forEach((mem, i) => insSmc.run(Number(sid), i + 1, mem[0], mem[1], mem[2], mem[3], i < 6 ? 'signed' : 'pending'));
  }

  /* ---- Teachers ---- */
  const insT = db.prepare(`INSERT INTO teachers (school_id,name,designation,qualification,phone,email,subject_spec,join_date,status) VALUES (?,?,?,?,?,?,?,?,?)`);
  const teachers: [number, string, string, string, string, string, string, string][] = [
    [1, 'Bhagaban Murmu', 'Headmaster', 'B.A, B.Ed', '9430100004', 'bhagaban@aseca.org', 'Santali (Ol Chiki)', '2005-07-01'],
    [1, 'Shyamsundar Majhi', 'Asst. Teacher', 'B.A, C.T', '9430100005', 'shyamsundar@aseca.org', 'Mathematics', '2011-08-12'],
    [1, 'Ramdulari Murmu', 'Lady Teacher', 'I.A, C.T', '9430100006', 'ramdulari@aseca.org', 'Odia / MIL', '2015-09-01'],
    [1, 'Ramesh Hansdah', 'Asst. Teacher', 'M.A, B.Ed', '9430100012', 'ramesh.h@aseca.org', 'English', '2018-07-16'],
    [2, 'Dukhabandhu Murmu', 'Headmaster', 'B.A, B.Ed', '9430200004', 'dukhabandhu@aseca.org', 'Santali (Ol Chiki)', '2004-07-01'],
    [2, 'Raisen Murmu', 'Asst. Teacher', 'B.Sc, B.Ed', '9430200005', 'raisen@aseca.org', 'Science', '2013-08-01'],
    [2, 'Sabita Majhi', 'Lady Teacher', 'I.A, C.T', '9430200006', 'sabita@aseca.org', 'Social Science', '2017-09-05'],
    [3, 'Kisun Majhi', 'Headmaster', 'B.A, C.T', '9430300004', 'kisun.m@aseca.org', 'Santali (Ol Chiki)', '2010-07-01'],
    [3, 'Laxman Tudu', 'Asst. Teacher', 'B.A, B.Ed', '9430300005', 'laxman@aseca.org', 'Mathematics', '2014-08-01'],
    [3, 'Radhika Soren', 'Lady Teacher', 'B.A, C.T', '9430300006', 'radhika@aseca.org', 'Odia / MIL', '2019-07-20'],
  ];
  teachers.forEach((t) => insT.run(...t, 'active'));

  /* ---- Staff ---- */
  const insSt = db.prepare(`INSERT INTO staff (school_id,name,designation,phone,join_date,status,duties) VALUES (?,?,?,?,?,?,?)`);
  [
    [1, 'Ganga Murmu', 'Cook (Mid-day Meal)', '9430110001', '2012-06-01', 'active', 'Mid-day meal preparation, kitchen hygiene'],
    [1, 'Suku Marandi', 'Watchman', '9430110002', '2015-03-10', 'active', 'Night watch, gate keeping'],
    [1, 'Ahalya Beshra', 'Peon / Cleaner', '9430110003', '2019-08-01', 'active', 'Office assistance, classroom cleaning'],
    [2, 'Budhrai Soren', 'Cook (Mid-day Meal)', '9430210001', '2014-07-01', 'active', 'Mid-day meal preparation'],
    [2, 'Mangal Tudu', 'Watchman', '9430210002', '2018-01-15', 'active', 'Night watch'],
    [3, 'Phulo Murmu', 'Cook (Mid-day Meal)', '9430310001', '2016-06-20', 'active', 'Mid-day meal preparation'],
  ].forEach((s) => insSt.run(...(s as [number, string, string, string, string, string, string])));

  /* ---- Subjects (global + school) ---- */
  const insSub = db.prepare(`INSERT INTO subjects (school_id,name,code,class_level,paper_group,max_marks) VALUES (?,?,?,?,?,?)`);
  [
    [0, 'MIL-I — Santali Paper 1', 'MIL1', 'Matric & +2', 'MIL (Santali)', 100],
    [0, 'MIL-II — Santali Paper 2', 'MIL2', 'Matric & +2', 'MIL (Santali)', 100],
    [0, 'MIL-III — Santali Paper 3', 'MIL3', 'Matric & +2', 'MIL (Santali)', 100],
    [0, 'MIL-IV — Santali Paper 4', 'MIL4', 'Matric & +2', 'MIL (Santali)', 100],
    [0, 'ODIA', 'ODIA', 'Matric & +2', 'MIL (Odia)', 100],
    [0, 'ENGLISH', 'ENG', 'Matric & +2', 'Language', 100],
    [0, 'Mathematics', 'MATH', 'Primary / Upper Primary', 'Core', 100],
    [0, 'General Science', 'SCI', 'Primary / Upper Primary', 'Core', 100],
    [0, 'Social Studies', 'SST', 'Primary / Upper Primary', 'Core', 100],
    [0, 'Ol Chiki Lipi Parichay', 'OLC', 'All Classes', 'Heritage', 50],
  ].forEach((s) => insSub.run(...(s as [number, string, string, string, string, number])));

  /* ---- Students ---- */
  const insStu = db.prepare(`INSERT INTO students
    (school_id,admission_no,roll_no,name,name_odia,name_santali,dob,gender,blood_group,aadhaar,father_name,father_aadhaar,mother_name,mother_aadhaar,guardian_name,guardian_mobile,village,block,district,state,pin,category,academic_year,class,section,admission_date,previous_school,status)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);

  const matric: [string, string, string, string, string, string, number, number, number, number, number, number][] = [
    ['Urmila Hembram', '36SSMS026001', 'Sona Hembram', 'Rajaram Hembram', '1993-04-04', 'F', 33, 68, 70, 53, 46, 49],
    ['Benudhar Murmu', '36SSMS026002', 'Sugi Murmu', 'Kanhu Murmu', '2009-02-22', 'M', 43, 60, 74, 38, 49, 46],
    ['Suru Beshra', '36SSMS026003', 'Sara Beshra', 'Purna Chandra Beshra', '2006-09-08', 'M', 53, 45, 52, 65, 62, 73],
    ['Anant Kisku', '36SSMS026004', 'Parbati Kisku', 'Rangadhar Kisku', '2006-06-15', 'M', 33, 48, 43, 32, 33, 41],
  ];
  const plus2Names = [
    'Sangita Murmu', 'Swati Murmu', 'Laxmipriya Murmu', 'Damini Murmu', 'Delha Beshra',
    'Salama Marandi', 'Lachhaman Murmu', 'Jagan Majhi', 'Fula Hembram', 'Salama Marandi (Jr.)',
    'Ramdulari Murmu', 'Bhagaban Murmu',
  ];
  const stuIds: number[] = [];
  matric.forEach((s, i) => {
    const info = insStu.run(1, 'HH/ADM/2025/' + (100 + i), s[1], s[0], '', '', s[4], s[5] === 'F' ? 'Female' : 'Male',
      i % 2 ? 'B+' : 'O+', '36' + String(1234 + i).padStart(10, '0'), s[3], '', s[2], '',
      s[3], '943' + String(400 + i).padStart(7, '0'), 'Dangachua', 'Soso', 'Kendujhar', 'Odisha', '758078', 'ST',
      '2025-26', 'Matric (Class X)', 'A', '2025-06-15', 'Ragudia Primary School', 'active');
    stuIds.push(Number(info.lastInsertRowid));
  });
  const plus2Ids: number[] = [];
  plus2Names.forEach((nm, i) => {
    const roll = '36SS+2S026' + String(1 + i).padStart(3, '0');
    const surname = nm.split(' ')[1] || 'Murmu';
    const info = insStu.run(1, 'HH/ADM/2025/' + (200 + i), roll, nm, '', '',
      `200${6 + (i % 4)}-0${1 + (i % 9)}-1${i % 9}`, i % 3 === 0 ? 'Female' : 'Male',
      ['A+', 'B+', 'O+', 'AB+'][i % 4], '36' + String(5600 + i).padStart(10, '0'),
      'Mohan ' + surname, '', 'Pramila ' + surname, '',
      'Guardian-' + nm, '943' + String(500 + i).padStart(7, '0'),
      i % 2 ? 'Haradabadi' : 'Dangachua', 'Soso', 'Kendujhar', 'Odisha', i % 2 ? '758023' : '758078', 'ST',
      '2025-26', '+2 (Class XII)', 'B', '2025-07-01', 'Hans Hansli Ol-Itun Ashra', 'active');
    plus2Ids.push(Number(info.lastInsertRowid));
  });
  // A few students in schools 2 & 3 for roster realism
  const extra: [number, string, string, string][] = [
    [2, 'Dasarath Soren', 'Class VIII', 'M'], [2, 'Menaka Murmu', 'Class VII', 'F'],
    [2, 'Bipin Kisku', 'Class IX', 'M'], [2, 'Rina Hansdah', 'Class VI', 'F'],
    [3, 'Sambhu Tudu', 'Class VIII', 'M'], [3, 'Parbati Marandi', 'Class VII', 'F'],
    [3, 'Gokul Murmu', 'Class IX', 'M'],
  ];
  extra.forEach((e, i) => {
    insStu.run(e[0], `ADM/2025/${300 + i}`, `R-${e[0]}-${i + 1}`, e[1], '', '', `201${i % 9}-0${(i % 8) + 1}-1${i}`,
      e[3] === 'F' ? 'Female' : 'Male', '', '', `Father of ${e[1]}`, '', `Mother of ${e[1]}`, '',
      `Guardian of ${e[1]}`, '943' + String(600 + i).padStart(7, '0'),
      e[0] === 2 ? 'Haradabadi' : 'Binapatia', 'Soso', 'Kendujhar', 'Odisha', e[0] === 2 ? '758023' : '758078',
      'ST', '2025-26', e[2], 'A', '2025-07-10', 'Local Primary School', 'active');
  });

  /* ---- Exams & results ---- */
  const insExam = db.prepare(`INSERT INTO exams (school_id,name,session,standard,exam_center,center_code,exam_date,status) VALUES (?,?,?,?,?,?,?,?)`);
  const e1 = insExam.run(1, 'MATRIC EXAMINATION — SUMMER-2026-27', '2026-27', 'Matric (Class X)', 'Ragudia Primary School, Ragudia', '026', '2026-04-10', 'published');
  const e2 = insExam.run(1, '+2 EXAMINATION — SUMMER-2026-27', '2026-27', '+2 (Class XII)', 'Ragudia Primary School, Ragudia', '026', '2026-04-14', 'published');
  const insRes = db.prepare(`INSERT INTO exam_results
    (exam_id,student_id,roll_no,student_name,mother_name,father_name,dob,mil1,mil2,mil3,mil4,odia,english,total,result,grade)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  matric.forEach((s, i) => {
    const m = { mil1: s[6], mil2: s[7], mil3: s[8], mil4: s[9], odia: s[10], english: s[11] };
    const g = gradeFor(m as any);
    insRes.run(Number(e1.lastInsertRowid), stuIds[i], s[1], s[0], s[2], s[3], s[4],
      m.mil1, m.mil2, m.mil3, m.mil4, m.odia, m.english, g.total, g.result, g.grade);
  });
  // Deterministic pseudo marks for +2 students
  plus2Names.forEach((nm, i) => {
    const base = 42 + ((i * 13) % 45);
    const mk = (k: number) => Math.max(28, Math.min(92, base + ((i * 7 + k * 11) % 38) - 14));
    const m = { mil1: mk(0), mil2: mk(1), mil3: mk(2), mil4: mk(3), odia: mk(4), english: mk(5) };
    const g = gradeFor(m as any);
    const roll = '36SS+2S026' + String(1 + i).padStart(3, '0');
    insRes.run(Number(e2.lastInsertRowid), plus2Ids[i], roll, nm,
      'Sita ' + nm.split(' ')[1], 'Mohan ' + nm.split(' ')[1], `200${6 + (i % 4)}-0${1 + (i % 9)}-1${i % 9}`,
      m.mil1, m.mil2, m.mil3, m.mil4, m.odia, m.english, g.total, g.result, g.grade);
  });

  /* ---- Attendance (last 14 school days) ---- */
  const insAtt = db.prepare(`INSERT OR IGNORE INTO attendance (school_id,student_id,date,status,note) VALUES (?,?,?,?,?)`);
  const allStu = db.prepare('SELECT id, school_id FROM students').all() as { id: number; school_id: number }[];
  for (let d = 14; d >= 1; d--) {
    const day = new Date();
    day.setDate(day.getDate() - d);
    if (day.getDay() === 0) continue;
    const ds = day.toISOString().slice(0, 10);
    allStu.forEach((s, i) => {
      const r = (i * 31 + d * 17) % 100;
      const status = r < 86 ? 'present' : r < 94 ? 'absent' : 'late';
      insAtt.run(s.school_id, s.id, ds, status, status === 'late' ? 'Reached after prayer' : '');
    });
  }

  /* ---- Timetable (school 1, Class X) ---- */
  const insTT = db.prepare(`INSERT INTO timetable (school_id,class,section,day,period,start_time,end_time,subject,teacher) VALUES (?,?,?,?,?,?,?,?,?)`);
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const slots = [
    ['10:00', '10:45'], ['10:45', '11:30'], ['11:45', '12:30'],
    ['12:30', '13:15'], ['14:00', '14:45'], ['14:45', '15:30'],
  ];
  const grid = [
    ['MIL-I Santali', 'Bhagaban Murmu'], ['Mathematics', 'Shyamsundar Majhi'], ['English', 'Ramesh Hansdah'],
    ['ODIA', 'Ramdulari Murmu'], ['Ol Chiki Lipi', 'Bhagaban Murmu'], ['Library / Sports', 'Ramesh Hansdah'],
  ];
  days.forEach((day, di) => {
    slots.forEach((slot, pi) => {
      const g = grid[(di + pi) % grid.length];
      insTT.run(1, 'Matric (Class X)', 'A', day, pi + 1, slot[0], slot[1], g[0], g[1]);
    });
  });

  /* ---- Hostels ---- */
  const insH = db.prepare(`INSERT INTO hostels (school_id,name,type,warden,capacity,occupied) VALUES (?,?,?,?,?,?)`);
  const h1 = insH.run(1, 'Birsa Boys Hostel', 'Boys', 'Suku Marandi', 40, 3);
  const h2 = insH.run(1, 'Phulo-Jhano Girls Hostel', 'Girls', 'Ahalya Beshra', 30, 1);
  const insHA = db.prepare(`INSERT INTO hostel_allocations (hostel_id,room_no,student_id,student_name,bed,check_in,status) VALUES (?,?,?,?,?,?,?)`);
  insHA.run(Number(h1.lastInsertRowid), 'B-1', stuIds[1], 'Benudhar Murmu', 'B1-2', '2025-07-05', 'boarding');
  insHA.run(Number(h1.lastInsertRowid), 'B-2', stuIds[3], 'Anant Kisku', 'B2-1', '2025-07-05', 'boarding');
  insHA.run(Number(h1.lastInsertRowid), 'B-3', plus2Ids[6], 'Lachhaman Murmu', 'B3-3', '2025-07-06', 'boarding');
  insHA.run(Number(h2.lastInsertRowid), 'G-1', stuIds[0], 'Urmila Hembram', 'G1-1', '2025-07-05', 'boarding');
  db.prepare('UPDATE hostels SET occupied=3 WHERE id=?').run(Number(h1.lastInsertRowid));
  db.prepare('UPDATE hostels SET occupied=1 WHERE id=?').run(Number(h2.lastInsertRowid));

  /* ---- Library ---- */
  const insBk = db.prepare(`INSERT INTO books (school_id,title,author,isbn,category,copies,available) VALUES (?,?,?,?,?,?,?)`);
  const books: [string, string, string, string, number][] = [
    ['Ol Chiki Lipa Puthi (Primer)', 'Pandit Raghunath Murmu', 'OLC-001', 'Santali / Ol Chiki', 20],
    ['Santali Sahitya Parichay', 'Sukhlal Murmu', 'SAN-014', 'Santali Literature', 12],
    ['Hital (Santali Folk Tales)', 'Somai Tudu', 'SAN-022', 'Folklore', 8],
    ['Odia Sahitya Manjari', 'B. Mohapatra', 'ODI-031', 'Odia Literature', 10],
    ['English Grammar & Composition', 'Wren & Martin', 'ENG-044', 'English', 15],
    ['Mathematics for Class X', 'B. K. Das', 'MAT-052', 'Mathematics', 10],
    ['General Science (Matric)', 'N. Panda', 'SCI-063', 'Science', 10],
    ['Social Studies Atlas', 'Orient BlackSwan', 'SST-070', 'Social Science', 6],
    ['Birsa Munda — A Biography', 'Mahasweta Devi', 'BIO-081', 'Biography', 5],
    ['History of Santal Hul (1855)', 'D. Trofimov', 'HIS-092', 'History', 6],
    ['Pandit Raghunath Murmu — Life & Works', 'K. Saren', 'BIO-096', 'Biography', 7],
    ['Santal Pargana Gazetteer', 'Govt. of Bihar', 'REF-101', 'Reference', 3],
  ];
  books.forEach((b, i) => {
    const r = insBk.run(1, b[0], b[1], b[2], b[3], b[4], b[4] - (i < 3 ? 1 : 0));
    if (i < 3) {
      db.prepare(`INSERT INTO book_issues (book_id,member_type,member_id,member_name,issue_date,due_date,status) VALUES (?,?,?,?,?,?,?)`)
        .run(Number(r.lastInsertRowid), 'student', stuIds[i % stuIds.length], matric[i % 4][0], '2026-08-10', '2026-09-10', 'issued');
    }
  });

  /* ---- Notices ---- */
  const insN = db.prepare(`INSERT INTO notices (school_id,title,body,category,priority,date,audience) VALUES (?,?,?,?,?,?,?)`);
  [
    [0, 'Affiliation/Renewal for Ol-Itun Ashra — 2026-27', 'All Ol-Itun Ashras under ASECA Dangachua branch must submit the 11-member School Managing Committee list and renewal form before 30 September 2026. Forms are generated from the SMC module.', 'Affiliation', 'high', '2026-08-15', 'all'],
    [0, 'Matric & +2 Examination Schedule — SUMMER 2026-27', 'Examinations will be conducted at Ragudia Primary School centre (Centre Code 026). Matric from 10 April 2026 and +2 from 14 April 2026. MIL Santali Papers I–IV, Odia and English as per syllabus.', 'Examination', 'high', '2026-08-12', 'students'],
    [1, 'Ol Chiki Lipi Workshop', 'A weekend workshop on Ol Chiki typography and Santali literary reading will be held at Hans Hansli Ol-Itun Ashra. All teachers and SMC members are invited.', 'Academic', 'normal', '2026-08-20', 'all'],
    [2, 'SMC Meeting — Sida Kanhu', 'Monthly School Managing Committee meeting at Haradabadi. Agenda: hostel repair, library books, attendance review.', 'Meeting', 'normal', '2026-08-25', 'staff'],
    [0, 'Independence Day & Santal Hul Remembrance', 'Cultural programme on 15 August featuring Santali song, dance and recitation in Ol Chiki. Families welcome.', 'Event', 'normal', '2026-08-10', 'all'],
    [0, 'Aadhaar Verification Camp', 'Students are requested to bring Aadhaar cards for the identity verification drive. Documents are stored securely and displayed masked.', 'General', 'normal', '2026-08-05', 'students'],
  ].forEach((n) => insN.run(...(n as [number, string, string, string, string, string, string])));

  /* ---- Events ---- */
  const insE = db.prepare(`INSERT INTO events (school_id,title,description,date,venue,category) VALUES (?,?,?,?,?,?)`);
  [
    [0, 'Santal Hul Memorial Day', 'Commemoration of the Santal Rebellion (1855) with speeches, floral tribute and cultural programme.', '2026-06-30', 'Branch Office, Dangachua', 'Cultural'],
    [0, 'Ol Chiki Divas', 'Celebration of the Ol Chiki script created by Pandit Raghunath Murmu — reading, writing and calligraphy competitions.', '2026-05-15', 'All Ol-Itun Ashras', 'Academic'],
    [0, 'Annual Sports Meet', 'Football, archery, kabaddi and athletics for students of all affiliated schools.', '2026-12-12', 'Ragudia Ground', 'Sports'],
    [1, 'Guardian-Teacher Meeting', 'Quarterly meeting with guardians; progress reports and attendance reviewed.', '2026-09-05', 'Hans Hansli Ol-Itun Ashra', 'Meeting'],
    [0, 'Matric & +2 Examinations', 'SUMMER-2026-27 examinations at Ragudia centre (Code 026).', '2026-04-10', 'Ragudia Primary School', 'Examination'],
  ].forEach((e) => insE.run(...(e as [number, string, string, string, string, string])));

  /* ---- Media placeholders (files added separately) ---- */
  const insM = db.prepare(`INSERT INTO media (title,file_path,type,size) VALUES (?,?,?,?)`);
  insM.run('Branch Office — Dangachua', '/uploads/branch-office.jpg', 'image', 0);
  insM.run('Ol Chiki Workshop', '/uploads/workshop.jpg', 'image', 0);
  insM.run('Annual Cultural Programme', '/uploads/cultural.jpg', 'image', 0);

  /* ---- CMS home page ---- */
  const homeBlocks = [
    { type: 'hero', title: 'BRANCH ASECA DANGACHUA', olchiki: 'ᱚ.ᱟ.ᱮ.ᱥ.ᱮ.ᱠ.ᱮ ᱩᱰᱤᱥᱟ ᱥᱟᱠᱷᱟ ᱫᱟᱸᱜᱩᱣᱟᱹ', subtitle: 'Adivasi Socio-Educational & Cultural Association, Odisha — Branch Office, Dangachua, Kendujhar', tagline: 'Education • Culture • Community', enabled: true },
    { type: 'about', title: 'About the Branch', body: 'The Dangachua branch of ASECA administers Ol-Itun Ashras (Santali-medium schools) and higher secondary institutions across Kendujhar district, promoting education through the Ol Chiki script, preserving Santali culture, and strengthening Adivasi communities.', enabled: true },
    { type: 'stats', title: 'Our Reach', enabled: true },
    { type: 'schools', title: 'Affiliated Ol-Itun Ashras', body: 'Schools affiliated and monitored by the Dangachua branch.', enabled: true },
    { type: 'notices', title: 'Notice Board', enabled: true },
    { type: 'events', title: 'Upcoming Events', enabled: true },
    { type: 'contact', title: 'Reach Us', body: 'Branch Office: At-Dangachua, P.O.-Bidyadharpur, P.S.-Soso, Dist-Kendujhar, PIN-758078, Odisha. Head Office: Rairangpur (Regd No-2667/269 of 1964).', enabled: true },
  ];
  db.prepare(`INSERT INTO cms_pages (slug,title,blocks) VALUES (?,?,?)`).run('home', 'Home', JSON.stringify(homeBlocks));
  db.prepare(`INSERT INTO cms_pages (slug,title,blocks) VALUES (?,?,?)`).run('about', 'About ASECA', JSON.stringify([
    { type: 'about', title: 'About ASECA', body: 'ADIVASI SOCIO-EDUCATIONAL & CULTURAL ASSOCIATION, ODISHA (ASECA) works for Adivasi/Santali educational uplift through Ol-Itun Ashras, Ol Chiki literacy, cultural preservation and community development. Head Office: Rairangpur, Regd No-2667/269 of 1964. Branch Office Dangachua: Regd No-77/26 of 2026.', enabled: true },
  ]));

  db.prepare(`INSERT INTO audit_logs (user_id,username,action,entity,detail) VALUES (?,?,?,?,?)`)
    .run(1, 'admin@aseca.org', 'SEED', 'system', 'Database initialized with branch, schools, SMC, students and examination records');

  console.log('[db] Seed complete: 3 schools, SMC committees, 23 students, exams, library, hostels, notices.');
}

seed();
