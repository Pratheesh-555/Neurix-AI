import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Zap, Clock, User, BarChart3, Brain } from 'lucide-react';
import Navbar  from '../components/shared/Navbar';
import Loader  from '../components/shared/Loader';
import { getChild }                      from '../api/child.api';
import { getProgramHistory, getSessions } from '../api/program.api';
import { getScreeningHistory }           from '../api/screening.api';
import { DIFFICULTY_COLORS } from '../utils/constants';

export default function ChildDetail() {
  const { id } = useParams();

  const { data: childData, isLoading, isError } = useQuery({
    queryKey: ['child', id],
    queryFn:  () => getChild(id).then(r => r.data),
  });

  const { data: histData } = useQuery({
    queryKey: ['programs', id],
    queryFn:  () => getProgramHistory(id).then(r => r.data),
  });

  const { data: sessionsData } = useQuery({
    queryKey: ['sessions', id],
    queryFn:  () => getSessions(id).then(r => r.data),
  });

  const { data: screeningData } = useQuery({
    queryKey: ['screenings', id],
    queryFn:  () => getScreeningHistory(id).then(r => r.data),
  });

  const child     = childData?.child;
  const programs  = histData?.programs || [];
  const sessions  = sessionsData?.sessions || [];
  const screenings = screeningData?.screenings || [];

  if (isLoading) return <div className="min-h-screen bg-slate-50"><Navbar /><Loader text="Loading child profile…" /></div>;
  if (isError || !child) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-16 text-center">
        <p className="text-red-500 font-medium">Child not found or failed to load</p>
        <Link to="/" className="text-indigo-600 hover:underline text-sm mt-2 inline-block">Back to dashboard</Link>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="text-slate-400 hover:text-slate-600"><ArrowLeft size={20} /></Link>
          <h1 className="text-xl font-bold text-slate-800">{child.name}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Profile card */}
            <div className="md:col-span-1 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  <User size={22} className="text-indigo-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{child.name}</p>
                  <p className="text-xs text-slate-500">{child.age} years old</p>
                </div>
              </div>
              {[
                ['Diagnosis',      child.diagnosisLevel],
                ['Communication',  child.communicationLevel],
                ['Learning Style', child.learningStyle || '—'],
                ['Session Freq.',  child.sessionFrequency || '—'],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between text-sm py-2 border-b border-slate-100 last:border-0">
                  <span className="text-slate-500">{label}</span>
                  <span className="text-slate-700 font-medium text-right max-w-[55%]">{val}</span>
                </div>
              ))}
              <div className="mt-4">
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Interests</p>
                <div className="flex flex-wrap gap-1">
                  {(child.interests || []).map(i => (
                    <span key={i} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{i}</span>
                  ))}
                </div>
              </div>
              <Link to={`/children/${id}/generate`}
                className="mt-5 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors w-full">
                <Zap size={15} /> Generate New Program
              </Link>
              <Link to={`/children/${id}/screening`}
                className="mt-2 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors w-full">
                <Brain size={15} /> Run Autism Screening
              </Link>
            </div>

            {/* Program history */}
            <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-semibold text-slate-800 mb-4">Program History</h2>
              {programs.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-slate-400 text-sm">No programs generated yet</p>
                  <Link to={`/children/${id}/generate`}
                    className="inline-flex items-center gap-1.5 mt-3 text-sm text-indigo-600 hover:underline">
                    <Zap size={13} /> Generate first program
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {programs.map(p => (
                    <Link key={p._id} to={`/programs/${p._id}`}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${p.status === 'completed' ? 'bg-green-500' : p.status === 'failed' ? 'bg-red-500' : 'bg-amber-500'}`} />
                        <div>
                          <p className="text-sm font-medium text-slate-700 group-hover:text-indigo-700">
                            Program — {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </p>
                          <p className="text-xs text-slate-400">
                            {p.status} · ₹{p.costInr?.toFixed(3)} · {p.generationTimeMs ? `${(p.generationTimeMs/1000).toFixed(1)}s` : '—'}
                          </p>
                        </div>
                      </div>
                      {p.mlPrediction?.successProbability && (
                        <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-full">
                          {p.mlPrediction.successProbability.toFixed(0)}% success
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

        {/* Session history */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-indigo-500" /> Session History
          </h2>
          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400 text-sm">No sessions run yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map(s => {
                const score = s.overallEngagementScore ?? 0;
                const scoreColor = score >= 70 ? 'text-green-700 bg-green-50'
                                 : score >= 40 ? 'text-amber-700 bg-amber-50'
                                 :               'text-red-700 bg-red-50';
                return (
                  <Link key={s._id} to={`/sessions/${s._id}/summary`}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                        <BarChart3 size={13} className="text-indigo-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700 group-hover:text-indigo-700">
                          Session — {new Date(s.sessionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-xs text-slate-400">{s.activityLogs?.length || 0} activity logs</p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${scoreColor}`}>
                      {score}% engagement
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Screening history */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm mt-6">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Brain size={16} className="text-purple-500" /> Screening History
          </h2>
          {screenings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400 text-sm">No screenings run yet</p>
              <Link to={`/children/${id}/screening`}
                className="inline-flex items-center gap-1.5 mt-3 text-sm text-purple-600 hover:underline">
                <Brain size={13} /> Run first screening
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {screenings.map(s => {
                const riskColor = s.riskLevel === 'High Risk'   ? 'text-red-700 bg-red-50'
                                : s.riskLevel === 'Medium Risk' ? 'text-amber-700 bg-amber-50'
                                :                                 'text-green-700 bg-green-50';
                return (
                  <Link key={s._id} to={`/screening/${s._id}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-purple-200 hover:bg-purple-50 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                        <Brain size={13} className="text-purple-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700 group-hover:text-purple-700">
                          Screening — {new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-xs text-slate-400">Score: {s.totalScore}/20</p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${riskColor}`}>
                      {s.riskLevel}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
