import { Router } from 'express';
import { all, one, run } from '../db.js';
import { requireAuth, requirePermission, audit, isOrgLevel } from '../middleware.js';
import { ok, fail, parseIntSafe, parseFloatSafe } from './_util.js';

const router = Router();

// ---------- Categories ----------
router.get('/fee-categories', requireAuth, (req, res) => res.json({ ok: true, data: all(`SELECT * FROM fee_categories ORDER BY name`) }));
router.post('/fee-categories', requireAuth, requirePermission('fees', 'create'), (req, res) => {
  const b = req.body || {};
  const info = run(`INSERT INTO fee_categories (org_id, name, description) VALUES (1,?,?)`, [b.name, b.description || null]);
  res.json({ ok: true, id: info.lastInsertRowid });
});

// ---------- Structures ----------
router.get('/fee-structures', requireAuth, (req, res) => {
  const rows = all(`SELECT fs.*, c.name AS class_name, fc.name AS category_name, sc.name AS school_name, ay.name AS year_name
    FROM fee_structures fs
    LEFT JOIN classes c ON c.id = fs.class_id
    LEFT JOIN fee_categories fc ON fc.id = fs.category_id
    LEFT JOIN schools sc ON sc.id = fs.school_id
    LEFT JOIN academic_years ay ON ay.id = fs.academic_year_id
    ORDER BY fs.id DESC`);
  res.json({ ok: true, data: rows });
});
router.post('/fee-structures', requireAuth, requirePermission('fees', 'create'), (req, res) => {
  const b = req.body || {};
  const info = run(`INSERT INTO fee_structures (org_id, school_id, class_id, category_id, academic_year_id, amount, due_date) VALUES (1,?,?,?,?,?,?,?)`,
    [parseIntSafe(b.school_id), parseIntSafe(b.class_id), b.category_id, parseIntSafe(b.academic_year_id), parseFloatSafe(b.amount, 0), b.due_date || null]);
  audit(req.user, 'create_fee_structure', 'fee_structure', info.lastInsertRowid, {}, req.ip);
  res.json({ ok: true, id: info.lastInsertRowid });
});
router.delete('/fee-structures/:id', requireAuth, requirePermission('fees', 'delete'), (req, res) => {
  run(`DELETE FROM fee_structures WHERE id = ?`, [req.params.id]);
  res.json({ ok: true });
});

// ---------- Assignments ----------
router.get('/fee-assignments', requireAuth, (req, res) => {
  const clauses = []; const params = [];
  if (req.query.status && req.query.status !== 'all') { clauses.push('fa.status = ?'); params.push(req.query.status); }
  if (req.query.q) { clauses.push('(st.name LIKE ? OR st.student_id LIKE ? OR st.admission_no LIKE ?)'); const q = `%${req.query.q}%`; params.push(q, q, q); }
  const u = req.user;
  if (!isOrgLevel(u) && u.school_id) { clauses.push('st.school_id = ?'); params.push(u.school_id); }
  const where = clauses.length ? ' WHERE ' + clauses.join(' AND ') : '';
  const rows = all(`SELECT fa.*, st.name AS student_name, st.student_id AS sid, st.admission_no, st.roll_no, c.name AS class_name,
      sc.name AS school_name, fc.name AS category_name
    FROM fee_assignments fa
    JOIN students st ON st.id = fa.student_id
    LEFT JOIN classes c ON c.id = st.current_class_id
    LEFT JOIN schools sc ON sc.id = st.school_id
    LEFT JOIN fee_structures fs ON fs.id = fa.structure_id
    LEFT JOIN fee_categories fc ON fc.id = fs.category_id
    ${where} ORDER BY fa.id DESC LIMIT 1000`, params);
  res.json({ ok: true, data: rows });
});
router.post('/fee-assignments', requireAuth, requirePermission('fees', 'create'), (req, res) => {
  const b = req.body || {};
  const info = run(`INSERT INTO fee_assignments (org_id, student_id, structure_id, amount, paid, discount, due_date, status)
    VALUES (1,?,?,?,?,?,?,?)`, [b.student_id, parseIntSafe(b.structure_id), parseFloatSafe(b.amount, 0), parseFloatSafe(b.paid, 0), parseFloatSafe(b.discount, 0), b.due_date || null, b.status || 'pending']);
  audit(req.user, 'assign_fee', 'fee_assignment', info.lastInsertRowid, {}, req.ip);
  res.json({ ok: true, id: info.lastInsertRowid });
});
router.post('/fee-assignments/bulk', requireAuth, requirePermission('fees', 'create'), (req, res) => {
  const { student_ids, structure_id, amount, due_date, discount } = req.body || {};
  if (!Array.isArray(student_ids)) return fail(res, 400, 'student_ids required');
  const ins = run(`INSERT INTO fee_assignments (org_id, student_id, structure_id, amount, paid, discount, due_date, status) VALUES (1,?,?,?,0,?,?,?)`);
  let n = 0;
  for (const sid of student_ids) { ins.run(sid, parseIntSafe(structure_id), parseFloatSafe(amount, 0), parseFloatSafe(discount, 0), due_date || null, 'pending'); n++; }
  audit(req.user, 'bulk_assign_fees', 'fee_assignment', null, { count: n }, req.ip);
  res.json({ ok: true, count: n });
});

