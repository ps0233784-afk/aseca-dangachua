// ============================================================
// Demo data seeder — populates the ERP with realistic fictional
// data so the system looks complete immediately. Safe to re-run:
// it only seeds when the database is empty.
// ============================================================
import bcrypt from 'bcryptjs';
import { db, initSchema, now } from './db.js';
import { rolePermissions, MODULES, ACTIONS } from './auth.js';

const hash = (p) => bcrypt.hashSync(p, 10);
const rnd = (n) => Math.floor(Math.random() * n);

export function seed() {
  initSchema();
  const count = db.prepare('SELECT COUNT(*) c FROM organizations').get().c;
  if (count > 0) {
    console.log('[seed] Database already populated — skipping.');
    return;
  }

  const tx = db.transaction(() => {
    // ---------------- Organization ----------------
    db.prepare(`INSERT INTO organizations
      (name, short_name, tagline, logo, hero_image, address, village, block, district, state, pincode,
       phone, email, website, established_year, about, mission, vision, footer_text, social, theme)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
      'BRANCH ASECA DANGACHUA',
      'ASECA',
      'Education • Culture • Community',
      null,
      '/uploads/hero.jpg',
      'At/Po: Dangachua, Via: Bangiriposi',
      'Dangachua',
      'Bangiriposi',
      'Mayurbhanj',
      'Odisha',
      '757032',
      '+91 94370 12345',
      'info@asecadangachua.org',
      'www.asecadangachua.org',
      1998,
      'BRANCH ASECA DANGACHUA is a community-driven educational trust working in the Mayurbhanj region of Odisha. Founded to bring quality schooling to rural and tribal communities, the organisation now runs a growing network of schools that blend modern education with Santali language, Ol Chiki script and the living cultural heritage of the Santal community.',
      'To empower every child of the community with quality education rooted in dignity, culture and opportunity.',
      'A future where every Santali child learns in their own language, honours their heritage, and grows into a confident citizen of the world.',
      'Education • Culture • Community — serving the Santal community of Mayurbhanj, Odisha since 1998.',
      JSON.stringify({ facebook: 'https://facebook.com/aseca', twitter: 'https://twitter.com/aseca', instagram: 'https://instagram.com/aseca', youtube: 'https://youtube.com/@aseca' }),
      JSON.stringify({ primary: '#1a56db', secondary: '#147d4b', accent: '#d9a033', radius: 18, darkDefault: false })
    );

    // ---------------- Schools ----------------
    const insertSchool = db.prepare(`INSERT INTO schools
      (org_id, name, code, school_id, address, village, block, district, cluster, pincode, phone, email,
       principal_name, school_type, medium, established_year, status, description)
      VALUES (1,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
    insertSchool.run(
      'BRANCH ASECA DANGACHUA HIGH SCHOOL', 'BAD-HS', 'SCH-001',
      'Main Road, Dangachua', 'Dangachua', 'Bangiriposi', 'Mayurbhanj', 'Bangiriposi Cluster', '757032',
      '+91 94370 12346', 'highschool@asecadangachua.org', 'Sri Rabindra Nath Hembram',
      'High School', 'Odia + Santali', 1998, 'active',
      'The flagship secondary school of the organisation, offering Classes 6–10 with strong Santali language and Ol Chiki instruction alongside the state curriculum.'
    );
    insertSchool.run(
      'BRANCH ASECA DANGACHUA UPPER PRIMARY SCHOOL', 'BAD-UPS', 'SCH-002',
      'Near Community Hall, Dangachua', 'Dangachua', 'Bangiriposi', 'Mayurbhanj', 'Bangiriposi Cluster', '757032',
      '+91 94370 12347', 'upperprimary@asecadangachua.org', 'Smt. Sumitra Tudu',
      'Upper Primary School', 'Odia + Santali', 2004, 'active',
      'Upper primary campus serving Classes 1–7 with activity-based learning, a library corner and daily cultural periods.'
    );
    insertSchool.run(
      'ASECA MODEL PRIMARY SCHOOL, DANGACHUA', 'BAD-MPS', 'SCH-003',
      'Dangachua Bazaar Road', 'Dangachua', 'Bangiriposi', 'Mayurbhanj', 'Bangiriposi Cluster', '757032',
      '+91 94370 12348', 'modelprimary@asecadangachua.org', 'Sri Laxman Murmu',
      'Primary School', 'Odia + Santali', 2010, 'active',
      'Model primary school focusing on early childhood education, multilingual foundation and joyful learning for Classes 1–5.'
    );

    // ---------------- Academic Years ----------------
    const ayInsert = db.prepare(`INSERT INTO academic_years (org_id, name, start_date, end_date, is_current, status) VALUES (1,?,?,?,?,?)`);
    ayInsert.run('2025–2026', '2025-04-01', '2026-03-31', 1, 'active');
    ayInsert.run('2024–2025', '2024-04-01', '2025-03-31', 0, 'active');

    // ---------------- Classes ----------------
    const clsInsert = db.prepare(`INSERT INTO classes (org_id, name, code, order_index, default_capacity) VALUES (1,?,?,?,?)`);
    const classIds = {};
    for (let i = 1; i <= 10; i++) {
      const info = clsInsert.run(`Class ${i}`, `C${i}`, i, 40);
      classIds[i] = info.lastInsertRowid;
    }

    // ---------------- Sections ----------------
    const secInsert = db.prepare(`INSERT INTO sections (school_id, class_id, name, room, capacity) VALUES (?,?,?,?,?)`);
    const sectionIds = {}; // `${schoolId}-${classNum}-${letter}` -> id
    for (let s = 1; s <= 3; s++) {
      for (let i = 1; i <= 10; i++) {
        const a = secInsert.run(s, classIds[i], 'A', `R${i}01`, 40).lastInsertRowid;
        sectionIds[`${s}-${i}-A`] = a;
        if (i <= 5) {
          const b = secInsert.run(s, classIds[i], 'B', `R${i}02`, 40).lastInsertRowid;
          sectionIds[`${s}-${i}-B`] = b;
        }
      }
    }

    // ---------------- Subjects ----------------
    const subInsert = db.prepare(`INSERT INTO subjects (org_id, name, code, full_marks, pass_marks, theory_marks, practical_marks, subject_type, color) VALUES (1,?,?,?,?,?,?,?,?)`);
    const subjects = [
      ['English', 'ENG', 100, 33, 100, 0, 'language', '#1a56db'],
      ['Mathematics', 'MATH', 100, 33, 100, 0, 'core', '#147d4b'],
      ['Science', 'SCI', 100, 33, 80, 20, 'core', '#0ea576'],
      ['Social Science', 'SSC', 100, 33, 100, 0, 'core', '#d9a033'],
      ['Odia', 'ODI', 100, 33, 100, 0, 'language', '#8b7bd8'],
      ['Santali', 'SAT', 100, 33, 100, 0, 'language', '#0c4a2e'],
      ['Ol Chiki', 'OLC', 100, 33, 100, 0, 'language', '#b9885c'],
      ['Hindi', 'HIN', 100, 33, 100, 0, 'language', '#38bdf8'],
      ['Computer', 'COMP', 100, 40, 60, 40, 'elective', '#1a56db'],
      ['Art Education', 'ART', 50, 17, 30, 20, 'activity', '#d9a033'],
      ['Physical Education', 'PE', 50, 17, 30, 20, 'activity', '#147d4b'],
    ];
    const subjectIds = {};
    for (const [name, code, fm, pm, tm, pr, type, color] of subjects) {
      subjectIds[code] = subInsert.run(name, code, fm, pm, tm, pr, type, color).lastInsertRowid;
    }

    // Class -> subject mapping (broad)
    const csInsert = db.prepare(`INSERT OR IGNORE INTO class_subjects (class_id, subject_id) VALUES (?,?)`);
    for (let i = 1; i <= 10; i++) {
      const base = new Set(['ENG', 'MATH', 'ODI', 'SAT']);
      if (i >= 6) ['SCI', 'SSC', 'OLC', 'HIN'].forEach((c) => base.add(c));
      if (i >= 3) ['HIN', 'ART', 'PE'].forEach((c) => base.add(c));
      if (i >= 6) base.add('COMP');
      for (const code of base) csInsert.run(classIds[i], subjectIds[code]);
    }

    // ---------------- Roles ----------------
    const roleInsert = db.prepare(`INSERT INTO roles (org_id, key, name, description, permissions, is_system, editable) VALUES (1,?,?,?,?,?,?)`);
    const roleDefs = [
      ['super_admin', 'Super Admin', 'Full control over the organisation and every school.', rolePermissions('super_admin'), 1, 0],
      ['org_admin', 'Organisation Admin', 'Manages the whole organisation across schools.', rolePermissions('org_admin'), 1, 0],
      ['school_admin', 'School Admin', 'Manages one school end-to-end.', rolePermissions('school_admin'), 1, 1],
      ['principal', 'Principal / Headmaster', 'Academic and administrative head of a school.', rolePermissions('principal'), 1, 1],
      ['teacher', 'Teacher', 'Classroom, attendance, marks and student records.', rolePermissions('teacher'), 1, 1],
      ['accountant', 'Accountant', 'Fees, payments and financial reports.', rolePermissions('accountant'), 1, 1],
      ['librarian', 'Librarian', 'Library books, issue and returns.', rolePermissions('librarian'), 1, 1],
      ['staff', 'Staff', 'Non-teaching and support staff.', rolePermissions('staff'), 1, 1],
      ['student', 'Student', 'Student portal — profile, results, timetable.', rolePermissions('student'), 1, 1],
      ['parent', 'Parent / Guardian', 'Parent portal — children, fees, results.', rolePermissions('parent'), 1, 1],
    ];
    const roleIds = {};
    for (const [key, name, desc, perms, sys, editable] of roleDefs) {
      roleIds[key] = roleInsert.run(key, name, desc, JSON.stringify(perms), sys, editable).lastInsertRowid;
    }

    // ---------------- Users ----------------
    const userInsert = db.prepare(`INSERT INTO users (org_id, school_id, role_id, name, username, email, password_hash, phone, gender, language, theme, status)
      VALUES (1,?,?,?,?,?,?,?,?,?,?,?)`);
    const user = (schoolId, role, name, username, email, phone, gender = 'Male') =>
      userInsert.run(schoolId, roleIds[role], name, username, email, hash('Admin@123'), phone, gender, 'en', 'system', 'active').lastInsertRowid;

    const superAdminId = user(null, 'super_admin', 'Anil Kumar Soren', 'superadmin', 'super@aseca.org', '+91 90000 00001');
    const orgAdminId = user(null, 'org_admin', 'Meera Hembram', 'orgadmin', 'org@aseca.org', '+91 90000 00002', 'Female');
    const schoolAdminId = user(1, 'school_admin', 'Deepak Murmu', 'schooladmin', 'admin@aseca.org', '+91 90000 00003');
    const principalId = user(1, 'principal', 'Rabindra Nath Hembram', 'principal', 'principal@aseca.org', '+91 94370 12346');
    const teacher1 = user(1, 'teacher', 'Sumitra Tudu', 'sumitra', 'sumitra@aseca.org', '+91 90000 00004', 'Female');
    const teacher2 = user(1, 'teacher', 'Chaitanya Besra', 'chaitanya', 'chaitanya@aseca.org', '+91 90000 00005');
    const teacher3 = user(2, 'teacher', 'Phula Marandi', 'phula', 'phula@aseca.org', '+91 90000 00006', 'Female');
    const accountantId = user(1, 'accountant', 'Gopal Kisku', 'accountant', 'accounts@aseca.org', '+91 90000 00007');
    const librarianId = user(1, 'librarian', 'Rupa Hansda', 'librarian', 'library@aseca.org', '+91 90000 00008', 'Female');
    const staffId = user(1, 'staff', 'Mangal Baskey', 'staff', 'staff@aseca.org', '+91 90000 00009');
    const studentUser = user(1, 'student', 'Birsa Murmu', 'birsa', 'birsa@student.aseca.org', '+91 90000 00010');
    const parentUser = user(1, 'parent', 'Sanatan Murmu', 'parent', 'parent@aseca.org', '+91 90000 00011');

    // ---------------- Staff ----------------
    const staffInsert = db.prepare(`INSERT INTO staff (org_id, school_id, user_id, employee_id, name, qualification, designation, staff_type, department, subject_ids, joining_date, mobile, email, gender, status)
      VALUES (1,?,?,?,?,?,?,?,?,?,?,?,?,?,'active')`);
    const staffData = [
      [1, principalId, 'EMP-001', 'Rabindra Nath Hembram', 'M.A., B.Ed.', 'Headmaster', 'teaching', 'Administration', JSON.stringify([subjectIds.SAT]), '2010-06-15', '+91 94370 12346', 'principal@aseca.org', 'Male'],
      [1, teacher1, 'EMP-002', 'Sumitra Tudu', 'M.A. (Odia), B.Ed.', 'Senior Teacher', 'teaching', 'Languages', JSON.stringify([subjectIds.ODI, subjectIds.SAT]), '2012-07-01', '+91 90000 00004', 'sumitra@aseca.org', 'Female'],
      [1, teacher2, 'EMP-003', 'Chaitanya Besra', 'M.Sc. (Mathematics)', 'Teacher', 'teaching', 'Science & Math', JSON.stringify([subjectIds.MATH, subjectIds.SCI]), '2015-07-10', '+91 90000 00005', 'chaitanya@aseca.org', 'Male'],
      [1, null, 'EMP-004', 'Bahamuni Soren', 'M.A. (English), B.Ed.', 'Teacher', 'teaching', 'Languages', JSON.stringify([subjectIds.ENG]), '2016-08-20', '+91 90000 00012', 'bahamuni@aseca.org', 'Female'],
      [1, null, 'EMP-005', 'Salge Hemram', 'M.A. (Santali)', 'Santali Teacher', 'teaching', 'Languages', JSON.stringify([subjectIds.SAT, subjectIds.OLC]), '2017-07-05', '+91 90000 00013', 'salge@aseca.org', 'Female'],
      [2, teacher3, 'EMP-006', 'Phula Marandi', 'B.Sc., B.Ed.', 'Teacher', 'teaching', 'Science & Math', JSON.stringify([subjectIds.SCI, subjectIds.MATH]), '2018-07-12', '+91 90000 00006', 'phula@aseca.org', 'Female'],
      [2, null, 'EMP-007', 'Kanhu Tudu', 'M.A. (History)', 'Teacher', 'teaching', 'Social Science', JSON.stringify([subjectIds.SSC]), '2019-07-15', '+91 90000 00014', 'kanhu@aseca.org', 'Male'],
      [1, accountantId, 'EMP-008', 'Gopal Kisku', 'B.Com.', 'Accountant', 'non-teaching', 'Accounts', null, '2014-04-01', '+91 90000 00007', 'accounts@aseca.org', 'Male'],
      [1, librarianId, 'EMP-009', 'Rupa Hansda', 'B.Lib.Sc.', 'Librarian', 'non-teaching', 'Library', null, '2016-04-01', '+91 90000 00008', 'library@aseca.org', 'Female'],
      [1, staffId, 'EMP-010', 'Mangal Baskey', 'Matriculation', 'Office Assistant', 'non-teaching', 'Administration', null, '2018-02-01', '+91 90000 00009', 'staff@aseca.org', 'Male'],
    ];
    for (const s of staffData) staffInsert.run(...s);

    // ---------------- Students ----------------
    const sInsert = db.prepare(`INSERT INTO students
      (org_id, school_id, user_id, student_id, admission_no, roll_no, name, name_odia, name_santali, dob, gender, blood_group,
       father_name, mother_name, guardian_name, guardian_relation, mobile, village, block, district, category,
       current_class_id, current_section_id, academic_year_id, admission_date, previous_school, status)
      VALUES (1,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,?,?,?)`);
    const surnames = ['Murmu', 'Soren', 'Hembram', 'Tudu', 'Kisku', 'Besra', 'Hansda', 'Marandi', 'Baskey', 'Hemram', 'Mahato', 'Dhanwar'];
    const firsts = ['Birsa', 'Sumi', 'Laxman', 'Salge', 'Rupa', 'Chaitanya', 'Madhu', 'Jiten', 'Phula', 'Bahamuni', 'Gopal', 'Sita', 'Ramesh', 'Durga', 'Kanhu', 'Sonamuni', 'Digamber', 'Purnima', 'Rabi', 'Nirmala', 'Sukul', 'Maina', 'Bhagirath', 'Champa'];
    const genders = ['Male', 'Female'];
    let studentSeq = 1001;
    let rollSeq = 1;
    const studentIds = {};
    for (let si = 0; si < 48; si++) {
      const schoolId = si < 24 ? 1 : (si < 36 ? 2 : 3);
      const classNum = schoolId === 1 ? 6 + (si % 5) : 1 + (si % 5);
      const gender = genders[si % 2];
      const first = firsts[si % firsts.length];
      const last = surnames[si % surnames.length];
      const name = `${first} ${last}`;
      const stdId = `STU-${studentSeq}`;
      const cls = classNum;
      const sec = sectionIds[`${schoolId}-${cls}-A`] || sectionIds[`${schoolId}-${cls}-B`];
      const dob = `${2010 - (cls > 5 ? cls - 5 : 0)}-0${(si % 9) + 1}-1${si % 9}`;
      const info = sInsert.run(
        schoolId, null, stdId, `ADM-${studentSeq}`, String(rollSeq++),
        name, null, null, dob, gender, ['O+', 'A+', 'B+', 'AB+'][si % 4],
        `${firsts[(si + 5) % firsts.length]} ${last}`, `${firsts[(si + 7) % firsts.length]} ${last}`,
        `${firsts[(si + 3) % firsts.length]} ${last}`, 'Father',
        `+91 9${String(8000000000 + studentSeq)}`,
        ['Dangachua', 'Bangiriposi', 'Kusumbandh', 'Baripada'][si % 4],
        'Bangiriposi', 'Mayurbhanj', ['ST', 'SC', 'OBC', 'General'][si % 4],
        classIds[cls], sec, `2022-04-0${(si % 9) + 1}`, 'Community Anganwadi', 'active'
      );
      studentIds[stdId] = info.lastInsertRowid;
      studentSeq++;
      if (stdId === 'STU-1001') {
        db.prepare('UPDATE students SET user_id = ? WHERE id = ?').run(studentUser, info.lastInsertRowid);
      }
    }

    // ---------------- Guardians ----------------
    const gInsert = db.prepare(`INSERT INTO guardians (org_id, user_id, name, relation, mobile, email, address, occupation) VALUES (1,?,?,?,?,?,?,?)`);
    const guardianParent = gInsert.run(parentUser, 'Sanatan Murmu', 'Father', '+91 90000 00011', 'parent@aseca.org', 'Dangachua, Mayurbhanj', 'Farmer').lastInsertRowid;
    const guardian2 = gInsert.run(null, 'Phulmani Soren', 'Mother', '+91 90000 00015', null, 'Bangiriposi, Mayurbhanj', 'Self Help Group').lastInsertRowid;
    const sg = db.prepare(`INSERT INTO student_guardians (student_id, guardian_id, is_primary) VALUES (?,?,?)`);
    sg.run(studentIds['STU-1001'], guardianParent, 1);
    sg.run(studentIds['STU-1002'], guardianParent, 1);
    sg.run(studentIds['STU-1001'], guardian2, 0);

    // ---------------- Managing Body (11 members) ----------------
    const mb = db.prepare(`INSERT INTO managing_body (org_id, name, designation, bio, order_index, status) VALUES (1,?,?,?,?,'active')`);
    const members = [
      ['Sri Sanatan Murmu', 'President', 'Founder-president of the society. A lifelong community leader from Dangachua working for tribal education and land rights.', 0],
      ['Smt. Phulmani Soren', 'Vice President', 'Social worker and women\'s self-help-group organiser; leads community outreach and girls\' education drives.', 1],
      ['Sri Rabindra Nath Hembram', 'Secretary', 'Headmaster and secretary. Coordinates academics, staff and school administration across all branches.', 2],
      ['Sri Chaitanya Besra', 'Joint Secretary', 'Mathematics teacher and joint secretary; oversees examinations, results and records.', 3],
      ['Sri Gopal Kisku', 'Treasurer', 'Accountant and treasurer responsible for funds, fees and transparent financial management.', 4],
      ['Smt. Sumitra Tudu', 'Member (Academics)', 'Senior teacher leading curriculum, Santali language teaching and teacher training.', 5],
      ['Sri Laxman Murmu', 'Member (Infrastructure)', 'Looks after buildings, classrooms, drinking water and campus development projects.', 6],
      ['Smt. Bahamuni Soren', 'Member (Cultural Affairs)', 'Promotes Santali festivals, Ol Chiki literacy and cultural programmes in schools.', 7],
      ['Sri Kanhu Tudu', 'Member (Sports & Youth)', 'Organises sports meets, youth clubs and community games.', 8],
      ['Smt. Rupa Hansda', 'Member (Library & Resources)', 'Librarian who manages book banks, reading rooms and learning resources.', 9],
      ['Sri Mangal Baskey', 'Member (Welfare)', 'Coordinates scholarships, midday meals and student welfare schemes.', 10],
    ];
    for (const m of members) mb.run(...m);

    // ---------------- Culture content ----------------
    const cc = db.prepare(`INSERT INTO culture_content (org_id, section_key, title, body, image) VALUES (1,?,?,?,?)`);
    cc.run('language', 'Santali Language', 'Santali is one of the largest Austroasiatic languages of India, listed in the Eighth Schedule of the Indian Constitution. In our schools, Santali is taught and spoken with pride alongside Odia, Hindi and English, so children learn in a language they understand.', '/uploads/culture-festival.jpg');
    cc.run('olchiki', 'Ol Chiki Script', 'Ol Chiki is the native script of the Santali language. We introduce Ol Chiki letters from the early classes so that reading and writing in the mother tongue becomes natural and joyful for every child.', '/uploads/culture-pattern.jpg');
    cc.run('literature', 'Santali Literature', 'From oral storytelling to written poetry and prose, Santali literature carries the wisdom of generations. Our libraries keep Santali storybooks and songs, and students are encouraged to write in Ol Chiki.', null);
    cc.run('festivals', 'Festivals', 'Sohrai, Baha, Karam and other seasonal festivals are celebrated together with songs, dance and community feasts. Our schools mark these days with cultural programmes, keeping the calendar of the community alive.', '/uploads/culture-festival.jpg');
    cc.run('knowledge', 'Traditional Knowledge', 'The Santal community holds deep knowledge of forests, farming, healing plants and the rhythm of seasons. We bring elders and resource persons into classrooms so this knowledge is honoured and passed on.', null);
    cc.run('resources', 'Educational Resources', 'We publish and share Santali and Ol Chiki learning materials, songbooks and bilingual readers developed by our teachers for use at home and in class.', null);
    cc.run('history', 'Community History', 'The Santal community of Mayurbhanj has a long history of farming, music and self-governance. This page shares community stories and history with respect and care, as told by community members.', null);

    // ---------------- Notices ----------------
    const nInsert = db.prepare(`INSERT INTO notices (org_id, title, body, category, target_type, target_ids, priority, status, publish_at, created_by)
      VALUES (1,?,?,?,?,?,?,?,?,?)`);
    const _d0 = new Date(); const _dayFromNow = (n) => { const d = new Date(_d0); d.setDate(_d0.getDate() + n); return d.toISOString().slice(0, 10); };
    const notices = [
      ['Annual Examination Schedule 2025–26 Released', 'The Annual Examination for Classes 1–9 begins on 10 March 2026. Detailed date sheets are available on the school notice board and in the student portal.', 'Examination', 'all', null, 'high', 'published', '2026-01-05', orgAdminId],
      ['Admission Open for Academic Year 2026–27', 'Fresh admissions for Classes 1–9 are now open at all ASECA schools. Parents may collect forms from the school office between 10 AM and 3 PM on working days.', 'Admission', 'all', null, 'high', 'published', '2026-02-01', orgAdminId],
      ['Sohrai Festival Celebration', 'All schools will celebrate Sohrai with cultural programmes and a community feast on 12 January. Parents and community members are warmly invited.', 'Cultural', 'all', null, 'normal', 'published', '2026-01-03', schoolAdminId],
      ['Parent–Teacher Meeting', 'A parent–teacher meeting will be held on 20 February 2026 at 11 AM in every school to discuss student progress.', 'Meeting', 'all', null, 'normal', 'published', '2026-02-10', schoolAdminId],
      ['Book Bank Collection Drive', 'The library invites students to donate storybooks for the Santali and Ol Chiki book bank.', 'Library', 'all', null, 'normal', 'published', '2026-02-15', librarianId],
      ['Scholarship Applications — Last Date Extended', 'Merit-cum-means scholarship applications for the current year have been extended. Apply at the school office.', 'Scholarship', 'all', null, 'high', 'scheduled', _dayFromNow(3), orgAdminId],
    ];
    for (const n of notices) nInsert.run(...n);

    // ---------------- Events (relative to today so the demo always shows upcoming) ----------------
    const eInsert = db.prepare(`INSERT INTO events (org_id, title, description, category, event_date, start_time, end_time, venue, status, created_by)
      VALUES (1,?,?,?,?,?,?,?,?,?)`);
    const d1 = new Date(); const dayFromNow = (n) => { const d = new Date(d1); d.setDate(d1.getDate() + n); return d.toISOString().slice(0, 10); };
    const events = [
      ['Baha Parab (Flower Festival)', 'Community celebration of the spring flower festival with Santali dance, songs and a shared meal.', 'Cultural', dayFromNow(9), '10:00', '16:00', 'Dangachua Community Ground', 'published', schoolAdminId],
      ['Inter-School Sports Meet', 'Annual athletics and kho-kho tournament between all ASECA schools.', 'Sports', dayFromNow(16), '08:00', '17:00', 'ASECA High School Playground', 'published', schoolAdminId],
      ['Ol Chiki Literacy Workshop', 'Workshop for teachers and parents on reading and writing the Ol Chiki script.', 'Training', dayFromNow(4), '11:00', '13:00', 'ASECA High School Hall', 'published', orgAdminId],
      ['Board Meeting — Managing Body', 'Quarterly meeting of the Managing Body to review academics, finance and infrastructure.', 'Meeting', dayFromNow(12), '10:00', '13:00', 'School Office, Dangachua', 'published', orgAdminId],
      ['World Environment Day — Tree Plantation', 'Students and community members plant saplings across the campus and village.', 'Community', dayFromNow(26), '09:00', '12:00', 'All ASECA campuses', 'published', schoolAdminId],
      ['Sohrai Festival Celebration', 'The harvest festival of Sohrai celebrated with traditional songs, dance and community feast.', 'Cultural', dayFromNow(34), '09:00', '18:00', 'Dangachua Community Ground', 'published', schoolAdminId],
    ];
    for (const ev of events) eInsert.run(...ev);

    // ---------------- Achievements ----------------
    const aInsert = db.prepare(`INSERT INTO achievements (org_id, title, description, category, achievement_date, is_public) VALUES (1,?,?,?,?,1)`);
    const ach = [
      ['100% Result in Class 10 Board Examination', 'The High School recorded a 100% pass result in the Board Examination, with 18 students scoring above 80%.', 'Academic', '2025-06-02'],
      ['District-Level Ol Chiki Essay Winner', 'A Class 8 student won first prize at the district Ol Chiki essay competition held in Baripada.', 'Student', '2025-11-18'],
      ['Inter-Block Kho-Kho Runners Up', 'Our girls\' kho-kho team finished runners-up at the Bangiriposi block sports meet.', 'Sports', '2025-12-09'],
      ['Sohrai Cultural Festival — Best Troupe', 'The school cultural troupe won the best performance award at the regional Sohrai festival.', 'Cultural', '2026-01-12'],
      ['Science Exhibition Recognition', 'Students presented a solar-dryer project at the district science exhibition and received special mention.', 'Activity', '2025-09-25'],
      ['Community Plantation Drive — 2,000 Saplings', 'Students and staff planted 2,000 saplings across three campuses on World Environment Day.', 'Activity', '2025-06-05'],
    ];
    for (const x of ach) aInsert.run(...x);

    // ---------------- Grading rules ----------------
    const gr = db.prepare(`INSERT INTO grading_rules (org_id, min_percent, max_percent, grade, remark, is_pass, order_index) VALUES (1,?,?,?,?,?,?)`);
    const grades = [
      [90, 100, 'A+', 'Outstanding', 1, 0],
      [80, 89.99, 'A', 'Excellent', 1, 1],
      [70, 79.99, 'B+', 'Very Good', 1, 2],
      [60, 69.99, 'B', 'Good', 1, 3],
      [50, 59.99, 'C', 'Satisfactory', 1, 4],
      [40, 49.99, 'D', 'Fair', 1, 5],
      [33, 39.99, 'E', 'Needs Improvement', 1, 6],
      [0, 32.99, 'F', 'Fail', 0, 7],
    ];
    for (const g of grades) gr.run(...g);

    // ---------------- Fee categories ----------------
    const fc = db.prepare(`INSERT INTO fee_categories (org_id, name, description) VALUES (1,?,?)`);
    const feeCats = [['Admission', 'One-time admission fee'], ['Tuition', 'Monthly tuition fee'], ['Examination', 'Examination fee'], ['Hostel', 'Hostel and mess charges'], ['Library', 'Library and reading fee'], ['Transport', 'School transport fee'], ['Other', 'Other miscellaneous charges']];
    const feeCatIds = {};
    for (const [name, desc] of feeCats) feeCatIds[name] = fc.run(name, desc).lastInsertRowid;

    // ---------------- Fee structures + assignments + payments ----------------
    const fsIns = db.prepare(`INSERT INTO fee_structures (org_id, school_id, class_id, category_id, academic_year_id, amount, due_date) VALUES (1,?,?,?,1,?,?)`);
    const faIns = db.prepare(`INSERT INTO fee_assignments (org_id, student_id, structure_id, amount, paid, discount, due_date, status) VALUES (1,?,?,?,?,?,?,?)`);
    const payIns = db.prepare(`INSERT INTO payments (org_id, student_id, fee_assignment_id, amount, method, reference, payment_date, received_by) VALUES (1,?,?,?,?,?,?,?)`);
    const tuitionAmt = (cls) => 120 + cls * 25;
    let paidCount = 0;
    for (const [sid, stRow] of Object.entries(studentIds).slice(0, 30)) {
      const student = db.prepare('SELECT current_class_id FROM students WHERE id = ?').get(stRow);
      const cls = db.prepare('SELECT order_index FROM classes WHERE id = ?').get(student.current_class_id).order_index;
      const amount = tuitionAmt(cls);
      const st = fsIns.run(1, student.current_class_id, feeCatIds['Tuition'], amount, '2026-01-31').lastInsertRowid;
      const paid = paidCount++ % 3 === 0 ? amount : (paidCount % 2 === 0 ? amount / 2 : 0);
      const status = paid === amount ? 'paid' : (paid > 0 ? 'partial' : 'pending');
      const fa = faIns.run(stRow, st, amount, paid, 0, '2026-01-31', status).lastInsertRowid;
      if (paid > 0) payIns.run(stRow, fa, paid, 'Cash', `RCP-2026-${1000 + paidCount}`, '2026-01-15', accountantId);
    }

    // ---------------- Exams & marks ----------------
    const exIns = db.prepare(`INSERT INTO exams (org_id, name, exam_type, academic_year_id, start_date, end_date, publish_date, status, created_by) VALUES (1,?,?,1,?,?,?,?,?)`);
    const examAnnual = exIns.run('Annual Examination 2025–26', 'annual', '2026-03-10', '2026-03-24', '2026-04-15', 'results_published', orgAdminId).lastInsertRowid;
    const examHalf = exIns.run('Half Yearly Examination 2025–26', 'half_yearly', '2025-10-05', '2025-10-14', '2025-11-01', 'published', orgAdminId).lastInsertRowid;
    const examUnit = exIns.run('Unit Test 2 2025–26', 'unit', '2025-08-18', '2025-08-22', '2025-09-01', 'published', orgAdminId).lastInsertRowid;

    const ecIns = db.prepare(`INSERT INTO exam_classes (exam_id, class_id) VALUES (?,?)`);
    const esIns = db.prepare(`INSERT INTO exam_subjects (exam_id, class_id, subject_id, full_marks, pass_marks, exam_date) VALUES (?,?,?,?,?,?)`);
    for (let clsNum = 6; clsNum <= 10; clsNum++) {
      ecIns.run(examAnnual, classIds[clsNum]);
      ecIns.run(examHalf, classIds[clsNum]);
      ecIns.run(examUnit, classIds[clsNum]);
      for (const code of ['ENG', 'MATH', 'SCI', 'SSC', 'ODI', 'SAT', 'OLC', 'HIN']) {
        const sub = subjects.find((s) => s[1] === code);
        esIns.run(examAnnual, classIds[clsNum], subjectIds[code], sub[2], sub[3], null);
        esIns.run(examHalf, classIds[clsNum], subjectIds[code], sub[2], sub[3], null);
        esIns.run(examUnit, classIds[clsNum], subjectIds[code], sub[2], sub[3], null);
      }
    }

    // Marks for Annual exam — deterministic pseudo-random but plausible
    const mkIns = db.prepare(`INSERT OR REPLACE INTO marks (org_id, exam_id, student_id, subject_id, theory_marks, practical_marks, total, grade, status, entered_by)
      VALUES (1,?,?,?,?,?,?,?, 'submitted', ?)`);
    const resIns = db.prepare(`INSERT OR REPLACE INTO results (org_id, exam_id, student_id, total_marks, max_marks, percentage, grade, result_status, rank, remarks, published_at)
      VALUES (1,?,?,?,?,?,?,?,NULL,?,?)`);
    const gradeFor = (pct) => grades.find((g) => pct >= g[0] && pct <= g[1])?.[2] || 'F';
    const passFor = (pct) => (pct >= 33 ? 'pass' : 'fail');
    const seedRand = (n) => { const x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x); };
    let examRankIdx = 0;
    const perExamScores = new Map();
    const studentList = db.prepare('SELECT id, current_class_id, school_id, name FROM students WHERE current_class_id >= ?').all(classIds[6]);
    for (const st of studentList) {
      const clsNum = db.prepare('SELECT order_index FROM classes WHERE id = ?').get(st.current_class_id).order_index;
      const subjectsForExam = db.prepare('SELECT subject_id, full_marks, pass_marks FROM exam_subjects WHERE exam_id = ? AND class_id = ?').all(examAnnual, st.current_class_id);
      let total = 0, max = 0; let allPass = true;
      for (const s of subjectsForExam) {
        const r = seedRand(st.id * 31 + s.subject_id * 7);
        const pct = 35 + Math.floor(r * 60); // 35..95
        const theory = Math.round((s.full_marks * pct) / 100);
        const practical = 0;
        const tot = theory + practical;
        total += tot; max += s.full_marks;
        if (pct < s.pass_marks / s.full_marks * 100) allPass = false;
        mkIns.run(examAnnual, st.id, s.subject_id, theory, practical, tot, gradeFor(pct), teacher2);
      }
      const percentage = max ? (total / max) * 100 : 0;
      const status = percentage >= 33 && allPass ? 'pass' : 'fail';
      const key = `${st.school_id}`;
      if (!perExamScores.has(key)) perExamScores.set(key, []);
      perExamScores.get(key).push({ id: st.id, pct: percentage, status });
      resIns.run(examAnnual, st.id, total, max, Math.round(percentage * 100) / 100, gradeFor(percentage), status, 'Published on 15 April 2026', '2026-04-15');
    }
    // ranks within each school
    const rankUpd = db.prepare('UPDATE results SET rank = ? WHERE exam_id = ? AND student_id = ?');
    for (const [, list] of perExamScores) {
      list.sort((a, b) => b.pct - a.pct);
      list.forEach((item, i) => rankUpd.run(i + 1, examAnnual, item.id));
    }

    // ---------------- Attendance (last ~30 days) ----------------
    const attIns = db.prepare(`INSERT OR IGNORE INTO attendance (org_id, school_id, person_type, person_id, date, status, marked_by) VALUES (1,?,?,?,?,?,?)`);
    const statuses = ['present', 'present', 'present', 'present', 'late', 'absent', 'half_day', 'leave'];
    const allStudents = db.prepare('SELECT id, school_id FROM students').all();
    const today = new Date();
    for (let d = 29; d >= 0; d--) {
      const dt = new Date(today); dt.setDate(today.getDate() - d);
      if (dt.getDay() === 0) continue; // skip Sundays
      const date = dt.toISOString().slice(0, 10);
      for (const st of allStudents) {
        const sts = statuses[(st.id + d) % statuses.length];
        attIns.run(st.school_id, 'student', st.id, date, sts, teacher1);
      }
      const staffRows = db.prepare('SELECT id, school_id FROM staff').all();
      for (const sf of staffRows) {
        const sts = statuses[(sf.id + d + 2) % statuses.length];
        attIns.run(sf.school_id || 1, 'staff', sf.id, date, sts, principalId);
      }
    }

    // ---------------- Timetable ----------------
    const tp = db.prepare(`INSERT INTO timetable_periods (org_id, school_id, name, start_time, end_time, order_index) VALUES (1,?,?,?,?,?)`);
    const periods = [];
    const ptimes = [['09:00', '09:45'], ['09:45', '10:30'], ['10:30', '11:15'], ['11:15', '12:00'], ['12:30', '13:15'], ['13:15', '14:00'], ['14:00', '14:45']];
    for (let i = 0; i < 7; i++) {
      periods.push(tp.run(1, `Period ${i + 1}`, ptimes[i][0], ptimes[i][1], i + 1).lastInsertRowid);
    }
    const tt = db.prepare(`INSERT INTO timetable (org_id, school_id, class_id, section_id, day, period_id, subject_id, teacher_id, room) VALUES (1,?,?,?,?,?,?,?,?)`);
    const cls5sec = sectionIds['1-5-A'];
    const daySubjects = [
      ['ENG', 'MATH', 'SCI', 'ODI', 'SAT', 'ART', 'PE'],
      ['MATH', 'ENG', 'SSC', 'OLC', 'HIN', 'SCI', 'SAT'],
      ['ODI', 'SAT', 'ENG', 'MATH', 'SCI', 'COMP', 'PE'],
      ['SCI', 'MATH', 'SAT', 'ENG', 'SSC', 'ODI', 'ART'],
      ['SAT', 'ODI', 'MATH', 'SCI', 'ENG', 'HIN', 'PE'],
      ['ENG', 'SCI', 'ODI', 'MATH', 'OLC', 'COMP', 'SAT'],
    ];
    for (let day = 1; day <= 6; day++) {
      daySubjects[day - 1].forEach((code, idx) => {
        const teacher = code === 'SAT' ? 5 : (code === 'MATH' ? 3 : 2); // staff id approximations
        tt.run(1, classIds[5], cls5sec, day, periods[idx], subjectIds[code], teacher, `R5${String.fromCharCode(65 + idx)}`);
      });
    }

    // ---------------- Library ----------------
    const bk = db.prepare(`INSERT INTO books (org_id, title, author, publisher, isbn, category, copies_total, copies_available, rack_no) VALUES (1,?,?,?,?,?,?,?,?)`);
    const books = [
      ['Ol Chiki Primer', 'ASECA Language Cell', 'ASECA Publications', '978-81-00001', 'Santali', 40, 12, 'A1'],
      ['Santali Grammar and Composition', 'R. C. Murmu', 'Tribal Press', '978-81-00002', 'Santali', 25, 8, 'A1'],
      ['Baha Phula (Santali Poetry)', 'Community Authors', 'ASECA Publications', '978-81-00003', 'Literature', 15, 5, 'A2'],
      ['Science Textbook — Class 8', 'SCERT Odisha', 'SCERT', '978-81-00004', 'Science', 50, 20, 'B1'],
      ['Mathematics Workbook', 'NCERT', 'NCERT', '978-81-00005', 'Mathematics', 60, 25, 'B2'],
      ['Odisha: Land and People', 'H. K. Mahtab', 'Odisha Sahitya', '978-81-00006', 'History', 10, 3, 'C1'],
      ['Panchatantra Stories', 'Vishnu Sharma', 'Children\'s Press', '978-81-00007', 'Stories', 30, 10, 'C2'],
      ['Environment and Forests of Mayurbhanj', 'Forest Dept.', 'Govt. Press', '978-81-00008', 'Environment', 8, 4, 'C3'],
    ];
    const bookIds = [];
    for (const b of books) bookIds.push(bk.run(...b).lastInsertRowid);
    const lt = db.prepare(`INSERT INTO library_transactions (org_id, book_id, person_type, person_id, issue_date, due_date, status) VALUES (1,?,?,?,?,?,?)`);
    const stdIdsArr = Object.values(studentIds);
    for (let i = 0; i < 6; i++) {
      const issued = i % 3 !== 0;
      lt.run(bookIds[i % bookIds.length], 'student', stdIdsArr[i], '2026-02-02', '2026-02-16', issued ? (i % 2 ? 'issued' : 'returned') : 'returned');
    }

    // ---------------- Hostel ----------------
    const hIns = db.prepare(`INSERT INTO hostels (org_id, school_id, name, type, address, warden_id, total_rooms, total_beds) VALUES (1,1,?,?,?,?,?,?)`);
    const boysHostel = hIns.run('ASECA Boys Hostel', 'boys', 'Dangachua Campus', null, 4, 16).lastInsertRowid;
    const girlsHostel = hIns.run('ASECA Girls Hostel', 'girls', 'Dangachua Campus', null, 3, 12).lastInsertRowid;
    const rmIns = db.prepare(`INSERT INTO hostel_rooms (hostel_id, room_no, beds) VALUES (?,?,?)`);
    const roomIds = [];
    for (let i = 1; i <= 4; i++) roomIds.push(rmIns.run(boysHostel, `B${i}`, 4).lastInsertRowid);
    for (let i = 1; i <= 3; i++) roomIds.push(rmIns.run(girlsHostel, `G${i}`, 4).lastInsertRowid);
    const haIns = db.prepare(`INSERT INTO hostel_allocations (org_id, hostel_id, room_id, student_id, from_date, fee, status) VALUES (1,?,?,?,?,?,?)`);
    const hostelStudents = stdIdsArr.slice(0, 10);
    hostelStudents.forEach((sid, i) => {
      haIns.run(i % 2 ? girlsHostel : boysHostel, roomIds[i % roomIds.length], sid, '2025-04-01', 6000, 'active');
    });

    // ---------------- Gallery ----------------
    const alIns = db.prepare(`INSERT INTO albums (org_id, name, cover, description) VALUES (1,?,?,?)`);
    const albumIds = {
      schools: alIns.run('Our Schools', '/uploads/gallery-school.jpg', 'Campuses of ASECA schools').lastInsertRowid,
      cultural: alIns.run('Cultural Events', '/uploads/gallery-cultural.jpg', 'Sohrai, Baha and community celebrations').lastInsertRowid,
      sports: alIns.run('Sports', '/uploads/gallery-sports.jpg', 'Sports meets and games').lastInsertRowid,
      community: alIns.run('Community Programs', '/uploads/gallery-community.jpg', 'Outreach and community programmes').lastInsertRowid,
      education: alIns.run('Educational Activities', '/uploads/gallery-education.jpg', 'Classrooms, labs and learning').lastInsertRowid,
    };
    const galIns = db.prepare(`INSERT INTO gallery (org_id, album_id, title, image, category, caption, is_public) VALUES (1,?,?,?,?,?,1)`);
    const gallery = [
      [albumIds.schools, 'High School Campus', '/uploads/gallery-school.jpg', 'school', 'The main High School campus at Dangachua.'],
      [albumIds.schools, 'Morning Assembly', '/uploads/gallery-education.jpg', 'school', 'Students at morning assembly.'],
      [albumIds.cultural, 'Sohrai Festival Dance', '/uploads/gallery-cultural.jpg', 'cultural', 'Students performing a traditional dance during Sohrai.'],
      [albumIds.cultural, 'Baha Parab Celebration', '/uploads/culture-festival.jpg', 'cultural', 'Community celebration of the flower festival.'],
      [albumIds.sports, 'Kho-Kho Match', '/uploads/gallery-sports.jpg', 'sports', 'Girls\' kho-kho team in action at the block meet.'],
      [albumIds.sports, 'Athletics Day', '/uploads/gallery-education.jpg', 'sports', 'Races and athletics on the school ground.'],
      [albumIds.community, 'Tree Plantation Drive', '/uploads/gallery-community.jpg', 'community', 'Students planting saplings with community members.'],
      [albumIds.community, 'Parent Meeting', '/uploads/gallery-community.jpg', 'community', 'Parents and teachers at a community meeting.'],
      [albumIds.education, 'Science Lab Session', '/uploads/gallery-education.jpg', 'education', 'Hands-on learning in the science lab.'],
      [albumIds.education, 'Ol Chiki Class', '/uploads/culture-pattern.jpg', 'education', 'Learning to write in Ol Chiki script.'],
    ];
    for (const g of gallery) galIns.run(...g);

    // ---------------- Settings ----------------
    const setIns = db.prepare(`INSERT OR REPLACE INTO settings (org_id, key, value) VALUES (1,?,?)`);
    setIns.run('languages', JSON.stringify({
      enabled: ['en', 'od', 'hi', 'sat'],
      default: 'en',
      olchiki_enabled: true,
    }));
    setIns.run('grading_config', JSON.stringify({
      pass_percent: 33,
      rounding: 2,
      show_rank: true,
    }));
    setIns.run('attendance_config', JSON.stringify({ statuses: ['present', 'absent', 'late', 'half_day', 'leave'] }));
    setIns.run('notifications_config', JSON.stringify({ email_enabled: false, sms_enabled: false, whatsapp_enabled: false, push_enabled: false }));
    setIns.run('academic_year', JSON.stringify({ current_id: 1 }));

    // ---------------- Notifications ----------------
    const notifIns = db.prepare(`INSERT INTO notifications (org_id, user_id, title, body, type, link, is_read, is_important) VALUES (1,?,?,?,?,?,?,?)`);
    notifIns.run(orgAdminId, 'New admission season', 'Admissions for 2026–27 are now open across all schools.', 'info', '/app/notices', 0, 1);
    notifIns.run(orgAdminId, 'Results published', 'Annual Examination results have been published.', 'success', '/app/exams', 0, 1);
    notifIns.run(schoolAdminId, 'Fee dues pending', 'Several students have pending tuition fees for January.', 'warning', '/app/fees', 0, 0);
    notifIns.run(teacher1, 'Attendance reminder', 'Please mark today\'s attendance before 10 AM.', 'info', '/app/attendance', 0, 0);

    // ---------------- Documents / Certificates (a few) ----------------
    const docIns = db.prepare(`INSERT INTO documents (org_id, owner_type, owner_id, name, doc_type, file_path, file_size, is_sensitive, uploaded_by) VALUES (1,?,?,?,?,?,?,?,?)`);
    docIns.run('student', studentIds['STU-1001'], 'Transfer Certificate (previous school)', 'certificate', null, 0, 0, orgAdminId);
    docIns.run('student', studentIds['STU-1001'], 'Birth Certificate', 'identity', null, 0, 1, orgAdminId);
    docIns.run('student', studentIds['STU-1002'], 'Caste Certificate', 'identity', null, 0, 1, orgAdminId);
    const certIns = db.prepare(`INSERT INTO certificates (org_id, student_id, certificate_no, type, title, issue_date, issued_by) VALUES (1,?,?,?,?,?,?)`);
    certIns.run(studentIds['STU-1001'], 'CERT-2026-0001', 'bonafide', 'Bonafide Certificate', '2026-02-10', orgAdminId);
    certIns.run(studentIds['STU-1001'], 'CERT-2026-0002', 'study', 'Study Certificate', '2026-02-12', orgAdminId);
  });

  tx();
  console.log('[seed] Demo data created successfully.');
}

// Run directly when invoked as a script
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seed();
}
