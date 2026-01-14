
import React, { useState } from 'react';
import { LearningTrack, User, UserTrackProgress } from '../../types';
import { academyDatabase } from '../../services/academyDatabase';
import { ArrowLeft, CheckCircle2, Play, MessageSquare, ExternalLink } from 'lucide-react';

interface TrackDetailViewProps {
    track: LearningTrack;
    currentUser: User;
    progress?: UserTrackProgress;
    onBack: () => void;
    onUpdateProgress: () => void;
}

const TrackDetailView: React.FC<TrackDetailViewProps> = ({ track, currentUser, progress, onBack, onUpdateProgress }) => {
    // Fix: Explicitly cast to string[] to satisfy Set constructor requirements and resolve unknown type error
    const watchedIds = new Set((progress?.videosWatched || []) as string[]);

    const handleWatch = (videoId: string) => {
        // In a real app, verify watch time. Here we just mark as watched when clicked.
        const newWatched = new Set(watchedIds);
        newWatched.add(videoId);
        
        const newProgress: UserTrackProgress = {
            userId: currentUser.id,
            trackId: track.id,
            videosWatched: Array.from(newWatched),
            completed: newWatched.size === track.videos.length,
            lastAccess: Date.now()
        };
        
        academyDatabase.saveProgress(newProgress);
        onUpdateProgress();
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-700 bg-slate-800 flex items-center gap-4">
                <button onClick={onBack} className="p-2 hover:bg-slate-700 rounded-full text-slate-400">
                    <ArrowLeft size={24}/>
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-white">{track.title}</h2>
                    <p className="text-slate-400 text-sm">Trilha de Aprendizado • {track.videos.length} vídeos</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                     <span className="text-sm font-bold text-slate-300">Progresso:</span>
                     <div className="w-32 h-3 bg-slate-900 rounded-full overflow-hidden">
                         <div className="h-full bg-green-500 transition-all" style={{ width: `${(watchedIds.size / track.videos.length) * 100}%` }}></div>
                     </div>
                     <span className="text-sm font-mono text-green-400">{Math.round((watchedIds.size / track.videos.length) * 100)}%</span>
                </div>
            </div>

            {/* Context */}
            <div className="p-6 bg-indigo-900/10 border-b border-slate-700/50">
                <h3 className="text-sm font-bold text-indigo-400 uppercase mb-2">Por que estudar isto?</h3>
                <p className="text-slate-300 text-sm">{track.description}</p>
            </div>

            {/* Video List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {track.videos.map((video, index) => {
                    const isWatched = watchedIds.has(video.id);
                    return (
                        <div key={video.id} className={`flex gap-4 p-4 rounded-xl border transition-all ${isWatched ? 'bg-slate-800/50 border-green-900/30' : 'bg-slate-800 border-slate-700 hover:border-indigo-500'}`}>
                            <div className="w-40 h-24 bg-black rounded shrink-0 relative group cursor-pointer overflow-hidden">
                                <img src={`https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg`} alt="thumb" className={`w-full h-full object-cover transition-opacity ${isWatched ? 'opacity-30' : 'opacity-70 group-hover:opacity-100'}`} />
                                {isWatched ? (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <CheckCircle2 size={32} className="text-green-500"/>
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Play size={32} className="text-white"/>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex-1">
                                <div className="flex justify-between">
                                    <h4 className={`text-lg font-bold ${isWatched ? 'text-slate-500 line-through' : 'text-white'}`}>{index + 1}. {video.title}</h4>
                                    <span className="text-xs bg-slate-900 px-2 py-1 rounded text-slate-500">{video.duration}</span>
                                </div>
                                <div className="text-sm text-indigo-400 mb-2">{video.channel}</div>
                                <p className="text-sm text-slate-400 line-clamp-2">{video.description}</p>
                            </div>

                            <div className="flex flex-col justify-center gap-2">
                                <a 
                                    href={video.videoUrl} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    onClick={() => handleWatch(video.id)} // Simulating watch on click
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold text-sm flex items-center gap-2"
                                >
                                    <Play size={14}/> Assistir
                                </a>
                                {!isWatched && (
                                    <button 
                                        onClick={() => handleWatch(video.id)}
                                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded font-bold text-sm"
                                    >
                                        Marcar Visto
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

             {/* Discussion (Mock) */}
             <div className="p-6 bg-slate-800 border-t border-slate-700">
                 <h3 className="font-bold text-white mb-4 flex items-center gap-2"><MessageSquare size={18}/> Discussão</h3>
                 <div className="flex gap-2">
                     <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">{currentUser.name.substring(0,2)}</div>
                     <input className="flex-1 bg-slate-900 border border-slate-600 rounded px-4 py-2 text-sm text-white" placeholder="Deixe um comentário ou dúvida sobre esta trilha..."/>
                 </div>
             </div>
        </div>
    );
};

export default TrackDetailView;
