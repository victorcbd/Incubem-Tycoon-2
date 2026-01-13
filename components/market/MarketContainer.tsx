
import React, { useState, useEffect } from 'react';
import { User, MarketItem, PurchaseRecord } from '../../types';
import { marketDatabase } from '../../services/marketDatabase';
import { ShoppingBag, Settings, Store, ClipboardList, CheckCircle2, XCircle, Package, Plus, Trash2, Edit2, Coins, X } from 'lucide-react';

interface MarketContainerProps {
    currentUser: User;
    userCoins: number;
    onPurchaseSuccess: (cost: number) => void;
}

const MarketContainer: React.FC<MarketContainerProps> = ({ currentUser, userCoins, onPurchaseSuccess }) => {
    const isBoard = currentUser.role === 'Master';
    const [view, setView] = useState<'STORE' | 'ADMIN'>('STORE');
    const [items, setItems] = useState<MarketItem[]>([]);
    const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);

    // Admin Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MarketItem | null>(null);

    useEffect(() => {
        setItems(marketDatabase.getItems());
        setPurchases(marketDatabase.getPurchases());
    }, []);

    const handleBuy = (item: MarketItem) => {
        if (userCoins < item.cost) return;
        if (item.stock <= 0) return;

        const newPurchase: PurchaseRecord = {
            id: `pur_${Date.now()}`,
            itemId: item.id,
            userId: currentUser.id,
            userName: currentUser.name,
            itemName: item.name,
            itemCost: item.cost,
            timestamp: Date.now(),
            status: 'PENDING'
        };

        const updatedItems = items.map(i => i.id === item.id ? { ...i, stock: i.stock - 1 } : i);
        setItems(updatedItems);
        marketDatabase.saveItems(updatedItems);
        
        marketDatabase.savePurchase(newPurchase);
        setPurchases(prev => [...prev, newPurchase]);
        
        onPurchaseSuccess(item.cost);
    };

    const handleValidate = (purchaseId: string) => {
        marketDatabase.updatePurchaseStatus(purchaseId, 'VALIDATED');
        setPurchases(prev => prev.map(p => p.id === purchaseId ? { ...p, status: 'VALIDATED' } : p));
    };

    const handleCancel = (purchaseId: string) => {
        const purchase = purchases.find(p => p.id === purchaseId);
        if (purchase) {
            const updatedItems = items.map(i => i.id === purchase.itemId ? { ...i, stock: i.stock + 1 } : i);
            setItems(updatedItems);
            marketDatabase.saveItems(updatedItems);
        }
        marketDatabase.updatePurchaseStatus(purchaseId, 'CANCELLED');
        setPurchases(prev => prev.map(p => p.id === purchaseId ? { ...p, status: 'CANCELLED' } : p));
    };

    const handleSaveItem = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newItem: MarketItem = {
            id: editingItem?.id || `mi_${Date.now()}`,
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            cost: parseInt(formData.get('cost') as string),
            stock: parseInt(formData.get('stock') as string),
            category: formData.get('category') as string,
            isActive: true
        };

        const updated = editingItem 
            ? items.map(i => i.id === editingItem.id ? newItem : i)
            : [...items, newItem];
        
        setItems(updated);
        marketDatabase.saveItems(updated);
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const deleteItem = (id: string) => {
        if (!window.confirm("Excluir esta recompensa permanentemente?")) return;
        const updated = items.filter(i => i.id !== id);
        setItems(updated);
        marketDatabase.saveItems(updated);
    };

    const openCreateModal = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const openEditModal = (item: MarketItem) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    return (
        <div className="flex flex-col h-full bg-slate-900">
            {/* Sub-Nav Mercado */}
            <div className="flex border-b border-slate-700 bg-slate-800 shrink-0">
                <button 
                    onClick={() => setView('STORE')}
                    className={`flex-1 py-3 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                        view === 'STORE' ? 'bg-slate-700 text-white border-b-2 border-indigo-500' : 'text-slate-400 hover:text-white'
                    }`}
                >
                    <Store size={18} /> Loja de Recompensas
                </button>
                
                {isBoard && (
                    <button 
                        onClick={() => setView('ADMIN')}
                        className={`flex-1 py-3 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                            view === 'ADMIN' ? 'bg-slate-700 text-white border-b-2 border-indigo-500' : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Settings size={18} /> Gestão Administrativa
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-hidden p-6 relative">
                {view === 'STORE' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto h-full custom-scrollbar pb-6">
                        {items.filter(i => i.isActive).map(item => (
                            <div key={item.id} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg flex flex-col hover:border-indigo-500 transition-all group">
                                <div className="h-32 bg-slate-900 flex items-center justify-center relative overflow-hidden">
                                    <ShoppingBag size={48} className="text-slate-700 group-hover:text-indigo-500 transition-colors" />
                                    <div className="absolute top-2 right-2 bg-slate-800/80 px-2 py-1 rounded text-[10px] font-bold text-slate-400 uppercase">{item.category}</div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
                                    <p className="text-sm text-slate-400 mb-4 line-clamp-2 flex-1">{item.description}</p>
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center gap-1 text-yellow-400 font-bold text-lg">
                                            <Coins size={20}/> {item.cost.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-slate-500 font-bold uppercase">Estoque: {item.stock}</div>
                                    </div>
                                    <button 
                                        onClick={() => handleBuy(item)}
                                        disabled={userCoins < item.cost || item.stock <= 0}
                                        className={`w-full py-3 rounded-lg font-bold transition-all shadow-lg ${
                                            userCoins >= item.cost && item.stock > 0 
                                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white hover:scale-[1.02]' 
                                            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                        }`}
                                    >
                                        {item.stock <= 0 ? 'FORA DE ESTOQUE' : userCoins < item.cost ? 'MOEDAS INSUFICIENTES' : 'COMPRAR RECOMPENSA'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {view === 'ADMIN' && isBoard && (
                    <div className="flex flex-col gap-6 h-full overflow-hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
                            {/* LISTA DE ITENS EXISTENTES */}
                            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl flex flex-col h-full overflow-hidden">
                                <div className="flex justify-between items-center mb-6 shrink-0">
                                    <h3 className="text-white font-bold flex items-center gap-2 uppercase tracking-wider text-sm">
                                        <Package size={20} className="text-indigo-400"/> Itens Disponíveis no Mercado
                                    </h3>
                                    <button 
                                        onClick={openCreateModal}
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-transform active:scale-95 shadow-lg"
                                    >
                                        <Plus size={16}/> CADASTRAR RECOMPENSA
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                                    {items.map(item => (
                                        <div key={item.id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700 hover:bg-slate-900 transition-colors group">
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-bold text-white truncate">{item.name}</div>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] text-slate-400 uppercase font-bold bg-slate-800 px-1.5 py-0.5 rounded">{item.category}</span>
                                                    <span className="text-[10px] text-yellow-500 font-bold flex items-center gap-0.5"><Coins size={10}/> {item.cost}</span>
                                                    <span className="text-[10px] text-slate-500 font-bold">Estoque: {item.stock}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openEditModal(item)} className="p-2 bg-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white rounded-lg transition-all" title="Editar"><Edit2 size={16}/></button>
                                                <button onClick={() => deleteItem(item.id)} className="p-2 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white rounded-lg transition-all" title="Excluir"><Trash2 size={16}/></button>
                                            </div>
                                        </div>
                                    ))}
                                    {items.length === 0 && (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-600 py-10">
                                            <Package size={48} className="opacity-10 mb-2"/>
                                            <p className="text-sm italic">Nenhum item cadastrado.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* FILA DE VALIDAÇÃO */}
                            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl flex flex-col h-full overflow-hidden">
                                <h3 className="text-white font-bold mb-6 flex items-center gap-2 shrink-0 uppercase tracking-wider text-sm">
                                    <ClipboardList size={20} className="text-yellow-400"/> Fila de Pedidos pendentes
                                </h3>
                                <div className="flex-1 overflow-y-auto custom-scrollbar">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-900/80 text-slate-400 text-[10px] uppercase font-bold sticky top-0 z-10">
                                            <tr>
                                                <th className="p-4 border-b border-slate-700">Data</th>
                                                <th className="p-4 border-b border-slate-700">Membro</th>
                                                <th className="p-4 border-b border-slate-700">Item</th>
                                                <th className="p-4 border-b border-slate-700 text-center">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-700/50">
                                            {purchases.slice().reverse().map(pur => (
                                                <tr key={pur.id} className="hover:bg-slate-700/20 group">
                                                    <td className="p-4 text-slate-500 text-[10px]">{new Date(pur.timestamp).toLocaleDateString()}</td>
                                                    <td className="p-4">
                                                        <span className="font-bold text-slate-200 text-xs truncate max-w-[100px] block">{pur.userName}</span>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="text-indigo-300 font-medium text-xs block">{pur.itemName}</span>
                                                        <span className="text-[9px] text-slate-500">{pur.itemCost} Moedas</span>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex justify-center gap-2">
                                                            {pur.status === 'PENDING' ? (
                                                                <>
                                                                    <button onClick={() => handleValidate(pur.id)} title="Efetivar" className="p-2 bg-green-900/20 text-green-400 hover:bg-green-600 hover:text-white rounded-lg transition-colors"><CheckCircle2 size={16}/></button>
                                                                    <button onClick={() => handleCancel(pur.id)} title="Cancelar" className="p-2 bg-red-900/20 text-red-400 hover:bg-red-600 hover:text-white rounded-lg transition-colors"><XCircle size={16}/></button>
                                                                </>
                                                            ) : (
                                                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                                                    pur.status === 'VALIDATED' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                                                                }`}>
                                                                    {pur.status}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {purchases.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="p-10 text-center text-slate-600 italic text-sm">Nenhum pedido realizado.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL DE CRIAÇÃO/EDIÇÃO */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <div className="bg-slate-800 border-2 border-slate-600 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center p-6 border-b border-slate-700 bg-slate-900/50">
                                <h3 className="text-white font-bold flex items-center gap-2">
                                    {editingItem ? <Edit2 size={18} className="text-indigo-400"/> : <Plus size={18} className="text-indigo-400"/>}
                                    {editingItem ? 'Editar Recompensa' : 'Nova Recompensa'}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors"><X/></button>
                            </div>
                            <form onSubmit={handleSaveItem} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nome da Recompensa</label>
                                    <input name="name" defaultValue={editingItem?.name} required placeholder="Ex: Cadeira Gamer" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Descrição Detalhada</label>
                                    <textarea name="description" defaultValue={editingItem?.description} required placeholder="Descreva o que o usuário ganhará..." className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none" rows={3} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Custo (Moedas)</label>
                                        <input name="cost" type="number" defaultValue={editingItem?.cost} required className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Estoque</label>
                                        <input name="stock" type="number" defaultValue={editingItem?.stock} required className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Categoria</label>
                                    <input name="category" defaultValue={editingItem?.category} placeholder="Ex: Hardware, Mentoria, Mimos" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-colors">Cancelar</button>
                                    <button type="submit" className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95">
                                        {editingItem ? 'SALVAR ALTERAÇÕES' : 'CADASTRAR ITEM'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarketContainer;
