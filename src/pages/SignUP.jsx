import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import regImage from '../components/images/signUp.jpg';

export default function SignUp() {
  const [searchParams] = useSearchParams();
  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegisterPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!uid || !token) {
      setError('Invalid or missing activation token. Please use your email invitation link.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/accounts/auth/set-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, token, password, email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Account activated! Redirecting to sign in...');
        setTimeout(() => navigate('/signin'), 2000);
      } else {
        setError(data.error || 'Failed to activate account. The link may have expired.');
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
      
      <div className='relative z-20 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 rounded-md overflow-hidden shadow-2xl border border-[#10002b]/40 backdrop-blur-md' style={{ backgroundColor: 'var(--sa-surface)' }}>
        
        <div className="hidden lg:flex flex-col justify-between items-center relative overflow-hidden border-r border-[#10002b]/30" style={{ backgroundColor: 'var(--sa-surface)' }}>
          <img src={regImage} alt="Sign Up" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#10002b]/60"></div>
          <div className="relative z-10 mt-40 p-8 text-center w-full">
            <h3 className="text-3xl font-extrabold text-white">Join SmartAcademic</h3>
            <p className="text-[20px] text-white/90 mt-1 font-medium">Set up your credentials to activate your account.</p>
          </div>
        </div>
       
        <div className="p-8 sm:p-10 flex flex-col justify-center" style={{ backgroundColor: 'var(--sa-surface)' }}>
          <div className="mb-6 flex flex-col items-start">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-base text-white shadow-md mb-3 bg-[#10002b]">
              SA
            </div>
            <h1 className="text-white text-2xl font-extrabold tracking-tight">Account Activation</h1>
            <p className="text-xs text-white/80 mt-1 font-medium">Enter your email and create a password</p>
          </div>

          {error && <div className="mb-4 p-3 rounded-md bg-red-500/20 border border-red-500/40 text-red-200 text-xs font-bold text-center">{error}</div>}
          {message && <div className="mb-4 p-3 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold text-center">{message}</div>}

          <form onSubmit={handleRegisterPassword} className="space-y-4">
            <div className="input-group">
              <label className="block text-xs font-bold mb-1 text-white">Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required
                placeholder="name@smartacademic.com"
                className="w-full px-4 py-3 text-xs rounded-md bg-white border border-[#10002b]/40 text-[#10002b] focus:outline-none focus:border-[#c77dff] focus:ring-2 focus:ring-[#c77dff]/40 shadow-xs" 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="input-group">
                <label className="block text-xs font-bold mb-1 text-white">Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  placeholder="••••••••"
                  className="w-full px-4 py-3 text-xs rounded-md bg-white border border-[#10002b]/40 text-[#10002b] focus:outline-none focus:border-[#c77dff] focus:ring-2 focus:ring-[#c77dff]/40 shadow-xs" 
                />
              </div>

              <div className="input-group">
                <label className="block text-xs font-bold mb-1 text-white">Confirm Password</label>
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                  placeholder="••••••••"
                  className="w-full px-4 py-3 text-xs rounded-md bg-white border border-[#10002b]/40 text-[#10002b] focus:outline-none focus:border-[#c77dff] focus:ring-2 focus:ring-[#c77dff]/40 shadow-xs" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="sa-btn-login w-full py-3 rounded-md bg-[#c77dff] text-[#10002b] hover:bg-white transition-all shadow-md font-extrabold text-xs mt-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Activating Account...' : 'Activate Account'}
            </button>
          </form>

          <p className="mt-6 text-xs text-white/80 font-semibold text-center">
            Already activated? <Link to="/signin" className="text-[#c77dff] hover:underline font-bold">Sign In</Link>
          </p>
        </div>

      </div>
    </div>
  );
}