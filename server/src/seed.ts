import { hashPassword } from './lib/auth';
import { db, initSchema, generateId } from './db';

async function seed() {
  await db.init();
  initSchema();

  console.log('[seed] Starting database seed...');

  const userCount = (db.prepare('SELECT COUNT(*) as c FROM users').get() as any).c;
  if (userCount > 0) { console.log('[seed] Database already seeded. Skipping.'); process.exit(0); }

  // Organization
  const orgId = generateId();
  db.prepare('INSERT INTO organization (id, name, ol_chiki_name, tagline, bo_address, phone, email, website) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
    orgId, 'BRANCH ASECA DANGACHUA', 'ᱚ.ᱟ.ᱮ.ᱥ.ᱮ.ᱠ.ᱮ ᱩᱰᱤᱥᱟ ᱥᱟᱠᱷᱟ ᱫᱟᱸᱜᱩᱣᱟᱹ',
    'Education • Culture • Community',
    'Regd No-77/26 of 2026, At-Dangachua, P.O.-Bidyadharpur, P.S.-Soso, Dist-Kendujhar, PIN-758078, Odisha',
    '+91-9430000001', 'info@branchasecadangachua.org', 'https://branchasecadangachua.org'
  );

  // Users
  const users = [
    { name: 'Super Administrator', email: 'superadmin@aseca.org', password: 'admin@123', role: 'super_admin' },
    { name: 'Organization Admin', email: 'orgadmin@aseca.org', password: 'admin@123', role: 'org_admin' },
    { name: 'School Admin', email: 'schooladmin@aseca.org', password: 'admin@123', role: 'school_admin' },
    { name: 'Principal Headmaster', email: 'principal@aseca.org', password: 'school@123', role: 'principal' },
    { name: 'Teacher User', email: 'teacher@aseca.org', password: 'school@123', role: 'teacher' },
  ];
  for (const u of users) {
    db.prepare('INSERT INTO users (id, name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?, ?)').run(
      generateId(), u.name, u.email, hashPassword(u.password), u.role, '9430000001'
    );
  }

  // Schools
  const schoolData = [
    { code: 'HH-OIA-026', name: 'HANS HANSLI OL-ITUN ASHRA, DANGACHUA', village: 'Dangachua', po: 'Bidyadharpur', pin: '758078', principal: 'Bhagaban Murmu', year: 1998 },
    { code: 'SK-OIA-027', name: 'SIDA KANHU OL-ITUN ASHRA, HARADABADI', village: 'Haradabadi', po: 'Hadagarh', pin: '758023', principal: 'Dukhabandhu Murmu', year: 2003 },
    { code: 'MB-OIA-028', name: 'MARANG BURU OL-ITUN ASHRA, BINAPATIA', village: 'Binapatia', po: 'Bidyadharpur', pin: '758078', principal: 'Kisun Majhi', year: 2010 },
  ];
  const schoolIds: string[] = [];
  for (const s of schoolData) {
    const id = generateId();
    schoolIds.push(id);
    db.prepare(`INSERT INTO schools (id, organization_id, code, name, ol_chiki_name, village, po, ps, block, district, pin, state, principal, established_year, type, medium, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      id, orgId, s.code, s.name, '', s.village, s.po, 'Soso', 'Soso', 'Kendujhar', s.pin, 'Odisha', s.principal, s.year, 'Ol-Itun Ashra', 'Santali', 'active'
    );
  }

  // Assign school to users
  const sa = db.prepare("SELECT id FROM users WHERE email = 'schooladmin@aseca.org'").get() as any;
  if (sa) db.prepare('UPDATE users SET school_id = ? WHERE id = ?').run(schoolIds[0], sa.id);
  const pu = db.prepare("SELECT id FROM users WHERE email = 'principal@aseca.org'").get() as any;
  if (pu) db.prepare('UPDATE users SET school_id = ? WHERE id = ?').run(schoolIds[0], pu.id);
  const tu = db.prepare("SELECT id FROM users WHERE email = 'teacher@aseca.org'").get() as any;
  if (tu) db.prepare('UPDATE users SET school_id = ? WHERE id = ?').run(schoolIds[0], tu.id);

  // Academic Year
  const yearId = generateId();
  db.prepare('INSERT INTO academic_years (id, school_id, name, start_date, end_date, is_active) VALUES (?, ?, ?, ?, ?, ?)').run(yearId, schoolIds[0], '2025-26', '2025-06-01', '2026-05-31', 1);

  // Classes
  const classData = [{ name: 'Class VI', o: 6 }, { name: 'Class VII', o: 7 }, { name: 'Class VIII', o: 8 }, { name: 'Class IX', o: 9 }, { name: 'Class X (Matric)', o: 10 }, { name: 'Class XII (+2)', o: 12 }];
  const cids: Record<string, string> = {};
  for (const c of classData) { const id = generateId(); cids[c.name] = id; db.prepare('INSERT INTO classes (id, school_id, name, display_order) VALUES (?, ?, ?, ?)').run(id, schoolIds[0], c.name, c.o); }

  // Sections
  const secA = generateId(), secB = generateId();
  db.prepare('INSERT INTO sections (id, class_id, name) VALUES (?, ?, ?)').run(secA, cids['Class X (Matric)'], 'A');
  db.prepare('INSERT INTO sections (id, class_id, name) VALUES (?, ?, ?)').run(secB, cids['Class XII (+2)'], 'B');

  // Subjects
  ['English', 'Mathematics', 'Science', 'Social Science', 'Odia', 'Santali', 'Hindi', 'Ol Chiki', 'Computer', 'Physical Education'].forEach((n, i) => {
    db.prepare('INSERT INTO subjects (id, academic_year_id, name, code, full_marks, pass_marks, display_order, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(generateId(), yearId, n, n.toUpperCase().slice(0, 4), 100, 33, i + 1, 'active');
  });

  // Teachers
  ([['Bhagaban Murmu', 'Headmaster', 'Santali', schoolIds[0]], ['Shyamsundar Majhi', 'Asst. Teacher', 'Mathematics', schoolIds[0]], ['Ramdulari Murmu', 'Lady Teacher', 'Odia', schoolIds[0]], ['Ramesh Hansdah', 'Asst. Teacher', 'English', schoolIds[0]], ['Dukhabandhu Murmu', 'Headmaster', 'Santali', schoolIds[1]], ['Kisun Majhi', 'Headmaster', 'Santali', schoolIds[2]]] as [string, string, string, string][]).forEach(([n, d, s, sid]) => {
    db.prepare('INSERT INTO teachers (id, school_id, name, designation, qualification, subject_spec, status) VALUES (?, ?, ?, ?, ?, ?, ?)').run(generateId(), sid, n, d, 'B.A, B.Ed', s, 'active');
  });

  // Staff
  ([['Ganga Murmu', 'Cook', 'Mid-day meal preparation', schoolIds[0]], ['Suku Marandi', 'Watchman', 'Night watch', schoolIds[0]], ['Ahalya Beshra', 'Peon', 'Office assistance', schoolIds[0]]] as [string, string, string, string][]).forEach(([n, d, du, sid]) => {
    db.prepare('INSERT INTO staff_members (id, school_id, name, designation, duties, status) VALUES (?, ?, ?, ?, ?, ?)').run(generateId(), sid, n, d, du, 'active');
  });

  // Students
  ([['Urmila Hembram', '36SSMS026001', '2009-04-04', 'Female'], ['Benudhar Murmu', '36SSMS026002', '2009-02-22', 'Male'], ['Suru Beshra', '36SSMS026003', '2009-09-08', 'Male'], ['Anant Kisku', '36SSMS026004', '2009-06-15', 'Male']] as [string, string, string, string][]).forEach(([n, r, d, g]) => {
    db.prepare(`INSERT INTO students (id, school_id, section_id, admission_no, roll_no, name, dob, gender, blood_group, father_name, mother_name, village, district, state, pin, category, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      generateId(), schoolIds[0], secA, `HH/ADM/2025/${100 + Math.floor(Math.random() * 900)}`, r, n, d, g, 'O+', `Father of ${n}`, `Mother of ${n}`, 'Dangachua', 'Kendujhar', 'Odisha', '758078', 'ST', 'active'
    );
  });
  ['Sangita Murmu', 'Swati Murmu', 'Lachhaman Murmu', 'Jagan Majhi'].forEach((n) => {
    db.prepare(`INSERT INTO students (id, school_id, section_id, admission_no, roll_no, name, dob, gender, father_name, mother_name, village, district, state, pin, category, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      generateId(), schoolIds[0], secB, `HH/ADM/2025/${200 + Math.floor(Math.random() * 900)}`, `36SS+2S026${10 + Math.floor(Math.random() * 90)}`, n, '2007-03-15', Math.random() > 0.5 ? 'Female' : 'Male', `Father of ${n}`, `Mother of ${n}`, 'Dangachua', 'Kendujhar', 'Odisha', '758078', 'ST', 'active'
    );
  });

  // SMC
  ([['Kisun Majhi', 1, 'Chairman'], ['Surendra Murmu', 2, 'Secretary'], ['Surendra Majhi', 3, 'Treasurer'], ['Bhagaban Murmu', 4, 'Headmaster'], ['Shyamsundar Majhi', 5, 'Asst. Teacher'], ['Ramdulari Murmu', 6, 'Lady Teacher'], ['Bhagaban Murmu', 7, 'Executive Member'], ['Khelaram Murmu', 8, 'Executive Member'], ['Ranku Beshra', 9, 'Executive Member'], ['Balaram Marandi', 10, 'Executive Member'], ['Sanjay Murmu', 11, 'Executive Member']] as [string, number, string][]).forEach(([n, sl, d]) => {
    db.prepare('INSERT INTO smc_members (id, school_id, sl_no, name, designation, mobile, display_order, status, is_public) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(generateId(), schoolIds[0], sl, n, d, `94301000${String(sl).padStart(2, '0')}`, sl, 'active', 1);
  });

  // Grading
  ([['A+', 80, 100, 'Outstanding'], ['A', 70, 79.99, 'Excellent'], ['B', 60, 69.99, 'Very Good'], ['C', 50, 59.99, 'Good'], ['D', 40, 49.99, 'Above Average'], ['E', 33, 39.99, 'Average'], ['F', 0, 32.99, 'Fail']] as [string, number, number, string][]).forEach(([g, mn, mx, r], i) => {
    db.prepare('INSERT INTO grading_rules (id, grade, min_percent, max_percent, remark, display_order) VALUES (?, ?, ?, ?, ?, ?)').run(generateId(), g, mn, mx, r, i + 1);
  });

  // Notices
  ([['Affiliation/Renewal 2026-27', 'Affiliation', 'high', '2026-08-15'], ['Matric & +2 Exam Schedule', 'Examination', 'high', '2026-08-12'], ['Ol Chiki Workshop', 'Academic', 'normal', '2026-08-20']] as [string, string, string, string][]).forEach(([t, c, p, d]) => {
    db.prepare('INSERT INTO notices (id, school_id, title, body, category, priority, date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(generateId(), schoolIds[0], t, 'Demo notice body.', c, p, d, 'published');
  });

  // Events
  ([['Santal Hul Memorial Day', '2026-06-30', 'Cultural'], ['Ol Chiki Divas', '2026-05-15', 'Academic'], ['Annual Sports Meet', '2026-12-12', 'Sports']] as [string, string, string][]).forEach(([t, d, c]) => {
    db.prepare('INSERT INTO events (id, school_id, title, description, date, category) VALUES (?, ?, ?, ?, ?, ?)').run(generateId(), schoolIds[0], t, 'Demo event.', d, c);
  });

  // Books
  ([['Ol Chiki Primer', 'Pandit Raghunath Murmu', 20], ['English Grammar', 'Wren & Martin', 15], ['Mathematics X', 'B.K. Das', 10]] as [string, string, number][]).forEach(([t, a, c]) => {
    db.prepare('INSERT INTO books (id, school_id, title, author, copies, available) VALUES (?, ?, ?, ?, ?, ?)').run(generateId(), schoolIds[0], t, a, c, c);
  });

  // Historical Profile
  db.prepare(`INSERT INTO historical_profiles (id, slug, name, summary, biography, sources, status) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
    generateId(), 'pandit-raghunath-murmu', 'Pandit Raghunath Murmu', 'Creator of the Ol Chiki script for the Santali language.',
    'Pandit Raghunath Murmu (1905-1982) was a Santali guru who created the Ol Chiki script.', 'Historical records', 'published'
  );

  // Dictionary
  ([['ᱫᱟᱹᱜ', 'dag', 'water', 'noun', 'The clear liquid essential for life.'], ['ᱡᱚᱢ', 'jom', 'eat', 'verb', 'To consume food.'], ['ᱚᱲᱟᱜ', 'orag', 'house', 'noun', 'A dwelling place.'], ['ᱥᱮᱨᱢᱟ', 'serma', 'year', 'noun', 'A period of twelve months.'], ['ᱦᱚᱲ', 'hor', 'person', 'noun', 'A human being.']] as [string, string, string, string, string][]).forEach(([w, r, e, p, d]) => {
    db.prepare('INSERT INTO dictionary_entries (id, word, roman, english, part_of_speech, definition, status, verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(generateId(), w, r, e, p, d, 'active', 1);
  });

  // Ol Chiki Letters
  ([['ᱚ', 'O', 'o'], ['ᱛ', 'Ot', 'ot'], ['ᱜ', 'Ag', 'ag'], ['ᱝ', 'Ang', 'ang'], ['ᱞ', 'Al', 'al'], ['ᱟ', 'A', 'a'], ['ᱵ', 'Ab', 'ab'], ['ᱫ', 'Ad', 'ad'], ['ᱢ', 'Am', 'am']] as [string, string, string][]).forEach(([c, n, r], i) => {
    db.prepare('INSERT INTO olchiki_letters (id, character, name, roman, display_order, status) VALUES (?, ?, ?, ?, ?, ?)').run(generateId(), c, n, r, i + 1, 'active');
  });

  // Audit
  db.prepare('INSERT INTO audit_logs (id, username, action, entity, detail) VALUES (?, ?, ?, ?, ?)').run(generateId(), 'system', 'SEED', 'database', 'Database initialized with demo data');

  db.save();
  console.log('[seed] ✅ Database seeded successfully!');
  process.exit(0);
}

seed().catch((e) => { console.error('[seed] Error:', e); process.exit(1); });
