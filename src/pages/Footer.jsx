import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#10002b] text-white py-12 px-6 border-t border-[#c77dff]/40 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          
          <div className="w-9 h-9 rounded-lg bg-white text-[#10002b] flex items-center justify-center font-black text-xs tracking-tighter shadow-xs">
            SA
          </div>
          <span className="text-lg font-black tracking-tight text-white">SmartAcademic</span>
        </div>
        <p className="text-xs text-white/70">
          &copy; {new Date().getFullYear()} SmartAcademic. All rights reserved.
        </p>
        <div className="flex gap-6 text-xs text-white/80 font-medium">
          <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}