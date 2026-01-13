import React, { useState } from 'react';
import { User, Squad, FeedbackEntry } from '../../types';
import { geminiService } from '../../services/geminiService';
import { mentorDatabase } from '../../services/mentorDatabase';
import { MessageSquare, UserCheck, Loader2, RefreshCcw } from 'lucide-react';

interface FeedbackViewProps {
    currentUser: User;
    squads: Squad[];
    users: User[];
    sprintCycle: number;
    onSave: (entry: FeedbackEntry) => void;
}

const FeedbackView: React.FC<FeedbackViewProps> = ({ currentUser, squads, users, sprintCycle, onSave }) => {
    const [mode, setMode] = useState<'360' | 'SELF'>('360');
    const [targetUserId, setTargetUserId] = useState<string>('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<FeedbackEntry | null>(null);

    // Form States (360)
    const [qComm, setQComm] = useState('');
    const [qEmpathy, setQEmpathy] = useState('');
    const [qCollab, setQCollab] = useState('');
    const [qConflict, setQConflict] = useState('');

    // Form States (Self)
    const [qStrengths, setQStrengths] = useState('');
    const [qWeaknesses, setQWeaknesses] = useState('');
    const [qImpact, setQImpact] = useState('');
    const [qDev, setQDev] = useState('');

    const currentSquad = squads.find(s => s.id === currentUser.squadId);
    
    // Filter potential targets (Members of same squad)
    const squadMembers = users.filter(u => u.squadId === currentUser.squadId && u.id !== currentUser.id);

    const handleSubmit = async () => {
        setIsAnalyzing(true);

        const relationship = mode === 'SELF' 
            ? 'SELF' 
            : currentUser.role === 'Mentor Júnior' 
                ? 'MENTOR_TO_EXECUTOR' 
                : 'EXECUTOR_TO_MENTOR';

        const partialData = mode === 'SELF' 
            ? { q_strengths: qStrengths, q_weaknesses: qWeaknesses, q_impact: qImpact, q_development: qDev }
            : { q_comm: qComm, q_empathy: qEmpathy, q_collab: qCollab, q_conflict: qConflict };

        const analysis = await geminiService.analyzeFeedback({
            relationship,
            ...partialData
        });

        const newEntry: FeedbackEntry = {
            id: Math.random().toString(36).substr(2, 9),
            squadId: currentUser.squadId,
            sourceUserId: currentUser.id,
            targetUserId: mode === 'SELF' ? currentUser.id : targetUserId,
            sprint: sprintCycle,
            relationship,
            timestamp: Date.now(),
            ...partialData,
            analysis
        };

        mentorDatabase.saveFeedback(newEntry);
        onSave(newEntry);
        setResult(newEntry);
        setIsAnalyzing(false);
    };

    const resetForm = () => {
        setResult(null);
        setQComm(''); setQEmpathy(''); setQCollab(''); setQConflict('');
        setQStrengths(''); setQWeaknesses(''); setQImpact(''); setQDev('');
    };

    if (result) {
        return (
            <div className="flex flex-col items-center justify-center h-full animate-in zoom-in-95">
                <div className="bg-slate-800 border border-slate-600 rounded-xl p-8 max-w-2xl w-full shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold text-white">Análise Concluída</h3>
                        <div className={`px-4 py-1 rounded-full text-sm font-bold ${
                            result.analysis?.relationshipHealth === 'SAUDAVEL' ? 'bg-green-900 text-green-400' : 'bg-yellow-900 text-yellow-400'
                        }`}>
                            {result.analysis?.relationshipHealth}
                        </div>
                    </div>

                    <div className="flex gap-4 mb-8">
                        <div className="flex-1 bg-slate-900 rounded p-4 text-center border border-slate-700">
                            <div className="text-sm text-slate-400 uppercase mb-1">Score de Sentimento</div>
                            <div className="text-4xl font-bold text-indigo-400">{result.analysis?.sentimentScore}</div>
                        </div>
                        <div className="flex-1 bg-slate-900 rounded p-4 text-center border border-slate-700">
                            <div className="text-sm text-slate-400 uppercase mb-1">Tom Emocional</div>
                            <div className="text-xl font-bold text-white">{result.analysis?.emotionalTone}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                            <h4 className="text-green-400 font-bold mb-2 flex items-center gap-2"><UserCheck size={16}/> Pontos Fortes</h4>
                            <ul className="list-disc list-inside text-sm text-slate-300">
                                {result.analysis?.strengths.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-orange-400 font-bold mb-2 flex items-center gap-2"><RefreshCcw size={16}/> Oportunidades</h4>
                            <ul className="list-disc list-inside text-sm text-slate-300">
                                {result.analysis?.gaps.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                    </div>

                    <div className="bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-lg mb-6">
                        <h4 className="font-bold text-indigo-300 mb-2 text-sm uppercase">Recomendações do Mentor</h4>
                        <ul className="space-y-1 text-sm text-indigo-100">
                             {result.analysis?.recommendations.map((r, i) => (
                                 <li key={i} className="flex gap-2"><span className="text-indigo-500">•</span> {r}</li>
                             ))}
                        </ul>
                    </div>

                    <button onClick={resetForm} className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg">
                        Realizar Nova Avaliação
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto h-full overflow-y-auto custom-scrollbar p-2">
            <div className="flex gap-4 mb-6">
                <button 
                    onClick={() => setMode('360')}
                    className={`flex-1 py-4 rounded-xl border-2 font-bold transition-all ${mode === '360' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                >
                    <div className="flex flex-col items-center gap-1">
                        <MessageSquare size={24}/>
                        <span>Avaliação 360°</span>
                        <span className="text-[10px] font-normal opacity-70">Avaliar Colegas</span>
                    </div>
                </button>
                <button 
                    onClick={() => setMode('SELF')}
                    className={`flex-1 py-4 rounded-xl border-2 font-bold transition-all ${mode === 'SELF' ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                >
                    <div className="flex flex-col items-center gap-1">
                        <UserCheck size={24}/>
                        <span>Autoavaliação</span>
                        <span className="text-[10px] font-normal opacity-70">Reflexão Pessoal</span>
                    </div>
                </button>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    {mode === '360' ? `Avaliar Colega (Sprint ${sprintCycle})` : `Reflexão Pessoal (Sprint ${sprintCycle})`}
                </h3>
                
                {mode === '360' && (
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Quem você está avaliando?</label>
                        <select 
                            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white"
                            value={targetUserId}
                            onChange={(e) => setTargetUserId(e.target.value)}
                        >
                            <option value="">Selecione um membro...</option>
                            {squadMembers.map(u => (
                                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* FORM FIELDS */}
                <div className="space-y-6">
                    {mode === '360' ? (
                        <>
                            <div>
                                <label className="block text-sm font-bold text-slate-200 mb-1">1. Comunicação</label>
                                <p className="text-xs text-slate-500 mb-2">Como essa pessoa se comunicou com a equipe?</p>
                                <textarea value={qComm} onChange={e => setQComm(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white text-sm" rows={3} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-200 mb-1">2. Empatia e Abertura</label>
                                <p className="text-xs text-slate-500 mb-2">Demonstrou abertura para opiniões divergentes?</p>
                                <textarea value={qEmpathy} onChange={e => setQEmpathy(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white text-sm" rows={3} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-200 mb-1">3. Colaboração</label>
                                <p className="text-xs text-slate-500 mb-2">Como contribuiu para o clima de confiança?</p>
                                <textarea value={qCollab} onChange={e => setQCollab(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white text-sm" rows={3} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-200 mb-1">4. Gestão de Conflitos</label>
                                <p className="text-xs text-slate-500 mb-2">Como agiu diante de divergências?</p>
                                <textarea value={qConflict} onChange={e => setQConflict(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white text-sm" rows={3} />
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-bold text-slate-200 mb-1">1. Pontos Fortes</label>
                                <p className="text-xs text-slate-500 mb-2">O que você fez de melhor nesta sprint?</p>
                                <textarea value={qStrengths} onChange={e => setQStrengths(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white text-sm" rows={3} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-200 mb-1">2. Pontos de Melhoria</label>
                                <p className="text-xs text-slate-500 mb-2">O que poderia ter sido mais eficiente?</p>
                                <textarea value={qWeaknesses} onChange={e => setQWeaknesses(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white text-sm" rows={3} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-200 mb-1">3. Impacto na Equipe</label>
                                <p className="text-xs text-slate-500 mb-2">Como suas ações afetaram o time?</p>
                                <textarea value={qImpact} onChange={e => setQImpact(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white text-sm" rows={3} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-200 mb-1">4. Desenvolvimento Futuro</label>
                                <p className="text-xs text-slate-500 mb-2">O que quer aprender na próxima sprint?</p>
                                <textarea value={qDev} onChange={e => setQDev(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white text-sm" rows={3} />
                            </div>
                        </>
                    )}

                    <button 
                        onClick={handleSubmit}
                        disabled={isAnalyzing || (mode === '360' && !targetUserId)}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-lg shadow-lg flex items-center justify-center gap-2 mt-6"
                    >
                         {isAnalyzing ? <Loader2 className="animate-spin" /> : <MessageSquare size={20} />}
                         {isAnalyzing ? 'Gerando Análise IA...' : `Gerar Análise ${mode === '360' ? '360°' : 'Autoavaliação'}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeedbackView;
