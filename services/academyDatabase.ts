import { LearningTrack, UserTrackProgress } from "../types";

const TRACKS_KEY = 'incubem_academy_tracks';
const PROGRESS_KEY = 'incubem_academy_progress';

export const academyDatabase = {
    getTracks: (): LearningTrack[] => {
        try {
            const stored = localStorage.getItem(TRACKS_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            return [];
        }
    },

    saveTrack: (track: LearningTrack) => {
        const current = academyDatabase.getTracks();
        // Check if update or new
        const index = current.findIndex(t => t.id === track.id);
        if (index >= 0) {
            current[index] = track;
        } else {
            current.push(track);
        }
        localStorage.setItem(TRACKS_KEY, JSON.stringify(current));
    },

    getProgress: (): UserTrackProgress[] => {
        try {
            const stored = localStorage.getItem(PROGRESS_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            return [];
        }
    },

    saveProgress: (progress: UserTrackProgress) => {
        const current = academyDatabase.getProgress();
        const index = current.findIndex(p => p.userId === progress.userId && p.trackId === progress.trackId);
        if (index >= 0) {
            current[index] = progress;
        } else {
            current.push(progress);
        }
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(current));
    }
};