import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Eye, EyeOff, Sparkles, ShieldCheck } from 'lucide-react';
import { login } from '../../api/auth.api';
import useAuthStore from '../../store/authStore';
import { useToast } from '../shared/Toast';

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth }   = useAuthStore();
  const toast         = useToast();
  const navigate      = useNavigate();

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await login(form);
      setAuth(data.token, data.user);
      navigate('/');
    } catch (err) {
      toast(err.response?.data?.error || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]" style={{ background: 'rgba(99,102,241,0.15)' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]" style={{ background: 'rgba(168,85,247,0.12)' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="glass-card w-full max-w-md p-10 relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
               style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 8px 24px rgba(99,102,241,0.3)' }}>
            <Brain size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Neurix <span style={{ color: '#6366f1' }}>AI</span></h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">Evidence-Grounded BCBA Copilot</p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-slate-500 uppercase tracking-wider ml-1">Email</label>
            <input
              name="email" type="email" value={form.email} onChange={handle} required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              placeholder="bcba@clinic.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-slate-500 uppercase tracking-wider ml-1">Password</label>
            <div className="relative">
              <input
                name="password" type={showPw ? 'text' : 'password'} value={form.password} onChange={handle} required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all pr-12"
                placeholder="••••••••"
              />
              <button type="button" tabIndex={-1} onClick={() => setShowPw(s => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button disabled={loading} className="btn-primary w-full py-3.5 text-base mt-4 justify-center">
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <ShieldCheck size={18} />
                Sign In
              </span>
            )}
          </button>
        </form>

        <div className="mt-8 flex items-center gap-2 justify-center py-4 rounded-xl" style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.1)' }}>
          <Sparkles size={14} className="text-indigo-400" />
          <p className="text-xs text-slate-500 font-medium tracking-tight">1,689 clinical records ready to assist you</p>
        </div>

        <p className="text-center text-sm text-slate-400 mt-8">
          New BCBA?{' '}
          <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-bold tracking-tight transition-colors">Create account</Link>
        </p>
      </motion.div>
    </div>
  );
}
