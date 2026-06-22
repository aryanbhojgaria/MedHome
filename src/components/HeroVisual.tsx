import React from 'react';
import { Heart, Stethoscope, ShieldCheck, MapPin, Brain, Activity, Plus } from 'lucide-react';

export default function HeroVisual() {
  return (
    <div className="relative w-full h-[360px] md:h-[480px] flex items-center justify-center overflow-visible">
      {/* Glow Circles (Background Ambient Lights) */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-[#E53935]/10 dark:bg-[#E53935]/12 blur-[80px] animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-[#FF6B6B]/8 dark:bg-[#FF6B6B]/10 blur-[80px] animate-pulse-slow" style={{ animationDelay: '2s' }} />

      {/* Grid Mesh Backplate */}
      <div className="absolute inset-0 opacity-15 dark:opacity-20 pointer-events-none" 
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0), 
            linear-gradient(rgba(229, 57, 53, 0.03) 1px, transparent 1px), 
            linear-gradient(90deg, rgba(229, 57, 53, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px, 40px 40px, 40px 40px',
        }} 
      />

      {/* Main Holographic Plate */}
      <div className="relative w-72 h-72 md:w-96 md:h-96 rounded-full border border-slate-500/10 dark:border-white/5 bg-slate-900/5 backdrop-blur-sm flex items-center justify-center shadow-inner">
        {/* Outer Rotating Orbit Ring */}
        <div className="absolute inset-0 rounded-full border border-dashed border-[#E53935]/25 animate-spin-slow" />
        
        {/* Intermediate Pulsing Circle */}
        <div className="absolute w-[80%] h-[80%] rounded-full border border-[#FF6B6B]/15 animate-pulse-slow" />

        {/* Central Brain Hologram */}
        <div className="relative z-10 flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-950/20 border border-white/5 backdrop-blur-md shadow-2xl">
          <Brain className="w-16 h-16 md:w-24 md:h-24 text-[#E53935] animate-pulse-slow drop-shadow-[0_0_15px_rgba(229,57,53,0.5)]" />
          <div className="mt-2 text-center">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">MedHome Core</span>
            <span className="block text-xs font-semibold text-[#FF6B6B] mt-0.5">AI Engine Active</span>
          </div>
        </div>

        {/* Floating Icons (Orbiting and bouncing) */}

        {/* Icon 1: Heart (Left) */}
        <div className="absolute -left-6 top-[40%] animate-float bg-white border border-black/5 dark:bg-slate-950/90 dark:border-white/10 p-3 rounded-2xl shadow-xl shadow-black/20">
          <Heart className="w-6 h-6 text-rose-500 fill-rose-500/10" />
        </div>

        {/* Icon 2: Stethoscope (Right) */}
        <div className="absolute -right-6 top-[30%] animate-float-delayed bg-white border border-black/5 dark:bg-slate-950/90 dark:border-white/10 p-3 rounded-2xl shadow-xl shadow-black/20">
          <Stethoscope className="w-6 h-6 text-[#E53935]" />
        </div>

        {/* Icon 3: Verified Badge (Top Left) */}
        <div className="absolute left-[15%] top-4 animate-float bg-white border border-black/5 dark:bg-slate-950/90 dark:border-white/10 p-3 rounded-2xl shadow-xl shadow-black/20" style={{ animationDelay: '1.5s' }}>
          <ShieldCheck className="w-6 h-6 text-[#00C853]" />
        </div>

        {/* Icon 4: Map Pin with Pulsing Radar (Bottom Right) */}
        <div className="absolute right-[10%] bottom-6 animate-float bg-white border border-black/5 dark:bg-slate-950/90 dark:border-white/10 p-3 rounded-2xl shadow-xl shadow-black/20" style={{ animationDelay: '4s' }}>
          <div className="relative">
            <MapPin className="w-6 h-6 text-amber-500 fill-amber-500/10" />
            <span className="absolute -inset-1 rounded-full border border-amber-500/40 radar-wave pointer-events-none" />
            <span className="absolute -inset-1 rounded-full border border-amber-500/40 radar-wave-delayed pointer-events-none" />
          </div>
        </div>

        {/* Icon 5: Emergency Plus (Bottom Left) */}
        <div className="absolute left-6 bottom-[15%] animate-float-delayed bg-white border border-black/5 dark:bg-slate-950/90 dark:border-white/10 p-3 rounded-2xl shadow-xl shadow-black/20">
          <Plus className="w-6 h-6 text-[#E53935]" />
        </div>
      </div>

      {/* Heartbeat EKG waveform scrolling at the bottom of the container */}
      <div className="absolute bottom-2 left-0 right-0 h-16 opacity-30 dark:opacity-40">
        <svg className="w-full h-full" viewBox="0 0 1000 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="ekgGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#E53935" stopOpacity="0" />
              <stop offset="30%" stopColor="#E53935" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#FF6B6B" stopOpacity="1" />
              <stop offset="70%" stopColor="#E53935" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#E53935" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M 0 50 L 300 50 L 320 30 L 340 70 L 360 10 L 380 90 L 400 45 L 420 55 L 440 50 L 700 50 L 720 20 L 740 80 L 760 15 L 780 85 L 800 48 L 820 52 L 840 50 L 1000 50"
            fill="none"
            stroke="url(#ekgGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-pulse-slow"
          />
        </svg>
      </div>

      {/* Futuristic Floating Hospital/Route overlay card */}
      <div className="absolute bottom-1/4 -right-4 md:right-4 bg-white border border-black/5 dark:bg-slate-950/85 dark:border-white/10 backdrop-blur-md p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-float max-w-[220px]" style={{ animationDelay: '2.5s' }}>
        <div className="w-10 h-10 rounded-xl bg-[#E53935]/12 flex items-center justify-center text-[#E53935]">
          <Activity className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-bold block text-left">DIAGNOSTIC INDEX</span>
          <span className="text-sm font-extrabold dark:text-white text-slate-800 text-left block">98% Match Rate</span>
          <span className="block text-[9px] text-[#FF6B6B] mt-0.5 font-medium text-left">Auto-Triage Active</span>
        </div>
      </div>
    </div>
  );
}
