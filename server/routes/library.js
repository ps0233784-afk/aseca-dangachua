import { Router } from 'express';
import { all, one, run } from '../db.js';
import { requireAuth, requirePermission, audit } from '../middleware.js';
import { ok, fail, parseIntSafe, parseFloatSafe } from './_util.js';

const router = Router();

// ---------- Library ----------
router.get('/books', requireAuth, (req, res) => {
  const clauses = []; const params = [];
  if (req.query.q) { clauses.push('(title LIKE ? OR author LIKE ? OR isbn LIKE ? OR category LIKE ?)'); const q = `%${req.query.q}%`; params.push(q, q, q, q); }
  if (req.query.category) { clauses.push('category = ?'); params.push(req.query.category); }
  const where = clauses.length ? ' WHERE ' + clauses.join(' AND ') : '';
  const rows = all(`SELECT * FROM books ${where} ORDER BY title LIMIT 500`, params);
  res.json({ ok: true, data: rows });
});
router.post('/books', requireAuth, requirePermission('library', 'create'), (req, res) => {
  const b = req.body || {};
  if (!b.title) return fail(res, 400, 'Title required');
  const copies = parseIntSafe(b.copies_total, 1);
  const info = run(`INSERT INTO books (org_id, title, author, publisher, isbn, category, copies_total, copies_available, rack_no)
    VALUES (1,?,?,?,?,?,?,?,?)`, [b.title, b.author || null, b.publisher || null, b.isbn || null, b.category || 'General', copies, copies, b.rack_no || null]);
  audit(req.user, 'create_book', 'book', info.lastInsertRowid, { title: b.title }, req.ip);
  res.json({ ok: true, id: info.lastInsertRowid });
});
router.put('/books/:id', requireAuth, requirePermission('library', 'update'), (req, res) => {
  const b = req.body || {};
  const ex = one(`SELECT * FROM books WHERE id = ?`, [req.params.id]);
  if (!ex) return fail(res, 404, 'Not found');
  const copies = parseIntSafe(b.copies_total, ex.copies_total);
  const diff = copies - ex.copies_total;
  run(`UPDATE books SET title=?, author=?, publisher=?, isbn=?, category=?, copies_total=?, copies_available = copies_available + ?, rack_no=? WHERE id=?`,
    [b.title ?? ex.title, b.author ?? ex.author, b.publisher ?? ex.publisher, b.isbn ?? ex.isbn, b.category ?? ex.category, copies, diff, b.rack_no ?? ex.rack_no, req.params.id]);
  res.json({ ok: true });
});
router.delete('/books/:id', requireAuth, requirePermission('library', 'delete'), (req, res) => {
  run(`DELETE FROM books WHERE id = ?`, [req.params.id]);
  res.json({ ok: true });
});

router.get('/library/transactions', requireAuth, (req, res) => {
  const rows = all(`SELECT lt.*, b.title, b.isbn,
      CASE WHEN lt.person_type='student' THEN (SELECT name FROM students WHERE id = lt.person_id) ELSE (SELECT name FROM staff WHERE id = lt.person_id) END AS person_name
    FROM library_transactions lt JOIN books b ON b.id = lt.book_id ORDER BY lt.id DESC LIMIT 1000`);
  res.json({ ok: true, data: rows });
});
router.post('/library/issue', requireAuth, requirePermission('library', 'create'), (req, res) => {
  const b = req.body || {};
  const book = one(`SELECT * FROM books WHERE id = ?`, [b.book_id]);
  if (!book) return fail(res, 404, 'Book not found');
  if (book.copies_available <= 0) return fail(res, 400, 'No copies available');
  const info = run(`INSERT INTO library_transactions (org_id, book_id, person_type, person_id, issue_date, due_date, status)
    VALUES (1,?,?,?,?,?,?)`, [b.book_id, b.person_type || 'student', b.person_id, b.issue_date || new Date().toISOString().slice(0, 10), b.due_date || null, 'issued']);
  run(`UPDATE books SET copies_available = copies_available - 1 WHERE id = ?`, [b.book_id]);
  audit(req.user, 'issue_book', 'library_transaction', info.lastInsertRowid, { book_id: b.book_id, person_id: b.person_id }, req.ip);
  res.json({ ok: true, id: info.lastInsertRowid });
});
router.post('/library/return', requireAuth, requirePermission('library', 'update'), (req, res) => {
  const { transaction_id, fine } = req.body || {};
  const t = one(`SELECT * FROM library_transactions WHERE id = ?`, [transaction_id]);
  if (!t) return fail(res, 404, 'Transaction not found');
  const status = fine > 0 ? 'returned' : 'returned';
  run(`UPDATE library_transactions SET return_date = date('now'), fine = ?, status = 'returned' WHERE id = ?`, [parseFloatSafe(fine, 0), transaction_id]);
  run(`UPDATE books SET copies_available = copies_available + 1 WHERE id = ?`, [t.book_id]);
  audit(req.user, 'return_book', 'library_transaction', transaction_id, { fine }, req.ip);
  res.json({ ok: true });
});

router.get('/library/stats', requireAuth, (req, res) => {
  const total = one(`SELECT COUNT(*) c FROM books`).c;
  const issued = one(`SELECT COUNT(*) c FROM library_transactions WHERE status = 'issued'`).c;
  const overdue = one(`SELECT COUNT(*) c FROM library_transactions WHERE status = 'issued' AND due_date < date('now')`).c;
  const available = one(`SELECT COALESCE(SUM(copies_available),0) c FROM books`).c;
  res.json({ ok: true, data: { total, issued, overdue, available } });
});

// Student library history
router.get('/library/student/:studentId', requireAuth, (req, res) => {
  const rows = all(`SELECT lt.*, b.title FROM library_transactions lt JOIN books b ON b.id = lt.book_id WHERE lt.person_type='student' AND lt.person_id = ? ORDER BY lt.id DESC`, [req.params.studentId]);
  res.json({ ok: true, data: rows });
});

export default router;
