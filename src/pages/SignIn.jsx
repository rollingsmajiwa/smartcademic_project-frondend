import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import signImage from '../components/images/sign.jpg';

export default function SignIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);

        const decoded = jwtDecode(data.access);
        console.log("Decoded taken", decoded)

        const userRole = decoded.role;
        console.log("userrole detected", userRole)

        // Dynamic navigation according to user profile role
        navigate(`/dashboard/${userRole}`);
      } else {
        setError('Invalid username or password.');
      }
    } catch (err) {
      setError('Server connection error.');
    }
  };

  return (
   <div className="auth-page min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
  {/* Background Animated Glowing Blobs */}
  <div className="blob-1"></div>
  <div className="blob-2"></div>
  
  {/* Unified Single Card Container */}
  <div className='relative z-20 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 rounded-md overflow-hidden shadow-2xl border border-[#c77dff] backdrop-blur-md' style={{ backgroundColor: 'var(--sa-surface)' }}>
    
    {/* Left Side: Combined Image Section */}
    <div className="hidden lg:flex flex-col justify-between items-center relative overflow-hidden border-r border-[#c77dff]/60" style={{ backgroundColor: 'var(--sa-surface)' }}>
      <img 
        src={signImage} 
        alt="Sign In illustration" 
        className="absolute inset-0 w-full h-full object-cover m-0 p-0 border-0"
      />
      {/* Optional Dark Overlay & Bottom Text Caption for Readability */}
      <div className="absolute inset-0 bg-[#10002b]/40"></div>
      <div className="relative z-10 mt-auto p-8 text-center w-full">
        <h3 className="text-md font-extrabold text-white">Welcome to SmartAcademic</h3>
        <p className="text-[15px] text-white/90 mt-1 font-medium">
          Your unified portal for seamless academic management.
        </p>
      </div>
    </div>
   
    {/* Right Side: Sign In Form Section with Lighter Background */}
    <div className="p-8 sm:p-10 flex flex-col justify-center" style={{ backgroundColor: 'var(--sa-surface)' }}>
      
      {/* Brand SA Logo & Header */}
      <div className="mb-6 flex flex-col items-start">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-base text-[#10002b] shadow-md mb-3 bg-[#c77dff]">
          SA
        </div>
        <h1 className="text-white text-2xl font-extrabold tracking-tight">Sign In</h1>
        <p className="text-xs text-white/80 mt-1 font-medium">Enter your credentials to access your portal</p>
      </div>

      {/* Error Notification Alert */}
      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-500/20 border border-red-500/40 text-red-200 text-xs font-bold text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSignIn} className="space-y-4">
        <div className="input-group">
          <label htmlFor="username" className="text-white block text-xs font-bold mb-1">Username</label>
          <input
            type="text"
            id="username"
            placeholder="Enter your username (eg. Mary)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-4 py-3 text-xs rounded-md bg-white border border-[#c77dff] text-[#10002b] placeholder-[#10002b]/50 focus:outline-none focus:border-[#10002b] focus:ring-2 focus:ring-[#c77dff]/40 shadow-xs"
          />
        </div>

        <div className="input-group">
          <label htmlFor="password" className="text-white block text-xs font-bold mb-1">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 text-xs rounded-md bg-white border border-[#c77dff] text-[#10002b] placeholder-[#10002b]/50 focus:outline-none focus:border-[#10002b] focus:ring-2 focus:ring-[#c77dff]/40 shadow-xs"
          />
        </div>

        <button
          type="submit"
          className="sa-btn-login w-full py-3 rounded-md bg-[#10002b] text-white hover:bg-[#c77dff] hover:text-[#10002b] transition-all shadow-md font-extrabold text-xs mt-2"
        >
          Sign In
        </button>

        <p className="mt-6 text-xs text-white/80 font-semibold text-center">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#c77dff] hover:underline font-bold">
            Register
          </Link>
        </p>
      </form>
    </div>

  </div>
</div>
  );
}