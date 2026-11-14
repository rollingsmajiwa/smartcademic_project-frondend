import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const sidebarImages = [
    { src: '/images/teacher1.jpg', alt: 'Teacher Portal' },
    { src: '/images/teacher2.jpg', alt: 'Student Portal' },
    { src: '/images/student1.jpg', alt: 'Assignments' },
    { src: '/images/student2.jpg', alt: 'Sign In' },
  ];

  const scrollContainerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let animationFrameId;

    const autoScroll = () => {
      if (!isPaused && container) {
        container.scrollTop += 0.6; // Smooth auto-scroll speed

        if (container.scrollTop >= container.scrollHeight / 2) {
          container.scrollTop = 0;
        }
      }
      animationFrameId = requestAnimationFrame(autoScroll);
    };

    animationFrameId = requestAnimationFrame(autoScroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused]);

  return (
    <section 
      id="home" 
      className="relative min-h-[88vh] flex items-center px-4 sm:px-8 py-8 overflow-hidden bg-slate-50 text-[#10002b]"
    >
      {/* Hide scrollbar visually while keeping full manual touch/wheel scrolling */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* ---------------- BACKGROUND IMAGE POSITIONED ON THE FAR RIGHT ---------------- */}
      <div className="absolute inset-0 z-0 pointer-events-none flex justify-end overflow-hidden">
        <div className="w-full lg:w-2/3 h-full relative">
          <img 
            src="/images/school1.jpg" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-60"
          />
          {/* Gradient fade overlay: clear on the far right, blending smoothly into light background on the left */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-slate-50/70 to-transparent"></div>
        </div>
      </div>

      {/* Glow Orbs & Grid Accents */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#c77dff]/20 rounded-full blur-3xl pointer-events-none z-1"></div>
      <div 
        className="absolute inset-0 opacity-[0.15] pointer-events-none z-1"
        style={{
          backgroundImage: `radial-gradient(#c77dff 1.2px, transparent 1.2px)`,
          backgroundSize: '32px 32px',
        }}
      ></div>

      {/* ---------------- MAIN CONTENT GRID (TIGHTENED MARGINS) ---------------- */}
      <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* LEFT SIDE: NARROWER SCROLLING IMAGES SIDEBAR WITH MINIMAL LEFT MARGIN */}
        <div 
          className="lg:col-span-3 relative h-[380px] rounded-2xl border border-[#c77dff]/40 bg-white/80 backdrop-blur-md shadow-xl p-2.5 overflow-hidden ml-0"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          onWheel={() => setIsPaused(true)}
        >
          <div className="absolute top-0 inset-x-0 h-8 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none"></div>
          <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none"></div>

          <div 
            ref={scrollContainerRef}
            className="h-full overflow-y-auto no-scrollbar flex flex-col gap-2.5 cursor-grab active:cursor-grabbing"
          >
            {[...sidebarImages, ...sidebarImages].map((img, index) => (
              <div key={index} className="rounded-xl overflow-hidden border border-[#c77dff]/30 shadow-sm bg-white shrink-0">
                <img 
                  src={img.src} 
                  alt={img.alt} 
                  draggable="false"
                  className="w-full h-36 object-cover select-none" 
                />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE: HERO TEXT & BUTTONS */}
        <div className="lg:col-span-9 text-center lg:text-left space-y-5 lg:pl-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md bg-[#c77dff]/20 border border-[#c77dff]/40 text-[#10002b] text-xl font-bold shadow-sm">
            SmartAcademic
          </div>

          <h1 className="text-4xl sm:text-6xl font-black leading-tight tracking-tight text-[#10002b]">
            Empowering Institutions with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10002b] via-[#c77dff] to-[#10002b]">
              Smart Analytics & Automation
            </span>
          </h1>
          
          <p className="text-base sm:text-lg text-slate-700 max-w-2xl font-medium leading-relaxed">
            Streamline institution-wide management, real-time geo-fenced attendance, live exams, and AI-guided revision under one unified SmartAcademic system.
          </p>

          <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-2">
            <Link 
              to="/signin" 
              className="px-7 py-3.5 rounded-xl bg-[#c77dff] text-[#10002b] font-extrabold text-sm shadow-xl hover:bg-[#10002b] hover:text-white transition-all transform hover:-translate-y-0.5"
            >
              Get Started Now
            </Link>
            <Link 
              to="/services" 
              className="px-7 py-3.5 rounded-xl bg-[#c77dff] border border-[#c77dff]/40 text-[#10002b] font-extrabold text-sm hover:border-[#c77dff] hover:bg-[#10002b] hover:text-white backdrop-blur-sm transition-all transform hover:-translate-y-0.5"
            >
              View Platform Modules
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}