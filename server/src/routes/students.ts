import { Router } from 'express';
import { db, generateId, maskAadhaar } from '../db';
import { AuthenticatedRequest, requireAuth, requireWrite, auditLog } from '../middleware/auth';

const router = Router();

const clean = (v: any) => (v === undefined || v === null ? '' : v);
const aadhaar12 = (v: any) => (v ? String(v).replace(/\D/g, '').slice(0, 12) : '');

router.get('/students', requireAuth, (req, res) => {
  try {
    const { schoolId, q } = req.query;
    let sql = `SELECT s.*, sc.name as school_name, c.name as class_name, sec.name as section_name
               FROM students s
               LEFT JOIN schools sc ON sc.id = s.school_id
               LEFT JOIN sections sec ON sec.id = s.section_id
               LEFT JOIN classes c ON c.id = sec.class_id
               WHERE s.status = 'active'`;
    const args: any[] = [];

    if (schoolId) { sql += ' AND s.school_id = ?'; args.push(schoolId); }
    if (q) { sql += ' AND (s.name LIKE ? OR s.roll_no LIKE ? OR s.admission_no LIKE ?)'; const s = `%${q}%`; args.push(s, s, s); }
    sql += ' ORDER BY s.name';

    const students = db.prepare(sql).all(...args) as any[];
    const isAdmin = ['super_admin', 'org_admin', 'school_admin', 'principal'].includes((req as any).user?.role);

    res.json(students.map((s) => ({
      ...s,
      school: { id: s.school_id, name: s.school_name },
      className: s.class_name,
      sectionName: s.section_name,
      aadhaar: isAdmin ? s.aadhaar : maskAadhaar(s.aadhaar),
      father_aadhaar: isAdmin ? s.father_aadhaar : maskAadhaar(s.father_aadhaar),
      mother_aadhaar: isAdmin ? s.mother_aadhaar : maskAadhaar(s.mother_aadhaar),
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

router.get('/students/:id', requireAuth, (req, res) => {
  try {
    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id) as any;
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const isAdmin = ['super_admin', 'org_admin', 'school_admin', 'principal'].includes((req as any).user?.role);
    if (!isAdmin) {
      student.aadhaar = maskAadhaar(student.aadhaar);
      student.father_aadhaar = maskAadhaar(student.father_aadhaar);
      student.mother_aadhaar = maskAadhaar(student.mother_aadhaar);
    }

    student.school = db.prepare('SELECT id, name, village, district FROM schools WHERE id = ?').get(student.school_id);
    student.attendance = db.prepare('SELECT * FROM attendance WHERE student_id = ? ORDER BY date DESC LIMIT 60').all(student.id);

    const present = (db.prepare("SELECT COUNT(*) c FROM attendance WHERE student_id = ? AND status = 'present'").get(student.id) as any).c;
    const total = (db.prepare('SELECT COUNT(*) c FROM attendance WHERE student_id = ?').get(student.id) as any).c;
    student.attendance_pct = total ? Math.round((present / total) * 100) : null;

    res.json(student);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

router.post('/students', requireAuth, requireWrite, (req: AuthenticatedRequest, res) => {
  try {
    const b = req.body;
    if (!b.name || !b.schoolId) return res.status(400).json({ error: 'Name and school are required' });
    if (b.aadhaar && String(b.aadhaar).replace(/\D/g, '').length !== 12) return res.status(400).json({ error: 'Aadhaar must be exactly 12 digits' });

    const id = generateId();
    db.prepare(`INSERT INTO students
      (id, school_id, section_id, student_id, admission_no, roll_no, name, ol_chiki_name, odia_name, dob, gender, blood_group, photo, aadhaar,
       father_name, father_aadhaar, mother_name, mother_aadhaar, guardian_name, guardian_mobile, village, block, district, state, pin, category,
       admission_date, previous_school, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      id, b.schoolId, b.sectionId || null, b.studentId || null, clean(b.admissionNo), clean(b.rollNo), b.name, clean(b.olChikiName), clean(b.odiaName),
      clean(b.dob), clean(b.gender), clean(b.bloodGroup), clean(b.photo), aadhaar12(b.aadhaar),
      clean(b.fatherName), aadhaar12(b.fatherAadhaar), clean(b.motherName), aadhaar12(b.motherAadhaar),
      clean(b.guardianName), clean(b.guardianMobile), clean(b.village), clean(b.block), clean(b.district), clean(b.state) || 'Odisha', clean(b.pin),
      clean(b.category), clean(b.admissionDate), clean(b.previousSchool), clean(b.status) || 'active'
    );

    auditLog(req.user?.id, req.user?.email, 'CREATE', 'students', `${b.name} (id ${id})`);
    res.json({ id });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ error: 'Failed to create student' });
  }
});

router.put('/students/:id', requireAuth, requireWrite, (req: AuthenticatedRequest, res) => {
  try {
    const b = req.body;
    if (b.aadhaar && String(b.aadhaar).replace(/\D/g, '').length !== 12) return res.status(400).json({ error: 'Aadhaar must be exactly 12 digits' });

    db.prepare(`UPDATE students SET
      school_id=?, section_id=?, student_id=?, admission_no=?, roll_no=?, name=?, ol_chiki_name=?, odia_name=?, dob=?, gender=?, blood_group=?, photo=?, aadhaar=?,
      father_name=?, father_aadhaar=?, mother_name=?, mother_aadhaar=?, guardian_name=?, guardian_mobile=?, village=?, block=?, district=?, state=?, pin=?, category=?,
      admission_date=?, previous_school=?, status=?, updated_at=datetime('now')
      WHERE id=?`).run(
      b.schoolId, b.sectionId || null, b.studentId || null, clean(b.admissionNo), clean(b.rollNo), b.name, clean(b.olChikiName), clean(b.odiaName),
      clean(b.dob), clean(b.gender), clean(b.bloodGroup), clean(b.photo), aadhaar12(b.aadhaar),
      clean(b.fatherName), aadhaar12(b.fatherAadhaar), clean(b.motherName), aadhaar12(b.motherAadhaar),
      clean(b.guardianName), clean(b.guardianMobile), clean(b.village), clean(b.block), clean(b.district), clean(b.state) || 'Odisha', clean(b.pin),
      clean(b.category), clean(b.admissionDate), clean(b.previousSchool), clean(b.status) || 'active',
      req.params.id
    );

    auditLog(req.user?.id, req.user?.email, 'UPDATE', 'students', `${b.name} (id ${req.params.id})`);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update student' });
  }
});

router.delete('/students/:id', requireAuth, requireWrite, (req: AuthenticatedRequest, res) => {
  try {
    db.prepare('DELETE FROM students WHERE id = ?').run(req.params.id);
    auditLog(req.user?.id, req.user?.email, 'DELETE', 'students', `id ${req.params.id}`);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

export default router;
