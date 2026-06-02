import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { register, googleSignIn } from '../../api/auth.api';
import useAuthStore from '../../store/authStore';
import { useToast } from '../shared/Toast';

function Field({ label, id, name, type = 'text', placeholder, required = true, value, onChange }) {
  return (
    <div>
      <label
        htmlFor={id}
        style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'rgba(255,255,255,0.9)' }}
      >
        {label}{required && ' *'}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '11px 14px',
          borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.3)',
          background: 'rgba(255,255,255,0.15)',
          color: '#fff',
          fontSize: '0.9rem',
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.2s',
        }}
        onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.7)'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.3)'}
      />
    </div>
  );
}

export default function Register() {
  const [form, setForm]       = useState({ name: '', email: '', password: '', licenseNumber: '', organization: '' });
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
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

  const handleGoogleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGLoading(true);
      try {
        const { data } = await googleSignIn(tokenResponse.access_token);
        if (data.needsProfile) {
          sessionStorage.setItem('tempToken', data.tempToken);
          navigate('/complete-profile');
        } else {
          setAuth(data.token, data.user);
          navigate('/');
        }
      } catch (err) {
        toast(err.response?.data?.error || 'Google sign-up failed', 'error');
      } finally {
        setGLoading(false);
      }
    },
    onError: () => toast('Google sign-in was cancelled or failed', 'error'),
    flow: 'implicit',
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.12)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.25)',
        boxShadow: '0 32px 64px rgba(0,0,0,0.25)',
        width: '100%',
        maxWidth: '440px',
        padding: '2.5rem',
        color: '#fff',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '50px',
            padding: '10px 20px',
            marginBottom: '1.25rem',
          }}>
            <Brain size={22} style={{ color: '#fff' }} />
            <span style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Neurix AI</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, letterSpacing: '-0.03em' }}>
            Create Account
          </h1>
          <p style={{ margin: '0.5rem 0 0', opacity: 0.75, fontSize: '0.9rem' }}>
            Join your clinical workspace
          </p>
        </div>

        {/* Google Sign-Up Button */}
        <button
          id="google-signup-btn"
          type="button"
          disabled={gLoading || loading}
          onClick={() => handleGoogleSignup()}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            background: '#fff',
            color: '#1f2937',
            border: 'none',
            borderRadius: '12px',
            padding: '12px',
            fontSize: '0.925rem',
            fontWeight: 600,
            cursor: gLoading ? 'not-allowed' : 'pointer',
            opacity: gLoading ? 0.7 : 1,
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
          onMouseEnter={e => { if (!gLoading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)'; } }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)'; }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {gLoading ? 'Connecting…' : 'Sign up with Google'}
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '1.5rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.25)' }} />
          <span style={{ opacity: 0.6, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>or register with email</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.25)' }} />
        </div>

        {/* Email Registration Form */}
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <Field id="reg-name"    label="Full Name"      name="name"          value={form.name}          onChange={handle} placeholder="Dr. Priya Sharma" />
          <Field id="reg-email"   label="Email"          name="email"         value={form.email}         onChange={handle} type="email" placeholder="bcba@clinic.com" />
          <Field id="reg-pw"      label="Password"       name="password"      value={form.password}      onChange={handle} type="password" placeholder="Min 8 characters" />
          <Field id="reg-license" label="BCBA License #" name="licenseNumber" value={form.licenseNumber} onChange={handle} placeholder="BCBA-12345" />
          <Field id="reg-org"     label="Organization"   name="organization"  value={form.organization}  onChange={handle} placeholder="Sunshine ABA Centre" required={false} />

          <button
            id="register-submit-btn"
            type="submit"
            disabled={loading || gLoading}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.22)',
              border: '1px solid rgba(255,255,255,0.4)',
              color: '#fff',
              fontWeight: 700,
              padding: '12px',
              borderRadius: '12px',
              fontSize: '0.95rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              marginTop: '0.25rem',
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = 'rgba(255,255,255,0.32)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.22)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.85rem', marginTop: '1.5rem', opacity: 0.75 }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: '#fff', fontWeight: 700, textDecoration: 'underline' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
