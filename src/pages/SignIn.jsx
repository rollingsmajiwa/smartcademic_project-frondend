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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div>
        <h2 className='font-black text-2xl'>SmartAcademic Sign In</h2>
        {error && <p>{error}</p>}
        
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block mb-1">Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required 
              className="w-full px-4 py-2.5" />
          </div>
          <div>
            <label className="block mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required 
              className="w-full" />
          </div>
          <button type="submit" className="w-full">
            Sign In
          </button>
          <p>Dont have account? <Link to="/signup">Register</Link> </p>
        </form>
      </div>
    </div>
  );
}