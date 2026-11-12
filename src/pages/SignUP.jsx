import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import regImage from '../components/images/signUp.jpg';

const API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL || `http://${window.location.hostname}:8000`;

/**
 * Removes email-client damage from link parameters.
 * - A leading "3D" is what is left of "=3D" when the "=" was consumed as the
 *   query separator (?token=3Dabc). Real uids start with M/N/O (base64 of
 *   digits) and real tokens are lowercase, so a leading uppercase "3D" is
 *   never legitimate.
 * - A stray "=" inside the value is a quoted-printable soft line break
 *   ("=" + newline) that wrapped the long URL. Uids and tokens never contain
 *   "=", so every "=" and all whitespace can be removed.
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
    'w-full px-4 py-3 text-xs rounded-md bg-white border border-[#10002b]/40 text-[#10002b] focus:outline-none focus:border-[#c77dff] focus:ring-2 focus:ring-[#c77dff]/40 shadow-xs';

  return (
    <div className="auth-page min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="blob-1"></div>
      <div className="blob-2"></div>

      <div
        className="relative z-20 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 rounded-md overflow-hidden shadow-2xl border border-[#10002b]/40 backdrop-blur-md"
        style={{ backgroundColor: 'var(--sa-surface)' }}
      >
        <div
          className="hidden lg:flex flex-col justify-between items-center relative overflow-hidden border-r border-[#10002b]/30"
          style={{ backgroundColor: 'var(--sa-surface)' }}
        >
          <img src={regImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#10002b]/60"></div>
          <div className="relative z-10 mt-40 p-8 text-center w-full">
            <h3 className="text-3xl font-extrabold text-white">Join SmartAcademic</h3>
            <p className="text-[20px] text-white/90 mt-1 font-medium">
              Choose a password to activate your account.
            </p>
          </div>
        </div>

        <div
          className="p-8 sm:p-10 flex flex-col justify-center"
          style={{ backgroundColor: 'var(--sa-surface)' }}
        >
          <div className="mb-6 flex flex-col items-start">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-base text-white shadow-md mb-3 bg-[#10002b]">
              SA
            </div>
            <h1 className="text-white text-2xl font-extrabold tracking-tight">Activate your account</h1>
            <p className="text-xs text-white/80 mt-1 font-medium">Create a password to finish setting up.</p>
          </div>

          {linkMissing && !message && (
            <div
              role="alert"
              className="mb-4 p-3 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-bold text-center"
            >
              This link is incomplete. Open the activation link from your invitation email.
            </div>
          )}
          {error && (
            <div
              role="alert"
              className="mb-4 p-3 rounded-md bg-red-500/20 border border-red-500/40 text-red-200 text-xs font-bold text-center"
            >
              {error}
            </div>
          )}
          {message && (
            <div
              role="status"
              className="mb-4 p-3 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold text-center"
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate={false}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="input-group">
                <label htmlFor="password" className="block text-xs font-bold mb-1 text-white">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>

              <div className="input-group">
                <label htmlFor="confirmPassword" className="block text-xs font-bold mb-1 text-white">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
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
              className="sa-btn-login w-full py-3 rounded-md bg-[#c77dff] text-[#10002b] hover:bg-white transition-all shadow-md font-extrabold text-xs mt-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Activating...' : 'Activate account'}
            </button>
          </form>

          <p className="mt-6 text-xs text-white/80 font-semibold text-center">
            Already activated?{' '}
            <Link to="/signin" className="text-[#c77dff] hover:underline font-bold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
