import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, GraduationCap, ArrowRight, User as Github } from 'lucide-react';
import { useAuth } from '../App';
import { useToast } from '../context/ToastContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');

      login(data);
      addToast(`Welcome back, ${data.user.name}! Accessing your portal...`, 'success');
      navigate(data.user.role === 'ADMIN' ? '/admin' : '/student');
    } catch (err) {
      setError(err.message);
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-sky-50 to-indigo-50">
      <div className="glass-card w-full max-w-[480px] p-12 animate-slide flex flex-col items-center">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-sky-200 mb-8">
          <GraduationCap className="text-white" size={36} />
        </div>
        
        <h1 className="text-3xl font-black text-text-dark text-center mb-2">Welcome Back!</h1>
        <p className="text-text-muted text-center mb-10">Sign in to continue your learning journey.</p>

        {error && (
          <div className="w-full bg-red-50 border border-red-100 text-red-500 p-4 rounded-xl text-xs font-bold mb-8 flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={20} />
              <input
                type="email"
                required
                className="pl-12 py-4 bg-white border-transparent focus:border-primary shadow-sm"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Password</label>
              <button type="button" className="text-[10px] font-bold text-primary hover:underline">Forgot Password?</button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={20} />
              <input
                type="password"
                required
                className="pl-12 py-4 bg-white border-transparent focus:border-primary shadow-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-4 justify-center group text-lg mt-4 shadow-xl shadow-sky-200"
          >
            {loading ? 'Authenticating...' : (
              <>
                Sign In <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </>
            )}
          </button>
        </form>

        <div className="w-full flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-slate-100" />
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">or continue with</span>
          <div className="flex-1 h-px bg-slate-100" />
        </div>

        <div className="w-full grid grid-2 gap-4">
           <button className="btn-neumorph flex items-center justify-center gap-3 py-3">
              <img src="https://www.google.com/favicon.ico" className="w-4" alt="Google" />
              <span className="text-xs font-bold text-slate-600">Google</span>
           </button>
           <button className="btn-neumorph flex items-center justify-center gap-3 py-3">
              <Github size={18} className="text-slate-600" />
              <span className="text-xs font-bold text-slate-600">Github</span>
           </button>
        </div>

        <p className="text-center mt-10 text-text-muted text-sm font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-bold hover:underline">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
