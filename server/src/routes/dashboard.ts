import { Router } from 'express';
import { db } from '../db';
import { AuthenticatedRequest, requireAuth, requireSchoolAccess } from '../middleware/auth';

const router = Router();
router.get('/dashboard/stats', requireAuth, requireSchoolAccess, (req: AuthenticatedRequest, res) => {
  try {
    const schoolId = typeof req.query.schoolId === 'string' ? req.query.schoolId : undefined;
    const count = (sql: string, args: any[] = []) => Number((db.prepare(sql).get(...args) as any)?.c || 0);
    const bySchool = (table: string, status = false) => {
      const args = schoolId ? [schoolId] : [];
      return count(`SELECT COUNT(*) c FROM ${table}${status ? " WHERE status = 'active'" : ' WHERE 1=1'}${schoolId ? ' AND school_id = ?' : ''}`, args);
    };
    const stats = {
      schools: schoolId ? count('SELECT COUNT(*) c FROM schools WHERE id = ?', [schoolId]) : count('SELECT COUNT(*) c FROM schools'),
      students: bySchool('students', true), teachers: bySchool('teachers', true), staff: bySchool('staff_members', true),
      exams: bySchool('exams'), notices: bySchool('notices'), events: bySchool('events'), books: bySchool('books'),
    };
    const attendanceTrend = db.prepare(`SELECT date, SUM(CASE WHEN status='present' THEN 1 ELSE 0 END) present, SUM(CASE WHEN status='absent' THEN 1 ELSE 0 END) absent, SUM(CASE WHEN status='late' THEN 1 ELSE 0 END) late, COUNT(*) total FROM attendance GROUP BY date ORDER BY date DESC LIMIT 14`).all().reverse();
    const recentNotices = schoolId ? db.prepare('SELECT * FROM notices WHERE school_id = ? ORDER BY date DESC LIMIT 5').all(schoolId) : db.prepare('SELECT * FROM notices ORDER BY date DESC LIMIT 5').all();
    const schoolWise = schoolId ? db.prepare(`SELECT s.name, COUNT(st.id) students FROM schools s LEFT JOIN students st ON st.school_id = s.id AND st.status = 'active' WHERE s.id = ? GROUP BY s.id`).all(schoolId) : db.prepare(`SELECT s.name, COUNT(st.id) students FROM schools s LEFT JOIN students st ON st.school_id = s.id AND st.status = 'active' GROUP BY s.id`).all();
    res.json({ stats, attendanceTrend, recentNotices, schoolWise });
  } catch (error) { console.error('Dashboard error:', error); res.status(500).json({ error: 'Failed to fetch dashboard stats' }); }
});
export default router;