// ---------- Payments ----------
router.get('/payments', requireAuth, (req, res) => {
  const rows = all(`SELECT p.*, st.name AS student_name, st.student_id AS sid, u.name AS received_by_name
    FROM payments p JOIN students st ON st.id = p.student_id LEFT JOIN users u ON u.id = p.received_by ORDER BY p.id DESC LIMIT 1000`);
  res.json({ ok: true, data: rows });
});
router.post('/payments', requireAuth, requirePermission('fees', 'create'), (req, res) => {
  const b = req.body || {};
  const info = run(`INSERT INTO payments (org_id, student_id, fee_assignment_id, amount, method, reference, payment_date, received_by)
    VALUES (1,?,?,?,?,?,?,?)`, [b.student_id, parseIntSafe(b.fee_assignment_id), parseFloatSafe(b.amount, 0), b.method || 'Cash', b.reference || null, b.payment_date || null, req.user.id]);
  // update assignment
  if (b.fee_assignment_id) {
    const fa = one(`SELECT * FROM fee_assignments WHERE id = ?`, [b.fee_assignment_id]);
    if (fa) {
      const paid = (fa.paid || 0) + (parseFloatSafe(b.amount, 0) || 0);
      const status = paid >= fa.amount ? 'paid' : (paid > 0 ? 'partial' : 'pending');
      run(`UPDATE fee_assignments SET paid = ?, status = ? WHERE id = ?`, [paid, status, b.fee_assignment_id]);
    }
  }
  audit(req.user, 'record_payment', 'payment', info.lastInsertRowid, { amount: b.amount, student_id: b.student_id }, req.ip);
  res.json({ ok: true, id: info.lastInsertRowid });
});
router.delete('/payments/:id', requireAuth, requirePermission('fees', 'delete'), (req, res) => {
  const p = one(`SELECT * FROM payments WHERE id = ?`, [req.params.id]);
  if (p && p.fee_assignment_id) {
    const fa = one(`SELECT * FROM fee_assignments WHERE id = ?`, [p.fee_assignment_id]);
    if (fa) {
      const paid = Math.max(0, (fa.paid || 0) - (p.amount || 0));
      const status = paid >= fa.amount ? 'paid' : (paid > 0 ? 'partial' : 'pending');
      run(`UPDATE fee_assignments SET paid = ?, status = ? WHERE id = ?`, [paid, status, p.fee_assignment_id]);
    }
  }
  run(`DELETE FROM payments WHERE id = ?`, [req.params.id]);
  res.json({ ok: true });
});

// Student fees (parent/student portal)
router.get('/student-fees/:studentId', requireAuth, (req, res) => {
  const rows = all(`SELECT fa.*, fc.name AS category_name, p.id AS pay_id, p.amount AS pay_amount, p.payment_date, p.method
    FROM fee_assignments fa
    LEFT JOIN fee_structures fs ON fs.id = fa.structure_id
    LEFT JOIN fee_categories fc ON fc.id = fs.category_id
    LEFT JOIN payments p ON p.fee_assignment_id = fa.id
    WHERE fa.student_id = ? ORDER BY fa.id DESC`, [req.params.studentId]);
  res.json({ ok: true, data: rows });
});

export default router;
