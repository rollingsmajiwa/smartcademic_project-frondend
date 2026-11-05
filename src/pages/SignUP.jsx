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
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden font-sans bg-[#011638]">
  
  {/* Distinct Background Decorative Glows */}
  <div 
    className="absolute top-12 left-12 w-96 h-96 rounded-sm filter blur-3xl opacity-20 pointer-events-none"
    style={{ backgroundColor: '#dff8eb' }}
  ></div>
  <div 
    className="absolute bottom-12 right-12 w-96 h-96 rounded-sm filter blur-3xl opacity-30 pointer-events-none"
    style={{ backgroundColor: '#214e34' }}
  ></div>

  {/* Dark Slate Registration Card (Contrasting Sign In's Light Mint Card) */}
  <main 
    className="relative z-20 border rounded-sm w-full max-w-md p-8 backdrop-blur-md shadow-2xl space-y-6 bg-[#364156]/90 border-[#dff8eb]/30"
  >
    
    <div>
      <h2 
        className="font-extrabold text-2xl tracking-tight text-center text-[#dff8eb]" 
        style={{ fontFamily: 'Montserrat, sans-serif' }}
      >
        Create Student Account
      </h2>
      <p className="text-xs text-[#cdcdcd] text-center mt-1 font-medium">
        Enter your details to register for SmartAcademic
      </p>
    </div>

    {error && (
      <p className="p-3 rounded-md bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-bold text-center">
        {error}
      </p>
    )}

    <form onSubmit={handleSignUp} className="space-y-4">
      <div className="input-group">
        <label className="block text-xs font-bold mb-1 text-[#dff8eb]">Username</label>
        <input 
          type="text" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          required 
          placeholder="Choose a username..."
          className="w-full px-4 py-3 text-xs rounded-sm bg-[#011638] border border-[#cdcdcd]/40 text-white placeholder-[#cdcdcd]/50 focus:outline-none focus:border-[#dff8eb] focus:ring-2 focus:ring-[#dff8eb]/20 shadow-xs" 
        />
      </div>

      <div className="input-group">
        <label className="block text-xs font-bold mb-1 text-[#dff8eb]">Email</label>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          placeholder="Enter your email..."
          className="w-full px-4 py-3 text-xs rounded-sm bg-[#011638] border border-[#cdcdcd]/40 text-white placeholder-[#cdcdcd]/50 focus:outline-none focus:border-[#dff8eb] focus:ring-2 focus:ring-[#dff8eb]/20 shadow-xs" 
        />
      </div>

      <div className="input-group">
        <label className="block text-xs font-bold mb-1 text-[#dff8eb]">Password</label>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          placeholder="Create a strong password..."
          className="w-full px-4 py-3 text-xs rounded-sm bg-[#011638] border border-[#cdcdcd]/40 text-white placeholder-[#cdcdcd]/50 focus:outline-none focus:border-[#dff8eb] focus:ring-2 focus:ring-[#dff8eb]/20 shadow-xs" 
        />
      </div>

      <button 
        type="submit" 
        className="w-full py-3 rounded-sm font-extrabold text-xs text-[#011638] bg-[#dff8eb] hover:bg-[#214e34] hover:text-[#dff8eb] shadow-md transition-all mt-2"
      >
        Register
      </button>

      <p className="text-center text-xs text-[#cdcdcd] font-semibold pt-2">
        Already have an account?{' '}
        <Link to="/signin" className="text-[#dff8eb] hover:underline font-bold">
          Sign In
        </Link>
      </p>
    </form>
  </main>

</div>
  );
}