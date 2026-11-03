import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

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

      {/* Glassmorphism Sign In Card */}
      <main className="glass-card">
        <h1>SmartAcademic</h1>

        {/* Error Notification Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-red-500/10 border border-red-400/30 text-red-600 text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSignIn}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input 
              type="text" 
              id="username" 
              placeholder="Enter your username (eg. Mary)"
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              placeholder=""
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button type="submit" className="sa-btn-login mt-2">
            Sign In
          </button>

          <p className="mt-6 text-xs text-slate-600 font-semibold">
            Don't have an account?{' '}
            <Link to="/signup" className="text-sky-600 hover:underline font-bold">
              Register
            </Link>
          </p>
        </form>
      </main>

    </div>
  );
}