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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div>
        <h2 className="text-2xl">Create Student Account</h2>
        {error && <p className="mb-4 text-center">{error}</p>}
        
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="block">Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required 
              className="w-full" />
          </div>
          <div>
            <label className="block">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required 
              className="w-full" />
          </div>
          <div>
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required 
              className="w-full" />
          </div>
          <button type="submit" className="w-full bg-gray-700">
            Register
          </button>
          <p>Already have an account? <Link to="/signin">Sign In</Link> </p>
        </form>
      </div>
    </div>
  );
}