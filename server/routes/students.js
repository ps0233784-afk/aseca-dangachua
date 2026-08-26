import { Router } from 'express';
import { db, all, one, run } from '../db.js';
import { requireAuth, requirePermission, audit, schoolScope, isOrgLevel, safeStudentRow } from '../middleware.js';
import { ok, fail, listResult, parseIntSafe, jsonOrNull } from './_util.js';

const router = Router();

function studentScope(req) {
  const u = req.user;
  if (['super_admin', 'org_admin'].includes(u.role_key)) return { where: '', params: [] };
  if (u.role_key === 'parent' || u.role_key === 'student') {
    // limited — handled separately in profile endpoints
    return { where: '', params: [] };
  }
  if (u.school_id) return { where: ' AND st.school_id = ?', params: [u.school_id] };
  return { where: '', params: [] };
}

// ---------- List / search ----------
router.get('/students', requireAuth, (req, res) => {
  const sc = studentScope(req);
  const { page, limit, offset } = { page: parseIntSafe(req.query.page, 1), limit: Math.min(500, parseIntSafe(req.query.limit, 20)), offset: (parseIntSafe(req.query.page, 1) - 1) * Math.min(500, parseIntSafe(req.query.limit, 20)) };
  const clauses = [];
  const params = [];
  if (req.query.q) {
    clauses.push(`(st.name LIKE ? OR st.student_id LIKE ? OR st.admission_no LIKE ? OR st.roll_no LIKE ? OR st.father_name LIKE ? OR st.mobile LIKE ?)`);
    const q = `%${req.query.q}%`;
    params.push(q, q, q, q, q, q);
  }
  if (req.query.school_id) { clauses.push('st.school_id = ?'); params.push(req.query.school_id); }
  if (req.query.class_id) { clauses.push('st.current_class_id = ?'); params.push(req.query.class_id); }
  if (req.query.section_id) { clauses.push('st.current_section_id = ?'); params.push(req.query.section_id); }
  if (req.query.status && req.query.status !== 'all') { clauses.push('st.status = ?'); params.push(req.query.status); }
  if (req.query.gender) { clauses.push('st.gender = ?'); params.push(req.query.gender); }
  if (req.query.category) { clauses.push('st.category = ?'); params.push(req.query.category); }
  const where = clauses.length ? ' WHERE ' + clauses.join(' AND ') : '';
  const total = one(`SELECT COUNT(*) c FROM students st ${where}${sc.where}`, [...params, ...sc.params]).c;
  const rows = all(`SELECT st.id, st.student_id, st.admission_no, st.roll_no, st.name, st.name_odia, st.name_santali, st.photo, st.dob, st.gender, st.blood_group, st.father_name, st.mother_name, st.guardian_name, st.mobile, st.village, st.block, st.district, st.category, st.admission_date, st.status, st.school_id, st.current_class_id, st.current_section_id, st.academic_year_id,
      c.name AS class_name, sec.name AS section_name, sc.name AS school_name
    FROM students st
    LEFT JOIN classes c ON c.id = st.current_class_id
    LEFT JOIN sections sec ON sec.id = st.current_section_id
    LEFT JOIN schools sc ON sc.id = st.school_id
    ${where}${sc.where} ORDER BY st.id DESC LIMIT ? OFFSET ?`, [...params, ...sc.params, limit, offset]);
  res.json({ ok: true, data: rows, total, page, limit });
});

