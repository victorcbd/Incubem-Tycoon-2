import React from 'react';
import { LearningTrack, UserTrackProgress } from '../../types';
import { TrendingUp, Users, CheckCircle2, BarChart3 } from 'lucide-react';

interface ImpactViewProps {
    tracks: LearningTrack[];
    allProgress: UserTrackProgress[];
}

const ImpactView: React.FC<ImpactViewProps> = ({ tracks, allProgress }) => {
    const totalCompletions = allProgress.filter(p => p.completed).length;
    const engagementRate = 68; // Mocked for visuals, normally calculated from active users vs total users
    const gapsResolved = 3; // Mocked

    return (
        <div className="p-6 h-full overflow-y-auto custom-scrollbar">
            <h2 className="text-2xl font-bold text-white mb-6">Métricas de Impacto</h2>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <div className="text-xs font-bold text-slate-400 uppercase mb-1">Trilhas Publicadas</div>
                    <div className="text-3xl font-bold text-white">{tracks.length}</div>
                </div>
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <div className="text-xs font-bold text-slate-400 uppercase mb-1">Engajamento</div>
                    <div className="text-3xl font-bold text-blue-400">{engagementRate}%</div>
                </div>
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <div className="text-xs font-bold text-slate-400 uppercase mb-1">Conclusões</div>
                    <div className="text-3xl font-bold text-green-400">{totalCompletions}</div>
                </div>
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <div className="text-xs font-bold text-slate-400 uppercase mb-1">Gaps Resolvidos</div>
                    <div className="text-3xl font-bold text-indigo-400">{gapsResolved}</div>
                </div>
            </div>

            {/* Impact List */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-700 bg-slate-900/50 font-bold text-slate-300">
                    Efetividade por Trilha
                </div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-900 text-slate-400 uppercase text-xs">
                        <tr>
                            <th className="p-4">Trilha</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Impacto na Performance</th>
                            <th className="p-4 text-right">Conclusão</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {tracks.map(track => (
                            <tr key={track.id} className="hover:bg-slate-700/30">
                                <td className="p-4 font-bold text-white">{track.title}</td>
                                <td className="p-4">
                                    <span className="bg-green-900/30 text-green-400 px-2 py-1 rounded text-xs font-bold">MELHORANDO</span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="text-green-400 font-mono">+32% AIM</div>
                                    <div className="text-xs text-slate-500">-15% Bloqueios</div>
                                </td>
                                <td className="p-4 text-right font-mono text-white">45%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ImpactView;