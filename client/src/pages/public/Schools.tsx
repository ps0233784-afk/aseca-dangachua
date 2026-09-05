import { useEffect, useState } from 'react';
import { ArrowUpRight, BookOpen, CalendarDays, GraduationCap, MapPin, School, Users } from 'lucide-react';
import PublicPageHero from '../../components/public/PublicPageHero';
import { api } from '../../lib/api';
import { fallbackSchools, PublicSchool } from '../../lib/publicData';

export default function PublicSchoolsPage() {
  const [schools, setSchools] = useState<PublicSchool[]>(fallbackSchools);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<PublicSchool[]>('/schools')
      .then((data) => data.length && setSchools(data))
      .catch(() => setSchools(fallbackSchools))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-[#f4f2e9]">
      <PublicPageHero
        eyebrow="Our school network"
        title="Learning lives"
        accent="close to home."
        description="Three community-rooted Ol-Itun Ashras serving Santali learners across villages in Kendujhar district."
      />

      <section id="page-content" className="px-5 py-24 sm:px-8 sm:py-32 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr] lg:items-end">
            <div>
              <div className="public-kicker public-kicker-dark"><span />Affiliated Ashras</div>
              <h2 className="public-display mt-6 text-5xl font-extrabold leading-[.98] tracking-[-0.055em] text-[#101a14] sm:text-6xl">Different villages.<br /><em className="not-italic text-emerald-700">One learning family.</em></h2>
            </div>
            <p className="max-w-2xl text-base leading-8 text-[#34483c]/70 lg:justify-self-end">Every school has its own history and local leadership. The branch creates a shared system for academic standards, records, teacher support and community accountability.</p>
          </div>

          {loading ? (
            <div className="mt-16 grid gap-5 lg:grid-cols-3">
              {[0, 1, 2].map((item) => <div key={item} className="h-[460px] animate-pulse rounded-[2rem] bg-[#e8e5da]" />)}
            </div>
          ) : (
            <div className="mt-16 grid gap-5 lg:grid-cols-3">
              {schools.map((school, index) => (
                <article key={school.id} className={`school-detail-card group relative flex min-h-[500px] flex-col overflow-hidden rounded-[2rem] p-7 ${index === 0 ? 'bg-lime-300' : index === 1 ? 'bg-[#cde0ff]' : 'bg-amber-300'}`}>
                  <div className="flex items-start justify-between">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#101a14] text-white"><School className="h-6 w-6" /></span>
                    <span className="public-display text-5xl font-extrabold text-[#101a14]/10">0{index + 1}</span>
                  </div>
                  <div className="mt-12">
                    <span className="rounded-full border border-[#101a14]/10 bg-white/30 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em]">{school.code}</span>
                    <h3 className="public-display mt-5 text-3xl font-extrabold leading-[1.02] tracking-[-0.04em]">{school.name}</h3>
                    <p className="mt-3 flex items-center gap-2 text-sm text-[#26372d]/65"><MapPin className="h-4 w-4" />{school.village}, {school.district}</p>
                  </div>
                  <div className="mt-auto border-t border-[#101a14]/10 pt-6">
                    <div className="grid grid-cols-2 gap-5 text-xs">
                      <div><span className="block text-[#26372d]/50">Headmaster</span><strong className="mt-1 block">{school.principal}</strong></div>
                      <div><span className="block text-[#26372d]/50">Established</span><strong className="mt-1 block">{school.established_year}</strong></div>
                      <div><span className="block text-[#26372d]/50">Medium</span><strong className="mt-1 block">{school.medium}</strong></div>
                      <div><span className="block text-[#26372d]/50">Postal code</span><strong className="mt-1 block">{school.pin}</strong></div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-[#0b1710] px-5 py-24 text-white sm:px-8 sm:py-32 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="public-kicker"><span />A shared model</div>
            <h2 className="public-display mt-6 text-5xl font-extrabold leading-[.98] tracking-[-0.055em] sm:text-6xl">What every school<br /><em className="not-italic text-lime-300">can count on.</em></h2>
          </div>
          <div className="mt-14 grid gap-px overflow-hidden rounded-[2rem] bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: BookOpen, title: 'Santali-first teaching', text: 'Learning grounded in language children understand.' },
              { icon: GraduationCap, title: 'Dedicated educators', text: 'Local teachers supported by shared academic systems.' },
              { icon: Users, title: 'Community oversight', text: 'An 11-member committee strengthens each institution.' },
              { icon: CalendarDays, title: 'Connected records', text: 'Clear academic and administrative information.' },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="bg-[#0b1710] p-7 sm:p-9">
                <Icon className="h-6 w-6 text-lime-300" />
                <h3 className="public-display mt-16 text-xl font-extrabold">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/45">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-24 sm:px-8 sm:py-32 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <div className="public-kicker public-kicker-dark"><span />School admissions</div>
            <h2 className="public-display mt-6 text-5xl font-extrabold leading-none tracking-[-0.05em]">Looking for the nearest Ol-Itun Ashra?</h2>
            <p className="mt-6 text-base leading-8 text-[#34483c]/70">Contact the branch office and we will connect you with the relevant headmaster or school committee.</p>
            <a href="mailto:info@branchasecadangachua.org?subject=School%20admission%20enquiry" className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#101a14] px-6 py-4 text-sm font-extrabold text-white">Ask about admissions <ArrowUpRight className="h-4 w-4 text-lime-300" /></a>
          </div>
          <div className="rounded-[2.5rem] bg-emerald-800 p-8 text-white sm:p-12">
            <p className="text-[10px] font-extrabold uppercase tracking-[.22em] text-lime-300">Branch office</p>
            <p className="public-display mt-5 text-3xl font-extrabold">Dangachua, Kendujhar</p>
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/55">At-Dangachua, P.O.-Bidyadharpur, P.S.-Soso, Dist.-Kendujhar, PIN-758078, Odisha</p>
            <div className="mt-9 border-t border-white/10 pt-7 text-sm text-white/65">Monday–Saturday · 10:00 AM–4:00 PM</div>
          </div>
        </div>
      </section>
    </div>
  );
}
