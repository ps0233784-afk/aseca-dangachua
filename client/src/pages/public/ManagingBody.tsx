import { useEffect, useState } from 'react';
import { ArrowUpRight, CheckCircle2, Scale, ShieldCheck, Users } from 'lucide-react';
import { api } from '../../lib/api';
import PublicPageHero from '../../components/public/PublicPageHero';
import { committee } from '../../lib/publicData';

export default function ManagingBodyPage() {
  const [people, setPeople] = useState<any[]>(committee.map((person) => ({ ...person, designation: person.role })));
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get<any[]>('/public/managing-body').then((items) => items.length && setPeople(items.map((person) => ({ ...person, initials: person.name.split(' ').map((part: string) => part[0]).join('').slice(0, 2) })))).catch(() => undefined).finally(() => setLoading(false)); }, []);
  const leadership = people.slice(0, 3);
  const members = people.slice(3);

  return (
    <div className="bg-[#f4f2e9]">
      <PublicPageHero
        eyebrow="Leadership & governance"
        title="Community voices."
        accent="Shared responsibility."
        description="The managing body helps our schools remain accountable to learners, families and the communities they serve."
      />

      <section id="page-content" className="px-5 py-24 sm:px-8 sm:py-32 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
            <div>
              <div className="public-kicker public-kicker-dark"><span />Branch leadership</div>
              <h2 className="public-display mt-6 text-5xl font-extrabold leading-[.98] tracking-[-0.055em] text-[#101a14] sm:text-6xl">Guided locally.<br /><em className="not-italic text-emerald-700">Focused on learners.</em></h2>
            </div>
            <p className="max-w-2xl text-base leading-8 text-[#34483c]/70 lg:justify-self-end">Our leaders combine knowledge of schools, villages and community priorities. Together, they guide strategy, strengthen oversight and keep the organisation’s mission visible in everyday decisions.</p>
          </div>

          <div className="mt-16 grid gap-5 lg:grid-cols-3">
            {leadership.map((person, index) => (
              <article key={`${person.name}-${person.role}`} className={`relative min-h-[430px] overflow-hidden rounded-[2.2rem] p-8 ${index === 0 ? 'bg-lime-300' : index === 1 ? 'bg-amber-300' : 'bg-[#cde0ff]'}`}>
                {person.photo ? <img src={person.photo} alt={`${person.name} official photograph`} className="h-24 w-24 rounded-full object-cover shadow-xl" /> : <span className="grid h-24 w-24 place-items-center rounded-full bg-[#101a14] public-display text-2xl font-extrabold text-white shadow-xl">{person.initials}</span>}
                <div className="absolute inset-x-8 bottom-8">
                  <p className="text-[10px] font-extrabold uppercase tracking-[.2em] opacity-55">{person.designation || person.role}</p>
                  <h3 className="public-display mt-3 text-3xl font-extrabold tracking-[-0.04em]">{person.name}</h3>
                  <div className="mt-5 flex items-center gap-2 text-xs font-bold"><CheckCircle2 className="h-4 w-4" />Branch managing body</div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0b1710] px-5 py-24 text-white sm:px-8 sm:py-32 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[.68fr_1.32fr]">
            <div>
              <div className="public-kicker"><span />The full committee</div>
              <h2 className="public-display mt-6 text-5xl font-extrabold leading-[.98] tracking-[-0.055em]">Many roles.<br /><em className="not-italic text-lime-300">One commitment.</em></h2>
              <p className="mt-6 max-w-sm text-sm leading-7 text-white/45">Teachers, office bearers and community members each bring a distinct perspective to school governance.</p>
            </div>
            <div className="divide-y divide-white/10 border-y border-white/10">
              {members.map((person, index) => (
                <div key={`${person.name}-${index}`} className="grid grid-cols-[46px_1fr] items-center gap-4 py-5 sm:grid-cols-[56px_1fr_auto]">
                  <span className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/5 text-xs font-extrabold text-lime-300 sm:h-12 sm:w-12">{person.initials}</span>
                  <div><h3 className="font-bold text-white/90">{person.name}</h3><p className="mt-1 text-xs text-white/35">School & community representative</p></div>
                  <span className="col-start-2 rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.12em] text-white/50 sm:col-start-auto">{person.designation || person.role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-24 sm:px-8 sm:py-32 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="public-kicker public-kicker-dark"><span />How governance works</div>
            <h2 className="public-display mt-6 text-5xl font-extrabold leading-none tracking-[-0.05em]">Clear roles build<br /><em className="not-italic text-emerald-700">stronger schools.</em></h2>
          </div>
          <div className="mt-14 grid gap-4 lg:grid-cols-3">
            {[
              { icon: Users, title: 'Represent', text: 'Bring learner, parent, teacher and village priorities into branch and school decisions.' },
              { icon: Scale, title: 'Review', text: 'Track academic activities, school needs and the responsible use of shared resources.' },
              { icon: ShieldCheck, title: 'Protect', text: 'Promote safe, inclusive learning and transparent handling of institutional records.' },
            ].map(({ icon: Icon, title, text }, index) => (
              <article key={title} className={`rounded-[2rem] p-8 ${index === 1 ? 'bg-amber-300' : 'border border-[#14251b]/10 bg-white/60'}`}>
                <Icon className="h-7 w-7" />
                <h3 className="public-display mt-16 text-3xl font-extrabold tracking-[-0.035em]">{title}</h3>
                <p className="mt-4 text-sm leading-7 text-[#34483c]/65">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8 sm:pb-32 lg:px-10">
        <div className="mx-auto max-w-7xl rounded-[2.5rem] bg-emerald-800 p-9 text-white sm:p-14">
          <div className="grid gap-7 sm:grid-cols-[1fr_auto] sm:items-center">
            <div><p className="text-[10px] font-extrabold uppercase tracking-[.22em] text-lime-300">Speak with the committee</p><h2 className="public-display mt-4 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">Questions, ideas and community participation are welcome.</h2></div>
            <a href="mailto:info@branchasecadangachua.org?subject=Message%20for%20ASECA%20Managing%20Body" className="inline-flex w-fit items-center gap-2 rounded-full bg-lime-300 px-6 py-4 text-sm font-extrabold text-[#101a14]">Write to us <ArrowUpRight className="h-4 w-4" /></a>
          </div>
        </div>
      </section>
    </div>
  );
}
