import { Brain } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <Link to="/" className="flex items-center gap-2 font-bold text-indigo-600 text-lg">
        <Brain size={22} />
        Neurix AI
      </Link>

      <div className="flex items-center gap-6 text-sm">
        <Link to="/"           className="text-slate-600 hover:text-indigo-600 transition-colors">Dashboard</Link>
        <Link to="/analytics"  className="text-slate-600 hover:text-indigo-600 transition-colors">Analytics</Link>
        <div className="flex items-center gap-3 ml-4 pl-4 border-l border-slate-200">
          <span className="text-slate-500">{user?.name}</span>
          <button
            onClick={logout}
            className="text-red-500 hover:text-red-700 transition-colors font-medium"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