// ---------- Get one (full profile) ----------
router.get('/students/:id', requireAuth, (req, res) => {
  const st = one(`SELECT * FROM students WHERE id = ?`, [req.params.id]);
  if (!st) return fail(res, 404, 'Student not found');
  const u = req.user;
  const orgLevel = isOrgLevel(u);
  if (!orgLevel) {
    if (u.role_key === 'parent' || u.role_key === 'student') {
      const allowed = myStudentIds(u);
      if (!allowed.includes(st.id)) return fail(res, 403, 'Access denied');
    } else if (u.school_id && st.school_id !== u.school_id) {
      return fail(res, 403, 'Access denied');
    }
  }
  const classInfo = one(`SELECT name FROM classes WHERE id = ?`, [st.current_class_id]);
  const sectionInfo = one(`SELECT name FROM sections WHERE id = ?`, [st.current_section_id]);
  const schoolInfo = one(`SELECT id, name FROM schools WHERE id = ?`, [st.school_id]);
  const guardians = all(`SELECT g.*, sg.is_primary FROM guardians g JOIN student_guardians sg ON sg.guardian_id = g.id WHERE sg.student_id = ?`, [st.id]);
  const docs = all(`SELECT * FROM documents WHERE owner_type = 'student' AND owner_id = ? ORDER BY created_at DESC`, [st.id]);
  const certs = all(`SELECT * FROM certificates WHERE student_id = ? ORDER BY issue_date DESC`, [st.id]);
  const enrollment = all(`SELECT ay.name AS year_name, e.* FROM academic_years ay WHERE ay.id = COALESCE(?, (SELECT id FROM academic_years WHERE is_current=1 LIMIT 1))`, [st.academic_year_id]);
  res.json({ ok: true, data: { ...safeStudentRow(st), class_name: classInfo?.name, section_name: sectionInfo?.name, school_name: schoolInfo?.name, guardians, documents: docs, certificates: certs, academic_year_name: enrollment[0]?.name || null } });
});

function myStudentIds(u) {
  if (u.role_key === 'student') {
    const row = one(`SELECT id FROM students WHERE user_id = ?`, [u.id]);
    return row ? [row.id] : [];
  }
  if (u.role_key === 'parent') {
    const g = one(`SELECT id FROM guardians WHERE user_id = ?`, [u.id]);
    if (!g) return [];
    return all(`SELECT student_id FROM student_guardians WHERE guardian_id = ?`, [g.id]).map((r) => r.student_id);
  }
  return [];
}

// Linked students for the current user (student / parent portals)
router.get('/my-students', requireAuth, (req, res) => {
  const u = req.user;
  let ids = [];
  if (u.role_key === 'student') {
    const row = one(`SELECT id FROM students WHERE user_id = ?`, [u.id]);
    ids = row ? [row.id] : [];
  } else if (u.role_key === 'parent') {
    const g = one(`SELECT id FROM guardians WHERE user_id = ?`, [u.id]);
    if (g) ids = all(`SELECT student_id FROM student_guardians WHERE guardian_id = ?`, [g.id]).map((r) => r.student_id);
  } else {
    return res.json({ ok: true, data: [] });
  }
  if (!ids.length) return res.json({ ok: true, data: [] });
  const rows = all(`SELECT st.id, st.name, st.photo, st.student_id, st.roll_no, st.current_class_id, st.current_section_id, st.school_id,
      c.name AS class_name, sec.name AS section_name, sc.name AS school_name
    FROM students st
    LEFT JOIN classes c ON c.id = st.current_class_id
    LEFT JOIN sections sec ON sec.id = st.current_section_id
    LEFT JOIN schools sc ON sc.id = st.school_id
    WHERE st.id IN (${ids.map(() => '?').join(',')}) ORDER BY st.name`, ids);
  res.json({ ok: true, data: rows });
});

