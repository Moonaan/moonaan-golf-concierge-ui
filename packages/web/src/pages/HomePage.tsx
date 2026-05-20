// ============================================================
// HomePage — Premium landing page for Missouri Golf Trail
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic, Zap, Star, ArrowRight, Phone, MapPin,
  Flag, CheckCircle, ChevronLeft, ChevronRight, Mail,
} from 'lucide-react';
import { SearchBar, type SearchParams } from '@/components/SearchBar';
import { CourseCard } from '@/components/CourseCard';
import { useCourses } from '@/hooks/useCourses';
import type { Course } from '@/lib/api';
import { MEMBERSHIP_TIERS, PHONE_NUMBER, PHONE_DISPLAY } from '@/lib/constants';
import { formatCurrency } from '@/lib/format';

// Featured courses (demo data)
const FEATURED_COURSES: Course[] = [
  {
    courseId: 'buffalo-ridge',
    name: 'Buffalo Ridge Springs',
    shortName: 'Buffalo Ridge',
    description: 'Tom Fazio masterpiece at Big Cedar Lodge',
    location: { lat: 36.63, lng: -93.24 },
    address: { street: '190 Top of the Rock Rd', city: 'Ridgedale', state: 'MO', zip: '65739' },
    phone: '800-225-6343',
    region: 'BRANSON',
    holes: 18,
    par: 71,
    yardage: { championship: 7036, mens: 6487, ladies: 5114 },
    courseRating: 4.8,
    slopeRating: 138,
    amenities: ['DRIVING_RANGE', 'PRO_SHOP', 'RESTAURANT', 'LODGING'],
    pricing: { weekday18: { min: 125, max: 175 }, weekend18: { min: 150, max: 200 }, cartFee18: 0 },
    status: 'ACTIVE',
  },
  {
    courseId: 'paynes-valley',
    name: "Payne's Valley",
    shortName: "Payne's Valley",
    description: 'Tiger Woods-designed course at Big Cedar Lodge',
    location: { lat: 36.64, lng: -93.25 },
    address: { street: '612 Devil\'s Pool Rd', city: 'Ridgedale', state: 'MO', zip: '65739' },
    phone: '800-225-6343',
    region: 'BRANSON',
    holes: 19,
    par: 71,
    yardage: { championship: 7370, mens: 6805, ladies: 5260 },
    courseRating: 4.9,
    slopeRating: 145,
    amenities: ['DRIVING_RANGE', 'PRO_SHOP', 'RESTAURANT', 'LODGING'],
    pricing: { weekday18: { min: 225, max: 325 }, weekend18: { min: 275, max: 375 }, cartFee18: 0 },
    status: 'ACTIVE',
  },
  {
    courseId: 'old-kinderhook',
    name: 'Old Kinderhook',
    shortName: 'Old Kinderhook',
    description: 'Tom Weiskopf gem on the Lake of the Ozarks',
    location: { lat: 37.99, lng: -92.65 },
    address: { street: '678 Old Kinderhook Dr', city: 'Camdenton', state: 'MO', zip: '65020' },
    phone: '573-317-3500',
    region: 'LAKE_OF_THE_OZARKS',
    holes: 18,
    par: 71,
    yardage: { championship: 6855, mens: 6367, ladies: 4952 },
    courseRating: 4.6,
    slopeRating: 136,
    amenities: ['DRIVING_RANGE', 'PRO_SHOP', 'RESTAURANT', 'LODGING', 'BAR'],
    pricing: { weekday18: { min: 79, max: 119 }, weekend18: { min: 99, max: 139 }, cartFee18: 0 },
    status: 'ACTIVE',
  },
  {
    courseId: 'ledgestone',
    name: 'LedgeStone Championship',
    shortName: 'LedgeStone',
    description: 'Award-winning course in the Ozark Mountains',
    location: { lat: 36.69, lng: -93.26 },
    address: { street: '1600 Ledgestone Way', city: 'Branson West', state: 'MO', zip: '65737' },
    phone: '417-335-8187',
    region: 'BRANSON',
    holes: 18,
    par: 71,
    yardage: { championship: 7050, mens: 6580, ladies: 5035 },
    courseRating: 4.5,
    slopeRating: 142,
    amenities: ['DRIVING_RANGE', 'PRO_SHOP', 'RESTAURANT'],
    pricing: { weekday18: { min: 65, max: 95 }, weekend18: { min: 85, max: 125 }, cartFee18: 0 },
    status: 'ACTIVE',
  },
  {
    courseId: 'thousand-hills',
    name: 'Thousand Hills Golf Resort',
    shortName: 'Thousand Hills',
    description: 'Scenic resort course in the heart of Branson',
    location: { lat: 36.65, lng: -93.28 },
    address: { street: '245 S Wildwood Dr', city: 'Branson', state: 'MO', zip: '65616' },
    phone: '417-334-4553',
    region: 'BRANSON',
    holes: 18,
    par: 64,
    yardage: { championship: 4091, mens: 3707, ladies: 2900 },
    courseRating: 4.2,
    slopeRating: 110,
    amenities: ['PRO_SHOP', 'LODGING'],
    pricing: { weekday18: { min: 39, max: 59 }, weekend18: { min: 49, max: 79 }, cartFee18: 0 },
    status: 'ACTIVE',
  },
  {
    courseId: 'the-cove',
    name: 'The Cove at Four Seasons',
    shortName: 'The Cove',
    description: 'Robert Trent Jones Jr. design on Lake of the Ozarks',
    location: { lat: 38.12, lng: -92.72 },
    address: { street: '315 Four Seasons Dr', city: 'Lake Ozark', state: 'MO', zip: '65049' },
    phone: '573-365-8532',
    region: 'LAKE_OF_THE_OZARKS',
    holes: 18,
    par: 71,
    yardage: { championship: 6357, mens: 5928, ladies: 4783 },
    courseRating: 4.4,
    slopeRating: 131,
    amenities: ['DRIVING_RANGE', 'PRO_SHOP', 'RESTAURANT', 'LODGING', 'BAR', 'LOCKER_ROOM'],
    pricing: { weekday18: { min: 69, max: 99 }, weekend18: { min: 89, max: 129 }, cartFee18: 0 },
    status: 'ACTIVE',
  },
];

