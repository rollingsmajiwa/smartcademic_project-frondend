import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { GoogleLogin } from '@react-oauth/google';

const API_ORIGIN = import.meta.env.VITE_API_URL || 'https://smartcademic-project.onrender.com';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAuthSuccess = (data) => {
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);

    let userRole = data.role;
    
    // Fallback: Decode JWT access token if top-level data.role is missing
    if (!userRole && data.access) {
      try {
        const decoded = jwtDecode(data.access);
        userRole = decoded.role || decoded.user_role || decoded.groups?.[0];
      } catch (e) {
        userRole = 'user';
      }
    }

    // Normalize role string to handle capitalization or whitespace mismatches
    const normalizedRole = (userRole || '').trim().toLowerCase();

    if (normalizedRole === 'admin') {
      navigate('/dashboard/admin');
    } else if (normalizedRole === 'teacher') {
      navigate('/dashboard/teacher');
    } else if (normalizedRole === 'student') {
      navigate('/dashboard/student');
    } else {
      navigate('/dashboard');
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_ORIGIN}/api/accounts/auth/login/password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        handleAuthSuccess(data);
      } else {
        setError(data.error || data.detail || 'Invalid email or password.');
      }
    } catch (err) {
      setError('Server connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_ORIGIN}/api/accounts/auth/google/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await response.json();

      if (response.ok) {
        handleAuthSuccess(data);
      } else {
        setError(data.error || data.detail || 'Google login failed.');
      }
    } catch (err) {
      setError('Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-white text-[#10002b] font-sans">
      
      {/* Soft background glow matching landing page accents */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#c77dff]/20 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#c77dff]/20 rounded-full blur-3xl pointer-events-none z-0"></div>
      
      <div className="relative z-20 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 rounded-xl overflow-hidden shadow-2xl border border-[#c77dff]/60 bg-white">
        
        {/* Left Visual Column */}
        <div className="hidden lg:flex flex-col justify-between items-center relative overflow-hidden border-r border-[#c77dff]/40 bg-[#10002b]">
          <img 
            src="/images/sign.jpg"
            alt="Sign In illustration" 
            className="absolute inset-0 w-full h-full object-cover m-0 p-0 border-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#10002b]/90 via-[#10002b]/40 to-transparent"></div>
          <div className="relative z-10 mt-40 p-8 text-center w-full">
            <h3 className="text-3xl font-extrabold text-white">Welcome to SmartAcademic</h3>
            <p className="text-[17px] text-white/90 mt-2 font-medium">
              Your portal for seamless academic management.
            </p>
          </div>
        </div>
       
        {/* Right Form Column */}
        <div className="p-8 sm:p-10 flex flex-col justify-center relative bg-white text-[#10002b]">
          
          {/* Back to Home Button */}
          <div className="absolute top-6 right-6">
            <Link 
              to="/" 
              className="px-3 py-1.5 rounded-lg bg-[#c77dff]/25 border border-[#c77dff]/60 text-[#10002b] text-xs font-bold hover:bg-[#10002b] hover:text-white transition-all flex items-center gap-1.5 shadow-sm"
            >
              Back to Home
            </Link>
          </div>

          <div className="mb-6 flex flex-col items-start pt-4 sm:pt-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-base text-[#10002b] shadow-md mb-3 bg-[#c77dff]">
              SA
            </div>
            <h1 className="text-[#10002b] text-2xl font-extrabold tracking-tight">Sign In</h1>
            <p className="text-xs text-[#10002b]/70 mt-1 font-medium">
              Enter your email and password to access your dashboard.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/30 text-red-600 text-xs font-bold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="input-group">
              <label className="text-[#10002b] block text-xs font-bold mb-1">Email Address</label>
              <input
                type="email"
                placeholder="rollingsmajiwa@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 text-xs rounded-md bg-white border border-[#c77dff]/70 text-[#10002b] focus:outline-none focus:border-[#10002b] focus:ring-2 focus:ring-[#c77dff]/40 shadow-xs"
              />
            </div>

            <div className="input-group">
              <label className="text-[#10002b] block text-xs font-bold mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 text-xs rounded-md bg-white border border-[#c77dff]/70 text-[#10002b] focus:outline-none focus:border-[#10002b] focus:ring-2 focus:ring-[#c77dff]/40 shadow-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-md bg-[#c77dff] text-[#10002b] hover:bg-[#10002b] hover:text-white transition-all shadow-md font-extrabold text-xs mt-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="flex items-center my-5">
            <div className="flex-grow border-t border-[#10002b]/15"></div>
            <span className="px-3 text-[#10002b]/50 text-[10px] uppercase font-bold">or continue with</span>
            <div className="flex-grow border-t border-[#10002b]/15"></div>
          </div>

          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Sign-In failed.')}
            />
          </div>

          <p className="mt-6 text-xs text-[#10002b]/70 font-semibold text-center">
            Accounts are activated through admin invitation links.
          </p>

        </div>

      </div>
    </div>
  );
}