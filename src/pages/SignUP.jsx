import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

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
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden font-sans bg-slate-50">
  
  {/* Light Green Decorative Blur Effect */}
  <div 
    className="absolute top-12 right-12 w-96 h-96 rounded-full filter blur-3xl opacity-40 pointer-events-none"
    style={{ backgroundColor: 'var(--sa-green-soft)' }}
  ></div>
  <div 
    className="absolute bottom-12 left-12 w-96 h-96 rounded-full filter blur-3xl opacity-30 pointer-events-none"
    style={{ backgroundColor: 'var(--sa-blue)' }}
  ></div>

  {/* Greenish Registration Card */}
  <main 
    className="relative z-20 border rounded-3xl w-full max-w-md p-8 backdrop-blur-md shadow-xl space-y-6"
    style={{ 
      backgroundColor: 'rgba(232, 245, 233, 0.9)', 
      borderColor: 'var(--sa-green-soft)' 
    }}
  >
    
    <div>
      <h2 
        className="font-extrabold text-2xl tracking-tight text-center" 
        style={{ fontFamily: 'Montserrat, sans-serif', color: 'var(--sa-green-dark)' }}
      >
        Create Student Account
      </h2>
      <p className="text-xs text-slate-600 text-center mt-1 font-medium">
        Enter your details to register for SmartAcademic
      </p>
    </div>

    {error && (
      <p className="p-3 rounded-2xl bg-red-500/10 border border-red-400/30 text-red-600 text-xs font-bold text-center">
        {error}
      </p>
    )}

    <form onSubmit={handleSignUp} className="space-y-4">
      <div className="input-group">
        <label className="block text-xs font-bold mb-1 text-slate-700">Username</label>
        <input 
          type="text" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          required 
          placeholder="Choose a username..."
          className="w-full px-4 py-3 text-xs rounded-full bg-white border border-emerald-200 focus:outline-none focus:border-emerald-500 text-slate-800 shadow-xs" 
        />
      </div>

      <div className="input-group">
        <label className="block text-xs font-bold mb-1 text-slate-700">Email</label>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          placeholder="Enter your email..."
          className="w-full px-4 py-3 text-xs rounded-full bg-white border border-emerald-200 focus:outline-none focus:border-emerald-500 text-slate-800 shadow-xs" 
        />
      </div>

      <div className="input-group">
        <label className="block text-xs font-bold mb-1 text-slate-700">Password</label>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          placeholder=" "
          className="w-full px-4 py-3 text-xs rounded-full bg-white border border-emerald-200 focus:outline-none focus:border-emerald-500 text-slate-800 shadow-xs" 
        />
      </div>

      <button 
        type="submit" 
        className="w-full py-3 rounded-full font-bold text-xs text-white shadow-md transition-all hover:opacity-90"
        style={{ backgroundColor: 'var(--sa-green-dark)' }}
      >
        Register
      </button>

      <p className="text-center text-xs text-slate-600 font-semibold pt-2">
        Already have an account?{' '}
        <Link to="/signin" className="text-sky-600 hover:underline font-bold">
          Sign In
        </Link>
      </p>
    </form>
  </main>

</div>
  );
}