const testimonials = [
  {
    quote: "I booked three rounds across Branson in under two minutes. By voice. While driving. This is how golf booking should work.",
    name: 'Mike T.',
    title: 'Trail Pro Member',
    rating: 5,
  },
  {
    quote: "Planned our entire corporate outing — tee times, dinner, hotels — in one session. The AI understood exactly what we needed.",
    name: 'Sarah K.',
    title: 'KC Business Golf',
    rating: 5,
  },
  {
    quote: "The buddy trip planner is genius. Four guys, six rounds, zero phone calls. Just told it what we wanted and it handled everything.",
    name: 'Dave R.',
    title: 'Annual Buddy Trip',
    rating: 5,
  },
];

function AnimatedCounter({ target, label, suffix = '' }: { target: number; label: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 1500;
          const steps = 40;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, hasAnimated]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-display font-bold text-white">
        {count}{suffix}
      </div>
      <p className="text-green-300 text-sm mt-1">{label}</p>
    </div>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const { courses } = useCourses();
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [email, setEmail] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const displayCourses =
    courses.length > 0 ? courses.slice(0, 6) : FEATURED_COURSES;

  function handleSearch(params: SearchParams) {
    const qs = new URLSearchParams();
    if (params.course) qs.set('q', params.course);
    if (params.date) qs.set('date', params.date);
    if (params.time) qs.set('time', params.time);
    if (params.partySize) qs.set('players', String(params.partySize));
    navigate(`/courses?${qs.toString()}`);
  }

  // Auto-rotate testimonials
  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx((i) => (i + 1) % testimonials.length), 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <div>
      {/* ── Hero Section ──────────────────────────────────── */}
      <section className="relative bg-hero-gradient text-white overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                'radial-gradient(circle at 25% 25%, rgba(196,163,90,0.3) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(196,163,90,0.2) 0%, transparent 50%)',
            }}
          />
        </div>

        {/* Animated golf ball (CSS only) */}
        <div className="absolute right-[10%] top-[20%] hidden lg:block">
          <div className="relative animate-float">
            <div className="w-20 h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/90 shadow-lg relative">
                {/* Dimples */}
                <div className="absolute inset-2 rounded-full border border-gray-200/50" />
                <div className="absolute inset-3 rounded-full border border-gray-200/30" />
              </div>
            </div>
            {/* Tee */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-1.5 h-8 bg-golf-gold-400/60 rounded-b" />
          </div>
        </div>

        <div className="page-container relative z-10 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight text-balance animate-fade-in">
              One Voice.{' '}
              <span className="text-golf-gold-400">Every Course.</span>{' '}
              Zero Friction.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-green-100 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
              The AI-powered golf concierge for Missouri&apos;s finest courses. Book tee times, plan trips, and play more — all with your voice.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <a
                href={`tel:${PHONE_NUMBER}`}
                className="btn-secondary text-lg px-8 py-3 shadow-lg hover:shadow-xl transition-shadow"
              >
                <Phone className="w-5 h-5 mr-2" />
                Call {PHONE_DISPLAY}
              </a>
              <button
                onClick={() => navigate('/courses')}
                className="btn-outline border-white text-white hover:bg-white hover:text-golf-green-700 text-lg px-8 py-3"
              >
                Browse Courses
              </button>
            </div>

            {/* Search Bar */}
            <div className="mt-10 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <SearchBar onSearch={handleSearch} />
            </div>

            {/* Quick links */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {['Branson', 'Lake of the Ozarks', 'Kansas City', 'St. Louis'].map((region) => (
                <button
                  key={region}
                  onClick={() => navigate(`/courses?region=${region.toUpperCase().replace(/ /g, '_')}`)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-sm transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  {region}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full">
            <path d="M0 60V30C240 0 480 0 720 30C960 60 1200 60 1440 30V60H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────── */}
      <section className="py-16 md:py-24">
        <div className="page-container">
          <div className="text-center mb-16">
            <h2 className="section-heading">
              How It <span className="text-golf-gold-400">Works</span>
            </h2>
            <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
              Three steps. That&apos;s it. No apps to download, no accounts required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                step: 1,
                icon: Mic,
                title: 'Say it',
                example: '"Book me 18 holes tomorrow near Branson"',
                details: 'Call our AI concierge or search online. Natural language, no menus.',
                color: 'bg-golf-green-100 text-golf-green-700',
              },
              {
                step: 2,
                icon: Zap,
                title: 'We handle it',
                example: 'Multi-course search, constraint matching, travel planning',
                details: 'AI searches every course, finds the best match, and handles the booking.',
                color: 'bg-golf-gold-400/10 text-golf-gold-600',
              },
              {
                step: 3,
                icon: Flag,
                title: 'You play',
                example: 'Confirmation, check-in, on-course support',
                details: 'Show up, tee off, enjoy. We handle weather alerts and course updates.',
                color: 'bg-green-100 text-green-700',
              },
            ].map((item) => (
              <div key={item.step} className="text-center group">
                <div className="relative inline-block mb-6">
                  <div className={`w-20 h-20 rounded-2xl ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <item.icon className="w-10 h-10" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-golf-green-700 text-white flex items-center justify-center font-bold text-sm">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-display font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-golf-green-600 font-medium mb-2 italic">
                  {item.example}
                </p>
                <p className="text-sm text-gray-500">{item.details}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Courses (horizontal scroll) ──────────── */}
      <section className="py-16 md:py-24 bg-golf-sand">
        <div className="page-container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="section-heading">Featured Courses</h2>
              <p className="mt-2 text-gray-500">
                Premier destinations on the Missouri Golf Trail
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => scrollRef.current?.scrollBy({ left: -340, behavior: 'smooth' })}
                className="p-2 rounded-full border border-gray-200 hover:bg-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => scrollRef.current?.scrollBy({ left: 340, behavior: 'smooth' })}
                className="p-2 rounded-full border border-gray-200 hover:bg-white transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => navigate('/courses')}
                className="flex items-center gap-1.5 text-golf-green-700 font-semibold hover:text-golf-green-600 transition-colors ml-2"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4"
          >
            {displayCourses.map((course) => (
              <div key={course.courseId} className="flex-shrink-0 w-[300px] snap-start">
                <CourseCard course={course} />
              </div>
            ))}
          </div>

          <div className="md:hidden text-center mt-6">
            <button onClick={() => navigate('/courses')} className="btn-outline">
              View All Courses
            </button>
          </div>
        </div>
      </section>

      {/* ── Trail Stats ───────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-golf-green-800 to-golf-green-950">
        <div className="page-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <AnimatedCounter target={100} label="Courses" suffix="+" />
            <AnimatedCounter target={6} label="Regions" />
            <AnimatedCounter target={1} label="Voice Command" />
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-display font-bold text-golf-gold-400">
                Zero
              </div>
              <p className="text-green-300 text-sm mt-1">Friction</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Membership Tiers ──────────────────────────────── */}
      <section className="py-16 md:py-24">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="section-heading">
              Join the <span className="text-golf-gold-400">Trail</span>
            </h2>
            <p className="mt-4 text-gray-500 max-w-xl mx-auto">
              From casual golfers to die-hard trail runners — there&apos;s a plan for every game.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {MEMBERSHIP_TIERS.map((tier) => {
              const isPopular = 'popular' in tier && tier.popular;
              return (
                <div
                  key={tier.id}
                  className={`relative rounded-2xl border-2 p-6 transition-all hover:shadow-lg ${
                    isPopular
                      ? 'border-golf-gold-400 shadow-md scale-[1.02]'
                      : 'border-gray-200 hover:border-golf-green-200'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-golf-gold-400 text-golf-green-700 text-xs font-bold rounded-full">
                      MOST POPULAR
                    </div>
                  )}

                  <h3 className="font-display font-bold text-lg text-gray-900">{tier.name}</h3>
                  <div className="mt-3">
                    <span className="text-3xl font-bold text-golf-green-700">
                      {tier.price === 0 ? 'Free' : formatCurrency(tier.price)}
                    </span>
                    {tier.period && (
                      <span className="text-gray-400 text-sm">{tier.period}</span>
                    )}
                  </div>

                  <ul className="mt-5 space-y-2.5">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-golf-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">{f}</span>
                      </li>
                    ))}
                    {tier.excluded.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm opacity-40">
                        <span className="w-4 h-4 flex-shrink-0 mt-0.5 text-center">—</span>
                        <span className="text-gray-400 line-through">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`w-full mt-6 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                      isPopular
                        ? 'bg-golf-gold-400 text-golf-green-700 hover:bg-golf-gold-300'
                        : 'bg-golf-green-700 text-white hover:bg-golf-green-600'
                    }`}
                  >
                    {tier.price === 0 ? 'Get Started' : 'Subscribe'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-golf-sand">
        <div className="page-container">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex justify-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} className="w-5 h-5 text-golf-gold-400 fill-golf-gold-400" />
              ))}
            </div>

            <div className="relative min-h-[120px]">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className={`transition-all duration-500 ${
                    i === testimonialIdx
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-4 absolute inset-0'
                  }`}
                >
                  <blockquote className="text-xl md:text-2xl font-display text-gray-700 italic">
                    &quot;{t.quote}&quot;
                  </blockquote>
                  <p className="mt-4 text-gray-500 font-medium">
                    — {t.name}, <span className="text-golf-green-600">{t.title}</span>
                  </p>
                </div>
              ))}
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTestimonialIdx(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i === testimonialIdx ? 'bg-golf-green-700' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────── */}
      <section className="py-16 md:py-20">
        <div className="page-container">
          <div className="bg-gradient-to-br from-golf-green-700 via-golf-green-800 to-golf-green-950 rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 30% 50%, rgba(196,163,90,0.5) 0%, transparent 50%)',
                }}
              />
            </div>
            <div className="relative z-10">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Ready to tee off?
              </h2>
              <p className="text-green-200 max-w-xl mx-auto mb-8">
                Join thousands of golfers who book smarter with the Missouri Golf Trail AI Concierge.
              </p>

              {/* Email signup */}
              <form
                onSubmit={(e) => { e.preventDefault(); setEmail(''); }}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-6"
              >
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-golf-gold-400"
                  />
                </div>
                <button type="submit" className="btn-secondary whitespace-nowrap">
                  Get Started
                </button>
              </form>

              <p className="text-green-300 text-sm">
                Or call us anytime:{' '}
                <a href={`tel:${PHONE_NUMBER}`} className="text-golf-gold-400 font-semibold hover:text-golf-gold-300">
                  {PHONE_DISPLAY}
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
