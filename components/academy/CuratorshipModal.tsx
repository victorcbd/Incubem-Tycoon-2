import React, { useState, useEffect } from 'react';
import { AcademyGap, AcademyVideo, LearningTrack } from '../../types';
import { geminiService } from '../../services/geminiService';
import { Play, Check, X, Loader2, Save, Plus } from 'lucide-react';

interface CuratorshipModalProps {
    gap: AcademyGap;
    onClose: () => void;
    onPublish: (track: LearningTrack) => void;
}

const CuratorshipModal: React.FC<CuratorshipModalProps> = ({ gap, onClose, onPublish }) => {
    const [loading, setLoading] = useState(true);
    const [videos, setVideos] = useState<AcademyVideo[]>([]);
    
    // Initial Generation
    useEffect(() => {
        const generate = async () => {
            const results = await geminiService.generateCuratorship(gap);
            setVideos(results);
            setLoading(false);
        };
        generate();
    }, [gap]);

    const toggleStatus = (id: string, status: 'APPROVED' | 'REJECTED') => {
        setVideos(prev => prev.map(v => v.id === id ? { ...v, status } : v));
    };

    const handlePublish = () => {
        const approved = videos.filter(v => v.status === 'APPROVED' || v.status === 'DRAFT'); // Default to draft if not explicitly rejected for UX speed
        const track: LearningTrack = {
            id: `track_${Date.now()}`,
            gapId: gap.id,
            title: gap.skill,
            description: `Trilha gerada para resolver o gap de ${gap.skill}. Evidências: ${gap.evidence[0]}`,
            urgency: gap.urgency,
            videos: approved.map(v => ({...v, status: 'APPROVED'})),
            createdAt: Date.now(),
            status: 'PUBLISHED',
            totalViews: 0,
            completions: 0
        };
        onPublish(track);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl h-[90vh] flex flex-col rounded-xl shadow-2xl animate-in zoom-in-95">
                {/* Header */}
                <div className="p-6 border-b border-slate-700 bg-slate-800 rounded-t-xl flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded uppercase">Curadoria IA</span>
                            <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${gap.urgency === 'CRÍTICO' ? 'bg-red-900 text-red-400' : 'bg-orange-900 text-orange-400'}`}>{gap.urgency}</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-1">Gap: {gap.skill}</h2>
                        <p className="text-slate-400 text-sm">Afetados: {gap.affectedMembers.join(', ')}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full"><X className="text-slate-400"/></button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-900/50 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
                            <Loader2 size={48} className="animate-spin text-indigo-500"/>
                            <p>O Gemini está buscando os melhores conteúdos...</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {videos.map(video => (
                                <div key={video.id} className={`flex gap-4 p-4 rounded-lg border transition-all ${video.status === 'REJECTED' ? 'bg-red-900/10 border-red-900/30 opacity-60' : video.status === 'APPROVED' ? 'bg-green-900/10 border-green-500/50' : 'bg-slate-800 border-slate-700'}`}>
                                    {/* Thumbnail Placeholder */}
                                    <div className="w-48 h-28 bg-black shrink-0 rounded flex items-center justify-center relative overflow-hidden group">
                                        <img src={`https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg`} alt="thumb" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"/> 
                                        <Play className="absolute text-white opacity-80" size={32}/>
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-white text-lg line-clamp-1">{video.title}</h4>
                                            <span className="text-xs bg-slate-900 px-2 py-1 rounded text-slate-400 font-mono">{video.duration}</span>
                                        </div>
                                        <div className="text-xs text-indigo-400 font-bold mb-2">{video.channel}</div>
                                        <p className="text-sm text-slate-400 line-clamp-2 mb-3">{video.description}</p>
                                        
                                        <div className="flex gap-4 text-xs">
                                            <span className="text-green-400">Relevância: {video.relevanceScore}/10</span>
                                            <span className="text-blue-400">Qualidade: {video.qualityScore}/10</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 justify-center border-l border-slate-700 pl-4">
                                        <button 
                                            onClick={() => toggleStatus(video.id, 'APPROVED')}
                                            className={`p-2 rounded hover:bg-green-900/50 transition-colors ${video.status === 'APPROVED' ? 'bg-green-600 text-white' : 'text-slate-500'}`}
                                        >
                                            <Check size={20}/>
                                        </button>
                                        <button 
                                            onClick={() => toggleStatus(video.id, 'REJECTED')}
                                            className={`p-2 rounded hover:bg-red-900/50 transition-colors ${video.status === 'REJECTED' ? 'bg-red-600 text-white' : 'text-slate-500'}`}
                                        >
                                            <X size={20}/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-700 bg-slate-800 rounded-b-xl flex justify-between items-center">
                    <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold text-sm">
                        <Plus size={16}/> Adicionar Vídeo Manualmente
                    </button>
                    <div className="flex gap-4">
                        <button onClick={onClose} className="px-6 py-3 rounded-lg font-bold text-slate-300 hover:bg-slate-700 transition-colors">
                            Cancelar
                        </button>
                        <button 
                            disabled={loading}
                            onClick={handlePublish}
                            className="px-6 py-3 rounded-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg flex items-center gap-2"
                        >
                            <Save size={18}/> Publicar Trilha
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CuratorshipModal;