import React, { useState } from 'react';

export default function About() {
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <section className="relative min-h-[88vh] flex items-center justify-center px-6 py-20 overflow-hidden bg-white text-[#10002b]">
      {/* Ambient Glows */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#c77dff]/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-[#c77dff]/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-5xl mx-auto w-full space-y-16">
        {/* Page Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center px-4 py-1.5 rounded-md bg-[#c77dff]/20 border border-[#c77dff]/50 text-[#10002b] text-sm font-extrabold shadow-sm">
            About SmartAcademic
          </div>
          <h1 className="text-3xl sm:text-5xl font-black leading-tight text-[#10002b]">
            Built for Modern Educational Standards
          </h1>
          <p className="text-base sm:text-lg text-[#10002b]/80 font-medium leading-relaxed">
            SmartAcademic was created to replace fragmented manual registers, unverified attendance logs, and passive study habits with one accountable academic ecosystem.
          </p>
        </div>

        {/* Mission & Core Pillars (No overlap with Services) */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-[#c77dff]/40 shadow-md space-y-3 hover:border-[#10002b]/40 transition-all">
            <h3 className="text-lg font-black text-[#10002b]">Our Mission</h3>
            <p className="text-xs sm:text-sm text-[#10002b]/80 leading-relaxed font-medium">
              To empower schools and institutions with transparent, tamper-proof operational tools that save administrative hours every day.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-[#c77dff]/40 shadow-md space-y-3 hover:border-[#10002b]/40 transition-all">
            <h3 className="text-lg font-black text-[#10002b]">Academic Integrity</h3>
            <p className="text-xs sm:text-sm text-[#10002b]/80 leading-relaxed font-medium">
              From GPS-verified campus presence to Socratic AI guidance that builds real understanding, every workflow promotes accountability.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-[#c77dff]/40 shadow-md space-y-3 hover:border-[#10002b]/40 transition-all">
            <h3 className="text-lg font-black text-[#10002b]">Unified Ecosystem</h3>
            <p className="text-xs sm:text-sm text-[#10002b]/80 leading-relaxed font-medium">
              Designed to bridge the gap between school leadership, educators, and learners inside a single connected platform.
            </p>
          </div>
        </div>

        {/* System FAQ */}
        <div className="bg-white p-8 rounded-2xl border border-[#c77dff]/50 shadow-md space-y-8 max-w-4xl mx-auto">
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
                q: "How are student and teacher invitations sent?",
                a: "Administrators generate encrypted registration tokens sent directly to student and teacher email accounts for verified self-registration."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-[#c77dff]/10 border border-[#c77dff]/40 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left p-4 font-bold text-xs sm:text-sm text-[#10002b] flex justify-between items-center focus:outline-none hover:bg-[#c77dff]/15 transition-colors"
                >
                  <span>{faq.q}</span>
                  <span className="text-lg font-black text-[#10002b]">{activeFaq === index ? "−" : "+"}</span>
                </button>
                {activeFaq === index && (
                  <div className="p-4 pt-3 bg-white text-xs sm:text-sm text-[#10002b]/85 border-t border-[#c77dff]/30 leading-relaxed font-medium">
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