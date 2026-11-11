import React, { useState } from 'react';

export default function About() {
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <section className="relative min-h-[88vh] flex items-center justify-center px-6 py-20 overflow-hidden bg-slate-50 text-[#10002b]">
      {/* Ambient Glows */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#c77dff]/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-[#10002b]/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Grid Dot Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#c77dff 1.2px, transparent 1.2px)`,
          backgroundSize: '32px 32px',
        }}
      ></div>

      <div className="relative z-10 max-w-5xl mx-auto w-full space-y-16">
        {/* Page Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center px-4 py-1.5 rounded-md bg-[#c77dff]/20 border border-[#c77dff]/40 text-[#10002b] text-sm font-extrabold shadow-sm">
            About SmartAcademic
          </div>
          <h1 className="text-3xl sm:text-5xl font-black leading-tight text-[#10002b]">
            Architected for Modern Educational Standards
          </h1>
          <p className="text-base sm:text-lg text-slate-700 font-medium leading-relaxed">
            SmartAcademic is an automated institutional management platform engineered to connect physical compound verification with real-time academic records and administrative workflows.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-[#c77dff]/30 shadow-md space-y-3">
            <h3 className="text-lg font-black text-[#10002b]">Institutional Focus</h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              Eliminate administrative friction through seamless user roles across administrators, teachers, and students.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-[#c77dff]/30 shadow-md space-y-3">
            <h3 className="text-lg font-black text-[#10002b]">Geofenced Compliance</h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              Automated coordinate evaluation ensures accurate physical attendance logging within institutional boundary limits.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-[#c77dff]/30 shadow-md space-y-3">
            <h3 className="text-lg font-black text-[#10002b]">Real-Time Reporting</h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              Instant breakdown of present, late, and absent metrics categorized by week and month for administrative oversight.
            </p>
          </div>
        </div>

        {/* System FAQ */}
        <div className="bg-white p-8 rounded-2xl border border-[#c77dff]/40 shadow-md space-y-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-[#10002b] text-center">Platform Details & Logic</h2>
          <div className="space-y-4">
            {[
              {
                q: "How does check-in time classification work?",
                a: "Check-ins completed at or before 7:00 AM are classified as Present. Check-ins after 7:00 AM are automatically recorded as Late. Unclocked records resolve to Absent by 4:30 PM."
              },
              {
                q: "What happens when stepping outside compound coordinates?",
                a: "The geofence backend checks coordinates continuously during operating hours and executes an automated check-out log when boundary limits are exceeded."
              },
              {
                q: "How are student invitations sent?",
                a: "Administrators generate encrypted registration tokens sent directly to student email accounts for verified self-registration."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-slate-50 border border-[#c77dff]/30 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left p-4 font-bold text-xs sm:text-sm text-[#10002b] flex justify-between items-center focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <span className="text-lg font-black text-[#10002b]">{activeFaq === index ? "−" : "+"}</span>
                </button>
                {activeFaq === index && (
                  <div className="p-4 pt-0 text-xs sm:text-sm text-slate-700 border-t border-[#c77dff]/20 leading-relaxed font-medium">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}