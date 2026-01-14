
import { LearningTrack, UserTrackProgress } from "../types";

const TRACKS_KEY = 'incubem_academy_tracks';
const PROGRESS_KEY = 'incubem_academy_progress';

export const academyDatabase = {
    getTracks: async (): Promise<LearningTrack[]> => {
        try {
            const stored = localStorage.getItem(TRACKS_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            return [];
        }
    },

    saveTrack: async (track: LearningTrack) => {
        const stored = localStorage.getItem(TRACKS_KEY);
        const current: LearningTrack[] = stored ? JSON.parse(stored) : [];
        const index = current.findIndex(t => t.id === track.id);
        if (index >= 0) {
            current[index] = track;
        } else {
            current.push(track);
        }
        localStorage.setItem(TRACKS_KEY, JSON.stringify(current));
    },

    getProgress: async (userId?: string): Promise<UserTrackProgress[]> => {
        try {
            const stored = localStorage.getItem(PROGRESS_KEY);
            const all: UserTrackProgress[] = stored ? JSON.parse(stored) : [];
            if (userId) {
                return all.filter(p => p.userId === userId);
            }
            return all;
        } catch (e) {
            return [];
        }
    },

    saveProgress: async (progress: UserTrackProgress) => {
        const stored = localStorage.getItem(PROGRESS_KEY);
        const current: UserTrackProgress[] = stored ? JSON.parse(stored) : [];
        const index = current.findIndex(p => p.userId === progress.userId && p.trackId === progress.trackId);
        if (index >= 0) {
            current[index] = progress;
        } else {
            current.push(progress);
        }
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(current));
    }
};
