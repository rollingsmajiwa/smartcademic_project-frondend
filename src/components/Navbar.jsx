
import { Link } from 'react-router-dom';



function Navbar() {
  return (
    <nav className="w-full bg-[#f7f0fa] border-b border-[#c77dff]/40 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl px-6 py-4 mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl bg-[#10002b] text-white flex items-center justify-center font-black text-sm tracking-tighter shadow-sm border border-[#c77dff]/40 group-hover:bg-[#c77dff] group-hover:text-[#10002b] transition-all"
            style={{ backgroundColor: '#c77dff' }}
          >
            SA
          </div>
          <span className="text-xl font-black tracking-wider text-[#7b2cbf]">
            Smart<span className="text-[#10002b]">Academic</span>
          </span>
        </div>

        {/* Center Navigation Links */}
        <div>
          <ul className="flex items-center gap-8 text-md font-bold text-[#10002b]">
            <li>
              <Link to="/" className="hover:text-[#c77dff] transition-all py-1.5 px-3 rounded-lg hover:bg-[#c77dff]/10">
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-[#c77dff] transition-all py-1.5 px-3 rounded-lg hover:bg-[#c77dff]/10">
                About
              </Link>
            </li>
            <li>
              <Link to="/services" className="hover:text-[#c77dff] transition-all py-1.5 px-3 rounded-lg hover:bg-[#c77dff]/10">
                Services
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-[#c77dff] transition-all py-1.5 px-3 rounded-lg hover:bg-[#c77dff]/10">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-[#c77dff] transition-all py-1.5 px-3 rounded-lg hover:bg-[#c77dff]/10">
                Dashboard
              </Link>
            </li>
          </ul>
        </div>

        {/* Auth Action Buttons */}
        <div className="flex items-center gap-3">
          <Link 
            to="/signup" 
            className="text-xs px-4 py-2 font-bold rounded-xl bg-transparent text-[#c77dff] border border-[#c77dff]/60 hover:text-[#10002b] transition-all shadow-sm"
          >
            Register
          </Link>

          <Link 
            to="/signin" 
            className="text-xs px-4 py-2 font-bold rounded-xl bg-[#c77dff] text-[#10002b] shadow-md shadow-[#c77dff]/30 hover:bg-white hover:text-[#10002b] transition-all"
          >
            Sign In
          </Link>
        </div>

      </div>
    </nav>
  )
}

export default Navbar;
