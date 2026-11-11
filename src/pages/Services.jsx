import React from 'react';
import { Link } from 'react-router-dom';

export default function Services() {
  return (
    <section className="relative min-h-[88vh] flex items-center justify-center px-6 py-20 overflow-hidden bg-slate-50 text-[#10002b]">
      {/* Background Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#c77dff]/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-[#10002b]/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Grid Dot Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#c77dff 1.2px, transparent 1.2px)`,
          backgroundSize: '32px 32px',
        }}
      ></div>

      <div className="relative z-10 max-w-5xl mx-auto w-full space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center px-4 py-1.5 rounded-md bg-[#c77dff]/20 border border-[#c77dff]/40 text-[#10002b] text-sm font-extrabold shadow-sm">
            Our Core Modules
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#10002b]">System Services & Capabilities</h1>
          <p className="text-base sm:text-lg text-slate-700 font-medium leading-relaxed">
            Everything your institution needs to automate attendance verification and administrative data reporting.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-[#c77dff]/40 shadow-md space-y-4">
            
            <h3 className="text-xl font-black text-[#10002b]">Geofenced Attendance Verification</h3>
            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
              GPS location validation ensures staff check-ins are restricted to school coordinate bounds with automated exit logging.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-[#c77dff]/40 shadow-md space-y-4">
            
            <h3 className="text-xl font-black text-[#10002b]">Punctuality Logic Engine</h3>
            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
              Automated rules mark arrivals before or at exactly 7:00 AM as Present(on time), arrivals later than 7:00 AM as Late, and unclocked records as Absent at 4:30 PM.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-[#c77dff]/40 shadow-md space-y-4">
            
            <h3 className="text-xl font-black text-[#10002b]">Role-Based Access Control</h3>
            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
              Dedicated dashboards tailored for administrators, teachers, and students to access localized metrics and actions.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-[#c77dff]/40 shadow-md space-y-4">
            <h3 className="text-xl font-black text-[#10002b]">Tokenized Email Invitations</h3>
            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
              Automated email dispatch for secure student and teachers self-registration and administrative onboardings.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}