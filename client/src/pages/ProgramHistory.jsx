import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Zap } from 'lucide-react';
import Navbar  from '../components/shared/Navbar';
import Loader  from '../components/shared/Loader';
import { getProgramHistory } from '../api/program.api';
import { getChild }          from '../api/child.api';

export default function ProgramHistory() {
  const { id } = useParams();

  const { data: childData }  = useQuery({ queryKey: ['child', id], queryFn: () => getChild(id).then(r => r.data) });
  const { data: histData, isLoading } = useQuery({ queryKey: ['programs', id], queryFn: () => getProgramHistory(id).then(r => r.data) });

  const child    = childData?.child;
  const programs = histData?.programs || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link to={`/children/${id}`} className="text-slate-400 hover:text-slate-600"><ArrowLeft size={20} /></Link>
          <h1 className="text-xl font-bold text-slate-800">
            {child ? `${child.name}'s Programs` : 'Program History'}
          </h1>
        </div>

        {isLoading ? <Loader /> : programs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-400">No programs yet</p>
            <Link to={`/children/${id}/generate`}
              className="inline-flex items-center gap-2 mt-3 text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
              <Zap size={14} /> Generate First Program
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {programs.map(p => (
              <Link key={p._id} to={`/programs/${p._id}`}
                className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-sm transition-all group">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${p.status === 'completed' ? 'bg-green-500' : p.status === 'failed' ? 'bg-red-500' : 'bg-amber-400'}`} />
                  <div>
                    <p className="font-medium text-slate-800 group-hover:text-indigo-700">
                      {new Date(p.createdAt).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {p.status} · ₹{p.costInr?.toFixed(3)} · Gen time: {p.generationTimeMs ? `${(p.generationTimeMs/1000).toFixed(1)}s` : '—'}
                    </p>
                  </div>
                </div>
                {p.mlPrediction?.successProbability && (
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">{p.mlPrediction.successProbability.toFixed(0)}%</p>
                    <p className="text-xs text-slate-400">success prob.</p>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
