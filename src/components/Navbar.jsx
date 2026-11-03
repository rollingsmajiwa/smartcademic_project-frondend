
import { Link } from 'react-router-dom';



function Navbar() {
  return (
    <nav className="fixed top-0 z-30 w-full px-6 py-3 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-xs font-sans">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div 
            className="w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm text-white shadow-xs"
            style={{ backgroundColor: 'var(--sa-green-dark)' }}
          >
            SA
          </div>
          <span className="text-lg font-extrabold tracking-tight text-slate-800">
            SmartAcademic
          </span>
        </div>

        {/* Center Navigation Links */}
        <div>
          <ul className="flex items-center gap-8 text-xs font-bold text-slate-600">
            <li>
              <Link 
                to="/" 
                className="hover:text-slate-900 transition-colors py-1 px-2 rounded-lg hover:bg-slate-50"
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/about" 
                className="hover:text-slate-900 transition-colors py-1 px-2 rounded-lg hover:bg-slate-50"
              >
                About
              </Link>
            </li>
            <li>
              <Link 
                to="/services" 
                className="hover:text-slate-900 transition-colors py-1 px-2 rounded-lg hover:bg-slate-50"
              >
                Services
              </Link>
            </li>
            <li>
              <Link 
                to="/contact" 
                className="hover:text-slate-900 transition-colors py-1 px-2 rounded-lg hover:bg-slate-50"
              >
                Contact
              </Link>
            </li>
            <li>
              <Link 
                to="/dashboard" 
                className="hover:text-slate-900 transition-colors py-1 px-2 rounded-lg hover:bg-slate-50"
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
            className="sa-btn-secondary text-xs px-4 py-2 font-bold"
          >
            Register
          </Link>

          <Link 
            to="/signin" 
            className="sa-btn-primary text-xs px-4 py-2 font-bold"
          >
            Sign In
          </Link>
        </div>

      </div>
    </nav>
  )
}

export default Navbar;
