import { Link } from 'react-router-dom';
import { GraduationCap, BookOpen, Users, Globe, ArrowRight, Star, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 gradient-sunset" />
        <div className="tribal-pattern absolute inset-0 opacity-30" />

        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-white/5 blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <div className="animate-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm mb-8">
                <Sparkles className="w-4 h-4" />
                <span>ᱚ.ᱟ.ᱮ.ᱥ.ᱮ.ᱠ.ᱮ ᱩᱰᱤᱥᱟ ᱥᱟᱠᱷᱟ ᱫᱟᱸᱜᱩᱣᱟᱹ</span>
              </div>
            </div>

            <h1 className="animate-in animate-in-delay-1 font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              BRANCH ASECA
              <br />
              <span className="text-white/90">DANGACHUA</span>
            </h1>

            <p className="animate-in animate-in-delay-2 text-xl sm:text-2xl text-white/80 mb-8 max-w-2xl">
              Adivasi Socio-Educational & Cultural Association — Preserving Santali heritage, empowering through Ol Chiki education, building stronger Adivasi communities.
            </p>

            <div className="animate-in animate-in-delay-3 flex flex-wrap gap-4">
              <Link to="/dictionary" className="btn-primary bg-white text-brand-700 hover:bg-white/90">
                <BookOpen className="w-5 h-5 mr-2" />
                Santali Dictionary
              </Link>
              <Link to="/olchiki-lab" className="px-6 py-3 rounded-xl font-semibold text-white border-2 border-white/30 hover:bg-white/10 transition-all flex items-center">
                Ol Chiki Lab
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <div className="w-1 h-3 rounded-full bg-white/60" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard number="3" label="Affiliated Schools" icon={GraduationCap} />
            <StatCard number="23+" label="Students Enrolled" icon={Users} />
            <StatCard number="10+" label="Dedicated Teachers" icon={BookOpen} />
            <StatCard number="1000+" label="Dictionary Words" icon={Globe} />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-gray-50 tribal-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="section-title mb-4">About ASECA Dangachua</h2>
            <p className="section-subtitle mb-8">
              The Dangachua branch of ASECA administers Ol-Itun Ashras (Santali-medium schools) and higher secondary institutions across Kendujhar district, promoting education through the Ol Chiki script, preserving Santali culture, and strengthening Adivasi communities.
            </p>
            <Link to="/about" className="btn-primary">
              Learn More
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">Our Platforms</h2>
            <p className="section-subtitle">Three connected experiences for education, culture, and community</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={BookOpen}
              title="Santali Dictionary"
              description="Comprehensive multilingual dictionary with Ol Chiki, Roman, Odia, Hindi, and English. Search, browse, and learn Santali vocabulary with audio pronunciation."
              link="/dictionary"
              color="brand"
            />
            <FeatureCard
              icon={Sparkles}
              title="Ol Chiki Lab"
              description="Child-friendly interactive learning platform with LEARN, LISTEN, MATCH, PRACTICE, QUIZ modes. Master the Ol Chiki script through engaging activities."
              link="/olchiki-lab"
              color="forest"
            />
            <FeatureCard
              icon={GraduationCap}
              title="Multi-School ERP"
              description="Complete school management system with attendance, exams, results, library, timetable, certificates, and more for all affiliated Ol-Itun Ashras."
              link="/login"
              color="earth"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-brand">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-4xl font-bold text-white mb-4">
            Ready to explore?
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Access the complete ERP system for school management, or explore our cultural platforms.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/login" className="px-8 py-4 rounded-xl font-semibold text-brand-700 bg-white hover:bg-gray-100 transition-all shadow-lg">
              Login to ERP
            </Link>
            <Link to="/schools" className="px-8 py-4 rounded-xl font-semibold text-white border-2 border-white/30 hover:bg-white/10 transition-all">
              View Schools
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ number, label, icon: Icon }: { number: string; label: string; icon: any }) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-50 mb-4">
        <Icon className="w-7 h-7 text-brand-600" />
      </div>
      <div className="font-display text-4xl font-bold text-gray-900 mb-1">{number}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, link, color }: { icon: any; title: string; description: string; link: string; color: string }) {
  const colors = {
    brand: 'bg-brand-50 text-brand-600',
    forest: 'bg-forest-50 text-forest-600',
    earth: 'bg-earth-50 text-earth-600',
  };

  return (
    <Link to={link} className="card-hover p-8 group">
      <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6 ${colors[color as keyof typeof colors]}`}>
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="font-display text-xl font-bold text-gray-900 mb-3 group-hover:text-brand-600 transition">
        {title}
      </h3>
      <p className="text-gray-600 leading-relaxed mb-4">{description}</p>
      <div className="flex items-center text-brand-600 font-semibold text-sm">
        Explore
        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}
