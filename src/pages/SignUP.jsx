import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://smartcademic-project.onrender.com';

/**
- Removes email-client damage from link parameters.
- - A leading "3D" is what is left of "=3D" when the "=" was consumed as the
-   query separator (?token=3Dabc). Real uids start with M/N/O (base64 of
-   digits) and real tokens are lowercase, so a leading uppercase "3D" is
-   never legitimate.
- - A stray "=" inside the value is a quoted-printable soft line break
-   ("=" + newline) that wrapped the long URL. Uids and tokens never contain
-   "=", so every "=" and all whitespace can be removed.
 */
const cleanParam = (value) =>
  (value || '')
    .replace(/^\s*3D/, '')
    .replace(/[=\s]/g, '');

/** Turns whatever shape the API returns into one readable string. */
const extractError = (data, fallback) => {
  if (!data) return fallback;
  if (typeof data === 'string') return data;

  const direct = data.error || data.detail || data.message;
  if (typeof direct === 'string') return direct;

  const lists = Object.values(data).flat().filter((v) => typeof v === 'string');
  return lists.length ? lists.join(' ') : fallback;
};

export default function SignUp() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const uid = useMemo(() => cleanParam(searchParams.get('uid')), [searchParams]);
  const token = useMemo(() => cleanParam(searchParams.get('token')), [searchParams]);
  const linkMissing = !uid || !token;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const redirectTimer = useRef(null);

  useEffect(() => () => clearTimeout(redirectTimer.current), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError('');
    setMessage('');

    if (linkMissing) {
      setError('This activation link is incomplete. Open the link from your invitation email again.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/accounts/auth/signup/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, token, password }),
      });

      let data = null;
      try {
        data = await response.json();
      } catch {
        /* non-JSON response (e.g. a 500 HTML page) */
      }

      if (response.ok) {
        setMessage('Account activated. Redirecting to sign in...');
        redirectTimer.current = setTimeout(() => navigate('/signin'), 2000);
      } else {
        setError(extractError(data, `Activation failed (status ${response.status}).`));
      }
    } catch {
      setError('Cannot reach the server. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 text-xs rounded-md bg-white border border-[#c77dff]/70 text-[#10002b] focus:outline-none focus:border-[#10002b] focus:ring-2 focus:ring-[#c77dff]/40 shadow-xs';

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-white text-[#10002b] font-sans">
      
      {/* Soft background glow matching landing page accents */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#c77dff]/20 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#c77dff]/20 rounded-full blur-3xl pointer-events-none z-0"></div>

      <div
        className="relative z-20 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 rounded-xl overflow-hidden shadow-2xl border border-[#c77dff]/60 bg-white"
      >
        <div
          className="hidden lg:flex flex-col justify-between items-center relative overflow-hidden border-r border-[#c77dff]/40 bg-[#10002b]"
        >
          <img src="/images/signUp.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#10002b]/90 via-[#10002b]/40 to-transparent"></div>
          <div className="relative z-10 mt-40 p-8 text-center w-full">
            <h3 className="text-3xl font-extrabold text-white">Join SmartAcademic</h3>
            <p className="text-[17px] text-white/90 mt-2 font-medium">
              Choose a password to activate your account.
            </p>
          </div>
        </div>

        <div
          className="p-8 sm:p-10 flex flex-col justify-center bg-white text-[#10002b]"
        >
          <div className="mb-6 flex flex-col items-start">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-base text-[#10002b] shadow-md mb-3 bg-[#c77dff]">
              SA
            </div>
            <h1 className="text-[#10002b] text-2xl font-extrabold tracking-tight">Activate your account</h1>
            <p className="text-xs text-[#10002b]/70 mt-1 font-medium">Create a password to finish setting up.</p>
          </div>

          {linkMissing && !message && (
            <div
              role="alert"
              className="mb-4 p-3 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-700 text-xs font-bold text-center"
            >
              This link is incomplete. Open the activation link from your invitation email.
            </div>
          )}
          {error && (
            <div
              role="alert"
              className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/30 text-red-600 text-xs font-bold text-center"
            >
              {error}
            </div>
          )}
          {message && (
            <div
              role="status"
              className="mb-4 p-3 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-xs font-bold text-center"
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate={false}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="input-group">
                <label htmlFor="password" className="block text-xs font-bold mb-1 text-[#10002b]">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>

              <div className="input-group">
                <label htmlFor="confirmPassword" className="block text-xs font-bold mb-1 text-[#10002b]">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || linkMissing || !!message}
              className="w-full py-3 rounded-md bg-[#c77dff] text-[#10002b] hover:bg-[#10002b] hover:text-white transition-all shadow-md font-extrabold text-xs mt-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Activating...' : 'Activate account'}
            </button>
          </form>

          <p className="mt-6 text-xs text-[#10002b]/70 font-semibold text-center">
            Already activated?{' '}
            <Link to="/signin" className="text-[#10002b] hover:underline font-bold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}