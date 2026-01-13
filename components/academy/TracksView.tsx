import React from 'react';
import { LearningTrack, UserTrackProgress } from '../../types';
import { PlayCircle, CheckCircle2, Flame, Clock } from 'lucide-react';

interface TracksViewProps {
    tracks: LearningTrack[];
    progressMap: Record<string, UserTrackProgress>;
    onSelectTrack: (track: LearningTrack) => void;
}

const TracksView: React.FC<TracksViewProps> = ({ tracks, progressMap, onSelectTrack }) => {
    return (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto h-full custom-scrollbar">
            {tracks.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center text-slate-500 h-64 border-2 border-dashed border-slate-700 rounded-xl">
                    <p>Nenhuma trilha de aprendizado publicada ainda.</p>
                </div>
            ) : (
                tracks.map(track => {
                    const userProgress = progressMap[track.id];
                    const pct = userProgress ? Math.round((userProgress.videosWatched.length / track.videos.length) * 100) : 0;
                    const isCompleted = pct === 100;

                    return (
                        <div key={track.id} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-indigo-500 transition-all shadow-lg flex flex-col">
                            {/* Card Header */}
                            <div className="p-4 bg-slate-900/50 border-b border-slate-700 flex justify-between items-start">
                                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1 ${
                                    track.urgency === 'CRÍTICO' ? 'bg-red-900 text-red-400' : 'bg-orange-900 text-orange-400'
                                }`}>
                                    <Flame size={12}/> {track.urgency}
                                </div>
                                {isCompleted && <CheckCircle2 size={20} className="text-green-500"/>}
                            </div>

                            {/* Body */}
                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{track.title}</h3>
                                <p className="text-sm text-slate-400 mb-4 line-clamp-3 flex-1">{track.description}</p>
                                
                                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                                    <span className="flex items-center gap-1"><PlayCircle size={14}/> {track.videos.length} vídeos</span>
                                    <span className="flex items-center gap-1"><Clock size={14}/> ~{(track.videos.length * 15)} min</span>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-4">
                                    <div className="h-full bg-green-500 transition-all" style={{ width: `${pct}%` }}></div>
                                </div>
                                <div className="text-right text-xs text-slate-400 mb-4">{pct}% Concluído</div>

                                <button 
                                    onClick={() => onSelectTrack(track)}
                                    className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors ${
                                        isCompleted ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-indigo-600 text-white hover:bg-indigo-500'
                                    }`}
                                >
                                    {isCompleted ? 'Revisar Trilha' : pct > 0 ? 'Continuar' : 'Iniciar Trilha'}
                                </button>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default TracksView;