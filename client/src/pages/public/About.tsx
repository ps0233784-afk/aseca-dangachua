import { Link } from 'react-router-dom';
import { ArrowUpRight, BookOpen, HeartHandshake, Languages, Lightbulb, ShieldCheck, Users } from 'lucide-react';
import PublicPageHero from '../../components/public/PublicPageHero';
import { milestones, organization } from '../../lib/publicData';

const principles = [
  { icon: Languages, title: 'Language is confidence', text: 'Children understand deeply when the first bridge to knowledge is a language they already know and love.' },
  { icon: BookOpen, title: 'Learning is possibility', text: 'Strong foundational education expands what young people believe is possible for themselves and their community.' },
  { icon: HeartHandshake, title: 'Community is strength', text: 'Schools thrive when families, educators, village leaders and managing committees share responsibility.' },
  { icon: ShieldCheck, title: 'Trust is essential', text: 'Transparent governance and responsible student records make our institutions safer and more accountable.' },
];

export default function AboutPage() {
  return (
    <div className="bg-[#f4f2e9]">
      <PublicPageHero
        eyebrow="Our story"
        title="Rooted in culture."
        accent="Growing through education."
        description="ASECA Dangachua brings community, language and learning together so Santali children can move forward without leaving identity behind."
      />

      <section id="page-content" className="px-5 py-24 sm:px-8 sm:py-32 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-14 lg:grid-cols-[.72fr_1.28fr]">
            <div>
              <p className="public-kicker public-kicker-dark"><span />Who we are</p>
              <p className="mt-6 max-w-sm text-sm leading-7 text-[#34483c]/60">{organization.registration}<br />{organization.address}</p>
            </div>
            <div>
              <h2 className="public-display text-4xl font-extrabold leading-[1.06] tracking-[-0.045em] text-[#101a14] sm:text-6xl">
                Education becomes transformative when it speaks to a child’s <em className="not-italic text-emerald-700">life, language and place.</em>
              </h2>
              <div className="mt-9 grid gap-7 text-[15px] leading-8 text-[#34483c]/70 sm:grid-cols-2">
                <p>The Dangachua branch of the Adivasi Socio-Educational & Cultural Association supports a network of Ol-Itun Ashras across Kendujhar district. These are learning spaces built close to the communities they serve.</p>
                <p>We work to strengthen Santali-medium education, promote the Ol Chiki script, support teachers and connect school administration through a shared digital platform.</p>
              </div>
            </div>
          </div>

          <div className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map(({ icon: Icon, title, text }, index) => (
              <article key={title} className={`min-h-[310px] rounded-[2rem] p-7 ${index === 0 ? 'bg-lime-300' : index === 1 ? 'bg-amber-300' : index === 2 ? 'bg-[#cde0ff]' : 'bg-white'}`}>
                <Icon className="h-7 w-7" />
                <h3 className="public-display mt-20 text-2xl font-extrabold tracking-[-0.03em]">{title}</h3>
                <p className="mt-4 text-sm leading-7 text-[#25382d]/65">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0b1710] px-5 py-24 text-white sm:px-8 sm:py-32 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-14 lg:grid-cols-[.7fr_1.3fr]">
            <div>
              <p className="public-kicker"><span />Our journey</p>
              <h2 className="public-display mt-6 text-5xl font-extrabold leading-none tracking-[-0.05em]">Built over time.<br /><span className="text-lime-300">Carried forward together.</span></h2>
            </div>
            <div className="divide-y divide-white/10 border-y border-white/10">
              {milestones.map((milestone) => (
                <div key={milestone.year} className="grid gap-4 py-7 sm:grid-cols-[100px_1fr] sm:items-start">
                  <span className="public-display text-2xl font-extrabold text-lime-300">{milestone.year}</span>
                  <p className="text-sm leading-7 text-white/55">{milestone.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-24 sm:px-8 sm:py-32 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-2 lg:items-center">
          <div className="overflow-hidden rounded-[2.5rem]">
            <img src="/images/aseca-learning-hero.jpg" alt="Students learning together" className="aspect-[4/3] h-full w-full object-cover object-[70%_center]" loading="lazy" />
          </div>
          <div>
            <div className="public-kicker public-kicker-dark"><span />Where we are going</div>
            <h2 className="public-display mt-6 text-5xl font-extrabold leading-[.98] tracking-[-0.05em] text-[#101a14]">A connected future,<br /><em className="not-italic text-emerald-700">on our own terms.</em></h2>
            <p className="mt-7 text-base leading-8 text-[#34483c]/70">Our digital platform helps schools manage students, teachers and academic records while the public website makes the branch’s work more visible and accessible. Technology supports the mission—it does not replace the relationships that make it work.</p>
            <div className="mt-8 flex items-start gap-4 rounded-2xl border border-[#14251b]/10 bg-white/60 p-5">
              <Lightbulb className="mt-1 h-6 w-6 shrink-0 text-emerald-800" />
              <p className="text-sm leading-7 text-[#34483c]/70"><strong className="text-[#101a14]">Our north star:</strong> every learner can access high-quality education while staying confident in Santali language and Adivasi identity.</p>
            </div>
            <Link to="/managing-body" className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#101a14] px-6 py-4 text-sm font-extrabold text-white">Meet our leadership <ArrowUpRight className="h-4 w-4 text-lime-300" /></Link>
          </div>
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8 sm:pb-32 lg:px-10">
        <div className="mx-auto max-w-7xl rounded-[2.5rem] bg-amber-300 p-9 sm:p-14">
          <div className="grid gap-8 sm:grid-cols-[auto_1fr_auto] sm:items-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-[#101a14] text-lime-300"><Users className="h-7 w-7" /></span>
            <div><h2 className="public-display text-3xl font-extrabold tracking-[-0.04em]">The next chapter needs all of us.</h2><p className="mt-2 text-sm text-[#34483c]/70">Parents, teachers, alumni and community partners are welcome.</p></div>
            <Link to="/contact" className="inline-flex items-center gap-2 text-sm font-extrabold">Join the journey <ArrowUpRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
