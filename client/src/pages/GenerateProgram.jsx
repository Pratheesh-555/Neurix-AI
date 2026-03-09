import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import Navbar          from '../components/shared/Navbar';
import ProgramGenerator from '../components/program/ProgramGenerator';
import { getChild }    from '../api/child.api';

export default function GenerateProgram() {
  const { id } = useParams();

  const { data } = useQuery({
    queryKey: ['child', id],
    queryFn:  () => getChild(id).then(r => r.data),
  });

  const child = data?.child;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link to={`/children/${id}`} className="text-slate-400 hover:text-slate-600"><ArrowLeft size={20} /></Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              Generate Program{child ? ` for ${child.name}` : ''}
            </h1>
            {child && (
              <p className="text-slate-500 text-sm">
                {child.diagnosisLevel} · {child.communicationLevel} · {child.age} yrs
              </p>
            )}
          </div>
        </div>
        <ProgramGenerator childId={id} />
      </main>
    </div>
  );
}
