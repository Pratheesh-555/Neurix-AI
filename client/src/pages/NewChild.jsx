import Navbar          from '../components/shared/Navbar';
import ChildProfileForm from '../components/child/ChildProfileForm';
import { ArrowLeft }   from 'lucide-react';
import { Link }        from 'react-router-dom';

export default function NewChild() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/" className="text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Add New Child</h1>
            <p className="text-slate-500 text-sm">Complete the 5-step profile for accurate program generation</p>
          </div>
        </div>
        <ChildProfileForm />
      </main>
    </div>
  );
}