// ---------- Create ----------
router.post('/students', requireAuth, requirePermission('students', 'create'), (req, res) => {
  const b = req.body || {};
  if (!b.name || !b.school_id) return fail(res, 400, 'Name and school are required');
  const student_id = b.student_id || ('STU-' + (10000 + Math.floor(Math.random() * 90000)));
  const admission_no = b.admission_no || ('ADM-' + (1000 + Math.floor(Math.random() * 9000)));
  try {
    const info = run(`INSERT INTO students (org_id, school_id, student_id, admission_no, roll_no, name, name_odia, name_santali, photo, dob, gender, blood_group, father_name, mother_name, guardian_name, guardian_relation, mobile, email, address, village, block, district, pincode, category, aadhaar, current_class_id, current_section_id, academic_year_id, admission_date, previous_school, status)
      VALUES (1,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [b.school_id, student_id, admission_no, b.roll_no || null, b.name, b.name_odia || null, b.name_santali || null, b.photo || null,
       b.dob || null, b.gender || null, b.blood_group || null, b.father_name || null, b.mother_name || null, b.guardian_name || null,
       b.guardian_relation || null, b.mobile || null, b.email || null, b.address || null, b.village || null, b.block || null,
       b.district || null, b.pincode || null, b.category || 'General', b.aadhaar || null, parseIntSafe(b.current_class_id),
       parseIntSafe(b.current_section_id), parseIntSafe(b.academic_year_id), b.admission_date || null, b.previous_school || null,
       b.status || 'active']);
    audit(req.user, 'create_student', 'student', info.lastInsertRowid, { name: b.name }, req.ip);
    res.json({ ok: true, id: info.lastInsertRowid });
  } catch (e) {
    return fail(res, 400, e.message.includes('UNIQUE') ? 'Student ID already exists' : e.message);
  }
});

// ---------- Update ----------
router.put('/students/:id', requireAuth, requirePermission('students', 'update'), (req, res) => {
  const b = req.body || {};
  const existing = one(`SELECT * FROM students WHERE id = ?`, [req.params.id]);
  if (!existing) return fail(res, 404, 'Student not found');
  const fields = ['student_id','admission_no','roll_no','name','name_odia','name_santali','photo','dob','gender','blood_group','father_name','mother_name','guardian_name','guardian_relation','mobile','email','address','village','block','district','pincode','category','aadhaar','current_class_id','current_section_id','academic_year_id','admission_date','previous_school','status','school_id'];
  const sets = []; const params = [];
  for (const f of fields) {
    if (b[f] !== undefined) { sets.push(`${f} = ?`); params.push(b[f]); }
  }
  if (!sets.length) return res.json({ ok: true });
  sets.push(`updated_at = datetime('now')`);
  params.push(req.params.id);
  run(`UPDATE students SET ${sets.join(', ')} WHERE id = ?`, params);
  audit(req.user, 'update_student', 'student', req.params.id, { name: b.name }, req.ip);
  res.json({ ok: true });
});

// ---------- Actions: archive / restore / transfer / promote ----------
router.post('/students/:id/archive', requireAuth, requirePermission('students', 'update'), (req, res) => {
  run(`UPDATE students SET status = 'archived' WHERE id = ?`, [req.params.id]);
  audit(req.user, 'archive_student', 'student', req.params.id, {}, req.ip);
  res.json({ ok: true });
});
router.post('/students/:id/restore', requireAuth, requirePermission('students', 'update'), (req, res) => {
  run(`UPDATE students SET status = 'active' WHERE id = ?`, [req.params.id]);
  res.json({ ok: true });
});
router.post('/students/:id/transfer', requireAuth, requirePermission('students', 'update'), (req, res) => {
  const { school_id } = req.body || {};
  run(`UPDATE students SET school_id = ? WHERE id = ?`, [school_id, req.params.id]);
  audit(req.user, 'transfer_student', 'student', req.params.id, { school_id }, req.ip);
  res.json({ ok: true });
});
router.post('/students/promote', requireAuth, requirePermission('students', 'update'), (req, res) => {
  const { student_ids, to_class_id } = req.body || {};
  if (!Array.isArray(student_ids) || !to_class_id) return fail(res, 400, 'student_ids and to_class_id required');
  const stmt = db.prepare(`UPDATE students SET current_class_id = ? WHERE id = ?`);
  const tx = db.transaction(() => { for (const id of student_ids) stmt.run(to_class_id, id); });
  tx();
  audit(req.user, 'promote_students', 'student', null, { count: student_ids.length, to_class_id }, req.ip);
  res.json({ ok: true, count: student_ids.length });
});
router.delete('/students/:id', requireAuth, requirePermission('students', 'delete'), (req, res) => {
  run(`DELETE FROM students WHERE id = ?`, [req.params.id]);
  audit(req.user, 'delete_student', 'student', req.params.id, {}, req.ip);
  res.json({ ok: true });
});

// ---------- Import (Excel/CSV via xlsx) ----------
router.post('/students/import', requireAuth, requirePermission('students', 'create'), async (req, res) => {
  const { rows } = req.body || {};
  if (!Array.isArray(rows) || !rows.length) return fail(res, 400, 'No rows to import');
  const valid = []; const invalid = []; const duplicates = [];
  const seen = new Set();
  const insert = db.prepare(`INSERT INTO students (org_id, school_id, student_id, admission_no, roll_no, name, gender, dob, father_name, mother_name, guardian_name, mobile, village, block, district, category, current_class_id, current_section_id, admission_date, status)
    VALUES (1,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const classByName = new Map(all(`SELECT id, name FROM classes`).map((c) => [c.name.toLowerCase(), c.id]));
  const schoolByName = new Map(all(`SELECT id, name FROM schools`).map((s) => [s.name.toLowerCase(), s.id]));
  const tx = db.transaction(() => {
    for (const r of rows) {
      const name = (r.name || r.Name || '').toString().trim();
      const schoolName = (r.school || r.School || '').toString().trim();
      const className = (r.class || r.Class || '').toString().trim();
      const student_id = (r.student_id || r['Student ID'] || `STU-${10000 + Math.floor(Math.random() * 90000)}`).toString().trim();
      const errors = [];
      if (!name) errors.push('Missing name');
      if (!schoolName || !schoolByName.has(schoolName.toLowerCase())) errors.push('Invalid school');
      if (!className || !classByName.has(className.toLowerCase())) errors.push('Invalid class');
      if (!errors.length && seen.has(student_id)) { duplicates.push({ ...r, reason: 'Duplicate student_id in file' }); continue; }
      if (!errors.length) {
        const existing = one(`SELECT id FROM students WHERE student_id = ?`, [student_id]);
        if (existing) { duplicates.push({ ...r, reason: 'Student ID already exists' }); continue; }
      }
      if (errors.length) { invalid.push({ ...r, errors }); continue; }
      seen.add(student_id);
      const school_id = schoolByName.get(schoolName.toLowerCase());
      const class_id = classByName.get(className.toLowerCase());
      const section = one(`SELECT id FROM sections WHERE school_id = ? AND class_id = ? LIMIT 1`, [school_id, class_id]);
      insert.run(school_id, student_id, `ADM-${Math.floor(1000 + Math.random() * 9000)}`, r.roll_no?.toString() || null, name,
        r.gender || null, r.dob || null, r.father_name || null, r.mother_name || null, r.guardian_name || null,
        r.mobile?.toString() || null, r.village || null, r.block || null, r.district || null, r.category || 'General',
        class_id, section?.id || null, r.admission_date || null, 'active');
      valid.push({ ...r });
    }
  });
  tx();
  audit(req.user, 'import_students', 'student', null, { valid: valid.length, invalid: invalid.length, duplicates: duplicates.length }, req.ip);
  res.json({ ok: true, valid: valid.length, invalid, duplicates });
});

// ---------- Documents ----------
router.post('/students/:id/documents', requireAuth, requirePermission('documents', 'create'), (req, res) => {
  const b = req.body || {};
  const info = run(`INSERT INTO documents (org_id, owner_type, owner_id, name, doc_type, file_path, file_size, is_sensitive, uploaded_by)
    VALUES (1,'student',?,?,?,?,?,?,?)`,
    [req.params.id, b.name, b.doc_type || 'other', b.file_path || null, parseIntSafe(b.file_size, 0), b.is_sensitive ? 1 : 0, req.user.id]);
  audit(req.user, 'add_document', 'document', info.lastInsertRowid, { name: b.name }, req.ip);
  res.json({ ok: true, id: info.lastInsertRowid });
});
router.delete('/documents/:id', requireAuth, requirePermission('documents', 'delete'), (req, res) => {
  run(`DELETE FROM documents WHERE id = ?`, [req.params.id]);
  res.json({ ok: true });
});

// ---------- Guardians ----------
router.post('/students/:id/guardians', requireAuth, requirePermission('students', 'update'), (req, res) => {
  const b = req.body || {};
  const g = run(`INSERT INTO guardians (org_id, name, relation, mobile, email, address, occupation) VALUES (1,?,?,?,?,?,?)`,
    [b.name, b.relation || 'Parent', b.mobile || null, b.email || null, b.address || null, b.occupation || null]);
  run(`INSERT INTO student_guardians (student_id, guardian_id, is_primary) VALUES (?,?,?)`, [req.params.id, g.lastInsertRowid, b.is_primary ? 1 : 0]);
  audit(req.user, 'add_guardian', 'guardian', g.lastInsertRowid, { name: b.name }, req.ip);
  res.json({ ok: true, id: g.lastInsertRowid });
});

export default router;
