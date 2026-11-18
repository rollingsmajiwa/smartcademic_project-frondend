import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="w-full bg-[#f7f0fa] border-b border-[#c77dff]/40 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl px-4 sm:px-6 py-4 mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div 
            className="w-10 h-10 rounded-xl bg-[#c77dff] text-[#10002b] flex items-center justify-center font-black text-sm tracking-tighter shadow-sm border border-[#c77dff]/40 group-hover:bg-[#10002b] group-hover:text-white transition-all"
          >
            SA
          </div>
          <span className="text-lg sm:text-xl font-black tracking-wider text-[#7b2cbf]">
            Smart<span className="text-[#10002b]">Academic</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:block">
          <ul className="flex items-center gap-6 lg:gap-8 text-sm sm:text-md font-bold text-[#10002b]">
            <li>
              <Link to="/" className="hover:text-[#7b2cbf] transition-all py-1.5 px-3 rounded-lg hover:bg-[#c77dff]/10">
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-[#7b2cbf] transition-all py-1.5 px-3 rounded-lg hover:bg-[#c77dff]/10">
                About
              </Link>
            </li>
            <li>
              <Link to="/services" className="hover:text-[#7b2cbf] transition-all py-1.5 px-3 rounded-lg hover:bg-[#c77dff]/10">
                Services
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-[#7b2cbf] transition-all py-1.5 px-3 rounded-lg hover:bg-[#c77dff]/10">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-[#7b2cbf] transition-all py-1.5 px-3 rounded-lg hover:bg-[#c77dff]/10">
                Dashboard
              </Link>
            </li>
          </ul>
        </div>

        {/* Auth Action Buttons (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <Link 
            to="/signin" 
            className="text-sm px-4 py-2 font-bold rounded-xl bg-transparent text-[#7b2cbf] border border-[#c77dff]/60 hover:bg-[#c77dff]/20 hover:text-[#10002b] transition-all shadow-sm"
          >
            Sign In
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-[#10002b] hover:bg-[#c77dff]/20 focus:outline-none"
          aria-label="Toggle Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full inset-x-0 bg-[#f7f0fa] border-b border-[#c77dff]/40 shadow-xl py-6 px-6 flex flex-col gap-4 animate-fadeIn">
          <ul className="flex flex-col gap-3 font-bold text-sm text-[#10002b]">
            <li>
              <Link 
                to="/" 
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 px-3 rounded-lg hover:bg-[#c77dff]/20 hover:text-[#7b2cbf]"
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/about" 
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 px-3 rounded-lg hover:bg-[#c77dff]/20 hover:text-[#7b2cbf]"
              >
                About
              </Link>
            </li>
            <li>
              <Link 
                to="/services" 
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 px-3 rounded-lg hover:bg-[#c77dff]/20 hover:text-[#7b2cbf]"
              >
                Services
              </Link>
            </li>
            <li>
              <Link 
                to="/contact" 
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 px-3 rounded-lg hover:bg-[#c77dff]/20 hover:text-[#7b2cbf]"
              >
                Contact
              </Link>
            </li>
            <li>
              <Link 
                to="/dashboard" 
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 px-3 rounded-lg hover:bg-[#c77dff]/20 hover:text-[#7b2cbf]"
              >
                Dashboard
              </Link>
            </li>
          </ul>

          <div className="pt-4 border-t border-[#c77dff]/30 flex flex-col gap-3">
            <Link 
              to="/signin" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-center text-sm px-4 py-2.5 font-bold rounded-xl bg-[#7b2cbf] text-white shadow-md hover:bg-[#10002b] transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;