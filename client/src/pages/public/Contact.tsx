import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock3, Mail, MapPin, Phone, Send } from 'lucide-react';
import PublicPageHero from '../../components/public/PublicPageHero';
import { organization } from '../../lib/publicData';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const subject = encodeURIComponent(form.subject || `Website enquiry from ${form.name}`);
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`);
    window.location.href = `mailto:${organization.email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="bg-[#f4f2e9]">
      <PublicPageHero
        eyebrow="Contact ASECA Dangachua"
        title="Let’s start a"
        accent="conversation."
        description="Ask about admissions, school records, community programmes or ways to support Santali education in Kendujhar."
      />

      <section id="page-content" className="px-5 py-24 sm:px-8 sm:py-32 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.78fr_1.22fr]">
          <div>
            <div className="public-kicker public-kicker-dark"><span />Branch office</div>
            <h2 className="public-display mt-6 max-w-xl text-5xl font-extrabold leading-[.98] tracking-[-0.055em] text-[#101a14] sm:text-6xl">Close to our schools.<br /><em className="not-italic text-emerald-700">Open to our community.</em></h2>
            <p className="mt-7 max-w-lg text-base leading-8 text-[#34483c]/70">Visit or contact the branch office for general information. For student-specific records, please use the ERP portal or contact the relevant school directly.</p>

            <div className="mt-12 space-y-4">
              <ContactItem icon={MapPin} label="Visit us" value={organization.address} href="https://maps.google.com/?q=Dangachua+Kendujhar+Odisha+758078" />
              <ContactItem icon={Phone} label="Call us" value={organization.phone} href={`tel:${organization.phone.replace(/\s/g, '')}`} />
              <ContactItem icon={Mail} label="Email us" value={organization.email} href={`mailto:${organization.email}`} />
              <ContactItem icon={Clock3} label="Office hours" value="Monday–Saturday · 10:00 AM–4:00 PM" />
            </div>
          </div>

          <div className="rounded-[2.5rem] bg-[#0b1710] p-6 text-white shadow-2xl shadow-emerald-950/10 sm:p-10 lg:p-12">
            <p className="text-[10px] font-extrabold uppercase tracking-[.22em] text-lime-300">Send an enquiry</p>
            <h2 className="public-display mt-4 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">How can we help?</h2>
            <p className="mt-3 text-sm leading-7 text-white/45">Submitting this form opens your email app with the message ready to send.</p>

            <form onSubmit={submit} className="mt-9 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Your name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} placeholder="Full name" required />
                <Field label="Email address" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} placeholder="you@example.com" required />
              </div>
              <Field label="Subject" value={form.subject} onChange={(value) => setForm({ ...form, subject: value })} placeholder="Admissions, records, partnership..." />
              <label className="block">
                <span className="mb-2 block text-xs font-bold text-white/65">Your message</span>
                <textarea required rows={6} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="Tell us how we can help" className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-lime-300/60 focus:bg-white/[0.08]" />
              </label>
              <button type="submit" className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-lime-300 px-6 py-4 text-sm font-extrabold text-[#101a14] transition hover:bg-lime-200 sm:w-auto">
                Prepare email <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8 sm:pb-32 lg:px-10">
        <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2.5rem] bg-amber-300 lg:grid-cols-[1.15fr_.85fr]">
          <div className="p-9 sm:p-14">
            <p className="text-[10px] font-extrabold uppercase tracking-[.22em]">Before you visit</p>
            <h2 className="public-display mt-5 max-w-xl text-4xl font-extrabold leading-[1.02] tracking-[-0.045em]">Contact the school directly for the quickest admissions guidance.</h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[#34483c]/70">Our directory lists all affiliated Ol-Itun Ashras, their locations and headmasters.</p>
            <Link to="/schools" className="mt-8 inline-flex items-center gap-2 text-sm font-extrabold">View school directory <ArrowUpRight className="h-4 w-4" /></Link>
          </div>
          <div className="relative min-h-[340px] overflow-hidden">
            <img src="/images/aseca-learning-hero.jpg" alt="ASECA community learning" className="absolute inset-0 h-full w-full object-cover object-[68%_center]" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-r from-amber-300/35 to-transparent lg:bg-gradient-to-l lg:from-transparent lg:to-amber-300/20" />
          </div>
        </div>
      </section>
    </div>
  );
}

function ContactItem({ icon: Icon, label, value, href }: { icon: typeof Mail; label: string; value: string; href?: string }) {
  const content = (
    <>
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-800 text-lime-300"><Icon className="h-5 w-5" /></span>
      <span><span className="block text-[10px] font-extrabold uppercase tracking-[.18em] text-[#34483c]/45">{label}</span><strong className="mt-1 block max-w-md text-sm leading-6 text-[#18271e]">{value}</strong></span>
      {href && <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-emerald-800" />}
    </>
  );

  return href ? <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="flex items-center gap-4 rounded-2xl border border-[#14251b]/10 bg-white/50 p-4 transition hover:bg-white">{content}</a> : <div className="flex items-center gap-4 rounded-2xl border border-[#14251b]/10 bg-white/50 p-4">{content}</div>;
}

function Field({ label, value, onChange, placeholder, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold text-white/65">{label}</span>
      <input type={type} required={required} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-lime-300/60 focus:bg-white/[0.08]" />
    </label>
  );
}
