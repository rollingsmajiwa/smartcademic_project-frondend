import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full bg-[#10002b] text-white py-12 px-6 border-t border-[#c77dff]/40 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Column 1: Brand & SA Logo */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white text-[#10002b] flex items-center justify-center font-black text-xs tracking-tighter shadow-xs">
              SA
            </div>
            <span className="text-lg font-black tracking-tight text-white">SmartAcademic</span>
          </div>
          <p className="text-sm text-white/70 font-medium leading-relaxed max-w-sm">
            Modern institutional management platform featuring real-time geofenced attendance verification and automated academic reporting.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-[#c77dff]">Quick Navigation</h4>
          <ul className="space-y-2 text-xs font-medium text-white/80">
            <li>
              <a href="/#home" className="hover:text-[#c77dff] transition-colors">Home Section</a>
            </li>
            <li>
              <a href="/about" className="hover:text-[#c77dff] transition-colors">About & FAQ</a>
            </li>
            <li>
              <a href="/services" className="hover:text-[#c77dff] transition-colors">System Services</a>
            </li>
            <li>
              <a href="/contact" className="hover:text-[#c77dff] transition-colors">Contact Support</a>
            </li>
            <li>
              <Link to="/privacy" className="hover:text-[#c77dff] transition-colors">Privacy Policy</Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-[#c77dff] transition-colors">Terms of Service</Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Contact Details */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-[#c77dff]">Institutional Support</h4>
          <div className="space-y-2 text-xs text-white/80 font-medium">
            <p>
              Email:{' '}
              <a href="mailto:rollingsmajiwa@gmail.com" className="text-white hover:text-[#c77dff] transition-colors font-bold">
                rollingsmajiwa@gmail.com
              </a>
            </p>
            <p>
              Phone:{' '}
              <a href="tel:+254742234603" className="text-white hover:text-[#c77dff] transition-colors font-bold">
                +254 742234603
              </a>
            </p>
            <p className="text-white/60 pt-1">
              Hours: Mon – Fri, 7:00 AM – 5:00 PM EAT
            </p>
          </div>
        </div>

      </div>

      {/* Bottom Copyright Bar */}
      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-[#c77dff]/20 flex flex-col sm:flex-row justify-between items-center text-xs text-white/60">
        <p>&copy; {new Date().getFullYear()} SmartAcademic System. All rights reserved.</p>
        <p className="mt-2 sm:mt-0 font-semibold text-white/80">Strictly Admin-Invited Access Only</p>
      </div>
    </footer>
  );
}