import { db, all, one, run } from '../db.js';

export function paginate(req, defaults = { limit: 20, max: 500 }) {
  const page = Math.max(1, parseInt(req.query.page || '1', 10) || 1);
  const limit = Math.min(defaults.max, Math.max(1, parseInt(req.query.limit || String(defaults.limit), 10) || defaults.limit));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

// Build a WHERE from a set of allowed filters
export function buildWhere(filters, req, likeFields = []) {
  const clauses = [];
  const params = [];
  for (const key of Object.keys(filters)) {
    const raw = req.query[key];
    if (raw === undefined || raw === null || raw === '') continue;
    const col = filters[key];
    if (likeFields.includes(key)) {
      clauses.push(`${col} LIKE ?`);
      params.push(`%${raw}%`);
    } else if (Array.isArray(raw) || (typeof raw === 'string' && raw.includes(','))) {
      const vals = Array.isArray(raw) ? raw : raw.split(',');
      clauses.push(`${col} IN (${vals.map(() => '?').join(',')})`);
      params.push(...vals);
    } else {
      clauses.push(`${col} = ?`);
      params.push(raw);
    }
  }
  return { where: clauses.length ? ' WHERE ' + clauses.join(' AND ') : '', params };
}

export function listResult(req, table, { filters = {}, likeFields = [], orderBy = 'id DESC', baseWhere = '', baseParams = [], allowedJoins = '' }) {
  const { page, limit, offset } = paginate(req);
  const { where, params } = buildWhere(filters, req, likeFields);
  const fullWhere = (baseWhere ? ` WHERE ${baseWhere}` : '') + (where ? (baseWhere ? ' AND ' : ' WHERE ') + where.slice(7) : '');
  const countRow = one(`SELECT COUNT(*) c FROM ${table} ${allowedJoins} ${fullWhere}`, [...baseParams, ...params]);
  const rows = all(`SELECT * FROM ${table} ${allowedJoins} ${fullWhere} ORDER BY ${orderBy} LIMIT ? OFFSET ?`, [...baseParams, ...params, limit, offset]);
  return { data: rows, total: countRow.c, page, limit };
}

export function ok(res, data = {}) {
  return res.json({ ok: true, ...data });
}

export function fail(res, status, message) {
  return res.status(status).json({ ok: false, error: message });
}

export function parseIntSafe(v, fallback = null) {
  if (v === undefined || v === null || v === '') return fallback;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? fallback : n;
}

export function parseFloatSafe(v, fallback = null) {
  if (v === undefined || v === null || v === '') return fallback;
  const n = parseFloat(v);
  return Number.isNaN(n) ? fallback : n;
}

export function jsonOrNull(v) {
  if (v === undefined || v === null || v === '') return null;
  if (typeof v !== 'string') return v;
  try { return JSON.parse(v); } catch { return null; }
}

export function toJSON(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === 'string') return v;
  return JSON.stringify(v);
}

// Get organisation row (single org system)
export function getOrg() {
  return one(`SELECT * FROM organizations ORDER BY id LIMIT 1`);
}

export function getSettingValue(orgId, key, fallback = null) {
  const row = one(`SELECT value FROM settings WHERE org_id = ? AND key = ?`, [orgId || 1, key]);
  if (!row) return fallback;
  try { return JSON.parse(row.value); } catch { return fallback; }
}

export function gradeForPercent(pct, rules) {
  const g = rules.find((r) => pct >= r.min_percent && pct <= r.max_percent);
  return g || null;
}
