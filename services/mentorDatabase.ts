
import { DailyEntry, FeedbackEntry } from "../types";

const DAILIES_KEY = 'incubem_dailies';
const FEEDBACKS_KEY = 'incubem_feedbacks';

export const mentorDatabase = {
    getDailies: async (squadId?: string): Promise<DailyEntry[]> => {
        try {
            const stored = localStorage.getItem(DAILIES_KEY);
            let data: DailyEntry[] = stored ? JSON.parse(stored) : [];
            if (squadId) {
                data = data.filter(d => d.squadId === squadId);
            }
            return data.sort((a, b) => b.timestamp - a.timestamp);
        } catch (e) {
            console.error("Failed to load dailies", e);
            return [];
        }
    },

    saveDaily: async (entry: DailyEntry) => {
        const stored = localStorage.getItem(DAILIES_KEY);
        const current: DailyEntry[] = stored ? JSON.parse(stored) : [];
        const updated = [...current, entry];
        localStorage.setItem(DAILIES_KEY, JSON.stringify(updated));
    },

    getFeedbacks: async (squadId?: string): Promise<FeedbackEntry[]> => {
        try {
            const stored = localStorage.getItem(FEEDBACKS_KEY);
            let data: FeedbackEntry[] = stored ? JSON.parse(stored) : [];
            if (squadId) {
                data = data.filter(f => f.squadId === squadId);
            }
            return data.sort((a, b) => b.timestamp - a.timestamp);
        } catch (e) {
             console.error("Failed to load feedbacks", e);
            return [];
        }
    },

    saveFeedback: async (entry: FeedbackEntry) => {
        const stored = localStorage.getItem(FEEDBACKS_KEY);
        const current: FeedbackEntry[] = stored ? JSON.parse(stored) : [];
        const updated = [...current, entry];
        localStorage.setItem(FEEDBACKS_KEY, JSON.stringify(updated));
    }
};
