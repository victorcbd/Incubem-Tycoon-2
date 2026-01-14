
import { MarketItem, PurchaseRecord } from "../types";

const ITEMS_KEY = 'incubem_market_items';
const PURCHASES_KEY = 'incubem_market_purchases';

const INITIAL_ITEMS: MarketItem[] = [
    { id: 'mi_1', name: 'Almoço com o CEO', description: 'Uma conversa estratégica durante o almoço.', cost: 500, stock: 2, category: 'Networking', isActive: true },
    { id: 'mi_2', name: 'Day Off Extra', description: 'Um dia de folga remunerada à sua escolha.', cost: 450, stock: 5, category: 'Qualidade de Vida', isActive: true },
    { id: 'mi_3', name: 'Livro Técnico à Escolha', description: 'Qualquer livro técnico de até R$ 150,00.', cost: 300, stock: 10, category: 'Educação', isActive: true },
    { id: 'mi_4', name: 'Vale iFood (R$ 50)', description: 'Crédito para pedir seu rango favorito.', cost: 200, stock: 20, category: 'Recompensa', isActive: true },
];

export const marketDatabase = {
    getItems: async (): Promise<MarketItem[]> => {
        try {
            const stored = localStorage.getItem(ITEMS_KEY);
            if (!stored) {
                localStorage.setItem(ITEMS_KEY, JSON.stringify(INITIAL_ITEMS));
                return INITIAL_ITEMS;
            }
            return JSON.parse(stored);
        } catch (e) {
            return INITIAL_ITEMS;
        }
    },

    saveItems: async (items: MarketItem[]) => {
        localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
    },

    getPurchases: async (userId?: string): Promise<PurchaseRecord[]> => {
        try {
            const stored = localStorage.getItem(PURCHASES_KEY);
            let all: PurchaseRecord[] = stored ? JSON.parse(stored) : [];
            if (userId) {
                all = all.filter(p => p.userId === userId);
            }
            return all.sort((a, b) => b.timestamp - a.timestamp);
        } catch (e) {
            return [];
        }
    },

    savePurchase: async (purchase: PurchaseRecord) => {
        const stored = localStorage.getItem(PURCHASES_KEY);
        const current: PurchaseRecord[] = stored ? JSON.parse(stored) : [];
        current.push(purchase);
        localStorage.setItem(PURCHASES_KEY, JSON.stringify(current));
    },

    updatePurchaseStatus: async (purchaseId: string, status: PurchaseRecord['status']) => {
        const stored = localStorage.getItem(PURCHASES_KEY);
        const current: PurchaseRecord[] = stored ? JSON.parse(stored) : [];
        const updated = current.map(p => p.id === purchaseId ? { ...p, status } : p);
        localStorage.setItem(PURCHASES_KEY, JSON.stringify(updated));
    }
};
