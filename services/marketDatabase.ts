
import { MarketItem, PurchaseRecord } from "../types";

const ITEMS_KEY = 'incubem_market_items';
const PURCHASES_KEY = 'incubem_market_purchases';

// Itens iniciais sugeridos com valores ajustados para a nova economia (200 - 500)
const INITIAL_ITEMS: MarketItem[] = [
    { id: 'mi_1', name: 'Almoço com o CEO', description: 'Uma conversa estratégica durante o almoço.', cost: 500, stock: 2, category: 'Networking', isActive: true },
    { id: 'mi_2', name: 'Day Off Extra', description: 'Um dia de folga remunerada à sua escolha.', cost: 450, stock: 5, category: 'Qualidade de Vida', isActive: true },
    { id: 'mi_3', name: 'Livro Técnico à Escolha', description: 'Qualquer livro técnico de até R$ 150,00.', cost: 300, stock: 10, category: 'Educação', isActive: true },
    { id: 'mi_4', name: 'Vale iFood (R$ 50)', description: 'Crédito para pedir seu rango favorito.', cost: 200, stock: 20, category: 'Recompensa', isActive: true },
];

export const marketDatabase = {
    getItems: (): MarketItem[] => {
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

    saveItems: (items: MarketItem[]) => {
        localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
    },

    getPurchases: (): PurchaseRecord[] => {
        try {
            const stored = localStorage.getItem(PURCHASES_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            return [];
        }
    },

    savePurchase: (purchase: PurchaseRecord) => {
        const current = marketDatabase.getPurchases();
        current.push(purchase);
        localStorage.setItem(PURCHASES_KEY, JSON.stringify(current));
    },

    updatePurchaseStatus: (purchaseId: string, status: PurchaseRecord['status']) => {
        const current = marketDatabase.getPurchases();
        const updated = current.map(p => p.id === purchaseId ? { ...p, status } : p);
        localStorage.setItem(PURCHASES_KEY, JSON.stringify(updated));
    }
};
