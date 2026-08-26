import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { useBrand } from '../../contexts/BrandContext';
import { useToast } from '../../components/ui/toast';
import { PageHero } from './Schools';

export default function Contact() {
  const { org } = useBrand();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  return (
    <div>
      <PageHero title="Contact Us" sub="We would love to hear from you" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          {[
            { icon: MapPin, title: 'Address', text: `${org?.address || 'Dangachua'}, ${org?.village}, ${org?.block}, ${org?.district}, ${org?.state} — ${org?.pincode}` },
            { icon: Phone, title: 'Phone', text: org?.phone || '+91 94370 12345' },
            { icon: Mail, title: 'Email', text: org?.email || 'info@asecadangachua.org' },
            { icon: Clock, title: 'Office Hours', text: 'Monday – Saturday, 10:00 AM – 4:00 PM' },
          ].map((c, i) => (
            <div key={i} className="card p-5 flex items-start gap-4">
              <div className="h-11 w-11 rounded-xl text-white flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))' }}><c.icon className="h-5 w-5" /></div>
              <div>
                <h3 className="font-semibold">{c.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{c.text}</p>
              </div>
            </div>
          ))}
        </div>

        <form className="card p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); toast('success', 'Thank you! Your message has been received.'); setForm({ name: '', email: '', message: '' }); }}>
          <h2 className="font-bold text-xl mb-2">Send us a message</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="label">Your Name</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          </div>
          <div><label className="label">Message</label><textarea className="input min-h-[140px]" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required /></div>
          <button className="btn-primary w-full !py-3"><Send className="h-4 w-4" /> Send Message</button>
        </form>
      </div>
    </div>
  );
}
