
import { Link } from 'react-router-dom';



function Navbar() {
  return (
    <nav className="bg-blue-50/70 backdrop-blur-sm p-2 fixed top-0 z-30 w-full">
        <div className="flex justify-between">
            <div className="text-xl font-bold tracking-tighter">SmartAcademic</div>
            
            <div>
                <ul className='flex gap-10'>
                    <li className="hover:underline"><Link to="/">Home</Link></li>
                   
                    <li className="hover:underline"><Link to="/contact">Contact</Link></li>
                    
                    <li className="hover:underline"><Link to="/about">About</Link></li>
                     <li className="hover:underline"><Link to="/services">Services</Link></li>
                    <li className="hover:underline"><Link to="/dashboard">Dashboard</Link></li>
                
                </ul>
            </div>
            <div>
              <button type="submit" className=" font-bold text-sm rounded-lg p-1.5"><Link to="/login">Sign Up</Link></button>  
            <button type="submit" className=" font-bold text-sm rounded-lg p-1.5"><Link to="/login">Sign In</Link></button>
                
            </div>
        </div>
    </nav>
  )
}

export default Navbar;
