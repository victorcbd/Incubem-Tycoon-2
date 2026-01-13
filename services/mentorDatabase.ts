import { DailyEntry, FeedbackEntry } from "../types";

const DAILIES_KEY = 'incubem_dailies';
const FEEDBACKS_KEY = 'incubem_feedbacks';

export const mentorDatabase = {
    getDailies: (): DailyEntry[] => {
        try {
            const stored = localStorage.getItem(DAILIES_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error("Failed to load dailies", e);
            return [];
        }
    },

    saveDaily: (entry: DailyEntry) => {
        const current = mentorDatabase.getDailies();
        const updated = [...current, entry];
        localStorage.setItem(DAILIES_KEY, JSON.stringify(updated));
    },

    getFeedbacks: (): FeedbackEntry[] => {
        try {
            const stored = localStorage.getItem(FEEDBACKS_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
             console.error("Failed to load feedbacks", e);
            return [];
        }
    },

    saveFeedback: (entry: FeedbackEntry) => {
        const current = mentorDatabase.getFeedbacks();
        const updated = [...current, entry];
        localStorage.setItem(FEEDBACKS_KEY, JSON.stringify(updated));
    }
};
