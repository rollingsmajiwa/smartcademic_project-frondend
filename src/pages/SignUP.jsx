import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Account created successfully! Redirecting to Log in...');
        setTimeout(() => navigate('/signin'), 1500);
      } else {
        const errorMsg = Object.values(data).flat().join(' ');
        setError(errorMsg || 'Registration failed.');
      }
    } catch (err) {
      setError('Network error. Could not connect to backend.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center">
          <h2 className="text-2xl">SmartAcademic</h2>
          <p className="text-x mt-1">Create your portal account</p>
        </div>

        {error && <div className="p-3 rounded-xl mb-4 text-center">{error}</div>}
        {success && <div className=" p-3 rounded-xl mb-4 text-center">{success}</div>}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="mb-1">Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full px-4" placeholder="eg, Rollings Majiwa" />
          </div>
          <div>
            <label className="block mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full" placeholder="eg, rollingsmajiwa@gmail.com" />
          </div>
          <div>
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full" placeholder="********" />
          </div>
          <button type="submit" className="w-full font-bold bg-gray-600">
            Register
          </button>
        </form>

        <div>
          Already have an account? <Link to="/signin" >Sign In</Link>
        </div>
      </div>
    </div>
  );
}