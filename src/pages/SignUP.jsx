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
   <div className="auth-page min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden font-sans bg-[#011638]">
      
  {/* Distinct Glowing Blobs */}
  <div 
    className="absolute top-12 left-12 w-96 h-96 rounded-full filter blur-3xl opacity-20 pointer-events-none"
    style={{ backgroundColor: '#dff8eb' }}
  ></div>
  <div 
    className="absolute bottom-12 right-12 w-96 h-96 rounded-full filter blur-3xl opacity-30 pointer-events-none"
    style={{ backgroundColor: '#214e34' }}
  ></div>
  
  {/* Unified Split Card with Inverted Dark Theme */}
  <div className="relative z-20 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 rounded-md overflow-hidden shadow-2xl border border-[#cdcdcd]/30 bg-[#364156]/90 backdrop-blur-md">
    
    {/* Left Side: Image Panel (Deep Dark Accent) */}
    <div className="hidden lg:flex flex-col justify-center items-center p-8 bg-[#011638]/60 border-r border-[#cdcdcd]/20">
      <div className="w-full flex flex-col justify-center items-center space-y-4">
        <img 
          src={regImage} 
          alt="Sign Up illustration" 
          className="w-full h-[340px] object-cover rounded-md shadow-lg border border-[#cdcdcd]/20"
        />
        <div className="text-center px-2">
          <h3 className="text-sm font-extrabold text-[#dff8eb]">Join SmartAcademic</h3>
          <p className="text-[11px] text-[#cdcdcd] mt-1 font-medium">
            Create your account to start managing your academic progress.
          </p>
        </div>
      </div>
    </div>
   
    {/* Right Side: Register Form Section */}
    <div className="p-8 sm:p-10 flex flex-col justify-center">
      
      {/* Brand SA Logo & Header */}
      <div className="mb-6 flex flex-col items-start">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-base text-[#011638] shadow-md mb-3" 
          style={{ backgroundColor: '#dff8eb' }}
        >
          SA
        </div>
        <h1 
          className="text-[#dff8eb] text-2xl font-extrabold tracking-tight"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          Create Student Account
        </h1>
        <p className="text-xs text-[#cdcdcd] mt-1 font-medium">
          Enter your details to register for SmartAcademic
        </p>
      </div>

      {/* Error Notification Alert */}
      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-bold text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSignUp} className="space-y-4">
        <div className="input-group">
          <label className="block text-xs font-bold mb-1 text-[#dff8eb]">Username</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
            placeholder="Choose a username..."
            className="w-full px-4 py-3 text-xs rounded-md bg-[#011638] border border-[#cdcdcd]/40 text-white placeholder-[#cdcdcd]/50 focus:outline-none focus:border-[#dff8eb] focus:ring-2 focus:ring-[#dff8eb]/20 shadow-xs" 
          />
        </div>

        <div className="input-group">
          <label className="block text-xs font-bold mb-1 text-[#dff8eb]">Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            placeholder="Enter your email..."
            className="w-full px-4 py-3 text-xs rounded-md bg-[#011638] border border-[#cdcdcd]/40 text-white placeholder-[#cdcdcd]/50 focus:outline-none focus:border-[#dff8eb] focus:ring-2 focus:ring-[#dff8eb]/20 shadow-xs" 
          />
        </div>

        <div className="input-group">
          <label className="block text-xs font-bold mb-1 text-[#dff8eb]">Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            placeholder="Create a strong password..."
            className="w-full px-4 py-3 text-xs rounded-md bg-[#011638] border border-[#cdcdcd]/40 text-white placeholder-[#cdcdcd]/50 focus:outline-none focus:border-[#dff8eb] focus:ring-2 focus:ring-[#dff8eb]/20 shadow-xs" 
          />
        </div>

        <button 
          type="submit" 
          className="w-full py-3 rounded-md font-extrabold text-xs text-[#011638] bg-[#dff8eb] hover:bg-[#214e34] hover:text-[#dff8eb] shadow-md transition-all mt-2 cursor-pointer"
        >
          Register
        </button>

        <p className="mt-6 text-xs text-[#cdcdcd] font-semibold text-center">
          Already have an account?{' '}
          <Link to="/signin" className="text-[#dff8eb] hover:underline font-bold">
            Sign In
          </Link>
        </p>
      </form>
    </div>

  </div>
</div>
  );
}