import { Router } from 'express';
import { db } from '../db';
import { AuthenticatedRequest, requireAuth, requireSchoolAccess } from '../middleware/auth';

const router = Router();

router.get('/dashboard/stats', requireAuth, requireSchoolAccess, (req: AuthenticatedRequest, res) => {
  try {
    const schoolId = req.query.schoolId as string | undefined;
    const count = (sql: string, args: any[] = []) => (db.prepare(sql).get(...args) as any).c;

    const schoolFilter = schoolId ? ` AND school_id = '${schoolId}'` : '';
    const activeSchoolFilter = schoolId ? ` WHERE id = '${schoolId}'` : '';

    const stats = {
      schools: count(`SELECT COUNT(*) c FROM schools${activeSchoolFilter}`),
      students: count(`SELECT COUNT(*) c FROM students WHERE status = 'active'${schoolFilter}`),
      teachers: count(`SELECT COUNT(*) c FROM teachers WHERE status = 'active'${schoolFilter}`),
      staff: count(`SELECT COUNT(*) c FROM staff_members WHERE status = 'active'${schoolFilter}`),
      exams: count(`SELECT COUNT(*) c FROM exams${schoolId ? ` WHERE school_id = '${schoolId}'` : ''}`),
      notices: count(`SELECT COUNT(*) c FROM notices${schoolId ? ` WHERE school_id = '${schoolId}'` : ''}`),
      events: count(`SELECT COUNT(*) c FROM events${schoolId ? ` WHERE school_id = '${schoolId}'` : ''}`),
      books: count(`SELECT COUNT(*) c FROM books${schoolId ? ` WHERE school_id = '${schoolId}'` : ''}`),
    };

    const attendanceTrend = db.prepare(`
      SELECT date,
        SUM(CASE WHEN status='present' THEN 1 ELSE 0 END) present,
        SUM(CASE WHEN status='absent' THEN 1 ELSE 0 END) absent,
        SUM(CASE WHEN status='late' THEN 1 ELSE 0 END) late,
        COUNT(*) total
      FROM attendance
      GROUP BY date ORDER BY date DESC LIMIT 14
    `).all().reverse();

    const recentNotices = db.prepare(`SELECT * FROM notices ORDER BY date DESC LIMIT 5`).all();

    const schoolWise = db.prepare(`
      SELECT s.name, COUNT(st.id) students FROM schools s
      LEFT JOIN students st ON st.school_id = s.id AND st.status = 'active'
      GROUP BY s.id
    `).all();

    res.json({ stats, attendanceTrend, recentNotices, schoolWise });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

export default router;
