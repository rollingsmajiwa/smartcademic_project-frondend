import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import regImage from '../components/images/signUp.jpg';

export default function SignUp() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      if (response.ok) {
        navigate('/signin');
      } else {
        const data = await response.json();
        setError(data.username?.[0] || 'Registration failed.');
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
  
  {/* Unified Single Card Container with Interchanged Theme Accents */}
  <div className='relative z-20 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 rounded-md overflow-hidden shadow-2xl border border-[#10002b]/40 backdrop-blur-md' style={{ backgroundColor: 'var(--sa-surface)' }}>
    
    {/* Left Side: Full-Cover Image Panel */}
    <div className="hidden lg:flex flex-col justify-between items-center relative overflow-hidden border-r border-[#10002b]/30" style={{ backgroundColor: 'var(--sa-surface)' }}>
      <img 
        src={regImage} 
        alt="Sign Up illustration" 
        className="absolute inset-0 w-full h-full object-cover m-0 p-0 border-0"
      />
      {/* Dark Overlay for Text Readability */}
      <div className="absolute inset-0 bg-[#10002b]/60"></div>
      <div className="relative z-10 mt-40 p-8 text-center w-full">
        <h3 className="text-3xl font-extrabold text-white">Join SmartAcademic</h3>
        <p className="text-[20px] text-white/90 mt-1 font-medium">
          Create your account to start managing your academic progress.
        </p>
      </div>
    </div>
   
    {/* Right Side: Register Form Section */}
    <div className="p-8 sm:p-10 flex flex-col justify-center" style={{ backgroundColor: 'var(--sa-surface)' }}>
      
      {/* Brand SA Logo & Header */}
      <div className="mb-6 flex flex-col items-start">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-base text-white shadow-md mb-3 bg-[#10002b]">
          SA
        </div>
        <h1 className="text-white text-2xl font-extrabold tracking-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Create Student Account
        </h1>
        <p className="text-xs text-white/80 mt-1 font-medium">Enter your details to register for SmartAcademic</p>
      </div>

      {/* Error Notification Alert */}
      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-500/20 border border-red-500/40 text-red-200 text-xs font-bold text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSignUp} className="space-y-4">
        <div className="input-group">
          <label className="block text-xs font-bold mb-1 text-white">Username</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
            placeholder="Choose a username..."
            className="w-full px-4 py-3 text-xs rounded-md bg-white border border-[#10002b]/40 text-[#10002b] placeholder-[#10002b]/50 focus:outline-none focus:border-[#c77dff] focus:ring-2 focus:ring-[#c77dff]/40 shadow-xs" 
          />
        </div>

        <div className="input-group">
          <label className="block text-xs font-bold mb-1 text-white">Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            placeholder="Enter your email..."
            className="w-full px-4 py-3 text-xs rounded-md bg-white border border-[#10002b]/40 text-[#10002b] placeholder-[#10002b]/50 focus:outline-none focus:border-[#c77dff] focus:ring-2 focus:ring-[#c77dff]/40 shadow-xs" 
          />
        </div>

        <div className="input-group">
          <label className="block text-xs font-bold mb-1 text-white">Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            placeholder="Create a strong password..."
            className="w-full px-4 py-3 text-xs rounded-md bg-white border border-[#10002b]/40 text-[#10002b] placeholder-[#10002b]/50 focus:outline-none focus:border-[#c77dff] focus:ring-2 focus:ring-[#c77dff]/40 shadow-xs" 
          />
        </div>

        <button 
          type="submit" 
          className="sa-btn-login w-full py-3 rounded-md bg-[#c77dff] text-[#10002b] hover:bg-white hover:text-[#10002b] transition-all shadow-md font-extrabold text-xs mt-2 cursor-pointer"
        >
          Register
        </button>

        <p className="mt-6 text-xs text-white/80 font-semibold text-center">
          Already have an account?{' '}
          <Link to="/signin" className="text-[#c77dff] hover:underline font-bold">
            Sign In
          </Link>
        </p>
      </form>
    </div>

  </div>
</div>
  );
}