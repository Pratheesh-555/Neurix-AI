import { Link, useParams } from 'react-router-dom';
import { useQuery }        from '@tanstack/react-query';
import { ArrowLeft }       from 'lucide-react';
import Navbar        from '../components/shared/Navbar';
import Loader        from '../components/shared/Loader';
import ProgramDisplay from '../components/program/ProgramDisplay';
import { getProgram } from '../api/program.api';

export default function ProgramView() {
  const { id } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ['program', id],
    queryFn:  () => getProgram(id).then(r => r.data),
  });

  const program = data?.program;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="text-slate-400 hover:text-slate-600"><ArrowLeft size={20} /></Link>
          <h1 className="text-xl font-bold text-slate-800">Program Details</h1>
        </div>

        {isLoading ? (
          <Loader text="Loading program…" />
        ) : program ? (
          <ProgramDisplay program={program} childId={program.childId?._id || program.childId} />
        ) : (
          <div className="text-center py-16">
            <p className="text-slate-400">Program not found</p>
            <Link to="/" className="text-indigo-600 hover:underline text-sm mt-2 inline-block">Back to dashboard</Link>
          </div>
        )}
      </main>
    </div>
  );
}
