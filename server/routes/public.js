import { Router } from 'express';
import { all, one } from '../db.js';
import { ok, fail } from './_util.js';

const router = Router();

// Everything here is PUBLIC, safe-for-web data only (no sensitive fields).

router.get('/public/bootstrap', (req, res) => {
  const org = one(`SELECT id, name, short_name, tagline, logo, favicon, hero_image, address, village, block, district, state, pincode, phone, email, website, established_year, about, mission, vision, footer_text, social, theme, brand_colors, stats_overrides FROM organizations ORDER BY id LIMIT 1`);
  const settingsRows = all(`SELECT key, value FROM settings WHERE org_id = 1 AND key IN ('languages','grading_config')`);
  const settings = {};
  for (const r of settingsRows) { try { settings[r.key] = JSON.parse(r.value); } catch { settings[r.key] = r.value; } }
  const languages = settings.languages || { enabled: ['en','od','hi','sat'], default: 'en', olchiki_enabled: true };

  const stats = {
    schools: one(`SELECT COUNT(*) c FROM schools WHERE status='active'`).c,
    students: one(`SELECT COUNT(*) c FROM students WHERE status='active'`).c,
    teachers: one(`SELECT COUNT(*) c FROM staff WHERE staff_type='teaching' AND status='active'`).c,
    staff: one(`SELECT COUNT(*) c FROM staff WHERE status='active'`).c,
    years: org?.established_year ? Math.max(1, new Date().getFullYear() - org.established_year) : 27,
  };
  // overrides
  if (org?.stats_overrides) { try { Object.assign(stats, JSON.parse(org.stats_overrides)); } catch {} }

  res.json({ ok: true, data: { org, languages, stats } });
});

router.get('/public/schools', (req, res) => {
  const q = `%${req.query.q || ''}%`;
  const rows = all(`SELECT id, name, code, logo, photo, address, village, block, district, cluster, pincode, phone, email, principal_name, school_type, medium, established_year, description,
      (SELECT COUNT(*) FROM students st WHERE st.school_id = s.id) AS student_count,
      (SELECT COUNT(*) FROM staff sf WHERE sf.school_id = s.id) AS teacher_count
    FROM schools s WHERE status = 'active' AND (name LIKE ? OR village LIKE ? OR block LIKE ? OR medium LIKE ? OR school_type LIKE ?) ORDER BY name`, [q, q, q, q, q]);
  res.json({ ok: true, data: rows });
});

router.get('/public/managing-body', (req, res) => {
  res.json({ ok: true, data: all(`SELECT id, name, designation, photo, bio FROM managing_body WHERE status='active' ORDER BY order_index`) });
});

router.get('/public/notices', (req, res) => {
  const rows = all(`SELECT id, title, body, category, priority, publish_at, created_at FROM notices
    WHERE status='published' AND (publish_at IS NULL OR publish_at <= datetime('now'))
    ORDER BY COALESCE(publish_at, created_at) DESC LIMIT 20`);
  res.json({ ok: true, data: rows });
});

router.get('/public/events', (req, res) => {
  const rows = all(`SELECT id, title, description, category, event_date, start_time, end_time, venue, image FROM events
    WHERE status='published' AND event_date >= date('now', '-1 day') ORDER BY event_date ASC LIMIT 20`);
  res.json({ ok: true, data: rows });
});

router.get('/public/achievements', (req, res) => {
  res.json({ ok: true, data: all(`SELECT id, title, description, category, image, achievement_date FROM achievements WHERE is_public=1 ORDER BY achievement_date DESC LIMIT 12`) });
});

router.get('/public/gallery', (req, res) => {
  const albums = all(`SELECT a.id, a.name, a.cover, a.description, (SELECT COUNT(*) FROM gallery g WHERE g.album_id = a.id) AS photo_count FROM albums a ORDER BY a.id`);
  const photos = all(`SELECT g.id, g.album_id, g.title, g.image, g.category, g.caption FROM gallery g WHERE g.is_public=1 ORDER BY g.id DESC LIMIT 200`);
  res.json({ ok: true, data: { albums, photos } });
});

router.get('/public/culture', (req, res) => {
  const rows = all(`SELECT section_key, title, body, image FROM culture_content ORDER BY id`);
  const map = {};
  for (const r of rows) map[r.section_key] = r;
  res.json({ ok: true, data: map });
});

// ---------- Result search (public, safe) ----------
router.get('/public/result-search', (req, res) => {
  const { roll, exam_id } = req.query;
  if (!roll) return fail(res, 400, 'Roll number / Student ID required');
  const st = one(`SELECT id, name, student_id, admission_no, roll_no, current_class_id, current_section_id, school_id FROM students
    WHERE roll_no = ? OR student_id = ? OR admission_no = ?`, [roll, roll, roll]);
  if (!st) return fail(res, 404, 'No student found with this Roll Number / ID. Please check and try again.');
  let exam;
  if (exam_id) {
    exam = one(`SELECT * FROM exams WHERE id = ? AND status = 'results_published'`, [exam_id]);
  } else {
    exam = one(`SELECT e.* FROM exams e JOIN results r ON r.exam_id = e.id WHERE r.student_id = ? AND e.status='results_published' ORDER BY e.id DESC LIMIT 1`, [st.id]);
  }
  if (!exam) return fail(res, 404, 'No published result available for this student yet.');
  const result = one(`SELECT * FROM results WHERE exam_id = ? AND student_id = ?`, [exam.id, st.id]);
  if (!result) return fail(res, 404, 'Result not published yet.');
  const subjects = all(`SELECT m.theory_marks, m.practical_marks, m.total, m.grade, s.name AS subject_name, es.full_marks, es.pass_marks
    FROM marks m JOIN subjects s ON s.id = m.subject_id
    LEFT JOIN exam_subjects es ON es.exam_id = m.exam_id AND es.subject_id = m.subject_id
    WHERE m.exam_id = ? AND m.student_id = ? ORDER BY s.name`, [exam.id, st.id]);
  const school = one(`SELECT name FROM schools WHERE id = ?`, [st.school_id]);
  const klass = one(`SELECT name FROM classes WHERE id = ?`, [st.current_class_id]);
  res.json({
    ok: true,
    data: {
      student: { name: st.name, roll_no: st.roll_no, student_id: st.student_id, admission_no: st.admission_no, school: school?.name, class: klass?.name },
      exam: { id: exam.id, name: exam.name, academic_year: exam.academic_year_id },
      result,
      subjects,
    },
  });
});

// List published exams for the result dropdown
router.get('/public/published-exams', (req, res) => {
  res.json({ ok: true, data: all(`SELECT id, name FROM exams WHERE status='results_published' ORDER BY id DESC LIMIT 10`) });
});

// QR verification returns the same safe result by a verification token
router.get('/public/verify-result', (req, res) => {
  const { student_id, exam_id } = req.query;
  if (!student_id || !exam_id) return fail(res, 400, 'Invalid verification link');
  const st = one(`SELECT id, name, roll_no, student_id AS sid, admission_no FROM students WHERE student_id = ?`, [student_id]);
  if (!st) return fail(res, 404, 'Result not found');
  const result = one(`SELECT r.*, e.name AS exam_name FROM results r JOIN exams e ON e.id = r.exam_id WHERE r.student_id = ? AND r.exam_id = ?`, [st.id, exam_id]);
  if (!result) return fail(res, 404, 'Result not found');
  res.json({ ok: true, data: { student_name: st.name, roll_no: st.roll_no, exam_name: result.exam_name, percentage: result.percentage, grade: result.grade, result_status: result.result_status, rank: result.rank } });
});

export default router;
