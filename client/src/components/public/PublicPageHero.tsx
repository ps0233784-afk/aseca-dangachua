import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';

interface PublicPageHeroProps {
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
}

export default function PublicPageHero({ eyebrow, title, accent, description }: PublicPageHeroProps) {
  return (
    <section className="public-page-hero relative overflow-hidden border-b border-white/10">
      <div className="public-orb public-orb-one" />
      <div className="public-orb public-orb-two" />
      <div className="public-grid absolute inset-0 opacity-30" />
      <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-32 sm:px-8 sm:pb-24 sm:pt-40 lg:px-10">
        <Link to="/" className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-white/55 transition hover:text-lime-300">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <div className="max-w-4xl">
          <div className="public-kicker mb-5"><span />{eyebrow}</div>
          <h1 className="public-display text-5xl font-extrabold leading-[0.98] tracking-[-0.055em] text-white sm:text-6xl lg:text-8xl">
            {title} <em className="not-italic text-lime-300">{accent}</em>
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-8 text-white/60 sm:text-lg">{description}</p>
          <a href="#page-content" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-white">
            Explore the page <ArrowUpRight className="h-4 w-4 text-lime-300" />
          </a>
        </div>
      </div>
    </section>
  );
}
