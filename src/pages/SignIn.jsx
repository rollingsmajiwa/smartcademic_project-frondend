import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Signin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
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
        navigate('/dashboard');
      } else {
        setError('Invalid username or password.');
      }
    } catch (err) {
      setError('Network error. Could not connect to backend.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h2>SmartAcademic</h2>
          <p>Sign in to your portal account</p>
        </div>

        {error && <div className=" p-3 rounded-xl mb-4 text-center">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1">Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full px-4 py-2.5" placeholder="Write your username" />
          </div>
          <div>
            <label className="block">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4" placeholder="***************" />
          </div>
          <button type="submit" className="w-full bg-gray-600">
            Sign In
          </button>
        </form>

        <div className="text-center">
          Don't have an account? <Link to="/signup">Register</Link>
        </div>
      </div>
    </div>
  );
}