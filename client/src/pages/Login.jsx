import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, GraduationCap, ArrowRight } from 'lucide-react';
import { useAuth } from '../App';
import { useToast } from '../context/ToastContext';

import { API_URL } from '../config';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');

      login(data);
      addToast(`Welcome back, ${data.user.name}!`, 'success');
      navigate(data.user.role === 'ADMIN' ? '/admin' : '/student');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-light)' }}>
      <div className="card-clean animate-fade" style={{ width: '100%', maxWidth: '420px', textAlign: 'center' }}>
        <div style={{ 
          width: '64px', height: '64px', background: 'var(--primary-gradient)', 
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem', color: 'white'
        }}>
          <GraduationCap size={32} />
        </div>
        
        <h1 style={{ marginBottom: '0.5rem', fontSize: '1.75rem' }}>ExamPro</h1>
        <p style={{ marginBottom: '2rem' }}>Experience the future of testing.</p>

        <form onSubmit={handleSubmit} className="section-stack">
          <div style={{ textAlign: 'left' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>Email</label>
            <input
              type="email"
              required
              className="input-clean"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>Password</label>
            <input
              type="password"
              required
              className="input-clean"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-emerald"
            style={{ width: '100%', marginTop: '1rem' }}
          >
            {loading ? 'Entering...' : (
              <>
                Sign In <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
        </div>

        <button className="btn-secondary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
          <img src="https://www.google.com/favicon.ico" style={{ width: '16px' }} alt="G" />
          Continue with Google
        </button>

        <p style={{ marginTop: '2rem', fontSize: '0.9rem' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

