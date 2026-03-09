import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain } from 'lucide-react';
import { register } from '../../api/auth.api';
import useAuthStore from '../../store/authStore';
import { useToast } from '../shared/Toast';

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

  const Field = ({ label, name, type = 'text', placeholder, required = true }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}{required && ' *'}</label>
      <input
        name={name} type={type} value={form[name]} onChange={handle} required={required}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <div className="flex items-center gap-2 justify-center mb-6">
          <Brain size={28} className="text-indigo-600" />
          <h1 className="text-2xl font-bold text-slate-800">Create Account</h1>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <Field label="Full Name"       name="name"          placeholder="Dr. Priya Sharma" />
          <Field label="Email"           name="email"         type="email" placeholder="bcba@clinic.com" />
          <Field label="Password"        name="password"      type="password" placeholder="Min 8 characters" />
          <Field label="BCBA License #"  name="licenseNumber" placeholder="BCBA-12345" />
          <Field label="Organization"    name="organization"  placeholder="Sunshine ABA Centre" required={false} />

          <button disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm mt-2">
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already registered?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
