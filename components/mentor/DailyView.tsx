import React, { useState } from 'react';
import { User, DailyEntry, Squad } from '../../types';
import { geminiService } from '../../services/geminiService';
import { mentorDatabase } from '../../services/mentorDatabase';
import { Send, Clock, CheckCircle2, AlertTriangle, AlertCircle, Loader2 } from 'lucide-react';

interface DailyViewProps {
    currentUser: User;
    currentSquad?: Squad;
    onSave: (entry: DailyEntry) => void;
    existingDailies: DailyEntry[];
}

const DailyView: React.FC<DailyViewProps> = ({ currentUser, currentSquad, onSave, existingDailies }) => {
    const [yesterday, setYesterday] = useState('');
    const [today, setToday] = useState('');
    const [blockers, setBlockers] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Check if already submitted today
    const todayStr = new Date().toISOString().split('T')[0];
    const hasSubmittedToday = existingDailies.some(
        d => d.userId === currentUser.id && d.date === todayStr
    );

    const handleSubmit = async () => {
        if (!yesterday || !today) return;

        setIsAnalyzing(true);
        
        const partialEntry = {
            yesterday,
            today,
            blockers: blockers || 'Nenhum',
            memberName: currentUser.name,
            role: currentUser.role || 'Executor',
            date: todayStr
        };

        const analysis = await geminiService.analyzeDaily(partialEntry);

        const newEntry: DailyEntry = {
            id: Math.random().toString(36).substr(2, 9),
            userId: currentUser.id,
            squadId: currentUser.squadId,
            ...partialEntry,
            timestamp: Date.now(),
            analysis
        };

        mentorDatabase.saveDaily(newEntry);
        onSave(newEntry);
        setIsAnalyzing(false);
        
        // Reset form
        setYesterday('');
        setToday('');
        setBlockers('');
    };

    const myHistory = existingDailies
        .filter(d => d.userId === currentUser.id)
        .sort((a, b) => b.timestamp - a.timestamp);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* LEFT: FORM */}
            <div className="flex flex-col gap-4">
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <h3 className="text-white font-bold mb-1 flex items-center gap-2">
                        <Clock size={20} className="text-indigo-400"/> Daily Check-in
                    </h3>
                    <p className="text-slate-400 text-xs mb-4">
                        {todayStr} • {currentSquad?.name}
                    </p>

                    {hasSubmittedToday ? (
                        <div className="bg-green-900/20 border border-green-500/50 p-4 rounded-lg text-center">
                            <CheckCircle2 size={32} className="text-green-500 mx-auto mb-2"/>
                            <p className="text-green-200 font-bold">Daily Enviada!</p>
                            <p className="text-xs text-green-300">Volte amanhã para registrar novo progresso.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                                    1. O que você fez de ontem para hoje?
                                </label>
                                <textarea
                                    className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white text-sm focus:border-indigo-500 outline-none"
                                    rows={3}
                                    placeholder="Foco em entregas e aprendizados..."
                                    value={yesterday}
                                    onChange={e => setYesterday(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                                    2. O que você fará de hoje para amanhã?
                                </label>
                                <textarea
                                    className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white text-sm focus:border-indigo-500 outline-none"
                                    rows={3}
                                    placeholder="Planejamento e metas..."
                                    value={today}
                                    onChange={e => setToday(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                                    3. Existe algum impedimento?
                                </label>
                                <textarea
                                    className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white text-sm focus:border-indigo-500 outline-none"
                                    rows={2}
                                    placeholder="Bloqueios técnicos ou emocionais..."
                                    value={blockers}
                                    onChange={e => setBlockers(e.target.value)}
                                />
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={isAnalyzing || !yesterday || !today}
                                className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                                    isAnalyzing ? 'bg-slate-700 text-slate-400' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                                }`}
                            >
                                {isAnalyzing ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                                {isAnalyzing ? 'Analisando...' : 'Enviar Daily'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT: HISTORY & AI INSIGHTS */}
            <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-4 overflow-y-auto custom-scrollbar h-[500px]">
                <h4 className="text-slate-400 font-bold uppercase text-xs mb-4 sticky top-0 bg-slate-900/90 py-2 backdrop-blur z-10">
                    Seu Histórico
                </h4>
                <div className="space-y-4">
                    {myHistory.map(entry => (
                        <div key={entry.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4 animate-in slide-in-from-right duration-300">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-mono text-slate-500">{entry.date}</span>
                                {entry.analysis && (
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                        entry.analysis.status === 'PRODUTIVO' ? 'bg-green-900 text-green-400' :
                                        entry.analysis.status === 'ATENCAO' ? 'bg-red-900 text-red-400' : 'bg-yellow-900 text-yellow-400'
                                    }`}>
                                        {entry.analysis.status}
                                    </span>
                                )}
                            </div>
                            
                            {entry.analysis && (
                                <div className="mb-3 bg-indigo-900/20 p-3 rounded border border-indigo-500/20">
                                    <p className="text-sm text-indigo-200 italic mb-2">"{entry.analysis.summary}"</p>
                                    <div className="flex items-start gap-2 text-xs text-slate-300">
                                        <span className="font-bold text-indigo-400 shrink-0">Dica:</span>
                                        {entry.analysis.advice}
                                    </div>
                                    {entry.analysis.riskDetected && (
                                        <div className="mt-2 flex items-center gap-2 text-xs text-red-300 bg-red-900/20 p-1.5 rounded">
                                            <AlertTriangle size={12}/> {entry.analysis.riskDetails}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="space-y-2 text-sm text-slate-300 opacity-80 text-xs">
                                <p><strong className="text-slate-500">Ontem:</strong> {entry.yesterday}</p>
                                <p><strong className="text-slate-500">Hoje:</strong> {entry.today}</p>
                            </div>
                        </div>
                    ))}
                    {myHistory.length === 0 && (
                        <div className="text-center text-slate-500 py-10">
                            <AlertCircle size={48} className="mx-auto mb-2 opacity-20"/>
                            <p>Nenhuma daily registrada ainda.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DailyView;
