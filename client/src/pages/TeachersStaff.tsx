import { useEffect, useState } from 'react';
import { get, post, put, del } from '../api';
import { useAuth } from '../auth';
import { Card, PageHeader, Button, Modal, Field, Input, Select, Table, Badge, useToast, confirmAction, Loading, EmptyState } from '../components/ui';
import { Users, UserCog, Plus, Pencil, Trash2, Phone, BookOpen } from 'lucide-react';

export default function TeachersStaff({ mode }: { mode: 'teachers' | 'staff' }) {
  const isTeachers = mode === 'teachers';
  const [rows, setRows] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [schoolId, setSchoolId] = useState('');
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<any>(null);
  const toast = useToast();
  const { canWrite } = useAuth();

  const load = () => {
    const path = isTeachers ? '/teachers' : '/staff';
    get(`${path}${schoolId ? `?school_id=${schoolId}` : ''}`).then((d) => { setRows(d); setLoading(false); });
  };
  useEffect(() => { get('/schools').then(setSchools); }, []);
  useEffect(() => { load(); }, [schoolId, mode]);

  const blank = isTeachers
    ? { school_id: 1, name: '', designation: 'Asst. Teacher', qualification: '', phone: '', email: '', aadhaar: '', subject_spec: '', join_date: '', status: 'active' }
    : { school_id: 1, name: '', designation: '', phone: '', join_date: '', status: 'active', duties: '' };

  const save = async () => {
    try {
      const path = isTeachers ? '/teachers' : '/staff';
      if (edit.id) await put(`${path}/${edit.id}`, edit);
      else await post(path, edit);
      toast.show(edit.id ? 'Record updated' : 'Record added');
      setEdit(null);
      load();
    } catch (e: any) { toast.show(e.message, false); }
  };
  const remove = async (id: number) => {
    if (!confirmAction('Delete this record?')) return;
    await del(`${isTeachers ? '/teachers' : '/staff'}/${id}`);
    toast.show('Deleted');
    load();
  };

  return (
    <div>
      <PageHeader
        title={isTeachers ? 'Teacher Management' : 'Support Staff'}
        subtitle={isTeachers ? 'Headmasters, assistant & lady teachers across Ol-Itun Ashras' : 'Cooks, watchmen, peons and other support personnel'}
        icon={isTeachers ? <Users size={22} /> : <UserCog size={22} />}
        action={<div className="flex gap-2">
          <Select value={schoolId} onChange={(e: any) => setSchoolId(e.target.value)} className="w-52">
            <option value="">All schools</option>
            {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
          {canWrite && <Button onClick={() => setEdit({ ...blank, school_id: Number(schoolId) || 1 })}><Plus size={15} /> Add</Button>}
        </div>}
      />

      <Card>
        {loading ? <Loading /> : rows.length === 0 ? <EmptyState text="No records found" /> : isTeachers ? (
          <Table headers={['Name', 'Designation', 'Subject', 'Qualification', 'School', 'Contact', 'Status', '']}>
            {rows.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-royal/10 text-royal flex items-center justify-center font-bold text-sm">{t.name?.charAt(0)}</div>
                    <span className="font-semibold">{t.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3"><Badge color={t.designation === 'Headmaster' ? 'gold' : 'blue'}>{t.designation}</Badge></td>
                <td className="px-4 py-3 text-xs flex items-center gap-1"><BookOpen size={12} className="text-slate-400" />{t.subject_spec}</td>
                <td className="px-4 py-3 text-xs">{t.qualification}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{schools.find((s) => s.id === t.school_id)?.name?.split(',')[0]}</td>
                <td className="px-4 py-3 text-xs"><span className="flex items-center gap-1"><Phone size={11} />{t.phone}</span></td>
                <td className="px-4 py-3"><Badge color={t.status === 'active' ? 'green' : 'gray'}>{t.status}</Badge></td>
                <td className="px-4 py-3">{canWrite && <span className="flex gap-1">
                  <button className="p-1.5 hover:bg-slate-100 rounded" onClick={() => setEdit(t)}><Pencil size={14} /></button>
                  <button className="p-1.5 hover:bg-red-50 rounded" onClick={() => remove(t.id)}><Trash2 size={14} className="text-red-500" /></button>
                </span>}</td>
              </tr>
            ))}
          </Table>
        ) : (
          <Table headers={['Name', 'Designation', 'Duties', 'School', 'Phone', 'Joined', 'Status', '']}>
            {rows.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold">{t.name}</td>
                <td className="px-4 py-3 text-xs">{t.designation}</td>
                <td className="px-4 py-3 text-xs text-slate-500 max-w-60">{t.duties}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{schools.find((s) => s.id === t.school_id)?.name?.split(',')[0]}</td>
                <td className="px-4 py-3 text-xs">{t.phone}</td>
                <td className="px-4 py-3 text-xs">{t.join_date}</td>
                <td className="px-4 py-3"><Badge color={t.status === 'active' ? 'green' : 'gray'}>{t.status}</Badge></td>
                <td className="px-4 py-3">{canWrite && <span className="flex gap-1">
                  <button className="p-1.5 hover:bg-slate-100 rounded" onClick={() => setEdit(t)}><Pencil size={14} /></button>
                  <button className="p-1.5 hover:bg-red-50 rounded" onClick={() => remove(t.id)}><Trash2 size={14} className="text-red-500" /></button>
                </span>}</td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Edit Record' : isTeachers ? 'Add Teacher' : 'Add Staff'}>
        {edit && (
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="School *" className="sm:col-span-2"><Select value={edit.school_id} onChange={(e: any) => setEdit({ ...edit, school_id: Number(e.target.value) })}>
              {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select></Field>
            <Field label="Name *" className="sm:col-span-2"><Input value={edit.name} onChange={(e: any) => setEdit({ ...edit, name: e.target.value })} /></Field>
            {isTeachers ? (
              <>
                <Field label="Designation"><Select value={edit.designation} onChange={(e: any) => setEdit({ ...edit, designation: e.target.value })}>
                  <option>Headmaster</option><option>Asst. Teacher</option><option>Lady Teacher</option><option>Guest Teacher</option>
                </Select></Field>
                <Field label="Subject Specialisation"><Input value={edit.subject_spec} onChange={(e: any) => setEdit({ ...edit, subject_spec: e.target.value })} placeholder="Santali (Ol Chiki)" /></Field>
                <Field label="Qualification"><Input value={edit.qualification} onChange={(e: any) => setEdit({ ...edit, qualification: e.target.value })} /></Field>
                <Field label="Aadhaar"><Input value={edit.aadhaar} onChange={(e: any) => setEdit({ ...edit, aadhaar: e.target.value.replace(/\D/g, '') })} /></Field>
                <Field label="Phone"><Input value={edit.phone} onChange={(e: any) => setEdit({ ...edit, phone: e.target.value })} /></Field>
                <Field label="Email"><Input value={edit.email} onChange={(e: any) => setEdit({ ...edit, email: e.target.value })} /></Field>
              </>
            ) : (
              <>
                <Field label="Designation / Role"><Input value={edit.designation} onChange={(e: any) => setEdit({ ...edit, designation: e.target.value })} placeholder="Cook / Watchman / Peon" /></Field>
                <Field label="Phone"><Input value={edit.phone} onChange={(e: any) => setEdit({ ...edit, phone: e.target.value })} /></Field>
                <Field label="Duties" className="sm:col-span-2"><Input value={edit.duties} onChange={(e: any) => setEdit({ ...edit, duties: e.target.value })} /></Field>
              </>
            )}
            <Field label="Join Date"><Input type="date" value={edit.join_date} onChange={(e: any) => setEdit({ ...edit, join_date: e.target.value })} /></Field>
            <Field label="Status"><Select value={edit.status} onChange={(e: any) => setEdit({ ...edit, status: e.target.value })}>
              <option value="active">Active</option><option value="inactive">Inactive</option>
            </Select></Field>
            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setEdit(null)}>Cancel</Button>
              <Button onClick={save}>Save</Button>
            </div>
          </div>
        )}
      </Modal>
      {toast.node}
    </div>
  );
}
