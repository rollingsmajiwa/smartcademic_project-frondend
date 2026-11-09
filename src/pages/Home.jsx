import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <section 
      id="home" 
      className="relative min-h-[88vh] flex items-center justify-center px-6 py-20 overflow-hidden bg-slate-50 text-[#10002b]"
    >
      {/* ---------------- LIGHT BACKDROP & ACCENTS USING YOUR PALETTE ---------------- */}
      {/* Glow Orbs using your #c77dff & #10002b tones */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#c77dff]/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-[#10002b]/10 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Subtle Grid Dot Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#c77dff 1.2px, transparent 1.2px)`,
          backgroundSize: '32px 32px',
        }}
      ></div>

      {/* ---------------- HERO CONTENT ---------------- */}
      <div className="relative z-10 max-w-5xl mx-auto text-center lg:text-left w-full space-y-6">
        
        {/* Brand Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md bg-[#c77dff]/20 border border-[#c77dff]/40 text-[#10002b] text-xl font-bold shadow-sm">
        
          SmartAcademic
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl font-black leading-tight tracking-tight text-[#10002b] max-w-4xl">
          Empowering Institutions with{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10002b] via-[#c77dff] to-[#10002b]">
            Smart Analytics & Automation
          </span>
        </h1>
        
        {/* Subtitle / Description */}
        <p className="text-base sm:text-lg text-slate-700 max-w-2xl font-medium leading-relaxed">
          Streamline institution-wide management, role-based user access, real-time geo-fenced attendance, and academic record reporting under one unified SmartAcademic system.
        </p>

        {/* Action Buttons using exact requested colors */}
        <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
          <Link 
            to="/signup" 
            className="px-7 py-3.5 rounded-xl bg-[#c77dff] text-[#10002b] font-extrabold text-sm shadow-xl hover:bg-[#10002b] hover:text-white transition-all transform hover:-translate-y-0.5"
          >
            Get Started Now
          </Link>
          <a 
            href="#about" 
            className="px-7 py-3.5 rounded-xl bg-[#c77dff] border border-[#c77dff]/40 text-white font-extrabold text-sm hover:border-[#c77dff] hover:bg-[#10002b] hover:text-[#10002b] backdrop-blur-sm transition-all transform hover:-translate-y-0.5"
          >
            View Platform Modules
          </a>
        </div>

        {/* Quick Contact & Support Bar */}
        <div className="mt-12 pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700 max-w-xl font-semibold">
          <div className="flex items-center justify-center lg:justify-start gap-2.5">
            
            rollingsmajiwa@gmail.com
          </div>
          <div className="flex items-center justify-center lg:justify-start gap-2.5">
            
            +254 742234603
          </div>
        </div>
      </div>
    </section>
  );
}