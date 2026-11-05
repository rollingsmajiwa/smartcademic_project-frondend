
import { Link } from 'react-router-dom';



function Navbar() {
  return (
    <nav className="fixed top-0 z-30 w-full px-6 py-3 bg-[#011638]/90 backdrop-blur-md border-b border-[#364156] shadow-xs font-sans text-white">
  <div className="max-w-7xl mx-auto flex items-center justify-between">
    
    {/* Brand Logo & Name */}
    <div className="flex items-center gap-3">
      <div 
        className="w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm text-[#dff8eb] shadow-xs"
        style={{ backgroundColor: '#214e34' }}
      >
        SA
      </div>
      <span className="text-lg font-extrabold tracking-tight text-white">
        SmartAcademic
      </span>
    </div>

    {/* Center Navigation Links */}
    <div>
      <ul className="flex items-center gap-8 text-xs font-bold text-[#cdcdcd]">
        <li>
          <Link 
            to="/" 
            className="hover:text-white transition-colors py-1 px-2 rounded-lg hover:bg-[#364156]"
          >
            Home
          </Link>
        </li>
        <li>
          <Link 
            to="/about" 
            className="hover:text-white transition-colors py-1 px-2 rounded-lg hover:bg-[#364156]"
          >
            About
          </Link>
        </li>
        <li>
          <Link 
            to="/services" 
            className="hover:text-white transition-colors py-1 px-2 rounded-lg hover:bg-[#364156]"
          >
            Services
          </Link>
        </li>
        <li>
          <Link 
            to="/contact" 
            className="hover:text-white transition-colors py-1 px-2 rounded-lg hover:bg-[#364156]"
          >
            Contact
          </Link>
        </li>
        <li>
          <Link 
            to="/dashboard" 
            className="hover:text-white transition-colors py-1 px-2 rounded-lg hover:bg-[#364156]"
          >
            Dashboard
          </Link>
        </li>
      </ul>
    </div>

    {/* Auth Action Buttons */}
    <div className="flex items-center gap-3">
      <Link 
        to="/signup" 
        className="sa-btn-secondary text-xs px-4 py-2 font-bold bg-[#364156] text-white border border-[#364156] hover:bg-[#011638]"
      >
        Register
      </Link>

      <Link 
        to="/signin" 
        className="sa-btn-primary text-xs px-4 py-2 font-bold bg-[#214e34] text-[#dff8eb] hover:bg-[#153321]"
      >
        Sign In
      </Link>
    </div>

  </div>
</nav>
  )
}

export default Navbar;
