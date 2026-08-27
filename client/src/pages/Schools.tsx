import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { get, post, put, del } from '../api';
import { useAuth } from '../auth';
import { Card, PageHeader, Button, Modal, Field, Input, Select, Table, Badge, useToast, confirmAction, Loading, EmptyState } from '../components/ui';
import { School as SchoolIcon, Plus, Pencil, Trash2, Users, Printer, FileCheck2, MapPin } from 'lucide-react';

const DESIGNATIONS = ['Chairman', 'Secretary', 'Treasurer', 'Headmaster', 'Asst. Teacher', 'Lady Teacher', 'Executive Member'];
const emptySchool = {
  code: '', name: '', ol_chiki_name: '', type: 'Ol-Itun Ashra', village: '', po: '', ps: '', district: 'Kendujhar',
  pin: '', state: 'Odisha', headmaster: '', phone: '', email: '', affiliation_no: '', affiliation_date: '', established: '', status: 'active',
};

export default function SchoolsPage() {
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<any>(null);
  const [smcSchool, setSmcSchool] = useState<any>(null);
  const toast = useToast();
  const { isAdmin } = useAuth();

  const load = () => get('/schools').then((d) => { setSchools(d); setLoading(false); });
  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      if (edit.id) await put(`/schools/${edit.id}`, edit);
      else await post('/schools', edit);
      toast.show(edit.id ? 'School updated' : 'School registered');
      setEdit(null);
      load();
    } catch (e: any) { toast.show(e.message, false); }
  };

  const remove = async (id: number) => {
    if (!confirmAction('Delete this school? Related records will remain.')) return;
    await del(`/schools/${id}`);
    toast.show('School deleted');
    load();
  };

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader
        title="Schools & Affiliation"
        subtitle="Ol-Itun Ashras and higher secondary schools under the Dangachua branch"
        icon={<SchoolIcon size={22} />}
        action={isAdmin && <Button onClick={() => setEdit({ ...emptySchool })}><Plus size={16} /> Register School</Button>}
      />

      {schools.length === 0 ? <EmptyState text="No schools registered yet" /> : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {schools.map((s) => (
            <Card key={s.id} className="overflow-hidden hover:shadow-glass transition-shadow">
              <div className="bg-brand-gradient p-4 text-white">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold leading-tight text-sm">{s.name}</div>
                    <div className="font-olchiki text-emerald-200 text-xs mt-1">{s.ol_chiki_name}</div>
                  </div>
                  <Badge color={s.status === 'active' ? 'green' : 'gold'}>{s.status === 'active' ? 'Active' : 'Renewal due'}</Badge>
                </div>
              </div>
              <div className="p-4 space-y-2 text-xs text-slate-600">
                <div className="flex items-start gap-2"><MapPin size={13} className="text-terra mt-0.5 shrink-0" /> At-{s.village}, P.O.-{s.po}, P.S.-{s.ps}, {s.district} — {s.pin}</div>
                <div><strong>Headmaster:</strong> {s.headmaster}</div>
                <div><strong>Affiliation No:</strong> {s.affiliation_no || '—'}</div>
                <div className="flex gap-2 pt-1">
                  <Badge color="blue">{s.student_count} students</Badge>
                  <Badge color="purple">{s.teacher_count} teachers</Badge>
                  <Badge color={s.smc_count >= 11 ? 'green' : 'red'}>SMC {s.smc_count}/11</Badge>
                </div>
              </div>
              <div className="px-4 pb-4 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setSmcSchool(s)}><Users size={13} /> SMC ({s.smc_count})</Button>
                <Link to={`/print/affiliation/${s.id}`} target="_blank">
                  <Button size="sm" variant="gold"><Printer size={13} /> Affiliation Form</Button>
                </Link>
                {isAdmin && (
                  <>
                    <Button size="sm" variant="ghost" onClick={() => setEdit(s)}><Pencil size={13} /></Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(s.id)}><Trash2 size={13} className="text-red-500" /></Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* School form */}
      <Modal open={!!edit && !smcSchool} onClose={() => setEdit(null)} title={edit?.id ? 'Edit School' : 'Register / Affiliate School'} wide>
        {edit && (
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="School Name *" className="sm:col-span-2"><Input value={edit.name} onChange={(e: any) => setEdit({ ...edit, name: e.target.value })} placeholder="HANS HANSLI OL-ITUN ASHRA, DANGACHUA" /></Field>
            <Field label="Ol Chiki Name" className="sm:col-span-2"><Input className="font-olchiki" value={edit.ol_chiki_name} onChange={(e: any) => setEdit({ ...edit, ol_chiki_name: e.target.value })} /></Field>
            <Field label="School Type"><Select value={edit.type} onChange={(e: any) => setEdit({ ...edit, type: e.target.value })}>
              <option>Ol-Itun Ashra</option><option>Higher Secondary (+2)</option><option>Primary School</option><option>Upper Primary</option>
            </Select></Field>
            <Field label="Branch Code"><Input value={edit.code} onChange={(e: any) => setEdit({ ...edit, code: e.target.value })} placeholder="HH-OIA-026" /></Field>
            <Field label="Village (At)"><Input value={edit.village} onChange={(e: any) => setEdit({ ...edit, village: e.target.value })} /></Field>
            <Field label="Post Office (P.O.)"><Input value={edit.po} onChange={(e: any) => setEdit({ ...edit, po: e.target.value })} /></Field>
            <Field label="Police Station (P.S.)"><Input value={edit.ps} onChange={(e: any) => setEdit({ ...edit, ps: e.target.value })} /></Field>
            <Field label="District"><Input value={edit.district} onChange={(e: any) => setEdit({ ...edit, district: e.target.value })} /></Field>
            <Field label="PIN"><Input value={edit.pin} onChange={(e: any) => setEdit({ ...edit, pin: e.target.value })} /></Field>
            <Field label="State"><Input value={edit.state} onChange={(e: any) => setEdit({ ...edit, state: e.target.value })} /></Field>
            <Field label="Headmaster"><Input value={edit.headmaster} onChange={(e: any) => setEdit({ ...edit, headmaster: e.target.value })} /></Field>
            <Field label="Phone"><Input value={edit.phone} onChange={(e: any) => setEdit({ ...edit, phone: e.target.value })} /></Field>
            <Field label="Email"><Input value={edit.email} onChange={(e: any) => setEdit({ ...edit, email: e.target.value })} /></Field>
            <Field label="Affiliation No"><Input value={edit.affiliation_no} onChange={(e: any) => setEdit({ ...edit, affiliation_no: e.target.value })} /></Field>
            <Field label="Affiliation Date"><Input type="date" value={edit.affiliation_date} onChange={(e: any) => setEdit({ ...edit, affiliation_date: e.target.value })} /></Field>
            <Field label="Established Year"><Input value={edit.established} onChange={(e: any) => setEdit({ ...edit, established: e.target.value })} /></Field>
            <Field label="Status"><Select value={edit.status} onChange={(e: any) => setEdit({ ...edit, status: e.target.value })}>
              <option value="active">Active</option><option value="renewal_due">Renewal Due</option><option value="archived">Archived</option>
            </Select></Field>
            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setEdit(null)}>Cancel</Button>
              <Button onClick={save}><FileCheck2 size={15} /> {edit.id ? 'Update School' : 'Register & Affiliate'}</Button>
            </div>
          </div>
        )}
      </Modal>

      {smcSchool && <SmcManager school={smcSchool} onClose={() => { setSmcSchool(null); load(); }} />}
      {toast.node}
    </div>
  );
}

/* ---------- 11-member SMC Manager ---------- */
function SmcManager({ school, onClose }: { school: any; onClose: () => void }) {
  const [members, setMembers] = useState<any[]>([]);
  const [form, setForm] = useState<any>(null);
  const toast = useToast();
  const { canWrite } = useAuth();

  const load = () => get(`/smc?school_id=${school.id}`).then(setMembers);
  useEffect(() => { load(); }, []);

  const saveMember = async () => {
    if (!form.name || !form.designation) return toast.show('Name and designation required', false);
    await post('/smc', { ...form, school_id: school.id });
    setForm(null);
    load();
    toast.show('SMC member saved');
  };
  const removeMember = async (id: number) => {
    if (!confirmAction('Remove this SMC member?')) return;
    await del(`/smc/${id}`);
    load();
  };
  const toggleSign = async (m: any) => {
    await post('/smc', { ...m, signature_status: m.signature_status === 'signed' ? 'pending' : 'signed' });
    load();
  };

  return (
    <Modal open onClose={onClose} title={`School Managing Committee — ${school.name}`} wide>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="text-xs text-slate-500">Statutory 11-member structure: Chairman, Secretary, Treasurer, Headmaster, Asst. Teacher, Lady Teacher + 5 Executive Members.</p>
        <div className="flex gap-2">
          {canWrite && <Button size="sm" onClick={() => setForm({ sl_no: members.length + 1, name: '', father_name: '', designation: 'Executive Member', mobile: '', signature_status: 'pending' })}><Plus size={14} /> Add Member</Button>}
          <Link to={`/print/affiliation/${school.id}`} target="_blank"><Button size="sm" variant="gold"><Printer size={14} /> Print Form</Button></Link>
        </div>
      </div>

      <Table headers={['Sl', 'Member Name', "Father's Name", 'Designation', 'Mobile', 'Signature', '']}>
        {Array.from({ length: 11 }).map((_, i) => {
          const m = members[i];
          if (!m) return (
            <tr key={i} className="text-slate-300">
              <td className="px-4 py-2.5">{String(i + 1).padStart(2, '0')}</td>
              <td className="px-4 py-2.5 italic">Vacant — add member</td>
              <td colSpan={5}></td>
            </tr>
          );
          return (
            <tr key={m.id} className="hover:bg-slate-50">
              <td className="px-4 py-2.5 font-semibold">{String(m.sl_no).padStart(2, '0')}</td>
              <td className="px-4 py-2.5 font-medium">{m.name}</td>
              <td className="px-4 py-2.5">{m.father_name}</td>
              <td className="px-4 py-2.5"><Badge color={m.designation.includes('Teacher') || m.designation === 'Headmaster' ? 'blue' : m.designation === 'Chairman' ? 'gold' : 'gray'}>{m.designation}</Badge></td>
              <td className="px-4 py-2.5">{m.mobile}</td>
              <td className="px-4 py-2.5">
                {canWrite
                  ? <button onClick={() => toggleSign(m)}><Badge color={m.signature_status === 'signed' ? 'green' : 'red'}>{m.signature_status === 'signed' ? '✓ Signed' : 'Pending'}</Badge></button>
                  : <Badge color={m.signature_status === 'signed' ? 'green' : 'red'}>{m.signature_status}</Badge>}
              </td>
              <td className="px-4 py-2.5 whitespace-nowrap">
                {canWrite && (
                  <span className="flex gap-1">
                    <button className="p-1 hover:bg-slate-100 rounded" onClick={() => setForm(m)}><Pencil size={13} /></button>
                    <button className="p-1 hover:bg-red-50 rounded" onClick={() => removeMember(m.id)}><Trash2 size={13} className="text-red-500" /></button>
                  </span>
                )}
              </td>
            </tr>
          );
        })}
      </Table>

      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? 'Edit SMC Member' : 'Add SMC Member'}>
        {form && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <Field label="Sl No"><Input type="number" min={1} max={11} value={form.sl_no} onChange={(e: any) => setForm({ ...form, sl_no: Number(e.target.value) })} /></Field>
              <Field label="Designation *" className="col-span-2"><Select value={form.designation} onChange={(e: any) => setForm({ ...form, designation: e.target.value })}>
                {DESIGNATIONS.map((d) => <option key={d}>{d}</option>)}
              </Select></Field>
            </div>
            <Field label="Member Name *"><Input value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Father's Name"><Input value={form.father_name} onChange={(e: any) => setForm({ ...form, father_name: e.target.value })} /></Field>
            <Field label="Mobile Number"><Input value={form.mobile} onChange={(e: any) => setForm({ ...form, mobile: e.target.value })} /></Field>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setForm(null)}>Cancel</Button>
              <Button onClick={saveMember}>Save Member</Button>
            </div>
          </div>
        )}
      </Modal>
      {toast.node}
    </Modal>
  );
}
