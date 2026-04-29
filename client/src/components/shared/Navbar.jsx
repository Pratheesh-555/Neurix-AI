import { Brain, LayoutDashboard, BarChart3, LogOut, Sparkles } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate  = useNavigate();
  const { pathname } = useLocation();

  const navLinks = [
    { to: '/',          label: 'Dashboard', icon: <LayoutDashboard size={15} /> },
    { to: '/analytics', label: 'Analytics',  icon: <BarChart3 size={15} /> },
  ];

  return (
    <nav className="glass sticky top-0 z-50 px-6 py-3 flex items-center justify-between"
         style={{ borderBottom: '1px solid rgba(255,255,255,0.4)', borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>

      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5 group">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
             style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 2px 8px rgba(99,102,241,0.4)' }}>
          <Brain size={16} className="text-white" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="font-bold text-slate-800 text-sm tracking-tight">Neurix <span style={{ color: '#6366f1' }}>AI</span></span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">BCBA Copilot</span>
        </div>
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-1">
        {navLinks.map(link => {
          const active = pathname === link.to;
          return (
            <Link key={link.to} to={link.to}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: active ? 'rgba(99,102,241,0.1)' : 'transparent',
                color:      active ? '#6366f1' : '#64748b',
              }}>
              {link.icon}
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* Right: user + sign out */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
             style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.1)' }}>
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
               style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            {user?.name?.[0]?.toUpperCase() || 'B'}
          </div>
          <span className="text-sm text-slate-600 font-medium">{user?.name?.split(' ')[0]}</span>
        </div>

        <button onClick={() => { logout(); navigate('/login'); }}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-red-500 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-50">
          <LogOut size={14} />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </nav>
  );
}
