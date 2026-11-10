import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { GoogleLogin } from '@react-oauth/google'; // 1. Import GoogleLogin
import signImage from '../components/images/sign.jpg';

export default function SignIn() {
  const [loginType, setLoginType] = useState('staff');
  
  // Staff (OTP) state
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  // Student Code state
  const [studentCode, setStudentCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Handle Request OTP (Staff)
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/accounts/staff/send-otp/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Login code sent successfully to your email!');
        setStep(2);
      } else {
        setError(data.error || 'Failed to send login code.');
      }
    } catch (err) {
      setError('Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Verify OTP (Staff)
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/accounts/staff/verify-otp/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);

        const decoded = jwtDecode(data.access);
        const userRole = data.role || decoded.role;

        navigate(`/dashboard/${userRole}`);
      } else {
        setError(data.error || 'Invalid or expired code.');
      }
    } catch (err) {
      setError('Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Google Login Success for Staff (Teachers / Admins)
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
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);

        const decoded = jwtDecode(data.access);
        const userRole = data.role || decoded.role;

        navigate(`/dashboard/${userRole}`);
      } else {
        setError(data.error || 'Google login failed.');
      }
    } catch (err) {
      setError('Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  // Student Login using Code
  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/accounts/student/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admission_number: studentCode }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);

        navigate('/dashboard/student');
      } else {
        setError(data.error || 'Invalid student code.');
      }
    } catch (err) {
      setError('Server connection error.');
    } finally {
      setLoading(false);
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
          <div className="absolute inset-0 bg-[#10002b]/40"></div>
          <div className="relative z-10 mt-40 p-8 text-center w-full">
            <h3 className="text-3xl font-extrabold text-white">Welcome to SmartAcademic</h3>
            <p className="text-[20px] text-white/90 mt-1 font-medium">
              Your unified portal for seamless academic management.
            </p>
          </div>
        </div>
       
        {/* Right Side: Sign In Form Section */}
        <div className="p-8 sm:p-10 flex flex-col justify-center" style={{ backgroundColor: 'var(--sa-surface)' }}>
          
          {/* Brand SA Logo & Header */}
          <div className="mb-4 flex flex-col items-start">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-base text-[#10002b] shadow-md mb-3 bg-[#c77dff]">
              SA
            </div>
            <h1 className="text-white text-2xl font-extrabold tracking-tight">Sign In</h1>
            <p className="text-xs text-white/80 mt-1 font-medium">
              {loginType === 'staff' 
                ? (step === 1 ? "Sign in with Google or enter your email for an OTP code" : "Enter the verification code sent to your email")
                : "Enter your student code to sign in directly"}
            </p>
          </div>

          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 mb-6 bg-[#10002b]/50 p-1 rounded-md border border-[#c77dff]/30">
            <button
              type="button"
              onClick={() => { setLoginType('staff'); setStep(1); setError(''); setMessage(''); }}
              className={`py-2 text-xs font-bold rounded transition-all cursor-pointer ${loginType === 'staff' ? 'bg-[#c77dff] text-[#10002b]' : 'text-white/80 hover:text-white'}`}
            >
              Teacher / Admin (OTP)
            </button>
            <button
              type="button"
              onClick={() => { setLoginType('student'); setError(''); setMessage(''); }}
              className={`py-2 text-xs font-bold rounded transition-all cursor-pointer ${loginType === 'student' ? 'bg-[#c77dff] text-[#10002b]' : 'text-white/80 hover:text-white'}`}
            >
              Student (Code)
            </button>
          </div>

          {/* Error Notification Alert */}
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-500/20 border border-red-500/40 text-red-200 text-xs font-bold text-center">
              {error}
            </div>
          )}

          {/* Success / Notification Message */}
          {message && (
            <div className="mb-4 p-3 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold text-center">
              {message}
            </div>
          )}

          {/* TAB 1: STAFF (TEACHER / ADMIN) LOGIN FORM */}
          {loginType === 'staff' && (
            <>
              {step === 1 ? (
                <div className="space-y-4">
                  {/* 3. Google Sign-In Button Option */}
                  <div className="flex justify-center w-full mb-2">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => setError('Google Sign-In was unsuccessful.')}
                      useOneTap
                    />
                  </div>

                  <div className="flex items-center my-3">
                    <div className="flex-grow border-t border-white/20"></div>
                    <span className="px-3 text-white/50 text-[10px] uppercase font-bold">or use email OTP</span>
                    <div className="flex-grow border-t border-white/20"></div>
                  </div>

                  <form onSubmit={handleSendOTP} className="space-y-4">
                    <div className="input-group">
                      <label htmlFor="email" className="text-white block text-xs font-bold mb-1">Staff Email Address</label>
                      <input
                        type="email"
                        id="email"
                        placeholder="Enter your email (eg. rollingsmajiwa@gmail.com)"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 text-xs rounded-md bg-white border border-[#c77dff] text-[#10002b] placeholder-[#10002b]/50 focus:outline-none focus:border-[#10002b] focus:ring-2 focus:ring-[#c77dff]/40 shadow-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="sa-btn-login w-full py-3 rounded-md bg-[#c77dff] text-[#10002b] hover:bg-white hover:text-[#10002b] transition-all shadow-md font-extrabold text-xs mt-2 disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? 'Sending Code...' : 'Send Login Code'}
                    </button>

                    <p className="mt-6 text-xs text-white/80 font-semibold text-center">
                      Don't have an account?{' '}
                      <Link to="/signup" className="text-[#c77dff] hover:underline font-bold">
                        Register (Student)
                      </Link>
                    </p>
                  </form>
                </div>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="input-group">
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="otp" className="text-white text-xs font-bold">Enter 6-Digit Code</label>
                      <button
                        type="button"
                        onClick={() => { setStep(1); setError(''); setMessage(''); }}
                        className="text-[10px] text-[#c77dff] hover:underline font-bold bg-transparent border-0 cursor-pointer"
                      >
                        Change email
                      </button>
                    </div>
                    <input
                      type="text"
                      id="otp"
                      maxLength="6"
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      className="w-full px-4 py-3 text-sm rounded-md bg-white border border-[#c77dff] text-[#10002b] text-center tracking-widest font-extrabold focus:outline-none focus:border-[#10002b] focus:ring-2 focus:ring-[#c77dff]/40 shadow-xs"
                    />
                    <p className="text-[11px] text-white/70 mt-1.5">
                      Code sent to: <span className="text-white font-bold">{email}</span>
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="sa-btn-login w-full py-3 rounded-md bg-[#c77dff] text-[#10002b] hover:bg-white hover:text-[#10002b] transition-all shadow-md font-extrabold text-xs mt-2 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? 'Verifying...' : 'Verify & Sign In'}
                  </button>

                  <p className="mt-6 text-xs text-white/80 font-semibold text-center">
                    Didn't receive the code?{' '}
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={loading}
                      className="text-[#c77dff] hover:underline font-bold bg-transparent border-0 cursor-pointer p-0"
                    >
                      Resend Code
                    </button>
                  </p>
                </form>
              )}
            </>
          )}

          {/* TAB 2: STUDENT LOGIN FORM */}
          {loginType === 'student' && (
            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div className="input-group">
                <label className="text-white block text-xs font-bold mb-1">Student Code</label>
                <input
                  type="text"
                  placeholder="e.g. STU-48291"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  required
                  className="w-full px-4 py-3 text-xs rounded-md bg-white border border-[#c77dff] text-[#10002b] placeholder-[#10002b]/50 focus:outline-none focus:border-[#10002b] focus:ring-2 focus:ring-[#c77dff]/40 shadow-xs uppercase font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="sa-btn-login w-full py-3 rounded-md bg-[#c77dff] text-[#10002b] hover:bg-white hover:text-[#10002b] transition-all shadow-md font-extrabold text-xs mt-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Signing In...' : 'Sign In as Student'}
              </button>

              <p className="mt-6 text-xs text-white/80 font-semibold text-center">
                Don't have a code?{' '}
                <Link to="/signup" className="text-[#c77dff] hover:underline font-bold">
                  Register Student
                </Link>
              </p>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}