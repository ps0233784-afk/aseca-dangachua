import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { get, post, put, del, uploadFile } from '../api';
import { useAuth } from '../auth';
import { Card, PageHeader, Button, Modal, Field, Input, Select, Table, Badge, useToast, confirmAction, Loading, EmptyState } from '../components/ui';
import { GraduationCap, Plus, Pencil, Trash2, Search, Eye, ShieldCheck, Upload } from 'lucide-react';

const CLASSES = ['Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Matric (Class X)', '+2 (Class XII)'];

const emptyStudent = {
  school_id: 1, admission_no: '', roll_no: '', name: '', name_odia: '', name_santali: '',
  dob: '', gender: 'Male', blood_group: '', photo: '', aadhaar: '',
  father_name: '', father_aadhaar: '', mother_name: '', mother_aadhaar: '',
  guardian_name: '', guardian_mobile: '', village: '', block: 'Soso', district: 'Kendujhar', state: 'Odisha', pin: '',
  category: 'ST', academic_year: '2026-27', class: 'Matric (Class X)', section: 'A',
  admission_date: new Date().toISOString().slice(0, 10), previous_school: '', status: 'active',
};

export default function StudentsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [schoolId, setSchoolId] = useState('');
  const [q, setQ] = useState('');
  const [cls, setCls] = useState('');
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<any>(null);
  const [aadhaarMsg, setAadhaarMsg] = useState('');
  const toast = useToast();
  const { canWrite } = useAuth();

  const load = () => {
    const p = new URLSearchParams();
    if (schoolId) p.set('school_id', schoolId);
    if (q) p.set('q', q);
    if (cls) p.set('class', cls);
    get(`/students?${p}`).then((d) => { setRows(d); setLoading(false); });
  };
  useEffect(() => { get('/schools').then(setSchools); }, []);
  useEffect(() => { load(); }, [schoolId, cls, q]);

  const validateAadhaar = (v: string) => {
    const d = (v || '').replace(/\D/g, '');
    if (v && d.length !== 12) { setAadhaarMsg('Aadhaar must be 12 digits'); return false; }
    setAadhaarMsg('');
    return true;
  };

  const save = async () => {
    try {
      if (!edit.name || !edit.school_id) return toast.show('Name and school are required', false);
      if (!validateAadhaar(edit.aadhaar)) return;
      if (edit.id) await put(`/students/${edit.id}`, edit);
      else await post('/students', edit);
      toast.show(edit.id ? 'Student updated' : 'Student admitted');
      setEdit(null);
      load();
    } catch (e: any) { toast.show(e.message, false); }
  };

  const remove = async (id: number) => {
    if (!confirmAction('Delete this student record? This cannot be undone.')) return;
    await del(`/students/${id}`);
    toast.show('Student deleted');
    load();
  };

  const onPhoto = async (f: File) => {
    try {
      const r = await uploadFile(f, 'media', edit.name + ' photo');
      setEdit({ ...edit, photo: r.url });
      toast.show('Photo uploaded');
    } catch (e: any) { toast.show(e.message, false); }
  };

  return (
    <div>
      <PageHeader
        title="Student Management"
        subtitle="Admissions, identity verification (Aadhaar), and academic records"
        icon={<GraduationCap size={22} />}
        action={canWrite && <Button onClick={() => setEdit({ ...emptyStudent, school_id: Number(schoolId) || 1 })}><Plus size={16} /> Admit Student</Button>}
      />

      <Card className="p-4 mb-4 flex flex-wrap gap-3 items-center no-print">
        <div className="relative flex-1 min-w-52">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input className="pl-9" placeholder="Search name, roll, admission no, Aadhaar…" value={q} onChange={(e: any) => setQ(e.target.value)} />
        </div>
        <Select value={schoolId} onChange={(e: any) => setSchoolId(e.target.value)} className="w-56">
          <option value="">All schools</option>
          {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select>
        <Select value={cls} onChange={(e: any) => setCls(e.target.value)} className="w-48">
          <option value="">All classes</option>
          {CLASSES.map((c) => <option key={c}>{c}</option>)}
        </Select>
      </Card>

      <Card>
        {loading ? <Loading /> : rows.length === 0 ? <EmptyState text="No students found" /> : (
          <Table headers={['Student', 'Roll / Adm No', 'Class', 'School', 'Guardian', 'Aadhaar', 'Status', '']}>
            {rows.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {s.photo
                      ? <img src={s.photo} className="w-9 h-9 rounded-full object-cover" alt="" />
                      : <div className="w-9 h-9 rounded-full bg-forest-50 text-forest flex items-center justify-center font-bold text-sm">{s.name?.charAt(0)}</div>}
                    <div>
                      <div className="font-semibold text-slate-800">{s.name}</div>
                      <div className="text-[11px] text-slate-400">{s.gender} · {s.blood_group || '—'} · DOB {s.dob}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-mono text-xs">{s.roll_no}</div>
                  <div className="text-[11px] text-slate-400">{s.admission_no}</div>
                </td>
                <td className="px-4 py-3 text-xs">{s.class} {s.section && `· ${s.section}`}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{schools.find((x) => x.id === s.school_id)?.name?.split(',')[0] || s.school_id}</td>
                <td className="px-4 py-3 text-xs">{s.guardian_name || s.father_name}<div className="text-slate-400">{s.guardian_mobile}</div></td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 text-xs font-mono">
                    <ShieldCheck size={13} className={s.aadhaar ? 'text-green-600' : 'text-slate-300'} />
                    {s.aadhaar ? s.aadhaar : '—'}
                  </span>
                </td>
                <td className="px-4 py-3"><Badge color={s.status === 'active' ? 'green' : 'gray'}>{s.status}</Badge></td>
                <td className="px-4 py-3">
                  <span className="flex gap-1">
                    <Link to={`/app/students/${s.id}`}><button className="p-1.5 hover:bg-forest-50 rounded text-forest"><Eye size={14} /></button></Link>
                    {canWrite && <button className="p-1.5 hover:bg-slate-100 rounded" onClick={() => setEdit({ ...s })}><Pencil size={14} /></button>}
                    {canWrite && <button className="p-1.5 hover:bg-red-50 rounded" onClick={() => remove(s.id)}><Trash2 size={14} className="text-red-500" /></button>}
                  </span>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {/* Student form */}
      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? `Edit — ${edit.name}` : 'Admit New Student'} wide>
        {edit && (
          <div className="space-y-5">
            {/* Photo */}
            <div className="flex items-center gap-4">
              {edit.photo
                ? <img src={edit.photo} className="w-16 h-16 rounded-xl object-cover border" alt="" />
                : <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400"><GraduationCap size={24} /></div>}
              <label className="inline-flex items-center gap-2 text-sm text-forest font-semibold cursor-pointer border border-dashed border-forest/40 rounded-lg px-3 py-2 hover:bg-forest-50">
                <Upload size={14} /> Upload Photo
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onPhoto(e.target.files[0])} />
              </label>
            </div>

            <Section title="Admission & School">
              <Field label="School *"><Select value={edit.school_id} onChange={(e: any) => setEdit({ ...edit, school_id: Number(e.target.value) })}>
                {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select></Field>
              <Field label="Admission No"><Input value={edit.admission_no} onChange={(e: any) => setEdit({ ...edit, admission_no: e.target.value })} /></Field>
              <Field label="Roll No"><Input value={edit.roll_no} onChange={(e: any) => setEdit({ ...edit, roll_no: e.target.value })} placeholder="36SSMS026010" /></Field>
              <Field label="Academic Year"><Input value={edit.academic_year} onChange={(e: any) => setEdit({ ...edit, academic_year: e.target.value })} /></Field>
              <Field label="Class"><Select value={edit.class} onChange={(e: any) => setEdit({ ...edit, class: e.target.value })}>{CLASSES.map((c) => <option key={c}>{c}</option>)}</Select></Field>
              <Field label="Section"><Input value={edit.section} onChange={(e: any) => setEdit({ ...edit, section: e.target.value })} /></Field>
              <Field label="Admission Date"><Input type="date" value={edit.admission_date} onChange={(e: any) => setEdit({ ...edit, admission_date: e.target.value })} /></Field>
              <Field label="Previous School"><Input value={edit.previous_school} onChange={(e: any) => setEdit({ ...edit, previous_school: e.target.value })} /></Field>
              <Field label="Status"><Select value={edit.status} onChange={(e: any) => setEdit({ ...edit, status: e.target.value })}>
                <option value="active">Active</option><option value="transferred">Transferred</option><option value="graduated">Graduated</option>
              </Select></Field>
            </Section>

            <Section title="Personal Details">
              <Field label="Student Name *"><Input value={edit.name} onChange={(e: any) => setEdit({ ...edit, name: e.target.value })} /></Field>
              <Field label="Name in Odia"><Input value={edit.name_odia} onChange={(e: any) => setEdit({ ...edit, name_odia: e.target.value })} /></Field>
              <Field label="Name in Santali (Ol Chiki)"><Input className="font-olchiki" value={edit.name_santali} onChange={(e: any) => setEdit({ ...edit, name_santali: e.target.value })} /></Field>
              <Field label="Date of Birth"><Input type="date" value={edit.dob} onChange={(e: any) => setEdit({ ...edit, dob: e.target.value })} /></Field>
              <Field label="Gender"><Select value={edit.gender} onChange={(e: any) => setEdit({ ...edit, gender: e.target.value })}>
                <option>Male</option><option>Female</option><option>Other</option>
              </Select></Field>
              <Field label="Blood Group"><Select value={edit.blood_group} onChange={(e: any) => setEdit({ ...edit, blood_group: e.target.value })}>
                <option value="">—</option>{['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((b) => <option key={b}>{b}</option>)}
              </Select></Field>
              <Field label="Category"><Select value={edit.category} onChange={(e: any) => setEdit({ ...edit, category: e.target.value })}>
                <option value="ST">ST</option><option value="SC">SC</option><option value="OBC">OBC</option><option value="General">General</option>
              </Select></Field>
            </Section>

            <Section title="Identity & Verification (Aadhaar)">
              <Field label="Student Aadhaar Number">
                <Input value={edit.aadhaar} maxLength={14} onChange={(e: any) => { const v = e.target.value; setEdit({ ...edit, aadhaar: v.replace(/\D/g, '') }); validateAadhaar(v); }} placeholder="12-digit number" />
                {aadhaarMsg && <span className="text-[11px] text-red-600">{aadhaarMsg}</span>}
                <span className="text-[10px] text-slate-400 block">Stored securely · displayed masked to non-admin staff</span>
              </Field>
              <Field label="Father's Name"><Input value={edit.father_name} onChange={(e: any) => setEdit({ ...edit, father_name: e.target.value })} /></Field>
              <Field label="Father's Aadhaar (optional)"><Input value={edit.father_aadhaar} onChange={(e: any) => setEdit({ ...edit, father_aadhaar: e.target.value.replace(/\D/g, '') })} /></Field>
              <Field label="Mother's Name"><Input value={edit.mother_name} onChange={(e: any) => setEdit({ ...edit, mother_name: e.target.value })} /></Field>
              <Field label="Mother's Aadhaar (optional)"><Input value={edit.mother_aadhaar} onChange={(e: any) => setEdit({ ...edit, mother_aadhaar: e.target.value.replace(/\D/g, '') })} /></Field>
              <Field label="Guardian Name"><Input value={edit.guardian_name} onChange={(e: any) => setEdit({ ...edit, guardian_name: e.target.value })} /></Field>
              <Field label="Guardian Mobile"><Input value={edit.guardian_mobile} onChange={(e: any) => setEdit({ ...edit, guardian_mobile: e.target.value })} /></Field>
            </Section>

            <Section title="Address">
              <Field label="Village / At"><Input value={edit.village} onChange={(e: any) => setEdit({ ...edit, village: e.target.value })} /></Field>
              <Field label="Block / P.S."><Input value={edit.block} onChange={(e: any) => setEdit({ ...edit, block: e.target.value })} /></Field>
              <Field label="District"><Input value={edit.district} onChange={(e: any) => setEdit({ ...edit, district: e.target.value })} /></Field>
              <Field label="State"><Input value={edit.state} onChange={(e: any) => setEdit({ ...edit, state: e.target.value })} /></Field>
              <Field label="PIN"><Input value={edit.pin} onChange={(e: any) => setEdit({ ...edit, pin: e.target.value })} /></Field>
            </Section>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="ghost" onClick={() => setEdit(null)}>Cancel</Button>
              <Button onClick={save}>{edit.id ? 'Update Student' : 'Admit Student'}</Button>
            </div>
          </div>
        )}
      </Modal>
      {toast.node}
    </div>
  );
}

function Section({ title, children }: { title: string; children: any }) {
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-wider text-gold-dark mb-3 flex items-center gap-2">
        <span className="w-6 h-0.5 bg-gold inline-block" /> {title}
      </h4>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{children}</div>
    </div>
  );
}
