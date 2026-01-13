import React, { useState } from 'react';
import { GameState, AcademyGap } from '../../types';
import { geminiService } from '../../services/geminiService';
import { AlertTriangle, RefreshCcw, ArrowRight, Activity, Users } from 'lucide-react';

interface DiagnosisViewProps {
    gameState: GameState;
    onSelectGap: (gap: AcademyGap) => void;
}

const DiagnosisView: React.FC<DiagnosisViewProps> = ({ gameState, onSelectGap }) => {
    const [analyzing, setAnalyzing] = useState(false);
    const [gaps, setGaps] = useState<AcademyGap[]>([]);

    const runDiagnosis = async () => {
        setAnalyzing(true);
        // Consolidate data for analysis
        const tasks = gameState.buildings.flatMap(b => b.tasks);
        const dailies = gameState.dailies || [];
        const feedbacks = gameState.feedbacks || [];
        
        const results = await geminiService.diagnoseGaps(tasks, dailies, feedbacks, gameState.squads);
        setGaps(results);
        setAnalyzing(false);
    };

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Diagnóstico de Gaps</h2>
                    <p className="text-slate-400">Analise os dados da Guilda para identificar oportunidades de aprendizado.</p>
                </div>
                <button 
                    onClick={runDiagnosis}
                    disabled={analyzing}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all"
                >
                    <RefreshCcw size={20} className={analyzing ? "animate-spin" : ""}/>
                    {analyzing ? "Analisando..." : "Atualizar Diagnóstico"}
                </button>
            </div>

            {gaps.length === 0 && !analyzing ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
                    <Activity size={64} className="mb-4 opacity-20"/>
                    <p>Nenhum diagnóstico recente.</p>
                    <p className="text-sm">Clique em "Atualizar" para rodar a IA.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto custom-scrollbar pb-6">
                    {gaps.map(gap => (
                        <div key={gap.id} className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-indigo-500 transition-colors flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                    gap.urgency === 'CRÍTICO' ? 'bg-red-900 text-red-400' : 
                                    gap.urgency === 'ALTO' ? 'bg-orange-900 text-orange-400' : 'bg-yellow-900 text-yellow-400'
                                }`}>
                                    {gap.urgency}
                                </span>
                                <span className="text-slate-500 text-xs">{gap.severity}/20 Sev</span>
                            </div>
                            
                            <h3 className="text-xl font-bold text-white mb-2">{gap.skill}</h3>
                            
                            <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                                <Users size={16}/> {gap.affectedMembers.length} pessoas afetadas
                            </div>

                            <div className="bg-slate-900/50 p-3 rounded mb-6 flex-1">
                                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Evidências:</p>
                                <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                                    {gap.evidence.slice(0, 3).map((e, i) => <li key={i} className="line-clamp-1">{e}</li>)}
                                </ul>
                            </div>

                            <button 
                                onClick={() => onSelectGap(gap)}
                                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                            >
                                Gerar Curadoria <ArrowRight size={16}/>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DiagnosisView;