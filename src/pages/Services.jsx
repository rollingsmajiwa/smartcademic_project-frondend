import React from 'react';
import { Link } from 'react-router-dom';

export default function Services() {
  const modules = [
    {
      title: "Geofenced Attendance Verification",
      description: "GPS location validation ensures staff check-ins are restricted to school coordinate bounds with automated exit logging.",
      image: "/images/geo.jpg"
    },
    {
      title: "Punctuality Logic Engine",
      description: "Automated rules mark arrivals before or at exactly 7:00 AM as Present (on time), arrivals later than 7:00 AM as Late, and unclocked records as Absent at 4:30 PM.",
      image: "/images/punt.jpg"
    },
    {
      title: "Role-Based Access Control",
      description: "Dedicated dashboards tailored for administrators, teachers, and students to access localized metrics and actions securely.",
      image: "/images/role.jpg"
    },
    {
      title: "Tokenized Email Invitations",
      description: "Automated email dispatch for secure student and teachers self-registration and administrative onboardings.",
      image: "/images/email.jpg"
    },
    {
      title: "Live Exams",
      description: "Real-time online examination delivery with automated timing, secure student access, and instant academic grading.",
      image: "/images/exam.jpg"
    },
    {
      title: "Mwalimu AI",
      description: "Interactive Socratic revision tutor that guides students through uploaded study materials using hints and conceptual prompts without giving away direct answers.",
      image: "/images/ai.jpg"
    }
  ];

  return (
    <section className="relative min-h-[88vh] flex items-center justify-center px-6 py-20 overflow-hidden bg-white text-[#10002b]">
      {/* Soft #c77dff Background Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#c77dff]/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-[#c77dff]/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-6xl mx-auto w-full space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center px-4 py-1.5 rounded-md bg-[#c77dff]/20 border border-[#c77dff]/50 text-[#10002b] text-sm font-extrabold shadow-sm">
            Our Core Modules
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#10002b]">System Services & Capabilities</h1>
          <p className="text-base sm:text-lg text-[#10002b]/80 font-medium leading-relaxed">
            Everything your institution needs to automate attendance verification and administrative data reporting.
          </p>
        </div>

        {/* Modules Grid with Images */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map((mod, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl border border-[#c77dff]/50 shadow-md overflow-hidden flex flex-col hover:border-[#10002b]/40 hover:shadow-xl transition-all group"
            >
              {/* Card Image Preview */}
              <div className="h-48 w-full overflow-hidden relative border-b border-[#c77dff]/30 bg-slate-100">
                <img 
                  src={mod.image} 
                  alt={mod.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-[#10002b]/10 group-hover:bg-transparent transition-colors"></div>
              </div>

              {/* Card Text Content */}
              <div className="p-6 flex flex-col flex-grow space-y-3">
                <h3 className="text-lg font-extrabold text-[#10002b] leading-snug">{mod.title}</h3>
                <p className="text-xs sm:text-sm text-[#10002b]/80 font-medium leading-relaxed flex-grow">
                  {mod.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}