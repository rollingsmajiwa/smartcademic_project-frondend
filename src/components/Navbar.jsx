
import { Link } from 'react-router-dom';



function Navbar() {
  return (
    <nav>
        <div>
            <div >SmartAcademic</div>
            
            <div>
                <ul>
                    <li><Link to="/">Home</Link></li>
                   
                    <li><Link to="/contact">Contact</Link></li>
                    
                    <li><Link to="/about">About</Link></li>
                    <li><Link to="/dashboard">Dashboard</Link></li>
                
                </ul>
            </div>
            <div>
              <button type="submit"><Link to="/login">Sign Up</Link></button>  
            <button type="submit"><Link to="/login">Sign In</Link></button>
                
            </div>
        </div>
    </nav>
  )
}

export default Navbar;
