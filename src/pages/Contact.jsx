import React from 'react';

export default function Contact() {
  return (
    <section className="relative min-h-[88vh] flex items-center justify-center px-6 py-20 overflow-hidden bg-slate-50 text-[#10002b]">
      {/* Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#c77dff]/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-[#10002b]/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#c77dff 1.2px, transparent 1.2px)`,
          backgroundSize: '32px 32px',
        }}
      ></div>

      <div className="relative z-10 max-w-5xl mx-auto w-full space-y-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center px-4 py-1.5 rounded-md bg-[#c77dff]/20 border border-[#c77dff]/40 text-[#10002b] text-sm font-extrabold shadow-sm">
            Contact & Support
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#10002b]">Get In Touch</h1>
          <p className="text-base text-slate-700 font-medium">
            Reach out to our integration team for system setup, campus geofence configuration, or general technical support.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start max-w-4xl mx-auto">
          {/* Direct Details */}
          <div className="bg-white p-8 rounded-2xl border border-[#c77dff]/40 shadow-md space-y-6">
            <h3 className="text-xl font-black text-[#10002b]">System Administration</h3>
            
            <div className="space-y-4 text-xs sm:text-sm font-semibold">
              <div className="p-4 rounded-xl space-y-1">
                <p className="text-[#10002b] font-black uppercase text-[10px]">Email Support</p>
                <p className="text-slate-800">rollingsmajiwa@gmail.com</p>
              </div>

              <div className="p-4 rounded-xl space-y-1">
                <p className="text-[#10002b] font-black uppercase text-[10px]">Phone Line</p>
                <p className="text-slate-800">+254 742234603</p>
              </div>

              <div className="p-4 rounded-xl space-y-1">
                <p className="text-[#10002b] font-black uppercase text-[10px]">System Availability</p>
                <p className="text-slate-800">Monday – Friday: 7:00 AM – 5:00 PM EAT</p>
              </div>
            </div>
          </div>

          {/* Inquiry Form */}
          <form className="bg-white p-8 rounded-2xl border border-[#c77dff]/40 shadow-md space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#10002b]">Institution Name</label>
              <input
                type="text"
                placeholder="e.g. Kenya High School"
                className="w-full p-3 rounded-xl bg-slate-50 border border-[#c77dff]/30 text-xs text-[#10002b] font-medium focus:outline-none focus:border-[#10002b]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#10002b]">Contact Email</label>
              <input
                type="email"
                placeholder=" e.g. kenyahigh@gmail.com"
                className="w-full p-3 rounded-xl bg-slate-50 border border-[#c77dff]/30 text-xs text-[#10002b] font-medium focus:outline-none focus:border-[#10002b]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#10002b]">Message</label>
              <textarea
                rows="4"
                placeholder="Details regarding your inquiry..."
                className="w-full p-3 rounded-xl bg-slate-50 border border-[#c77dff]/30 text-xs text-[#10002b] font-medium focus:outline-none focus:border-[#10002b]"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#c77dff] text-[#10002b] font-extrabold text-sm shadow-md hover:bg-[#10002b] hover:text-white transition-all"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}