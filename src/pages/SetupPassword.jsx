import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

export default function SetPassword() {
  const [searchParams] = useSearchParams();
  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/accounts/auth/set-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Password set successfully! Redirecting to sign in...');
        setTimeout(() => navigate('/signin'), 3000);
      } else {
        setError(data.error || 'Failed to set password. Link may be invalid or expired.');
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

      <div className="relative z-20 w-full max-w-md p-8 rounded-md shadow-2xl border border-[#c77dff] backdrop-blur-md" style={{ backgroundColor: 'var(--sa-surface)' }}>
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-base text-[#10002b] shadow-md mb-3 bg-[#c77dff]">
            SA
          </div>
          <h1 className="text-white text-2xl font-extrabold tracking-tight">Set Your Password</h1>
          <p className="text-xs text-white/80 mt-1 font-medium">
            Enter your new secure password to activate your SmartAcademic account.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-500/20 border border-red-500/40 text-red-200 text-xs font-bold text-center">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleSetPassword} className="space-y-4">
          <div className="input-group">
            <label className="text-white block text-xs font-bold mb-1">New Password</label>
            <input
              type="password"
              placeholder=""
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 text-xs rounded-md bg-white border border-[#c77dff] text-[#10002b] focus:outline-none focus:border-[#10002b]"
            />
          </div>

          <div className="input-group">
            <label className="text-white block text-xs font-bold mb-1">Confirm New Password</label>
            <input
              type="password"
              placeholder=""
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 text-xs rounded-md bg-white border border-[#c77dff] text-[#10002b] focus:outline-none focus:border-[#10002b]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-md bg-[#c77dff] text-[#10002b] hover:bg-white transition-all shadow-md font-extrabold text-xs mt-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Saving Password...' : 'Activate Account'}
          </button>
        </form>

        <p className="mt-6 text-xs text-white/80 font-semibold text-center">
          Remembered your password?{' '}
          <Link to="/signin" className="text-[#c77dff] hover:underline font-bold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}