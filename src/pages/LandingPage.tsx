import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { fetchDoctors, type DbDoctor } from '../lib/db';
import HeroVisual from '../components/HeroVisual';
import {
  Brain, Activity, Stethoscope, Map, Calendar, Compass,
  Heart, Mic, Globe, ShieldCheck, Zap, ShieldAlert,
  ChevronRight, Star, MapPin, Building2, AlertTriangle,
  ArrowRight, Sparkles, TrendingUp, Users, Award,
  HeartPulse, CheckCircle2, Play
} from 'lucide-react';

interface LandingPageProps {
  setCurrentTab: (tab: string) => void;
  lang: string;
}

// Counter animation hook
function useCounter(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

// Section reveal wrapper
function Section({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const features = [
  { icon: Brain, name: 'AI Symptom Analysis', desc: 'Neural symptom mapping against 41 diseases with confidence scoring.', color: '#E53935' },
  { icon: Activity, name: 'Severity Detection', desc: 'Real-time urgency index measurement with Critical/High/Moderate alerts.', color: '#FF6B6B' },
  { icon: Stethoscope, name: 'Doctor Matching', desc: 'Pairs symptoms to board-certified disease-specific specialists.', color: '#E53935' },
  { icon: Map, name: 'Hospital Finder', desc: 'Live OpenStreetMap integration with ICU bed availability.', color: '#FF6B6B' },
  { icon: Calendar, name: 'Instant Booking', desc: 'Secure consultation slots in under 15 seconds.', color: '#E53935' },
  { icon: Mic, name: 'Voice Input', desc: 'Speak naturally to describe symptoms in multiple languages.', color: '#FF6B6B' },
  { icon: ShieldCheck, name: 'Verified Doctors', desc: 'Every physician is credential-audited for absolute trust.', color: '#E53935' },
  { icon: ShieldAlert, name: 'Emergency SOS', desc: 'One-click dispatch to nearest trauma centers.', color: '#FF6B6B' },
  { icon: Globe, name: 'Multilingual', desc: 'Full UI localizations across 6 major regional languages.', color: '#E53935' },
];

const testimonials = [
  {
    name: 'Dr. Priya Sharma',
    role: 'Cardiologist, AIIMS Delhi',
    quote: 'MedHome\'s AI diagnosis engine has dramatically reduced consultation wait times. The confidence scoring is impressively accurate.',
    avatar: 'P',
  },
  {
    name: 'Rahul Gupta',
    role: 'Patient, Mumbai',
    quote: 'I got my dengue diagnosed in under 2 minutes. The app found me a specialist and booked an appointment the same day.',
    avatar: 'R',
  },
  {
    name: 'Dr. Aisha Khan',
    role: 'Pulmonologist, Fortis',
    quote: 'The hospital map integration is flawless. I recommend MedHome to all my patients for after-hour consultation needs.',
    avatar: 'A',
  },
];

const timelineSteps = [
  {
    step: '01',
    title: 'Instant Symptom Intake',
    desc: 'Describe your symptoms naturally via voice or text. The diagnostic engine maps queries against extensive multi-symptom patterns.',
    icon: Mic,
    detail: 'Voice inputs, multi-language query mapping.'
  },
  {
    step: '02',
    title: 'Neural Diagnosis Mapping',
    desc: 'The AI parses indicators against 41 diagnostic patterns in real-time, outputting confidence scores and risk metrics.',
    icon: Brain,
    detail: '41 disease regression models, confidence score.'
  },
  {
    step: '03',
    title: 'Critical Triage Assessment',
    desc: 'Severe issues trigger auto-triage. The platform pre-reserves emergency ICU slots at nearby ABDM registered hospitals.',
    icon: ShieldCheck,
    detail: 'Automated SOS beacons, live bed vacancy checks.'
  },
  {
    step: '04',
    title: 'Verified Doctor Connection',
    desc: 'Get recommended specialists matching your report, view schedules, and confirm consultations in under 15 seconds.',
    icon: Stethoscope,
    detail: 'Audited credential verification, 15-second booking.'
  }
];

export default function LandingPage({ setCurrentTab }: LandingPageProps) {
  const [symptomInput, setSymptomInput] = useState('');
  const [featuredDoctors, setFeaturedDoctors] = useState<DbDoctor[]>([]);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true });
  const docCount = useCounter(5000, 2000, statsInView);
  const hospCount = useCounter(1200, 2000, statsInView);
  const accuracy = useCounter(98, 2000, statsInView);
  const reportsCount = useCounter(50000, 2500, statsInView);

  // Timeline Scroll Hooks for Storytelling
  const timelineRef = useRef(null);
  const { scrollYProgress: timelineScroll } = useScroll({
    target: timelineRef,
    offset: ["start end", "end start"]
  });
  const timelineProgress = useTransform(timelineScroll, [0.15, 0.85], [0, 1]);

  useEffect(() => {
    fetchDoctors().then(docs => setFeaturedDoctors(docs.slice(0, 3))).catch(() => {});
    const interval = setInterval(() => {
      setTestimonialIdx(prev => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSymptomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (symptomInput.trim()) {
      localStorage.setItem('medhome_landing_symptom', symptomInput.trim());
    }
    setCurrentTab('checker');
  };

  return (
    <div className="min-h-screen">

      {/* ─── HERO ───────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          {/* Red ambient glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full dark:bg-[#E53935]/6 bg-[#E53935]/3 blur-[120px]" />
          {/* Grid lines */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04]"
            style={{ backgroundImage: 'linear-gradient(rgba(229,57,53,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(229,57,53,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-20">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left: Text Content and Inputs */}
            <div className="lg:col-span-7 text-left space-y-6">
              {/* Pill label */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border dark:bg-[#E53935]/8 dark:border-[#E53935]/20 bg-[#E53935]/5 border-[#E53935]/15 mb-4"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#E53935] animate-pulse" />
                <span className="text-xs font-semibold dark:text-[#FF6B6B] text-[#C62828] uppercase tracking-wider">AI-Powered Healthcare Platform</span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] dark:text-white text-[#111] mb-2"
              >
                Healthcare
                <br />
                <span className="text-gradient">reimagined</span>
                <br />
                for everyone.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg sm:text-xl dark:text-[#888] text-[#555] max-w-xl leading-relaxed mb-6"
              >
                Instant AI diagnostics, verified doctors, and emergency-ready hospitals — all in one premium healthcare experience.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-3 mb-8"
              >
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setCurrentTab('checker')}
                  className="btn-primary gap-2 text-sm py-3.5 px-7 rounded-2xl"
                >
                  <Sparkles className="w-4 h-4" />
                  Start AI Diagnosis
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setCurrentTab('hospitals')}
                  className="btn-secondary text-sm py-3.5 px-7 rounded-2xl flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  Find Nearby Hospitals
                </motion.button>
              </motion.div>

              {/* Quick symptom input */}
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                onSubmit={handleSymptomSubmit}
                className="flex gap-2 max-w-lg"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={symptomInput}
                    onChange={e => setSymptomInput(e.target.value)}
                    placeholder="Describe your symptoms… e.g., high fever, headache"
                    className="custom-input text-sm py-3.5 pl-4 pr-12 rounded-2xl"
                  />
                  <HeartPulse className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 dark:text-[#555] text-[#999]" />
                </div>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  type="submit"
                  className="btn-primary py-3.5 px-5 rounded-2xl flex-shrink-0 text-sm"
                >
                  Analyze
                </motion.button>
              </motion.form>
            </div>

            {/* Right: Interactive Holographic Visualization */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-5 w-full flex justify-center lg:justify-end mt-10 lg:mt-0"
            >
              <HeroVisual />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── STATS ──────────────────────────────────── */}
      <section ref={statsRef} className="py-20 border-t border-b dark:border-white/5 border-black/6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {[
              { val: `${docCount.toLocaleString()}+`, label: 'Verified Doctors', icon: <Users className="w-5 h-5" /> },
              { val: `${hospCount.toLocaleString()}+`, label: 'Registered Hospitals', icon: <Building2 className="w-5 h-5" /> },
              { val: `${accuracy}%`, label: 'AI Accuracy Rate', icon: <TrendingUp className="w-5 h-5" /> },
              { val: `${reportsCount.toLocaleString()}+`, label: 'Diagnoses Completed', icon: <HeartPulse className="w-5 h-5" /> },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-[#E53935]">{stat.icon}</span>
                </div>
                <div className="text-3xl sm:text-4xl font-bold dark:text-white text-[#111] mb-1">{stat.val}</div>
                <div className="text-sm dark:text-[#666] text-[#888]">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SCROLL STORYTELLING TIMELINE ───────────────────────── */}
      <section ref={timelineRef} className="py-24 relative overflow-hidden bg-slate-50 dark:bg-[#080808] border-t border-b dark:border-white/5 border-black/5">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          {/* Subtle rose ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full dark:bg-[#E53935]/2 bg-[#E53935]/1 blur-[150px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Section className="text-center mb-24">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full dark:bg-white/4 bg-black/4 dark:border dark:border-white/8 border border-black/8 mb-6">
              <HeartPulse className="w-3.5 h-3.5 text-[#E53935] animate-pulse" />
              <span className="text-xs font-semibold dark:text-[#888] text-[#555] uppercase tracking-wider">Patient Journey</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold dark:text-white text-[#111] tracking-tight mb-5">
              The AI Diagnostic Journey
            </h2>
            <p className="text-base dark:text-[#666] text-[#777] max-w-xl mx-auto leading-relaxed">
              Experience a narrative walk-through of the underlying clinical intelligence processing your request.
            </p>
          </Section>

          {/* Timeline Wrapper */}
          <div className="relative">
            {/* Center line for desktop */}
            <div className="absolute left-1/2 -translate-x-1/2 top-4 bottom-4 w-[2px] bg-black/5 dark:bg-white/5 hidden md:block" aria-hidden>
              {/* Dynamic scrolling progress fill */}
              <motion.div 
                className="absolute top-0 left-0 right-0 rounded-full bg-gradient-to-b from-[#E53935] via-[#FF6B6B] to-[#E53935]"
                style={{
                  height: "100%",
                  scaleY: timelineProgress,
                  originY: 0
                }}
              />
            </div>

            {/* Alternate steps grid */}
            <div className="space-y-24 md:space-y-36 relative z-10">
              {timelineSteps.map((step, idx) => {
                const isEven = idx % 2 === 1;
                const StepIcon = step.icon;

                return (
                  <div key={idx} className={`grid md:grid-cols-2 gap-8 md:gap-16 items-center ${isEven ? 'md:flex-row-reverse' : ''}`}>
                    {/* Content Column */}
                    <motion.div
                      initial={{ opacity: 0, x: isEven ? 32 : -32 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      className={`space-y-4 text-left ${isEven ? 'md:order-2 md:pl-8' : 'md:pr-8'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-5xl font-black text-[#E53935]/15 dark:text-[#E53935]/10 font-mono tracking-tighter">{step.step}</span>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center dark:bg-white/4 bg-black/4 border dark:border-white/8 border-black/8">
                          <StepIcon className="w-5 h-5 text-[#E53935]" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold dark:text-white text-[#111] tracking-tight">{step.title}</h3>
                      <p className="text-sm dark:text-[#666] text-[#777] leading-relaxed">{step.desc}</p>
                      
                      {/* Metric card badge */}
                      <div className="inline-block px-3 py-1.5 rounded-lg text-[10px] font-bold dark:bg-white/3 bg-black/3 dark:text-slate-400 text-slate-500 border dark:border-white/5 border-black/5 font-mono">
                        {step.detail}
                      </div>
                    </motion.div>

                    {/* Visual Graphic Column */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                      className={`flex justify-center ${isEven ? 'md:order-1' : ''}`}
                    >
                      <div className="relative group p-6 rounded-3xl dark:bg-[#141414]/90 bg-white border dark:border-white/6 border-black/6 shadow-xl hover:shadow-[#E53935]/5 dark:hover:shadow-[#E53935]/10 transition-shadow duration-300 w-full max-w-[340px]">
                        <div className="absolute top-4 right-4 text-[9px] font-bold dark:text-[#333] text-slate-300 font-mono uppercase tracking-widest">Diagnostic Step</div>
                        
                        {/* Mock mini dashboard visual for this step */}
                        <div className="space-y-4 pt-4">
                          {idx === 0 && (
                            <div className="space-y-2">
                              <div className="h-2 w-2/3 rounded bg-slate-100 dark:bg-white/5 animate-pulse" />
                              <div className="h-8 rounded-xl bg-slate-50 dark:bg-white/4 border dark:border-white/5 border-black/5 flex items-center px-3 gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#E53935] animate-pulse" />
                                <span className="text-[10px] dark:text-[#888] text-[#555] font-mono">"Experiencing high fever..."</span>
                              </div>
                              <div className="flex gap-2">
                                <div className="h-5 w-14 rounded-full bg-[#E53935]/8 text-[9px] text-[#FF6B6B] font-bold flex items-center justify-center">English</div>
                                <div className="h-5 w-14 rounded-full bg-slate-100 dark:bg-white/4 text-[9px] text-slate-400 font-bold flex items-center justify-center">Hindi</div>
                              </div>
                            </div>
                          )}

                          {idx === 1 && (
                            <div className="space-y-3">
                              <div className="flex justify-between items-center text-[10px] font-mono dark:text-slate-400 text-slate-600">
                                <span>Disease Model</span>
                                <span>Confidence</span>
                              </div>
                              {[
                                { name: 'Dengue Fever', w: '87%', c: 'bg-[#E53935]' },
                                { name: 'Typhoid', w: '35%', c: 'bg-amber-500' }
                              ].map(m => (
                                <div key={m.name} className="space-y-1">
                                  <div className="flex justify-between text-[11px] font-bold dark:text-white text-slate-800">
                                    <span>{m.name}</span>
                                    <span>{m.w}</span>
                                  </div>
                                  <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                                    <div className={`h-full ${m.c}`} style={{ width: m.w }} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {idx === 2 && (
                            <div className="p-3.5 rounded-xl border dark:border-red-500/20 dark:bg-red-500/5 bg-red-50/50 border-red-500/15 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-red-500/10 text-[#E53935] flex items-center justify-center flex-shrink-0">
                                <ShieldCheck className="w-4 h-4" />
                              </div>
                              <div className="text-left">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-[#E53935]">Triage Level</span>
                                <div className="text-xs font-black dark:text-white text-slate-900 mt-0.5">Critical Emergency</div>
                                <div className="text-[9px] dark:text-[#FF6B6B] text-[#C62828] font-bold font-mono">Beds Auto-Reserved</div>
                              </div>
                            </div>
                          )}

                          {idx === 3 && (
                            <div className="space-y-2.5">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#E53935] to-[#FF6B6B] flex items-center justify-center text-[8px] font-bold text-white">DR</div>
                                <div className="text-left">
                                  <div className="text-[10px] font-bold dark:text-white text-slate-900">Dr. Priya Sharma</div>
                                  <div className="text-[8px] text-slate-400 font-semibold">Cardiologist • Fortis</div>
                                </div>
                              </div>
                              <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-white/3">
                                <span className="text-[9px] dark:text-[#888] text-[#555]">Next Available: Today</span>
                                <span className="text-[9px] font-bold text-[#E53935]">15s Book</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ───────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Section className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full dark:bg-white/4 bg-black/4 dark:border dark:border-white/8 border border-black/8 mb-6">
              <span className="text-xs font-semibold dark:text-[#888] text-[#555] uppercase tracking-wider">Platform Features</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold dark:text-white text-[#111] tracking-tight mb-5">
              Everything you need.<br />
              <span className="text-gradient">Nothing you don't.</span>
            </h2>
            <p className="text-lg dark:text-[#666] text-[#777] max-w-xl mx-auto">
              Built on real clinical data from 41+ diseases, 5,000+ verified practitioners, and 1,200+ registered hospitals.
            </p>
          </Section>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feat, i) => (
              <Section key={i} delay={i * 0.05}>
                <div className="feature-card h-full group">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all group-hover:scale-110"
                    style={{ background: `${feat.color}15` }}>
                    <feat.icon className="w-5 h-5" style={{ color: feat.color }} />
                  </div>
                  <h3 className="text-base font-semibold dark:text-white text-[#111] mb-2">{feat.name}</h3>
                  <p className="text-sm dark:text-[#666] text-[#777] leading-relaxed">{feat.desc}</p>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AI SHOWCASE ────────────────────────────── */}
      <section className="py-24 dark:bg-[#0D0D0D] bg-[#F0F0F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <Section>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full dark:bg-[#E53935]/8 dark:border dark:border-[#E53935]/15 bg-[#E53935]/5 border border-[#E53935]/12 mb-6">
                <Brain className="w-3.5 h-3.5 text-[#E53935]" />
                <span className="text-xs font-semibold dark:text-[#FF6B6B] text-[#C62828] uppercase tracking-wider">AI Symptom Checker</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold dark:text-white text-[#111] tracking-tight mb-6">
                Diagnose smarter.
                <br />
                <span className="text-gradient">Act faster.</span>
              </h2>
              <p className="text-lg dark:text-[#666] text-[#777] mb-8 leading-relaxed">
                Enter your symptoms and our AI engine cross-references them against 41 diseases in real time. Get confidence scores, severity ratings, specialist recommendations, and matched doctors in seconds.
              </p>
              <ul className="space-y-3 mb-8">
                {['41 disease patterns analyzed', 'Severity score with triage category', 'Specialist doctor recommendation', 'Auto-save to EHR database'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm dark:text-[#888] text-[#555]">
                    <CheckCircle2 className="w-4 h-4 text-[#E53935] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setCurrentTab('checker')}
                className="btn-primary text-sm py-3 px-6 rounded-xl gap-2"
              >
                Try AI Diagnosis <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Section>

            {/* Mock AI report card */}
            <Section delay={0.2}>
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="glass-card dark:bg-[#141414] bg-white p-6 rounded-2xl max-w-sm mx-auto"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="text-[10px] font-mono dark:text-[#555] text-[#999] uppercase tracking-widest mb-0.5">REPORT #MH-20240622</div>
                    <div className="text-base font-bold dark:text-white text-[#111]">AI Diagnostic Report</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-red-500/12 text-red-400 border border-red-500/20">High Risk</span>
                </div>

                {/* Primary diagnosis */}
                <div className="dark:bg-[#1A1A1A] bg-[#F5F5F7] rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold dark:text-white text-[#111]">Dengue Fever</span>
                    <span className="text-[#E53935] font-bold text-sm">87%</span>
                  </div>
                  {/* Confidence bar */}
                  <div className="progress-track mb-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '87%' }}
                      transition={{ delay: 0.5, duration: 1.2, ease: 'easeOut' }}
                      className="progress-fill"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {['Fever', 'Headache', 'Joint Pain', 'Rash'].map(s => (
                      <span key={s} className="symptom-chip text-[10px] py-0.5 px-2">{s}</span>
                    ))}
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: 'Severity', val: 'High', color: 'text-[#FF6B6B]' },
                    { label: 'Specialist', val: 'Virologist', color: 'dark:text-white text-[#111]' },
                    { label: 'Matched', val: '3 Docs', color: 'text-[#E53935]' },
                  ].map(s => (
                    <div key={s.label} className="text-center dark:bg-[#1A1A1A] bg-[#F5F5F7] rounded-lg p-2">
                      <div className={`text-xs font-bold ${s.color}`}>{s.val}</div>
                      <div className="text-[10px] dark:text-[#555] text-[#999]">{s.label}</div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentTab('checker')}
                  className="btn-primary w-full text-xs py-2.5 rounded-xl"
                >
                  View Full Report
                </button>
              </motion.div>
            </Section>
          </div>
        </div>
      </section>

      {/* ─── HOSPITAL PREVIEW ───────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Hospital Cards preview */}
            <Section delay={0.1}>
              <div className="space-y-3 max-w-sm">
                {[
                  { name: 'AIIMS Trauma Center', city: 'New Delhi', beds: 24, rating: 4.9, type: 'Emergency' },
                  { name: 'Fortis Cardiac Hub', city: 'Mumbai', beds: 12, rating: 4.8, type: 'Cardiac' },
                  { name: 'Apollo Multispecialty', city: 'Chennai', beds: 31, rating: 4.7, type: 'General' },
                ].map((h, i) => (
                  <motion.div
                    key={h.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className="hospital-card p-4 flex items-center gap-4 cursor-pointer"
                    onClick={() => setCurrentTab('hospitals')}
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#E53935]/12 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-[#E53935]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold dark:text-white text-[#111] truncate">{h.name}</div>
                      <div className="flex items-center gap-2 text-xs dark:text-[#666] text-[#888]">
                        <MapPin className="w-3 h-3" />{h.city}
                        <span className="dark:text-[#333]">•</span>
                        <span className="text-[#E53935] font-semibold">{h.beds} beds</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="font-semibold dark:text-white text-[#111]">{h.rating}</span>
                    </div>
                  </motion.div>
                ))}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setCurrentTab('hospitals')}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-[#E53935] dark:border dark:border-[#E53935]/20 dark:hover:bg-[#E53935]/5 border border-[#E53935]/15 hover:bg-[#E53935]/4 transition-colors"
                >
                  View All Hospitals →
                </motion.button>
              </div>
            </Section>

            <Section>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full dark:bg-white/4 dark:border dark:border-white/8 bg-black/4 border border-black/8 mb-6">
                <Building2 className="w-3.5 h-3.5 dark:text-[#888] text-[#555]" />
                <span className="text-xs font-semibold dark:text-[#888] text-[#555] uppercase tracking-wider">Hospital Finder</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold dark:text-white text-[#111] tracking-tight mb-5">
                Find care
                <br />
                <span className="text-gradient">near you.</span>
              </h2>
              <p className="text-lg dark:text-[#666] text-[#777] mb-6 leading-relaxed">
                Interactive OpenStreetMap integration showing 1,200+ ABDM-registered hospitals with real-time ICU bed availability, emergency status, and Haversine-calculated distances.
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setCurrentTab('hospitals')}
                className="btn-primary text-sm py-3 px-6 rounded-xl gap-2"
              >
                Open Hospital Map <MapPin className="w-4 h-4" />
              </motion.button>
            </Section>
          </div>
        </div>
      </section>

      {/* ─── DOCTOR PREVIEW ─────────────────────────── */}
      <section className="py-24 dark:bg-[#0D0D0D] bg-[#F0F0F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Section className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full dark:bg-white/4 dark:border dark:border-white/8 bg-black/4 border border-black/8 mb-6">
              <Stethoscope className="w-3.5 h-3.5 dark:text-[#888] text-[#555]" />
              <span className="text-xs font-semibold dark:text-[#888] text-[#555] uppercase tracking-wider">Verified Doctors</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold dark:text-white text-[#111] tracking-tight mb-5">
              Book your specialist
              <br /><span className="text-gradient">in seconds.</span>
            </h2>
          </Section>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {(featuredDoctors.length > 0 ? featuredDoctors : [
              { id: '1', name: 'Dr. Arjun Mehta', specialization: 'Cardiologist', hospital: 'AIIMS Delhi', rating: 4.9, experience: 15, availableToday: true, qualification: 'MD', timeSlots: [], distance: 2.1 },
              { id: '2', name: 'Dr. Priya Nair', specialization: 'Neurologist', hospital: 'Fortis Gurgaon', rating: 4.8, experience: 12, availableToday: true, qualification: 'DM', timeSlots: [], distance: 3.4 },
              { id: '3', name: 'Dr. Sameer Rao', specialization: 'Pulmonologist', hospital: 'Apollo Mumbai', rating: 4.7, experience: 10, availableToday: false, qualification: 'DNB', timeSlots: [], distance: 5.2 },
            ] as any[]).map((doc, i) => (
              <Section key={doc.id} delay={i * 0.1}>
                <div className="doctor-card p-5 group h-full" onClick={() => setCurrentTab('doctors')}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E53935] to-[#FF6B6B] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {doc.name.split(' ').slice(-1)[0].charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold dark:text-white text-[#111]">{doc.name}</div>
                      <div className="text-xs dark:text-[#666] text-[#888]">{doc.specialization}</div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs dark:text-[#666] text-[#888]">
                      <Building2 className="w-3 h-3" />
                      <span className="truncate">{doc.hospital}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="font-semibold dark:text-white text-[#111]">{doc.rating}</span>
                      </div>
                      <span className="dark:text-[#555] text-[#999]">{doc.experience} yrs exp</span>
                      {doc.availableToday && (
                        <span className="text-[#30D158] font-semibold">Available today</span>
                      )}
                    </div>
                  </div>

                  <button
                    className="w-full py-2 text-xs font-semibold rounded-xl dark:bg-[#E53935]/10 dark:text-[#FF6B6B] dark:border dark:border-[#E53935]/20 dark:hover:bg-[#E53935]/15 bg-[#E53935]/6 text-[#C62828] border border-[#E53935]/15 hover:bg-[#E53935]/10 transition-all"
                    onClick={() => setCurrentTab('doctors')}
                  >
                    Book Consultation
                  </button>
                </div>
              </Section>
            ))}
          </div>

          <div className="text-center">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setCurrentTab('doctors')}
              className="btn-primary text-sm py-3 px-8 rounded-xl gap-2"
            >
              Browse All Doctors <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ───────────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Section className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold dark:text-white text-[#111] tracking-tight mb-4">
              Trusted by patients
              <br /><span className="text-gradient">and doctors alike.</span>
            </h2>
          </Section>

          <div className="max-w-2xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={testimonialIdx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="glass-card p-8 text-center"
              >
                <div className="text-[#E53935] text-4xl mb-4">"</div>
                <p className="text-lg dark:text-[#CCC] text-[#444] leading-relaxed mb-6">
                  {testimonials[testimonialIdx].quote}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E53935] to-[#FF6B6B] flex items-center justify-center text-white font-bold">
                    {testimonials[testimonialIdx].avatar}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold dark:text-white text-[#111]">{testimonials[testimonialIdx].name}</div>
                    <div className="text-xs dark:text-[#666] text-[#888]">{testimonials[testimonialIdx].role}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTestimonialIdx(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === testimonialIdx ? 'bg-[#E53935] w-6' : 'dark:bg-[#333] bg-[#CCC]'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─────────────────────────────── */}
      <Section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="relative overflow-hidden rounded-3xl dark:bg-[#141414] bg-[#111] p-12 text-center border dark:border-white/6 border-black/10">
            <div className="relative z-10">
              <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-5">
                Your health deserves
                <br /><span className="text-gradient">the best technology.</span>
              </h2>
              <p className="text-lg text-white/50 mb-8 max-w-md mx-auto">
                Join thousands of patients and doctors using MedHome for faster, smarter healthcare decisions.
              </p>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setCurrentTab('checker')}
                className="btn-primary text-base py-4 px-10 rounded-2xl"
              >
                <Sparkles className="w-5 h-5" />
                Start for Free
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </Section>

      {/* ─── FOOTER ─────────────────────────────────── */}
      <footer className="border-t dark:border-white/5 border-black/6 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#E53935] to-[#FF6B6B] flex items-center justify-center">
                <HeartPulse className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold dark:text-white text-[#111]">Med<span className="text-gradient">Home</span></span>
              <span className="text-xs dark:text-[#555] text-[#999] ml-2">© 2026. All rights reserved.</span>
            </div>
            <div className="flex gap-6 text-xs dark:text-[#666] text-[#888]">
              <button onClick={() => setCurrentTab('landing')} className="hover:text-[#E53935] transition-colors">Privacy Policy</button>
              <button onClick={() => setCurrentTab('landing')} className="hover:text-[#E53935] transition-colors">Clinical Disclaimer</button>
              <button onClick={() => setCurrentTab('analytics')} className="hover:text-[#E53935] transition-colors">Data Sources</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
