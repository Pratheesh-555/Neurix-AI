import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, BadgeCheck } from 'lucide-react';
import { completeProfile } from '../api/auth.api';
import useAuthStore from '../store/authStore';
import { useToast } from '../components/shared/Toast';

export default function CompleteProfile() {
  const [form, setForm]       = useState({ licenseNumber: '', organization: '' });
  const [loading, setLoading] = useState(false);
  const { setAuth }           = useAuthStore();
  const toast                 = useToast();
  const navigate              = useNavigate();
  const tempToken             = sessionStorage.getItem('tempToken');

  // If no temp token present, redirect to login
  useEffect(() => {
    if (!tempToken) navigate('/login', { replace: true });
  }, [tempToken, navigate]);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.licenseNumber.trim()) return toast('BCBA License number is required', 'error');
    setLoading(true);
    try {
      const { data } = await completeProfile(form, tempToken);
      sessionStorage.removeItem('tempToken');
      setAuth(data.token, data.user);
      toast('Profile complete — welcome to Neurix AI!', 'success');
      navigate('/');
    } catch (err) {
      toast(err.response?.data?.error || 'Could not save profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
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
  };

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
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            marginBottom: '1.25rem',
          }}>
            <BadgeCheck size={32} style={{ color: '#fff' }} />
          </div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '50px',
            padding: '6px 16px',
            marginBottom: '1rem',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}>
            <Brain size={14} />
            Neurix AI
          </div>
          <h1 style={{ fontSize: '1.7rem', fontWeight: 700, margin: 0, letterSpacing: '-0.03em' }}>
            One last step
          </h1>
          <p style={{ margin: '0.6rem 0 0', opacity: 0.75, fontSize: '0.9rem', lineHeight: 1.5 }}>
            Since Neurix AI is a clinical tool, we need your BCBA credentials before you can access the workspace.
          </p>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* License Number */}
          <div>
            <label
              htmlFor="license-input"
              style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', opacity: 0.9 }}
            >
              BCBA License # *
            </label>
            <input
              id="license-input"
              name="licenseNumber"
              type="text"
              value={form.licenseNumber}
              onChange={handle}
              required
              placeholder="BCBA-12345"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.7)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.3)'}
            />
          </div>

          {/* Organization */}
          <div>
            <label
              htmlFor="org-input"
              style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', opacity: 0.9 }}
            >
              Organization <span style={{ opacity: 0.6, fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              id="org-input"
              name="organization"
              type="text"
              value={form.organization}
              onChange={handle}
              placeholder="Sunshine ABA Centre"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.7)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.3)'}
            />
          </div>

          <button
            id="complete-profile-btn"
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: '#fff',
              color: '#6d28d9',
              border: 'none',
              borderRadius: '12px',
              padding: '13px',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s ease',
              marginTop: '0.5rem',
              boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)'; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.15)'; }}
          >
            {loading ? 'Saving…' : 'Complete Setup & Enter Workspace'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.8rem', marginTop: '1.25rem', opacity: 0.6, lineHeight: 1.5 }}>
          🔒 Your credentials are stored securely and never shared.
        </p>
      </div>
    </div>
  );
}
