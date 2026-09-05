import { Router } from 'express';
import { db, generateId } from '../db';
import { AuthenticatedRequest, requireAuth, requireSchoolAccess, requireWrite, auditLog } from '../middleware/auth';

const router = Router();

// Academic Years
router.get('/academic-years', requireAuth, requireSchoolAccess, (req, res) => {
  try {
    const { schoolId } = req.query;
    let sql = 'SELECT * FROM academic_years';
    const args: any[] = [];
    if (schoolId) { sql += ' WHERE school_id = ?'; args.push(schoolId); }
    sql += ' ORDER BY start_date DESC';
    res.json(db.prepare(sql).all(...args));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch academic years' });
  }
});

router.post('/academic-years', requireAuth, requireWrite, (req: AuthenticatedRequest, res) => {
  try {
    const b = req.body;
    if (!b.name || !b.schoolId) return res.status(400).json({ error: 'Name and school are required' });
    const id = generateId();
    db.prepare('INSERT INTO academic_years (id, school_id, name, start_date, end_date, is_active) VALUES (?, ?, ?, ?, ?, ?)').run(
      id, b.schoolId, b.name, b.start || '', b.end || '', b.isActive ? 1 : 0
    );
    auditLog(req.user?.id, req.user?.email, 'CREATE', 'academic_years', b.name);
    res.json({ id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create academic year' });
  }
});

// Classes
router.get('/classes', requireAuth, requireSchoolAccess, (req, res) => {
  try {
    const { schoolId } = req.query;
    let sql = 'SELECT * FROM classes';
    const args: any[] = [];
    if (schoolId) { sql += ' WHERE school_id = ?'; args.push(schoolId); }
    sql += ' ORDER BY display_order';
    res.json(db.prepare(sql).all(...args));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

router.post('/classes', requireAuth, requireWrite, (req: AuthenticatedRequest, res) => {
  try {
    const b = req.body;
    if (!b.name || !b.schoolId) return res.status(400).json({ error: 'Name and school are required' });
    const id = generateId();
    db.prepare('INSERT INTO classes (id, school_id, name, display_order) VALUES (?, ?, ?, ?)').run(id, b.schoolId, b.name, b.order || 0);
    auditLog(req.user?.id, req.user?.email, 'CREATE', 'classes', b.name);
    res.json({ id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create class' });
  }
});

// Subjects
router.get('/subjects', requireAuth, (req, res) => {
  try {
    const { academicYearId } = req.query;
    let sql = "SELECT * FROM subjects WHERE status = 'active'";
    const args: any[] = [];
    if (academicYearId) { sql += ' AND academic_year_id = ?'; args.push(academicYearId); }
    sql += ' ORDER BY display_order';
    res.json(db.prepare(sql).all(...args));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

router.post('/subjects', requireAuth, requireWrite, (req: AuthenticatedRequest, res) => {
  try {
    const b = req.body;
    if (!b.name || !b.academicYearId) return res.status(400).json({ error: 'Name and academic year are required' });
    const id = generateId();
    db.prepare(`INSERT INTO subjects (id, academic_year_id, name, odia_name, santali_name, ol_chiki_name, code, full_marks, pass_marks, theory_marks, practical_marks, type, display_order, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      id, b.academicYearId, b.name, b.odiaName || '', b.santaliName || '', b.olChikiName || '', b.code || '',
      b.fullMarks || 100, b.passMarks || 33, b.theoryMarks || 100, b.practicalMarks || 0, b.type || 'Theory', b.order || 0, b.status || 'active'
    );
    auditLog(req.user?.id, req.user?.email, 'CREATE', 'subjects', b.name);
    res.json({ id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create subject' });
  }
});

export default router;
