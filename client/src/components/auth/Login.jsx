import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Eye, EyeOff } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { login, googleSignIn } from '../../api/auth.api';
import useAuthStore from '../../store/authStore';
import { useToast } from '../shared/Toast';

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
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

  const handleGoogleSuccess = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGLoading(true);
      try {
        // tokenResponse.access_token is for the userinfo endpoint,
        // but we need the ID token — use credential flow instead.
        // We'll pass access_token and exchange it on our backend.
        const { data } = await googleSignIn(tokenResponse.access_token);
        if (data.needsProfile) {
          // Store temp token in sessionStorage for the profile page
          sessionStorage.setItem('tempToken', data.tempToken);
          navigate('/complete-profile');
        } else {
          setAuth(data.token, data.user);
          navigate('/');
        }
      } catch (err) {
        toast(err.response?.data?.error || 'Google sign-in failed', 'error');
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
        maxWidth: '420px',
        padding: '2.5rem',
        color: '#fff',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
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
            Welcome back
          </h1>
          <p style={{ margin: '0.5rem 0 0', opacity: 0.75, fontSize: '0.9rem' }}>
            Sign in to your clinical workspace
          </p>
        </div>

        {/* Google Sign-In Button */}
        <button
          id="google-signin-btn"
          type="button"
          disabled={gLoading || loading}
          onClick={() => handleGoogleSuccess()}
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
          onMouseEnter={e => { if (!gLoading) e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)'; }}
        >
          {/* Google SVG logo */}
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {gLoading ? 'Signing in…' : 'Continue with Google'}
        </button>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          margin: '1.5rem 0',
        }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.25)' }} />
          <span style={{ opacity: 0.6, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>or sign in with email</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.25)' }} />
        </div>

        {/* Email/Password Form */}
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', opacity: 0.9 }}>
              Email
            </label>
            <input
              id="email-input"
              name="email"
              type="email"
              value={form.email}
              onChange={handle}
              required
              placeholder="bcba@clinic.com"
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

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', opacity: 0.9 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password-input"
                name="password"
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={handle}
                required
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '11px 42px 11px 14px',
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
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPw(s => !s)}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)',
                  padding: 0, display: 'flex', alignItems: 'center',
                }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            id="signin-submit-btn"
            type="submit"
            disabled={loading || gLoading}
            style={{
              width: '100%',
              background: loading ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.22)',
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
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.85rem', marginTop: '1.5rem', opacity: 0.75 }}>
          New BCBA?{' '}
          <Link to="/register" style={{ color: '#fff', fontWeight: 700, textDecoration: 'underline' }}>
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
