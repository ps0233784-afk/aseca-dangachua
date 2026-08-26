// PDF generation for report cards and certificates using PDFKit.
import PDFDocument from 'pdfkit';
import fs from 'node:fs';
import path from 'node:path';
import { one, all } from './db.js';
import { UPLOAD_DIR } from './db.js';

function imgOrNull(relPath) {
  if (!relPath) return null;
  const abs = path.join(UPLOAD_DIR, path.basename(relPath));
  if (fs.existsSync(abs)) return abs;
  return null;
}

export function gradeFor(pct, rules) {
  const g = rules.find((r) => pct >= r.min_percent && pct <= r.max_percent);
  return g || null;
}

export async function buildReportCard(examId, studentId, res) {
  const result = one(`SELECT r.*, st.name, st.roll_no, st.student_id AS sid, st.admission_no, st.photo, st.dob, st.father_name, st.mother_name,
      c.name AS class_name, sec.name AS section_name, sc.name AS school_name, sc.logo AS school_logo
    FROM results r JOIN students st ON st.id = r.student_id
    LEFT JOIN classes c ON c.id = st.current_class_id
    LEFT JOIN sections sec ON sec.id = st.current_section_id
    LEFT JOIN schools sc ON sc.id = st.school_id
    WHERE r.exam_id = ? AND r.student_id = ?`, [examId, studentId]);
  if (!result) return null;

  const exam = one(`SELECT * FROM exams WHERE id = ?`, [examId]);
  const org = one(`SELECT * FROM organizations ORDER BY id LIMIT 1`);
  const subjects = all(`SELECT m.*, s.name AS subject_name, es.full_marks, es.pass_marks
    FROM marks m JOIN subjects s ON s.id = m.subject_id
    LEFT JOIN exam_subjects es ON es.exam_id = m.exam_id AND es.subject_id = m.subject_id
    WHERE m.exam_id = ? AND m.student_id = ? ORDER BY s.name`, [examId, studentId]);
  const attendance = one(`SELECT COUNT(*) c FROM attendance WHERE person_type='student' AND person_id = ? AND status != 'absent'`, [studentId]);
  const attTotal = one(`SELECT COUNT(*) c FROM attendance WHERE person_type='student' AND person_id = ?`, [studentId]);
  const attPct = attTotal?.c ? Math.round((attendance?.c || 0) / attTotal.c * 100) : 0;

  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="report-card-${result.sid}.pdf"`);
  doc.pipe(res);

  // Header
  const logo = imgOrNull(result.school_logo) || imgOrNull(org.logo);
  if (logo) { try { doc.image(logo, 40, 30, { width: 55, height: 55 }); } catch {} }
  doc.font('Helvetica-Bold').fontSize(15).fillColor('#0c4a2e')
    .text(org.name || 'BRANCH ASECA DANGACHUA', 105, 34, { width: 400, align: 'center' });
  doc.font('Helvetica').fontSize(9).fillColor('#444')
    .text(result.school_name || '', 105, 52, { width: 400, align: 'center' });
  doc.text(`${org.address || ''} • ${org.phone || ''}`, 105, 64, { width: 400, align: 'center' });
  doc.moveDown(0.5);
  doc.font('Helvetica-Bold').fontSize(13).fillColor('#1a56db')
    .text(`REPORT CARD — ${exam?.name || ''}`, 40, 100, { align: 'center', width: 515 });
  doc.moveDown(1);

  // Student info box
  const y0 = 130;
  const photo = imgOrNull(result.photo);
  if (photo) { try { doc.image(photo, 460, y0, { width: 70, height: 80 }); } catch {} }
  doc.font('Helvetica').fontSize(9).fillColor('#222');
  const info = [
    ['Name', result.name],
    ['Roll No', result.roll_no],
    ['Student ID', result.sid],
    ['Class / Section', `${result.class_name || '-'} / ${result.section_name || '-'}`],
    ['Father', result.father_name || '-'],
    ['Mother', result.mother_name || '-'],
  ];
  let yy = y0;
  for (const [k, v] of info) {
    doc.font('Helvetica-Bold').text(`${k}: `, 50, yy, { continued: true, width: 80 });
    doc.font('Helvetica').text(String(v || '-'), { width: 300 });
    yy += 14;
  }

  // Subject table
  const ty = yy + 14;
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#fff');
  doc.rect(40, ty, 515, 16).fill('#147d4b');
  doc.fillColor('#fff');
  doc.text('Subject', 48, ty + 4, { width: 170 });
  doc.text('Full', 240, ty + 4, { width: 40, align: 'center' });
  doc.text('Pass', 285, ty + 4, { width: 40, align: 'center' });
  doc.text('Marks', 330, ty + 4, { width: 45, align: 'center' });
  doc.text('Grade', 385, ty + 4, { width: 45, align: 'center' });
  doc.text('Result', 445, ty + 4, { width: 60, align: 'center' });
  let ry = ty + 16;
  doc.font('Helvetica').fontSize(9);
  subjects.forEach((s, i) => {
    if (i % 2 === 0) { doc.rect(40, ry, 515, 14).fill('#f1f5f9'); }
    doc.fillColor('#222');
    doc.text(s.subject_name, 48, ry + 3, { width: 170 });
    doc.text(String(s.full_marks || 100), 240, ry + 3, { width: 40, align: 'center' });
    doc.text(String(s.pass_marks || 33), 285, ry + 3, { width: 40, align: 'center' });
    doc.text(String(s.total ?? '-'), 330, ry + 3, { width: 45, align: 'center' });
    doc.text(s.grade || '-', 385, ry + 3, { width: 45, align: 'center' });
    const passed = (s.total || 0) >= (s.pass_marks || 33);
    doc.fillColor(passed ? '#147d4b' : '#c0392b').text(passed ? 'Pass' : 'Fail', 445, ry + 3, { width: 60, align: 'center' });
    ry += 14;
  });

  // Totals
  doc.font('Helvetica-Bold').fontSize(10).fillColor('#0c4a2e');
  doc.text(`Total: ${result.total_marks}/${result.max_marks}    Percentage: ${result.percentage}%    Grade: ${result.grade}    Result: ${result.result_status?.toUpperCase()}`, 40, ry + 8, { width: 515 });
  if (result.rank) doc.text(`Class Rank: ${result.rank}`, 40, ry + 22);
  doc.text(`Attendance: ${attPct}%`, 200, ry + 22);

  // Signatures
  const sy = ry + 60;
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#222');
  doc.text('Class Teacher', 60, sy);
  doc.text('Headmaster', 300, sy);
  doc.text('Parent / Guardian', 450, sy);
  doc.moveDown(1);
  doc.font('Helvetica').fontSize(7.5).fillColor('#888');
  doc.text(`Generated by ${org.name} ERP on ${new Date().toLocaleString('en-IN')} • This is a system generated document.`, 40, sy + 30, { width: 515, align: 'center' });

  doc.end();
  return true;
}

export async function buildCertificate(cert, res) {
  const student = one(`SELECT st.*, c.name AS class_name, sec.name AS section_name, sc.name AS school_name
    FROM students st LEFT JOIN classes c ON c.id = st.current_class_id
    LEFT JOIN sections sec ON sec.id = st.current_section_id
    LEFT JOIN schools sc ON sc.id = st.school_id WHERE st.id = ?`, [cert.student_id]);
  if (!student) return null;
  const org = one(`SELECT * FROM organizations ORDER BY id LIMIT 1`);

  const titles = {
    bonafide: 'BONAFIDE CERTIFICATE',
    transfer: 'TRANSFER CERTIFICATE',
    character: 'CHARACTER CERTIFICATE',
    study: 'STUDY CERTIFICATE',
    participation: 'PARTICIPATION CERTIFICATE',
  };
  const title = cert.title || titles[cert.type] || 'CERTIFICATE';

  const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${cert.type}-${student.student_id}.pdf"`);
  doc.pipe(res);

  doc.rect(0, 0, 842, 595).lineWidth(2).stroke('#0c4a2e');
  doc.rect(15, 15, 812, 565).stroke('#d9a033');
  doc.font('Helvetica-Bold').fontSize(20).fillColor('#0c4a2e')
    .text(org.name || 'BRANCH ASECA DANGACHUA', 50, 70, { align: 'center', width: 742 });
  doc.font('Helvetica').fontSize(10).fillColor('#555')
    .text(`${org.address || ''} • ${org.phone || ''}`, 50, 95, { align: 'center', width: 742 });
  doc.moveDown(2);
  doc.font('Helvetica-Bold').fontSize(22).fillColor('#1a56db').text(title, 50, 150, { align: 'center', width: 742 });
  doc.moveDown(1.5);

  doc.font('Helvetica').fontSize(12).fillColor('#222');
  const y = 230;
  doc.text(`This is to certify that ${student.name}`, 90, y, { align: 'center', width: 662 });
  doc.text(`(Student ID: ${student.student_id}, Roll No: ${student.roll_no || '-'}), ${student.father_name ? 'son/daughter of ' + student.father_name + ', ' : ''}a student of ${student.class_name || '-'}${student.section_name ? ' (Section ' + student.section_name + ')' : ''}, ${student.school_name || org.name},`, 70, y + 20, { align: 'center', width: 702 });
  doc.text(`has been a bonafide student of this institution during the academic year 2025–2026.`, 70, y + 48, { align: 'center', width: 702 });
  doc.text(`His/her conduct and character during the period of study has been satisfactory.`, 70, y + 72, { align: 'center', width: 702 });
  doc.text(`We wish him/her success in all future endeavours.`, 70, y + 96, { align: 'center', width: 702 });

  doc.font('Helvetica').fontSize(11).fillColor('#222');
  doc.text(`Date: ${cert.issue_date || new Date().toISOString().slice(0, 10)}`, 90, y + 160);
  doc.text(`Certificate No: ${cert.certificate_no || ''}`, 90, y + 176);
  doc.font('Helvetica-Bold').text('Headmaster', 620, y + 170, { width: 150, align: 'center' });

  doc.end();
  return true;
}
