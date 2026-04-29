import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, UserPlus, Sparkles, CheckCircle } from 'lucide-react';
import { register } from '../../api/auth.api';
import useAuthStore from '../../store/authStore';
import { useToast } from '../shared/Toast';

function Field({ label, name, type = 'text', placeholder, required = true, value, onChange }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}{required && ' *'}</label>
      <input
        name={name} type={type} value={value} onChange={onChange} required={required}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
      />
    </div>
  );
}

export default function Register() {
  const [form, setForm]       = useState({ name: '', email: '', password: '', licenseNumber: '', organization: '' });
  const [loading, setLoading] = useState(false);
  const { setAuth }   = useAuthStore();
  const toast         = useToast();
  const navigate      = useNavigate();

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) return toast('Password must be at least 8 characters', 'error');
    setLoading(true);
    try {
      const { data } = await register(form);
      setAuth(data.token, data.user);
      navigate('/');
    } catch (err) {
      toast(err.response?.data?.error || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-5%] right-[-5%] w-[45%] h-[45%] rounded-full blur-[120px]" style={{ background: 'rgba(99,102,241,0.12)' }} />
      <div className="absolute bottom-[-5%] left-[-5%] w-[45%] h-[45%] rounded-full blur-[120px]" style={{ background: 'rgba(168,85,247,0.1)' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="glass-card w-full max-w-lg p-10 relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
               style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 8px 24px rgba(99,102,241,0.3)' }}>
            <Brain size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Join Neurix AI</h1>
          <p className="text-slate-400 text-sm mt-1 font-medium">Empowering BCBAs with clinical intelligence</p>
        </div>

        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Field label="Full Name" name="name" value={form.name} onChange={handle} placeholder="Dr. Priya Sharma" />
          </div>
          <Field label="Email" name="email" value={form.email} onChange={handle} type="email" placeholder="bcba@clinic.com" />
          <Field label="Password" name="password" value={form.password} onChange={handle} type="password" placeholder="Min 8 characters" />
          <Field label="BCBA License #" name="licenseNumber" value={form.licenseNumber} onChange={handle} placeholder="BCBA-12345" />
          <Field label="Organization" name="organization" value={form.organization} onChange={handle} placeholder="Sunshine ABA Centre" required={false} />

          <div className="md:col-span-2 mt-4">
            <button disabled={loading} className="btn-primary w-full py-3.5 text-base justify-center">
              {loading ? 'Creating account...' : <span className="flex items-center gap-2"><UserPlus size={18} /> Create Account</span>}
            </button>
          </div>
        </form>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
            <CheckCircle size={14} className="text-green-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Clinical RAG</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
            <Sparkles size={14} className="text-indigo-400" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">ML Insights</span>
          </div>
        </div>

        <p className="text-center text-sm text-slate-400 mt-8">
          Already registered?{' '}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-bold tracking-tight transition-colors">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
