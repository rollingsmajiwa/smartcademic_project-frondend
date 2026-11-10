import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { GoogleLogin } from '@react-oauth/google';
import signImage from '../components/images/sign.jpg';

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
      const response = await fetch('http://127.0.0.1:8000/api/accounts/auth/login/password/', {
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
      const response = await fetch('http://127.0.0.1:8000/api/accounts/auth/google/', {
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
    <div className="auth-page min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="blob-1"></div>
      <div className="blob-2"></div>
      
      <div className="relative z-20 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 rounded-md overflow-hidden shadow-2xl border border-[#c77dff] backdrop-blur-md" style={{ backgroundColor: 'var(--sa-surface)' }}>
        
        {/* Left Visual Column */}
        <div className="hidden lg:flex flex-col justify-between items-center relative overflow-hidden border-r border-[#c77dff]/60" style={{ backgroundColor: 'var(--sa-surface)' }}>
          <img 
            src={signImage} 
            alt="Sign In illustration" 
            className="absolute inset-0 w-full h-full object-cover m-0 p-0 border-0"
          />
          <div className="absolute inset-0 bg-[#10002b]/40"></div>
          <div className="relative z-10 mt-40 p-8 text-center w-full">
            <h3 className="text-3xl font-extrabold text-white">Welcome to SmartAcademic</h3>
            <p className="text-[20px] text-white/90 mt-1 font-medium">
              Your portal for seamless academic management.
            </p>
          </div>
        </div>
       
        {/* Right Form Column */}
        <div className="p-8 sm:p-10 flex flex-col justify-center" style={{ backgroundColor: 'var(--sa-surface)' }}>
          
          <div className="mb-6 flex flex-col items-start">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-base text-[#10002b] shadow-md mb-3 bg-[#c77dff]">
              SA
            </div>
            <h1 className="text-white text-2xl font-extrabold tracking-tight">Sign In</h1>
            <p className="text-xs text-white/80 mt-1 font-medium">
              Enter your email and password to access your dashboard.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-500/20 border border-red-500/40 text-red-200 text-xs font-bold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="input-group">
              <label className="text-white block text-xs font-bold mb-1">Email Address</label>
              <input
                type="email"
                placeholder="name@smartacademic.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 text-xs rounded-md bg-white border border-[#c77dff] text-[#10002b] focus:outline-none focus:border-[#10002b] focus:ring-2 focus:ring-[#c77dff]/40 shadow-xs"
              />
            </div>

            <div className="input-group">
              <label className="text-white block text-xs font-bold mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 text-xs rounded-md bg-white border border-[#c77dff] text-[#10002b] focus:outline-none focus:border-[#10002b] focus:ring-2 focus:ring-[#c77dff]/40 shadow-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="sa-btn-login w-full py-3 rounded-md bg-[#c77dff] text-[#10002b] hover:bg-white transition-all shadow-md font-extrabold text-xs mt-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="flex items-center my-5">
            <div className="flex-grow border-t border-white/20"></div>
            <span className="px-3 text-white/50 text-[10px] uppercase font-bold">or continue with</span>
            <div className="flex-grow border-t border-white/20"></div>
          </div>

          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Sign-In failed.')}
            />
          </div>

          <p className="mt-6 text-xs text-white/80 font-semibold text-center">
            Accounts are activated through admin invitation links.
          </p>

        </div>

      </div>
    </div>
  );
}