import React, { useState, useEffect } from 'react';
import { User, Squad, DailyEntry, FeedbackEntry } from '../../types';
import { mentorDatabase } from '../../services/mentorDatabase';
import DailyView from './DailyView';
import FeedbackView from './FeedbackView';
import DashboardView from './DashboardView';
import { PenTool, MessageSquare, LayoutGrid } from 'lucide-react';

interface MentorContainerProps {
  currentUser: User;
  users: User[];
  squads: Squad[];
  sprintCycle: number;
}

const MentorContainer: React.FC<MentorContainerProps> = ({ 
  currentUser, 
  users, 
  squads, 
  sprintCycle 
}) => {
  const [activeView, setActiveView] = useState<'DAILY' | 'FEEDBACK' | 'DASHBOARD'>('DAILY');
  const [dailies, setDailies] = useState<DailyEntry[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackEntry[]>([]);
  
  // Load data on mount
  useEffect(() => {
      setDailies(mentorDatabase.getDailies());
      setFeedbacks(mentorDatabase.getFeedbacks());
  }, []);

  const handleSaveDaily = (entry: DailyEntry) => {
    setDailies(prev => [...prev, entry]);
  };

  const handleSaveFeedback = (entry: FeedbackEntry) => {
    setFeedbacks(prev => [...prev, entry]);
  };

  const currentSquad = squads.find(s => s.id === currentUser.squadId);

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Sub-Navigation */}
      <div className="flex border-b border-slate-700 bg-slate-800">
        <button 
          onClick={() => setActiveView('DAILY')}
          className={`flex-1 py-3 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
            activeView === 'DAILY' 
              ? 'bg-slate-700 text-white border-b-2 border-indigo-500' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <PenTool size={18} /> Daily Check-in
        </button>
        
        <button 
          onClick={() => setActiveView('FEEDBACK')}
          className={`flex-1 py-3 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
            activeView === 'FEEDBACK' 
              ? 'bg-slate-700 text-white border-b-2 border-indigo-500' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare size={18} /> Avaliação 360°
        </button>
        
        <button 
          onClick={() => setActiveView('DASHBOARD')}
          className={`flex-1 py-3 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
            activeView === 'DASHBOARD' 
              ? 'bg-slate-700 text-white border-b-2 border-indigo-500' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <LayoutGrid size={18} /> Dashboard
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden p-6">
        
        {activeView === 'DAILY' && (
            <DailyView 
            currentUser={currentUser}
            currentSquad={currentSquad}
            onSave={handleSaveDaily}
            existingDailies={dailies}
            />
        )}

        {activeView === 'FEEDBACK' && (
            <FeedbackView 
            currentUser={currentUser}
            squads={squads}
            users={users}
            sprintCycle={sprintCycle}
            onSave={handleSaveFeedback}
            />
        )}

        {activeView === 'DASHBOARD' && (
            <DashboardView 
            dailies={dailies}
            feedbacks={feedbacks}
            currentUser={currentUser}
            users={users}
            squads={squads}
            />
        )}
        
      </div>
    </div>
  );
};

export default MentorContainer;
