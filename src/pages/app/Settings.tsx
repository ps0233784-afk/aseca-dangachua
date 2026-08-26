import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Building2, Palette, GraduationCap, Globe, Bell, Upload, Trash2, Plus } from 'lucide-react';
import { api } from '../../lib/api';
import { useApi } from '../../lib/hooks';
import { useToast } from '../../components/ui/toast';
import { PageLoader, Field, Logo } from '../../components/ui/primitives';
import { useBrand } from '../../contexts/BrandContext';

export default function SettingsPage() {
  const { data, loading, reload } = useApi('/api/settings');
  const { refresh } = useBrand();
  const { toast } = useToast();
  const [tab, setTab] = useState<'org' | 'branding' | 'grading' | 'languages' | 'notifications'>('org');
  const [org, setOrg] = useState<any>(null);
  const [rules, setRules] = useState<any[]>([]);
  const [langs, setLangs] = useState<any>(null);
  const [notif, setNotif] = useState<any>(null);

  React.useEffect(() => {
    if (data) {
      setOrg(data.org);
      setLangs(data.settings.languages);
      setNotif(data.settings.notifications_config);
    }
  }, [data]);

  React.useEffect(() => {
    if (tab === 'grading') api('/api/grading-rules').then((r: any) => setRules(r.data));
  }, [tab]);

  if (loading || !org) return <PageLoader />;

  const saveOrg = async () => {
    await api('/api/settings/org', { method: 'PUT', body: org });
    toast('success', 'Organisation settings saved');
    reload(); refresh();
  };

  const uploadLogo = async (field: 'logo' | 'hero_image', e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const fd = new FormData(); fd.append('file', f);
    const up: any = await api('/api/upload', { method: 'POST', formData: fd });
    setOrg({ ...org, [field]: up.url });
    toast('success', 'Uploaded');
  };

  const saveGrading = async () => {
    await api('/api/grading-rules', { method: 'PUT', body: { rules } });
    toast('success', 'Grading rules saved');
  };

  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold flex items-center gap-2"><SettingsIcon className="h-6 w-6" style={{ color: 'var(--brand-primary)' }} /> Settings</h1><p className="text-sm text-slate-500">Organisation, branding, grading, languages and notifications</p></div>

      <div className="flex gap-1 flex-wrap bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl w-fit">
        {([['org', 'Organisation', Building2], ['branding', 'Branding', Palette], ['grading', 'Grading', GraduationCap], ['languages', 'Languages', Globe], ['notifications', 'Notifications', Bell]] as const).map(([k, l, I]) => (
          <button key={k} onClick={() => setTab(k)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${tab === k ? 'bg-white dark:bg-slate-900 shadow' : 'text-slate-500'}`}><I className="h-4 w-4" /> {l}</button>
        ))}
      </div>

      {tab === 'org' && (
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="card p-6 space-y-4">
            <h3 className="font-semibold">Organisation Details</h3>
            <Field label="Name"><input className="input" value={org.name} onChange={(e) => setOrg({ ...org, name: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Short Name"><input className="input" value={org.short_name || ''} onChange={(e) => setOrg({ ...org, short_name: e.target.value })} /></Field>
              <Field label="Established Year"><input type="number" className="input" value={org.established_year || ''} onChange={(e) => setOrg({ ...org, established_year: Number(e.target.value) })} /></Field>
            </div>
            <Field label="Tagline"><input className="input" value={org.tagline} onChange={(e) => setOrg({ ...org, tagline: e.target.value })} /></Field>
            <Field label="Address"><input className="input" value={org.address || ''} onChange={(e) => setOrg({ ...org, address: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Village"><input className="input" value={org.village || ''} onChange={(e) => setOrg({ ...org, village: e.target.value })} /></Field>
              <Field label="Block"><input className="input" value={org.block || ''} onChange={(e) => setOrg({ ...org, block: e.target.value })} /></Field>
              <Field label="District"><input className="input" value={org.district || ''} onChange={(e) => setOrg({ ...org, district: e.target.value })} /></Field>
              <Field label="PIN"><input className="input" value={org.pincode || ''} onChange={(e) => setOrg({ ...org, pincode: e.target.value })} /></Field>
              <Field label="Phone"><input className="input" value={org.phone || ''} onChange={(e) => setOrg({ ...org, phone: e.target.value })} /></Field>
              <Field label="Email"><input className="input" value={org.email || ''} onChange={(e) => setOrg({ ...org, email: e.target.value })} /></Field>
            </div>
          </div>
          <div className="card p-6 space-y-4">
            <h3 className="font-semibold">About & Social</h3>
            <Field label="About"><textarea className="input min-h-[100px]" value={org.about || ''} onChange={(e) => setOrg({ ...org, about: e.target.value })} /></Field>
            <Field label="Mission"><textarea className="input min-h-[70px]" value={org.mission || ''} onChange={(e) => setOrg({ ...org, mission: e.target.value })} /></Field>
            <Field label="Vision"><textarea className="input min-h-[70px]" value={org.vision || ''} onChange={(e) => setOrg({ ...org, vision: e.target.value })} /></Field>
            <button className="btn-primary" onClick={saveOrg}><Save className="h-4 w-4" /> Save Organisation</button>
          </div>
        </div>
      )}

      {tab === 'branding' && (
        <div className="card p-6 space-y-6">
          <h3 className="font-semibold">Branding & Theme</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Logo</label>
              <Logo name={org.name} src={org.logo} size={80} />
              <label className="btn-outline mt-2 cursor-pointer"><Upload className="h-4 w-4" /> Upload<input type="file" accept="image/*" className="hidden" onChange={(e) => uploadLogo('logo', e)} /></label>
            </div>
            <div>
              <label className="label">Hero Image</label>
              {org.hero_image && <img src={org.hero_image} className="h-20 w-full object-cover rounded-xl" alt="" />}
              <label className="btn-outline mt-2 cursor-pointer"><Upload className="h-4 w-4" /> Upload<input type="file" accept="image/*" className="hidden" onChange={(e) => uploadLogo('hero_image', e)} /></label>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Primary Color"><input type="color" className="input h-11" value={org.theme?.primary || '#1a56db'} onChange={(e) => setOrg({ ...org, theme: { ...org.theme, primary: e.target.value } })} /></Field>
            <Field label="Secondary Color"><input type="color" className="input h-11" value={org.theme?.secondary || '#147d4b'} onChange={(e) => setOrg({ ...org, theme: { ...org.theme, secondary: e.target.value } })} /></Field>
            <Field label="Accent Color"><input type="color" className="input h-11" value={org.theme?.accent || '#d9a033'} onChange={(e) => setOrg({ ...org, theme: { ...org.theme, accent: e.target.value } })} /></Field>
          </div>
          <button className="btn-primary" onClick={saveOrg}><Save className="h-4 w-4" /> Save Branding</button>
        </div>
      )}

      {tab === 'grading' && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Grading Rules</h3>
            <button className="btn-outline" onClick={() => setRules([...rules, { min_percent: 0, max_percent: 100, grade: 'NEW', remark: '', is_pass: 1 }])}><Plus className="h-4 w-4" /> Add Grade</button>
          </div>
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800/60"><tr><th className="th">Grade</th><th className="th">Min %</th><th className="th">Max %</th><th className="th">Remark</th><th className="th text-center">Pass</th><th className="th"></th></tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rules.map((r, i) => (
                <tr key={i}>
                  <td className="td"><input className="input !w-20" value={r.grade} onChange={(e) => setRules(rules.map((x, j) => j === i ? { ...x, grade: e.target.value } : x))} /></td>
                  <td className="td"><input type="number" className="input !w-24" value={r.min_percent} onChange={(e) => setRules(rules.map((x, j) => j === i ? { ...x, min_percent: Number(e.target.value) } : x))} /></td>
                  <td className="td"><input type="number" className="input !w-24" value={r.max_percent} onChange={(e) => setRules(rules.map((x, j) => j === i ? { ...x, max_percent: Number(e.target.value) } : x))} /></td>
                  <td className="td"><input className="input !w-40" value={r.remark || ''} onChange={(e) => setRules(rules.map((x, j) => j === i ? { ...x, remark: e.target.value } : x))} /></td>
                  <td className="td text-center"><input type="checkbox" className="h-4 w-4 accent-emerald-600" checked={!!r.is_pass} onChange={(e) => setRules(rules.map((x, j) => j === i ? { ...x, is_pass: e.target.checked ? 1 : 0 } : x))} /></td>
                  <td className="td"><button className="text-rose-500" onClick={() => setRules(rules.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="btn-primary mt-4" onClick={saveGrading}><Save className="h-4 w-4" /> Save Grading Rules</button>
        </div>
      )}

      {tab === 'languages' && langs && (
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Languages</h3>
          <div className="space-y-3">
            {[['en', 'English'], ['od', 'Odia (ଓଡ଼ିଆ)'], ['hi', 'Hindi (हिन्दी)'], ['sat', 'Santali (Roman)'], ['olc', 'Ol Chiki (preview)']].map(([code, label]) => (
              <label key={code} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="font-medium">{label}</span>
                <input type="checkbox" className="h-4 w-4 accent-blue-600" checked={langs.enabled?.includes(code)} onChange={(e) => {
                  const en = new Set(langs.enabled || []);
                  e.target.checked ? en.add(code) : en.delete(code);
                  setLangs({ ...langs, enabled: Array.from(en) });
                }} />
              </label>
            ))}
          </div>
          <button className="btn-primary mt-4" onClick={async () => { await api('/api/settings/languages', { method: 'PUT', body: { value: langs } }); toast('success', 'Language settings saved'); reload(); }}><Save className="h-4 w-4" /> Save Languages</button>
        </div>
      )}

      {tab === 'notifications' && notif && (
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Notification Channels</h3>
          <p className="text-sm text-slate-500 mb-4">Architecture is ready for these channels. They will activate when provider credentials are configured.</p>
          <div className="space-y-3">
            {[['email_enabled', 'Email'], ['sms_enabled', 'SMS'], ['whatsapp_enabled', 'WhatsApp'], ['push_enabled', 'Push Notifications']].map(([key, label]) => (
              <label key={key} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="font-medium">{label}</span>
                <span className="badge bg-slate-100 text-slate-500">Coming soon</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
