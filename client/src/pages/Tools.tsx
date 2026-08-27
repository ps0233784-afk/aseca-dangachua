import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { get, downloadFile, post } from '../api';
import { Card, PageHeader, Button, Select, Table, Badge, useToast, Loading, EmptyState } from '../components/ui';
import { Award, FileSpreadsheet, Download, Upload, FileDown, CreditCard, FileText } from 'lucide-react';

export default function ToolsPage({ mode }: { mode: 'certificates' | 'excel' }) {
  return mode === 'certificates' ? <Certificates /> : <ExcelCenter />;
}

function Certificates() {
  const [students, setStudents] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [schoolId, setSchoolId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { get('/schools').then(setSchools); }, []);
  useEffect(() => {
    setLoading(true);
    get(`/students${schoolId ? `?school_id=${schoolId}` : ''}`).then((d) => { setStudents(d); setLoading(false); });
  }, [schoolId]);

  return (
    <div>
      <PageHeader title="Certificates & ID Cards" subtitle="Printable bonafide, conduct, transfer certificates and student ID cards" icon={<Award size={22} />}
        action={<Select value={schoolId} onChange={(e: any) => setSchoolId(e.target.value)} className="w-56">
          <option value="">All schools</option>
          {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select>} />
      <Card>
        {loading ? <Loading /> : students.length === 0 ? <EmptyState text="No students" /> : (
          <Table headers={['Student', 'Roll No', 'Class', 'Bonafide', 'Conduct', 'TC', 'ID Card']}>
            {students.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold">{s.name}</td>
                <td className="px-4 py-3 font-mono text-xs">{s.roll_no}</td>
                <td className="px-4 py-3 text-xs">{s.class}</td>
                {['bonafide', 'conduct', 'tc'].map((t) => (
                  <td key={t} className="px-4 py-3">
                    <Link to={`/print/certificate/${s.id}/${t}`} target="_blank">
                      <Button size="sm" variant="outline"><FileText size={12} /> {t === 'tc' ? 'Transfer Crtf.' : t === 'conduct' ? 'Conduct' : 'Bonafide'}</Button>
                    </Link>
                  </td>
                ))}
                <td className="px-4 py-3">
                  <Link to={`/print/idcard/${s.id}`} target="_blank">
                    <Button size="sm" variant="royal"><CreditCard size={12} /> ID Card</Button>
                  </Link>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}

const ENTITIES = [
  { key: 'students', label: 'Students' },
  { key: 'teachers', label: 'Teachers' },
  { key: 'staff', label: 'Staff' },
  { key: 'smc', label: 'SMC Members' },
  { key: 'books', label: 'Library Books' },
  { key: 'notices', label: 'Notices' },
  { key: 'exams', label: 'Examinations' },
];

function ExcelCenter() {
  const toast = useToast();
  const [importing, setImporting] = useState<string | null>(null);

  const doImport = async (entity: string, file: File) => {
    setImporting(entity);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const r = await post(`/excel/import/${entity}`, fd);
      toast.show(`Imported ${r.inserted} records (${r.skipped} skipped)`);
    } catch (e: any) {
      toast.show(e.message, false);
    } finally {
      setImporting(null);
    }
  };

  return (
    <div>
      <PageHeader title="Excel Import / Export Center" subtitle="Bulk-export data to .xlsx and bulk-import students, teachers, staff, SMC and books" icon={<FileSpreadsheet size={22} />} />
      <div className="grid md:grid-cols-2 gap-5">
        <Card className="p-5">
          <h3 className="font-bold text-forest-dark flex items-center gap-2 mb-4"><Download size={17} className="text-forest" /> Export Data</h3>
          <div className="space-y-2">
            {ENTITIES.map((e) => (
              <div key={e.key} className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-2.5">
                <span className="text-sm font-medium">{e.label}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => downloadFile(`/excel/template/${e.key}`, `aseca-${e.key}-template.xlsx`)}>
                    <FileDown size={13} /> Template
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => downloadFile(`/excel/export/${e.key}`, `aseca-${e.key}.xlsx`)}>
                    <Download size={13} /> Export
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="font-bold text-forest-dark flex items-center gap-2 mb-4"><Upload size={17} className="text-gold" /> Bulk Import</h3>
          <p className="text-xs text-slate-500 mb-4">Download the template for the entity, fill rows, then upload. Rows with errors are skipped and reported.</p>
          <div className="space-y-2">
            {ENTITIES.map((e) => (
              <div key={e.key} className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-2.5">
                <span className="text-sm font-medium">{e.label}</span>
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-gold-dark border border-dashed border-gold/50 rounded-lg px-3 py-1.5 cursor-pointer hover:bg-amber-50">
                  <Upload size={13} /> {importing === e.key ? 'Uploading…' : 'Upload .xlsx'}
                  <input type="file" accept=".xlsx,.xls" className="hidden" onChange={(ev) => ev.target.files?.[0] && doImport(e.key, ev.target.files[0])} />
                </label>
              </div>
            ))}
          </div>
        </Card>
      </div>
      {toast.node}
    </div>
  );
}
