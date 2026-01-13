import React, { useMemo } from 'react';
import { User, Squad, DailyEntry, FeedbackEntry } from '../../types';
import { TrendingUp, AlertTriangle, Activity, UserCheck } from 'lucide-react';

interface DashboardViewProps {
  dailies: DailyEntry[];
  feedbacks: FeedbackEntry[];
  currentUser: User;
  users: User[];
  squads: Squad[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ dailies, feedbacks, currentUser, squads, users }) => {
  const isMaster = currentUser.role === 'Master';
  const isMentor = currentUser.role === 'Mentor Júnior';
  
  // --- PRIVACY & FILTERING LOGIC ---
  
  const filteredDailies = useMemo(() => {
      if (isMaster) return dailies;
      // Mentor sees their squad
      if (isMentor) return dailies.filter(d => d.squadId === currentUser.squadId);
      // Executor sees all squad dailies (as per transparency requirement "Dailies de toda squad") 
      return dailies.filter(d => d.squadId === currentUser.squadId);
  }, [dailies, currentUser, isMaster, isMentor]);

  const filteredFeedbacks = useMemo(() => {
      if (isMaster) return feedbacks;
      if (isMentor) {
          return feedbacks.filter(f => 
              f.squadId === currentUser.squadId && 
              // Don't show feedback ABOUT me from Executors (Bias prevention)
              !(f.relationship === 'EXECUTOR_TO_MENTOR' && f.targetUserId === currentUser.id)
          );
      }
      // Executor
      return feedbacks.filter(f => 
        // Own Self Evals
        (f.relationship === 'SELF' && f.sourceUserId === currentUser.id) ||
        // 360s GIVEN by Executor
        (f.sourceUserId === currentUser.id)
      );
  }, [feedbacks, currentUser, isMaster, isMentor]);


  // --- METRICS CALCULATION ---
  const productiveCount = filteredDailies.filter(d => d.analysis?.status === 'PRODUTIVO').length;
  const riskCount = filteredDailies.filter(d => d.analysis?.riskDetected).length;
  const avgSentiment = filteredFeedbacks.length 
      ? Math.round(filteredFeedbacks.reduce((acc, f) => acc + (f.analysis?.sentimentScore || 0), 0) / filteredFeedbacks.length)
      : 0;

  // Chart Data (Status Distro)
  const statusCounts = {
      'PRODUTIVO': filteredDailies.filter(d => d.analysis?.status === 'PRODUTIVO').length,
      'REGULAR': filteredDailies.filter(d => d.analysis?.status === 'REGULAR').length,
      'ATENCAO': filteredDailies.filter(d => d.analysis?.status === 'ATENCAO').length,
  };
  const totalDailies = filteredDailies.length || 1;

  // Top Skills
  const skillTags: Record<string, number> = {};
  filteredDailies.forEach(d => {
      d.analysis?.tags.forEach(tag => {
          skillTags[tag] = (skillTags[tag] || 0) + 1;
      });
  });
  const topSkills = Object.entries(skillTags).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="space-y-6 h-full overflow-y-auto custom-scrollbar p-2">
       {/* HEADLINE STATS */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
               <div className="text-xs font-bold text-slate-400 uppercase mb-1">Check-ins Visíveis</div>
               <div className="text-3xl font-bold text-white">{filteredDailies.length}</div>
           </div>
           <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
               <div className="text-xs font-bold text-slate-400 uppercase mb-1">Índice Produtividade</div>
               <div className="text-3xl font-bold text-green-400">{Math.round((productiveCount / totalDailies) * 100)}%</div>
           </div>
           <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
               <div className="text-xs font-bold text-slate-400 uppercase mb-1">Clima Emocional (360)</div>
               <div className="text-3xl font-bold text-indigo-400">{avgSentiment}/100</div>
           </div>
           <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
               <div className="text-xs font-bold text-slate-400 uppercase mb-1">Riscos Ativos</div>
               <div className="text-3xl font-bold text-red-400 flex items-center gap-2">
                   {riskCount} {riskCount > 0 && <AlertTriangle className="animate-pulse" size={24}/>}
               </div>
           </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           
           {/* STATUS DISTRIBUTION CHART */}
           <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
               <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                   <Activity size={20} className="text-yellow-400"/> Distribuição de Status
               </h3>
               <div className="flex flex-col gap-4">
                    {Object.entries(statusCounts).map(([status, count]) => {
                        const pct = Math.round((count / totalDailies) * 100);
                        const color = status === 'PRODUTIVO' ? 'bg-green-500' : status === 'REGULAR' ? 'bg-yellow-500' : 'bg-red-500';
                        return (
                            <div key={status}>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-300 font-bold">{status}</span>
                                    <span className="text-slate-400">{count} ({pct}%)</span>
                                </div>
                                <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden">
                                    <div className={`h-full ${color}`} style={{ width: `${pct}%` }}></div>
                                </div>
                            </div>
                        )
                    })}
               </div>
           </div>

           {/* TOP SKILLS */}
           <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
               <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                   <TrendingUp size={20} className="text-indigo-400"/> Top Skills Emergentes
               </h3>
               <div className="flex flex-wrap gap-2">
                   {topSkills.map(([skill, count], i) => (
                       <div key={skill} className="bg-indigo-900/40 border border-indigo-500/30 px-3 py-2 rounded-lg flex items-center gap-2">
                           <span className="text-indigo-300 font-bold text-sm">{skill}</span>
                           <span className="bg-indigo-800 text-white text-[10px] px-1.5 rounded-full">{count}</span>
                       </div>
                   ))}
                   {topSkills.length === 0 && <p className="text-slate-500 italic">Nenhuma skill identificada ainda.</p>}
               </div>
           </div>

           {/* INSIGHTS / ADVICE */}
           <div className="lg:col-span-2 bg-gradient-to-r from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700">
               <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                   <UserCheck size={20} className="text-purple-400"/> Conselho Estratégico (IA)
               </h3>
               <div className="bg-slate-900/50 p-4 rounded-lg border-l-4 border-purple-500">
                   <p className="text-slate-300 text-sm leading-relaxed">
                       {riskCount > 2 
                         ? "A squad apresenta sinais de bloqueio consistentes. Recomenda-se uma reunião de alinhamento urgente para tratar dos impedimentos técnicos. Foque em desbloquear o fluxo antes de adicionar novas tarefas."
                         : productiveCount > totalDailies * 0.7 
                            ? "Excelente tração! A equipe está em ritmo de alta performance. O momento é ideal para desafiar o grupo com tarefas de maior complexidade técnica ou inovação, aproveitando a confiança elevada."
                            : "A consistência está estável, mas há espaço para otimização. Incentive o registro mais detalhado dos planejamentos diários para aumentar a clareza das entregas."
                       }
                   </p>
               </div>
           </div>
       </div>

        {/* FEEDBACK LIST SAMPLE */}
       <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4">Feedbacks Recentes</h3>
            <div className="space-y-3">
                {filteredFeedbacks.slice(0, 5).map(f => {
                    const source = users.find(u => u.id === f.sourceUserId);
                    const target = users.find(u => u.id === f.targetUserId);
                    return (
                        <div key={f.id} className="p-3 bg-slate-900/50 rounded border border-slate-700 flex justify-between items-center">
                            <div>
                                <span className="text-xs font-bold text-indigo-300 uppercase">{f.relationship}</span>
                                <div className="text-sm text-slate-300 mt-1">
                                    <span className="text-white font-bold">{source?.name}</span> avaliou <span className="text-white font-bold">{target?.name}</span>
                                </div>
                            </div>
                            <div className={`px-2 py-1 rounded text-xs font-bold ${f.analysis?.relationshipHealth === 'SAUDAVEL' ? 'text-green-400 bg-green-900/20' : 'text-yellow-400 bg-yellow-900/20'}`}>
                                {f.analysis?.relationshipHealth}
                            </div>
                        </div>
                    )
                })}
                {filteredFeedbacks.length === 0 && <p className="text-slate-500 text-sm">Nenhum feedback disponível.</p>}
            </div>
       </div>
    </div>
  );
};

export default DashboardView;
