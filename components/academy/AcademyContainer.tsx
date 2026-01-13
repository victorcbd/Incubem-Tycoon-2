import React, { useState, useEffect } from 'react';
import { GameState, User, AcademyGap, LearningTrack, UserTrackProgress } from '../../types';
import { academyDatabase } from '../../services/academyDatabase';
import DiagnosisView from './DiagnosisView';
import CuratorshipModal from './CuratorshipModal';
import TracksView from './TracksView';
import TrackDetailView from './TrackDetailView';
import ImpactView from './ImpactView';
import { BarChart3, BookOpen, GraduationCap, LayoutDashboard } from 'lucide-react';

interface AcademyContainerProps {
    gameState: GameState;
    currentUser: User;
}

const AcademyContainer: React.FC<AcademyContainerProps> = ({ gameState, currentUser }) => {
    const isSenior = currentUser.role === 'Master';
    const [view, setView] = useState<'TRACKS' | 'DIAGNOSIS' | 'IMPACT'>('TRACKS');
    
    // State
    const [tracks, setTracks] = useState<LearningTrack[]>([]);
    const [progressMap, setProgressMap] = useState<Record<string, UserTrackProgress>>({});
    
    // UX State
    const [selectedGap, setSelectedGap] = useState<AcademyGap | null>(null);
    const [activeTrack, setActiveTrack] = useState<LearningTrack | null>(null);

    // Initial Load
    useEffect(() => {
        setTracks(academyDatabase.getTracks());
        
        const allProgress = academyDatabase.getProgress();
        const myProgress = allProgress.filter(p => p.userId === currentUser.id);
        const map: Record<string, UserTrackProgress> = {};
        myProgress.forEach(p => map[p.trackId] = p);
        setProgressMap(map);
    }, [currentUser.id]);

    const handlePublishTrack = (newTrack: LearningTrack) => {
        academyDatabase.saveTrack(newTrack);
        setTracks(prev => [...prev, newTrack]);
        setSelectedGap(null);
        setView('TRACKS');
    };

    const refreshProgress = () => {
        const allProgress = academyDatabase.getProgress();
        const myProgress = allProgress.filter(p => p.userId === currentUser.id);
        const map: Record<string, UserTrackProgress> = {};
        myProgress.forEach(p => map[p.trackId] = p);
        setProgressMap(map);
    };

    if (activeTrack) {
        return (
            <TrackDetailView 
                track={activeTrack}
                currentUser={currentUser}
                progress={progressMap[activeTrack.id]}
                onBack={() => setActiveTrack(null)}
                onUpdateProgress={refreshProgress}
            />
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-900">
            {/* Sub Nav */}
            <div className="flex border-b border-slate-700 bg-slate-800">
                <button 
                    onClick={() => setView('TRACKS')}
                    className={`flex-1 py-3 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                        view === 'TRACKS' ? 'bg-slate-700 text-white border-b-2 border-indigo-500' : 'text-slate-400 hover:text-white'
                    }`}
                >
                    <BookOpen size={18} /> Trilhas Ativas
                </button>
                
                {isSenior && (
                    <>
                        <button 
                            onClick={() => setView('DIAGNOSIS')}
                            className={`flex-1 py-3 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                                view === 'DIAGNOSIS' ? 'bg-slate-700 text-white border-b-2 border-indigo-500' : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <LayoutDashboard size={18} /> Diagnóstico (Admin)
                        </button>
                        <button 
                            onClick={() => setView('IMPACT')}
                            className={`flex-1 py-3 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                                view === 'IMPACT' ? 'bg-slate-700 text-white border-b-2 border-indigo-500' : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <BarChart3 size={18} /> Impacto (Admin)
                        </button>
                    </>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                {view === 'DIAGNOSIS' && isSenior && (
                    <DiagnosisView 
                        gameState={gameState} 
                        onSelectGap={setSelectedGap} 
                    />
                )}
                {view === 'TRACKS' && (
                    <TracksView 
                        tracks={tracks} 
                        progressMap={progressMap}
                        onSelectTrack={setActiveTrack}
                    />
                )}
                {view === 'IMPACT' && isSenior && (
                     <ImpactView tracks={tracks} allProgress={academyDatabase.getProgress()} />
                )}
            </div>

            {/* Modals */}
            {selectedGap && (
                <CuratorshipModal 
                    gap={selectedGap} 
                    onClose={() => setSelectedGap(null)}
                    onPublish={handlePublishTrack}
                />
            )}
        </div>
    );
};

export default AcademyContainer;